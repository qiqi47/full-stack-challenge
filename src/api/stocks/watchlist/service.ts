import { fetchFromAlpaca } from '../route';
import { watchlistEndpoints } from './constant';

export const fetchOrders = async () => {
    try {
        const response = await fetchFromAlpaca(watchlistEndpoints.watchlist);
        return { data: response.data, error: null };
    } catch (error: any) {
        return { data: null, error: error.response.data };
    }
};
