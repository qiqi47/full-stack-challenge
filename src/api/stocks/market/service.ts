import { alpacaMarketApi } from '../axiosConfig';
import { marketEndpoints } from './constant';
import { AxiosError } from 'axios';

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

        // If we get here, the API call succeeded
        return {
            ...response,
            symbol: symbol.toUpperCase(),
            isValid: true,
        };
    } catch (error) {
        console.error('API error:', error);

        // Check if this is a 404 (Not Found) error, which indicates an invalid symbol
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 404) {
            return {
                isValid: false,
                symbol: symbol.toUpperCase(),
                error: 'Invalid symbol',
            };
        }

        console.log('Returning mock data instead');
        // Return mock data for development/testing with validation flag
        return {
            ...mockStockData,
            symbol: symbol.toUpperCase(),
            isValid: process.env.NODE_ENV === 'development',
        };
    }
};
