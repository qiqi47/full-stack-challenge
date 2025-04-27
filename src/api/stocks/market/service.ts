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

interface BarData {
    c: number; // close
    h: number; // high
    l: number; // low
    n: number; // number of trades
    o: number; // open
    t: string; // timestamp
    v: number; // volume
    vw: number; // volume weighted average price
}

interface StockData {
    bars: BarData[];
    next_page_token: string | null;
    symbol: string;
}

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

// Fetch stock by symbol and timeframe
export const fetchStockBySymbolAndTimeframe = async (symbol: string, timeframe: string) => {
    try {
        const response = await alpacaMarketApi.get(
            marketEndpoints.bars
                .replace('{symbol}', symbol.toUpperCase())
                .replace('{timeframe}', timeframe),
        );
        return response;
    } catch (error) {
        console.error('API error:', error);
        console.log('Returning mock data instead');
    }
};

// Function to fetch stock bar data (OHLC)
export const fetchStockBars = async (
    symbol: string,
    timeframe: string,
    start: string,
    end: string,
): Promise<StockData | null> => {
    try {
        // Format timeframe for API
        const formattedTimeframe = formatTimeframe(timeframe);

        const endpoint = marketEndpoints.bars
            .replace('{symbol}', symbol.toUpperCase())
            .replace('{timeframe}', formattedTimeframe)
            .replace('{start}', start)
            .replace('{end}', end);

        console.log(`Fetching stock data for ${symbol} with timeframe ${formattedTimeframe}`);

        try {
            // Try to fetch from the API
            const response = await alpacaMarketApi.get(endpoint);

            if (response && response.data) {
                return {
                    bars: response.data.bars || [],
                    next_page_token: response.data.next_page_token || null,
                    symbol: symbol.toUpperCase(),
                };
            }
        } catch (apiError) {
            console.error('API error:', apiError);
            console.log('Falling back to mock data');
        }

        // Fallback to mock data if API call fails
        console.log('Using mock data for', symbol);
        return getStockMockData(symbol);
    } catch (error) {
        console.error('Error fetching stock bars:', error);
        return null;
    }
};

// Helper function to format timeframe for the API
const formatTimeframe = (timeframe: string): string => {
    // Map UI timeframe selections to API format
    switch (timeframe) {
        case '5m':
            return '5Min';
        case '15m':
            return '15Min';
        case '30m':
            return '30Min';
        case '1h':
            return '1Hour';
        case '4h':
            return '4Hour';
        case '1d':
            return '1Day';
        case '1m': // 1 month
            return '1Day'; // Use daily data for month view
        case '3m': // 3 months
            return '1Day'; // Use daily data for 3-month view
        case '1y': // 1 year
            return '1Day'; // Use daily data for year view
        default:
            return '1Day';
    }
};

// Mock data for demo purposes
const getStockMockData = (symbol: string): StockData => {
    return {
        bars: [
            {
                c: 185.26,
                h: 185.31,
                l: 185.26,
                n: 120,
                o: 185.31,
                t: '2024-01-03T00:00:00Z',
                v: 2359,
                vw: 185.291289,
            },
            {
                c: 185.23,
                h: 185.24,
                l: 185.15,
                n: 187,
                o: 185.24,
                t: '2024-01-03T00:05:00Z',
                v: 5499,
                vw: 185.226363,
            },
            {
                c: 185.24,
                h: 185.24,
                l: 185.18,
                n: 145,
                o: 185.2,
                t: '2024-01-03T00:10:00Z',
                v: 4527,
                vw: 185.220156,
            },
            {
                c: 185.26,
                h: 185.29,
                l: 185.19,
                n: 140,
                o: 185.2,
                t: '2024-01-03T00:15:00Z',
                v: 6241,
                vw: 185.264973,
            },
            {
                c: 185.2491,
                h: 185.3,
                l: 185.2,
                n: 120,
                o: 185.29,
                t: '2024-01-03T00:20:00Z',
                v: 7167,
                vw: 185.275669,
            },
            {
                c: 185.21,
                h: 185.3,
                l: 185.2,
                n: 161,
                o: 185.2,
                t: '2024-01-03T00:25:00Z',
                v: 6537,
                vw: 185.223473,
            },
            {
                c: 185.18,
                h: 185.23,
                l: 185.18,
                n: 136,
                o: 185.2,
                t: '2024-01-03T00:30:00Z',
                v: 3693,
                vw: 185.199127,
            },
            {
                c: 184.9,
                h: 185,
                l: 184.9,
                n: 289,
                o: 185,
                t: '2024-01-03T09:00:00Z',
                v: 8305,
                vw: 184.923741,
            },
            {
                c: 184.88,
                h: 184.88,
                l: 184.73,
                n: 156,
                o: 184.85,
                t: '2024-01-03T09:05:00Z',
                v: 4403,
                vw: 184.84769,
            },
            {
                c: 184.87,
                h: 184.99,
                l: 184.87,
                n: 106,
                o: 184.87,
                t: '2024-01-03T09:10:00Z',
                v: 3445,
                vw: 184.947084,
            },
            {
                c: 184.86,
                h: 184.94,
                l: 184.86,
                n: 82,
                o: 184.93,
                t: '2024-01-03T09:15:00Z',
                v: 2395,
                vw: 184.879792,
            },
            {
                c: 183.75,
                h: 183.95,
                l: 183.71,
                n: 9647,
                o: 183.91,
                t: '2024-01-03T15:20:00Z',
                v: 807455,
                vw: 183.822858,
            },
            {
                c: 183.9587,
                h: 184.11,
                l: 183.63,
                n: 14855,
                o: 183.75,
                t: '2024-01-03T15:25:00Z',
                v: 970814,
                vw: 183.848749,
            },
            {
                c: 183.92,
                h: 184.12,
                l: 183.81,
                n: 23384,
                o: 183.955,
                t: '2024-01-03T15:30:00Z',
                v: 649020,
                vw: 183.971899,
            },
            {
                c: 183.78,
                h: 184.12,
                l: 183.72,
                n: 24307,
                o: 183.925,
                t: '2024-01-03T15:35:00Z',
                v: 679645,
                vw: 183.944852,
            },
            {
                c: 184.19,
                h: 184.2,
                l: 184.15,
                n: 85,
                o: 184.2,
                t: '2024-01-04T00:00:00Z',
                v: 1858,
                vw: 184.177322,
            },
        ],
        next_page_token: null,
        symbol: symbol,
    };
};
