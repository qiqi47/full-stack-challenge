'use client';

import React from 'react';

interface StockChartProps {
    symbol: string;
    timeframe: string;
    data: Array<{
        date: string;
        price: string;
        volume: number;
    }>;
}

export function StockChart({ symbol, timeframe, data }: StockChartProps) {
    // This is a placeholder for a real chart component
    // In a real app, you would use a charting library like recharts, chart.js, etc.

    const firstPrice = parseFloat(data[0]?.price || '0');
    const lastPrice = parseFloat(data[data.length - 1]?.price || '0');
    const isPositive = lastPrice >= firstPrice;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">
                {symbol} • {timeframe} • {data.length} data points
            </div>

            <div className="flex-1 relative">
                {/* Simple price visualization */}
                <div className="absolute inset-0 flex items-end">
                    {data.map((point, i) => {
                        const height = `${
                            (parseFloat(point.price) /
                                Math.max(...data.map((d) => parseFloat(d.price)))) *
                            100
                        }%`;
                        return (
                            <div
                                key={i}
                                className={`flex-1 ${
                                    isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`}
                                style={{ height }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
