const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

export async function fetchFromAlpaca(endpoint: string, options: RequestInit = {}) {
    const url = `https://paper-api.alpaca.markets/v2${endpoint}`;
    const headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        // accept: 'application/json',
        'content-type': 'application/json',
    };

    const requestOptions: RequestInit = {
        ...options,
        headers: headers as HeadersInit,
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching from Alpaca:', error);
        throw error;
    }
}
