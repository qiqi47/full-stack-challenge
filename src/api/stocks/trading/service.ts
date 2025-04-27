import { alpacaTradeApi } from '../axiosConfig';
import { watchlistEndpoints } from './constant';

// Mock data for fallback
const mockWatchlistData = {
    id: 'bbb7464e-1d3c-4ea0-b65f-1e357357b3e3',
    account_id: '688299ae-fe4a-4943-bfe4-49991ce060f2',
    created_at: '2025-04-26T22:14:00.768563Z',
    updated_at: '2025-04-26T22:14:00.768563Z',
    name: 'watchlist',
};

// Fetch all watchlists
export const fetchWatchlist = async () => {
    try {
        const response = await alpacaTradeApi.get(watchlistEndpoints.watchlist);
        return response;
    } catch (error) {
        console.error('API error:', error);
        console.log('Returning mock data instead');
    }
};

// Fetch a specific watchlist by ID
export const fetchWatchlistById = async (watchlistId: string) => {
    try {
        const url = watchlistEndpoints.watchlist + '/' + watchlistId;
        const response = await alpacaTradeApi.get(url);
        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};

// Create a new watchlist
export const createWatchlist = async (name: string, symbols?: string[]) => {
    try {
        const payload = {
            name,
            symbols: symbols || [],
        };
        const response = await alpacaTradeApi.post(watchlistEndpoints.watchlist, payload);
        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};

// Add a symbol to a watchlist
export const addSymbolToWatchlist = async (watchlistId: string, symbol: string) => {
    try {
        const url = `${watchlistEndpoints.watchlist}/${watchlistId}`;
        const response = await alpacaTradeApi.post(url, { symbol: symbol.toUpperCase() });
        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};
