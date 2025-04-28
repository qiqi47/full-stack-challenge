'use client';
import React from 'react';
import { TickerPrice } from './ticker-price';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
interface stock {
    id: string;
    cusip: string | null;
    class: string;
    exchange: string;
    symbol: string;
    name: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    maintenance_margin_requirement: number;
    margin_requirement_long: string;
    margin_requirement_short: string;
    shortable: boolean;
    easy_to_borrow: boolean;
    fractionable: boolean;
    attributes: string | null;
}

const Watchlist = ({
    stocks,
    selectedTicker,
    handleTickerSelect,
    watchlistId,
    refetchWatchlist,
}: {
    stocks: stock[];
    selectedTicker: string;
    handleTickerSelect: (ticker: string) => void;
    watchlistId: string;
    refetchWatchlist: () => void;
}) => {
    const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
        return (
            <div className="text-muted-foreground text-center py-4">No stocks in watchlist</div>
        );
    }

    const handleRemoveStock = async (symbol: string) => {
        setIsRemoving((prev) => ({ ...prev, [symbol]: true }));

        try {
            const response = await fetch(
                `/api/watchlist/${watchlistId}/symbols/${symbol.toUpperCase()}`,
                {
                    method: 'DELETE',
                },
            );

            const result = await response.json();

            if (!result.success) {
                toast.error(result.message);
            } else {
                toast.success(result.message);
                refetchWatchlist();
            }
        } catch (error) {
            console.error('Network or unexpected error removing stock:', error);
        } finally {
            setIsRemoving((prev) => ({ ...prev, [symbol]: false }));
        }
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Exchange</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stocks.map((stock) => (
                        <TableRow
                            key={stock.id}
                            className={`cursor-pointer ${
                                selectedTicker === stock.symbol ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => handleTickerSelect(stock.symbol)}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-1">
                                    {stock.symbol}
                                    {stock.fractionable && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                            F
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={stock.name}>
                                {stock.name}
                            </TableCell>
                            <TableCell>{stock.exchange}</TableCell>
                            <TableCell className="text-right">
                                <span
                                    className={`px-2 py-1 rounded text-xs ${
                                        stock.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100'
                                    }`}
                                >
                                    {stock.status}
                                </span>
                            </TableCell>
                            <TickerPrice
                                ticker={stock.symbol}
                                selected={selectedTicker === stock.symbol}
                            />
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer text-red-500 hover:bg-red-100 hover:text-red-600"
                                    size="icon"
                                    disabled={isRemoving[stock.symbol]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveStock(stock.symbol);
                                    }}
                                >
                                    {isRemoving[stock.symbol] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ToastContainer />
        </div>
    );
};

export default Watchlist;
