import axios from "axios";
import { IPumpCoin } from "../../common/types";
const PUMPFUN_TOKEN_PROGRAM_ID = process.env.PUMPFUN_TOKEN_PROGRAM_ID
const PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID = process.env.PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID
const HELIUS_API_KEY = process.env.HELIUS_API_KEY


function buildQueryParams(params: object) {
    const query = new URLSearchParams(params as any);
    query.append('api-key', String(HELIUS_API_KEY));
    return query.toString();
}

const formartResponse = (data: []) => data?.map(item => {
    return {
        mint: item?.mint
    }
})


export async function getPumpList(params: URLSearchParams): Promise<IPumpCoin[]> {

    const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/rank/sol/pump?${params.toString()}`, { headers: { 'Cache-Control': 'no-store' } });
    const data = res.data;
    return data.code === 0 ? data.data.rank : [];
}

export async function getGradiatedPumtList(params: URLSearchParams) {
    const API_URL = `https://api.helius.xyz/v0/addresses/${PUMPFUN_RAYDIUM_MIGRTION_PROGRAM_ID}/transactions?${buildQueryParams(params)}`;
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            return formartResponse(data);
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