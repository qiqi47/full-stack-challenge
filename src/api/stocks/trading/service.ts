import { alpacaTradeApi } from '../axiosConfig';
import { watchlistEndpoints } from './constant';

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

// Add a symbol to a watchlist
export const addSymbolToWatchlist = async (watchlistId: string, symbol: string) => {
    try {
        const url = `${watchlistEndpoints.watchlist}/${watchlistId}`;
        const response = await alpacaTradeApi.post(url, { symbol: symbol.toUpperCase() });
        return { success: true, data: response };
    } catch (error: any) {
        console.error('API error:', error);

        // Check for duplicate symbol error (code 40010001)
        if (error.response && error.response.status === 422 && error.response.data) {
            return {
                success: false,
                error: 'duplicate_symbol',
                message: `${symbol.toUpperCase()} is already in your watchlist`,
            };
        }

        // For other errors, rethrow
        throw error;
    }
};

//Remove a symbol from a watchlist
export const removeSymbolFromWatchlist = async (watchlistId: string, symbol: string) => {
    try {
        const url = `${watchlistEndpoints.watchlist}/${watchlistId}/${symbol.toUpperCase()}`;
        const response = await alpacaTradeApi.delete(url);
        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};

//Update a watchlist
