import axios from 'axios';
import { buildQueryParams } from '../../utils';
import { IPumpTokenItem } from '../../common/types';
import { PUMPFUN_RAYDIUM_MIGRATION_PROGRAM_ID } from '../../config';
import { formatResponse } from '../formaters';

export async function getPumpList(params: object): Promise<IPumpTokenItem[]> {
    const query = buildQueryParams({ limit: 20, orderby: 'usd_market_cap', direction: 'desc', pump: 'true', ...params });
    try {
        const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/rank/sol/pump?${query}`, { headers: { 'Cache-Control': 'no-store' } });
        const data = res.data;
        return data.code === 0 ? data.data.rank : [];
    } catch (error) {
        console.error('Error fetching Pump list:', error);
        throw error;
    }
}

export async function getGradiatedPumpList(params: object): Promise<IPumpTokenItem[]> {
    const query = buildQueryParams({ type: 'CREATE_POOL', limit: 30, sort: 'desc', ...params });
    const API_URL = `https://api.helius.xyz/v0/addresses/${PUMPFUN_RAYDIUM_MIGRATION_PROGRAM_ID}/transactions?${query}`;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error('Failed to fetch transactions:', response.statusText);
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        const tokens = formatResponse(data as string[]);
        const tokenDetailsPromises = tokens.map(fetchTokenDetails);
        const tokensAndDetails = await Promise.allSettled(tokenDetailsPromises);
        const fulfilledTokens = tokensAndDetails
            .filter(tokenDetail => tokenDetail.status === 'fulfilled')
            .map(tokenDetail => (tokenDetail as PromiseFulfilledResult<IPumpTokenItem>).value);
        return fulfilledTokens;
    } catch (error) {
        console.error('Error fetching gradated Pump list:', error);
        throw error;
    }
}

export async function fetchTokenDetails(addr: string): Promise<IPumpTokenItem> {
    try {
        const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/sol/${addr}`);
        const data = res.data;
        return data.code === 0 ? data.data.token : {} as IPumpTokenItem;
    } catch (error) {
        console.error('Error fetching Token details:', error);
        throw error;
    }
}
