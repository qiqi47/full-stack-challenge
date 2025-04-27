'use client';
import React, { useEffect, useState } from 'react';
import { TickerPrice } from './ticker-price';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const Watchlist = ({
    stocks,
    selectedTicker,
    handleTickerSelect,
}: {
    stocks: any[];
    selectedTicker: string;
    handleTickerSelect: (ticker: string) => void;
}) => {
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
        return (
            <div className="text-muted-foreground text-center py-4">No stocks in watchlist</div>
        );
    }

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
                        {/* <TableHead className="text-right">Change</TableHead> */}
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Watchlist;
