import axios from "axios";
import { IPumpCoin } from "../../common/types";

export async function getPumpList(params: URLSearchParams): Promise<IPumpCoin[]> {

    const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/rank/sol/pump?${params.toString()}`, { headers: { 'Cache-Control': 'no-store' } });
    const data = res.data;
    return data.code === 0 ? data.data.rank : [];
}

export async function getPumpDetail(addr: string): Promise<IPumpCoin> {
    const res = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/sol/${addr}`);
    const data = res.data;
    return data.code === 0 ? data.data.token : {} as IPumpCoin;
}