import { alpacaMarketApi } from '../axiosConfig';
import { marketEndpoints } from './constant';

// Mock data for fallback
const mockStockData = {
    symbol: 'MOCK',
    bar: [
        {
            c: 120.31,
            h: 120.33,
            l: 120.28,
            n: 40,
            o: 120.33,
            t: '2025-04-25T19:59:00Z',
            v: 1489,
            vw: 120.319933,
        },
    ],
};

// Fetch stock by symbol
export const fetchLatestStockBySymbol = async (symbol: string) => {
    try {
        const response = await alpacaMarketApi.get(
            marketEndpoints.latest.replace('{symbol}', symbol.toUpperCase()),
        );
        return response;
    } catch (error) {
        console.error('API error:', error);
        console.log('Returning mock data instead');
        // Return mock data for development/testing
        return { ...mockStockData, symbol: symbol.toUpperCase() };
    }
};
