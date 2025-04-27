import { useState, useEffect } from 'react';
import { fetchLatestStockBySymbol } from '@/api/stocks/market/service';
import { TableCell } from './ui/table';

export function TickerPrice({ ticker, selected }: { ticker: string; selected: boolean }) {
    const [price, setPrice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Generate mock data for the ticker
        const latestStock = async () => {
            const response = await fetchLatestStockBySymbol(ticker);
            if (response) {
                try {
                    setPrice(response);
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to fetch stock data:', error);
                    setLoading(false);
                }
            }
        };
        latestStock();
    }, [ticker]);

    return (
        <>
            <TableCell className="px-4 py-3 text-right">
                {price && price.bar ? `$${price.bar.c}` : 'Loading...'}
            </TableCell>
        </>
    );
}

export default TickerPrice;
