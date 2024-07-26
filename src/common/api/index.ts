import axios from "axios";
import { IPumpCoin } from "../../common/types";
import { config } from "dotenv";

config()

const PUMPFUN_TOKEN_PROGRAM_ID = process.env.PUMPFUN_TOKEN_PROGRAM_ID
const PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID = process.env.PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID
const HELIUS_API_KEY = process.env.HELIUS_API_KEY


function buildQueryParams(params: object) {
    const query = new URLSearchParams(params as any);
    query.append('api-key', String(HELIUS_API_KEY));
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

function extractRelevantData(data: any[]) {
    return data?.map?.(item => ({
        account: item?.account,
        decimals: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.decimals,
        supply: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.supply,
        mintAuthority: item?.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.mintAuthority,
        tokenStandard: item?.onChainMetadata?.metadata?.tokenStandard,
        updateAuthority: item?.onChainMetadata?.metadata?.updateAuthority,
        address: item?.onChainMetadata?.metadata?.mint,
        name: item?.onChainMetadata?.metadata?.data?.name,
        symbol: item?.onChainMetadata?.metadata?.data?.symbol,
        uri: item?.onChainMetadata?.metadata?.data?.uri,
        sellerFeeBasisPoints: item?.onChainMetadata?.metadata?.data?.sellerFeeBasisPoints,
        primarySaleHappened: item?.onChainMetadata?.metadata?.primarySaleHappened,
        isMutable: item?.onChainMetadata?.metadata?.isMutable,
        createdOn: item?.offChainMetadata?.metadata?.createdOn,
        description: item?.offChainMetadata?.metadata?.description,
        logo: item?.offChainMetadata?.metadata?.image,
        showName: item?.offChainMetadata?.metadata?.showName,
        telegram: item?.offChainMetadata?.metadata?.telegram,
        twitter: item?.offChainMetadata?.metadata?.twitter,
        website: item?.offChainMetadata?.metadata?.website
    }));
}

export async function getPumpList(params: Object): Promise<IPumpCoin[]> {
    const query = buildQueryParams({ limit: 20, orderby: 'usd_market_cap', direction: 'desc', pump: 'true', ...params })
    const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/rank/sol/pump?${query}`, { headers: { 'Cache-Control': 'no-store' } });
    const data = res.data;
    return data.code === 0 ? data.data.rank : [];
}

export async function getGradiatedPumtList(params: Object) {

    const query = buildQueryParams({ type: 'CREATE_POOL', name: 'pump', sort: 'desc', ...params })
    const API_URL = `https://api.helius.xyz/v0/addresses/${PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID}/transactions?${query}`;
    const API_METADATA_URL = `https://api.helius.xyz/v0/token-metadata?${query}`

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
                    mintAccounts: tokens,
                    includeOffChain: true,
                    disableCache: false,
                }),
            })
            const metadataResponse = await metadata.json()
            const fomartedMesta = extractRelevantData(metadataResponse)
            return fomartedMesta;
        } else {
            console.error('Failed to fetch transactions:', response.statusText);
            throw new Error(`API request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching gradated pump list:', error);
        throw error;
    }
}

export async function getPumpDetail(addr: string): Promise<IPumpCoin> {
    const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/sol/${addr}`);
    const data = res.data;
    return data.code === 0 ? data.data.token : {} as IPumpCoin;
}