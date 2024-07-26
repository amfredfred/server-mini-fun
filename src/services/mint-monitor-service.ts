import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { config } from 'dotenv';
import { Metaplex } from '@metaplex-foundation/js';

config();

class MintMonitorService {
    private connection: Connection;
    private metaplex: Metaplex;
    private lastSignature: string | null = null;
    private program_id: PublicKey = TOKEN_PROGRAM_ID;

    constructor(rpcUrl: string, program_id: string) {
        this.connection = new Connection(rpcUrl, 'confirmed');
        this.metaplex = Metaplex.make(this.connection);
        this.program_id = new PublicKey(program_id);
    }

    public async fetchTokenMetadata(pubkey: PublicKey) {
        const mintAddress = pubkey;

        const metadataAccount = this.metaplex
            .nfts()
            .pdas()
            .metadata({ mint: mintAddress });

        const metadataAccountInfo = await this.connection.getAccountInfo(metadataAccount);

        if (metadataAccountInfo) {
            const token = await this.metaplex.nfts().findByMint({ mintAddress: mintAddress });
            return {
                mint: token.mint,
                meta: token.json,
            };
        }
        return null;
    }

    public async fetchMultipleTokenMetadata(mints: PublicKey[]): Promise<any[]> {
        const metadataPromises = mints.map(async (mint) => {
            return await this.fetchTokenMetadata(mint);
        });
        return Promise.all(metadataPromises);
    }

    private async fetchPumpfunTokens(limit: number = 10) {
        try {
            const options = this.lastSignature ? { before: this.lastSignature, limit } : { limit };
            const signatures = await this.connection.getSignaturesForAddress(this.program_id, options);

            const mints = new Set<PublicKey>();

            for (const { signature } of signatures) {
                this.lastSignature = signature;

                const transaction = await this.connection.getTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 2 });

                if (transaction && transaction.meta) {
                    const postTokenBalances = transaction.meta.postTokenBalances;
                    const preTokenBalances = transaction.meta.preTokenBalances;

                    if (postTokenBalances && preTokenBalances) {
                        if (postTokenBalances.length > preTokenBalances.length) {
                            for (let i = 0; i < postTokenBalances.length; i++) {
                                if (!preTokenBalances[i] || postTokenBalances[i].mint !== preTokenBalances[i].mint) {
                                    const mintPublicKey = new PublicKey(postTokenBalances[i].mint);
                                    mints.add(mintPublicKey);
                                }
                            }
                        }
                    }
                }
            }

            const metadata = await this.fetchMultipleTokenMetadata(Array.from(mints));
            console.log(`Fetched metadata for tokens:`, metadata);

        } catch (error) {
            console.error('Error fetching Pumpfun tokens:', error);
            if ((error as Error).message.includes('125/second request limit reached')) {
                console.log('Rate limit reached, waiting before retrying...');
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
    }

    public async listenToNewBlocks() {
        while (true) {
            await this.fetchPumpfunTokens(10);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const PUMPFUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const tokenMonitor = new MintMonitorService(RPC_URL, PUMPFUN_PROGRAM_ID);
tokenMonitor.listenToNewBlocks().catch(console.error);
