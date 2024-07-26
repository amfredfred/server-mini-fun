import { config } from 'dotenv';
config();

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const PUMPFUN_TOKEN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const PUMPFUN_RAYDIUM_MIG_ID = '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg'
const API_KEY = '8d008dbe-16dc-4e44-ae08-0812e3fed48c'


function buildQueryParams(params) {
    const query = new URLSearchParams(params);
    query.append('api-key', API_KEY);
    return query.toString();
}


const formartResponse = (data: any[]) => data?.map(item => {
    for (const transfer of item.tokenTransfers) {
        if (transfer.mint.endsWith("pump")) {
            return transfer.mint;
        }
    }
    return;
}).filter(i => i !== undefined)

function extractRelevantData(data) {
    return data.map(item => ({
        account: item?.account,
        decimals: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.decimals,
        supply: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.supply,
        mintAuthority: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.mintAuthority,
        tokenStandard: item?.onChainMetadata?.metadata?.tokenStandard,
        updateAuthority: item?.onChainMetadata?.metadata?.updateAuthority,
        mint: item?.onChainMetadata?.metadata?.mint,
        name: item?.onChainMetadata?.metadata?.data?.name,
        symbol: item?.onChainMetadata?.metadata?.data?.symbol,
        uri: item?.onChainMetadata?.metadata?.data?.uri,
        sellerFeeBasisPoints: item?.onChainMetadata?.metadata?.data?.sellerFeeBasisPoints,
        primarySaleHappened: item?.onChainMetadata?.metadata?.primarySaleHappened,
        isMutable: item?.onChainMetadata?.metadata?.isMutable,
        createdOn: item?.offChainMetadata?.metadata?.createdOn,
        description: item?.offChainMetadata?.metadata?.description,
        image: item?.offChainMetadata?.metadata?.image,
        showName: item?.offChainMetadata?.metadata?.showName,
        telegram: item?.offChainMetadata?.metadata?.telegram,
        twitter: item?.offChainMetadata?.metadata?.twitter,
        website: item?.offChainMetadata?.metadata?.website
    }));
}
async function fetchPumpFunTokens(limit = 10, sortBy = 'timestamp', sortOrder = 'desc', filters = {}) {
    const params = {
        limit,
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
        name: 'pump',
        type: 'CREATE_POOL',//TOKEN_MINT
        ...filters
    };

    // Build the complete API URL with query parameters
    const API_URL = `https://api.helius.xyz/v0/addresses/${PUMPFUN_RAYDIUM_MIG_ID}/transactions?${buildQueryParams(params)}`;
    const API_METADATA_URL = `https://api.helius.xyz/v0/token-metadata?${buildQueryParams(params)}`

    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            const tokens = formartResponse(data)
            const metadata = await fetch(API_METADATA_URL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mintAccounts: tokens.filter(String),
                    includeOffChain: true,
                    // disableCache: false,
                }),
            })
            const metadataResponse = await metadata.json()
            const fomartedMesta = extractRelevantData(metadataResponse)
            // console.log('Pump.fun Tokens:', tokens);
            console.log(tokens, fomartedMesta)
            console.log(tokens)
        } else {
            console.error('Failed to fetch transactions:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchPumpFunTokens(20, 'timestamp', 'desc');//, { status: 'success' } 