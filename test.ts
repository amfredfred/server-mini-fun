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

const formartResponse = (data: []) => data?.map(item => {
    return {
        mint: item?.mint
    }
}) 

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

    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json(); 
            const tokens = formartResponse(data) 
            // console.log('Pump.fun Tokens:', tokens);
            console.log(JSON.stringify(data))
        } else {
            console.error('Failed to fetch transactions:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchPumpFunTokens(50, 'timestamp', 'desc');//, { status: 'success' } 