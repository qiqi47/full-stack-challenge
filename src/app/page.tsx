'use client';
import { useChat } from 'ai/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GridIcon, ListIcon } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { fetchWatchlist, fetchWatchlistById } from '@/api/stocks/trading/service';
import Watchlist from '@/components/watchlist';
import StockCard from '@/components/stock-card';
import TradingViewChart from '@/components/TradingViewChart';
import TickerSearch from '@/components/ticker-search';
import Chatbox from '@/components/chatbox';
// Favorite tickers to display
const FAVORITE_TICKERS = ['SPY', 'QQQ', 'AAPL', 'NVDA', 'ORCL', 'WMT', 'NFLX'];

// Time selection options
const TIME_OPTIONS = [
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '1y', label: '1Y' },
];

export default function TradingDashboard() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat',
    });

    const [selectedTicker, setSelectedTicker] = useState();
    const [timeframe, setTimeframe] = useState('1d');
    const [stockData, setStockData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [usingMockData, setUsingMockData] = useState(false);
    const [watchlistId, setWatchlistId] = useState<string>('');
    const [refetch, setRefetch] = useState(false);

    const refetchWatchlist = () => {
        setRefetch(!refetch);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const response = await fetchWatchlist();
            if (Array.isArray(response) && response.length > 0) {
                setWatchlistId(response[0].id);
            }
            setLoading(false);
        };
        fetchData();
    }, [refetch]);

    useEffect(() => {
        if (!watchlistId) return; // If no id, don't execute

        const fetchData = async () => {
            setLoading(true);
            const response = await fetchWatchlistById(watchlistId);
            if (response) {
                setStockData(response);
            }
            setLoading(false);
        };
        fetchData();
    }, [watchlistId, refetch]); // Run when watchlistId or refetch changes

    // Handle ticker selection
    const handleTickerSelect = (ticker: string) => {
        setSelectedTicker(ticker as any);
    };

    return (
        <div className="flex flex-col h-screen max-h-screen bg-slate-50">
            <Header usingMockData={usingMockData} />
            {/* Main content area (70% width) */}

            <div className="flex flex-1 overflow-hidden">
                <div className="w-full lg:w-[70%] p-4 overflow-auto">
                    {/* Main Chart */}
                    <Card className="w-full mb-4">
                        <div className="h-[400px] w-full">
                            <TradingViewChart
                                symbol={selectedTicker || stockData?.assets[0].symbol}
                            />
                        </div>
                    </Card>

                    {/* Favorites List */}
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

                        <Watchlist
                            stocks={stockData?.assets}
                            selectedTicker={selectedTicker || ''}
                            handleTickerSelect={handleTickerSelect}
                            watchlistId={watchlistId}
                            refetchWatchlist={refetchWatchlist}
                        />
                    </div>
                </div>

                <div className="hidden lg:block w-[30%] border-l bg-white overflow-hidden">
                    <div className="flex flex-col h-full">
                        <Chatbox refetchWatchlist={refetchWatchlist} />
                    </div>
                </div>
            </div>

            {/* Mobile chat button (visible on small screens) */}
            {/* <div className="lg:hidden fixed bottom-4 right-4">
                <Button className="rounded-full h-12 w-12 shadow-lg">
                    <Send className="h-5 w-5" />
                </Button>
            </div> */}
        </div>
    );
}
