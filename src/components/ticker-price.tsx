import { useState, useEffect } from 'react';
import { TableCell } from './ui/table';

export function TickerPrice({ ticker, selected }: { ticker: string; selected: boolean }) {
    const [price, setPrice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Generate mock data for the ticker
        const latestStock = async () => {
            const response = await fetch(`/api/market?symbol=${ticker}`);
            const res = await response.json();
            if (res) {
                try {
                    setPrice(res.bar.c);
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
                {price ? `$${price}` : 'Loading...'}
            </TableCell>
        </>
    );
}

export default TickerPrice;
