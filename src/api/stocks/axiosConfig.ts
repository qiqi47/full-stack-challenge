import axios from 'axios';

// Create a base axios instance for Alpaca Trade API
const alpacaTradeApi = axios.create({
    baseURL: 'https://paper-api.alpaca.markets/v2',
    headers: {
        'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_API_SECRET,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for error handling
alpacaTradeApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;

        if (response) {
            console.error('Alpaca API Error:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
            });
        } else {
            console.error('Alpaca API Error:', error.message);
        }

        return Promise.reject(error);
    },
);

const alpacaMarketApi = axios.create({
    baseURL: 'https://data.alpaca.markets/v2',
    headers: {
        'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_API_SECRET,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for error handling
alpacaMarketApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;

        if (response) {
            console.error('Alpaca API Error:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
            });
        } else {
            console.error('Alpaca API Error:', error.message);
        }

        return Promise.reject(error);
    },
);

export { alpacaTradeApi, alpacaMarketApi };
