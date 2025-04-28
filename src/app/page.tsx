'use client';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/header';
import Watchlist from '@/components/watchlist';
import TradingViewChart from '@/components/TradingViewChart';
import type { TradingViewChartProps } from '@/components/TradingViewChart';
import TickerSearch from '@/components/ticker-search';
import Chatbox from '@/components/chatbox';
import { Skeleton } from '@/components/ui/skeleton';
import AuthRoute from './AuthRoute';

// Define an interface for the Watchlist object based on Alpaca's structure
interface AlpacaWatchlist {
    id: string;
    account_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    assets: any[]; // Define more specific type if needed
}

export default function TradingDashboard() {
    const [selectedTicker, setSelectedTicker] = useState<string | undefined>('');
    const [stockData, setStockData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [usingMockData, setUsingMockData] = useState(false);
    const [watchlistId, setWatchlistId] = useState<string>('');
    const [refetch, setRefetch] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetchWatchlist = () => {
        setRefetch(!refetch);
    };

    useEffect(() => {
        const fetchWatchlistId = async () => {
            setLoading(true);
            setError(null);
            setWatchlistId('');
            try {
                const res = await fetch('/api/watchlist');
                if (!res.ok) {
                    throw new Error(`Failed to fetch watchlists: ${res.statusText}`);
                }
                const data = await res.json();

                if (data.success && data.watchlists && data.watchlists.length > 0) {
                    setWatchlistId(data.watchlists[0].id);
                } else if (!data.success) {
                    throw new Error(data.message || 'Failed to get watchlists from API');
                } else {
                    console.log('No watchlists found for this account.');
                }
            } catch (err: any) {
                console.error('Error fetching watchlist ID:', err);
                setError(err.message || 'An unknown error occurred');
            }
        };

        fetchWatchlistId();
    }, [refetch]);

    useEffect(() => {
        if (!watchlistId) {
            setStockData(null);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/watchlist/${watchlistId}`);
                const response = await res.json();

                if (response.response.assets) {
                    setStockData(response.response.assets);
                } else {
                    setStockData(null);
                }
            } catch (error) {
                console.error('Failed to fetch watchlist details:', error);
                setStockData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [watchlistId, refetch]);

    const handleTickerSelect = (ticker: string) => {
        setSelectedTicker(ticker);
    };

    return (
        <AuthRoute>
            <div className="flex flex-col h-screen bg-gray-50">
                <Header usingMockData={usingMockData} />
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 p-6 overflow-y-auto">
                        <Card className="p-4 mb-4 h-[400px]">
                            <TradingViewChart
                                symbol={selectedTicker || stockData?.[0]?.symbol}
                            />
                        </Card>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">Favorites</h3>
                            </div>

                            {watchlistId && (
                                <div className="mb-3">
                                    <TickerSearch
                                        watchlistId={watchlistId}
                                        refetchWatchlist={refetchWatchlist}
                                        handleTickerSelect={handleTickerSelect}
                                        currentSymbols={
                                            stockData?.assets?.map(
                                                (stock: { symbol: string }) => stock.symbol,
                                            ) || []
                                        }
                                    />
                                </div>
                            )}

                            {loading && !stockData && watchlistId ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, index) => (
                                        <Skeleton key={index} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : watchlistId ? (
                                <Watchlist
                                    stocks={stockData}
                                    selectedTicker={selectedTicker || ''}
                                    handleTickerSelect={handleTickerSelect}
                                    watchlistId={watchlistId}
                                    refetchWatchlist={refetchWatchlist}
                                />
                            ) : (
                                !loading && (
                                    <div className="text-muted-foreground text-center py-4">
                                        {error ? (
                                            <span className="text-red-500">Error: {error}</span>
                                        ) : (
                                            'No watchlist found or selected.'
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:block w-[30%] border-l bg-white overflow-hidden">
                        <div className="flex flex-col h-full">
                            <Chatbox
                                refetchWatchlist={refetchWatchlist}
                                handleTickerSelect={handleTickerSelect}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthRoute>
    );
}
