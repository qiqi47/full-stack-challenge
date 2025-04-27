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

    // Handle timeframe change
    const handleTimeframeChange = (value: string) => {
        setTimeframe(value);
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
                        <div className="border-b p-4">
                            <h2 className="text-lg font-semibold">Trading Assistant</h2>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {messages.length === 0 && (
                                <div className="flex h-full items-center justify-center text-center p-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Ask me about stocks, market trends, or request
                                            information for any ticker.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div key={message.id} className="mb-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar
                                            className={
                                                message.role === 'user'
                                                    ? 'bg-primary'
                                                    : 'bg-muted'
                                            }
                                        >
                                            <AvatarFallback>
                                                {message.role === 'user' ? 'U' : 'AI'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <div className="font-semibold">
                                                {message.role === 'user' ? 'You' : 'AI'}
                                            </div>
                                            <div className="text-sm">{message.content}</div>
                                        </div>
                                    </div>

                                    {message.toolInvocations?.map((toolInvocation) => {
                                        const { toolName, toolCallId, state } = toolInvocation;
                                        if (state === 'result' && toolName === 'getStockInfo') {
                                            const { result } = toolInvocation;
                                            return (
                                                <div key={toolCallId} className="mt-4 ml-10">
                                                    <Card className="p-3">
                                                        <div className="text-sm">
                                                            <div className="font-semibold">
                                                                {result.symbol}
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Price:</span>
                                                                <span className="font-medium">
                                                                    ${result.price}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Change:</span>
                                                                <span
                                                                    className={
                                                                        Number(result.change) >=
                                                                        0
                                                                            ? 'text-green-600'
                                                                            : 'text-red-600'
                                                                    }
                                                                >
                                                                    {Number(result.change) >= 0
                                                                        ? '+'
                                                                        : ''}
                                                                    {result.change}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                        </ScrollArea>

                        <div className="border-t p-4">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Ask about stocks..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
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

// Small component to show ticker prices in the favorites list
// function TickerPrice({
//     ticker,
//     selected,
//     listView = false,
// }: {
//     ticker: string;
//     selected: boolean;
//     listView?: boolean;
// }) {
//     const [price, setPrice] = useState<string | null>(null);
//     const [change, setChange] = useState<number>(0);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         setLoading(true);

//         // Use the utility function with fallback to mock data
//         fetchStockData(ticker, '1d').then((data) => {
//             if (data) {
//                 setPrice(data.currentPrice);
//                 setChange(parseFloat(data.percentChange));
//             }
//             setLoading(false);
//         });
//     }, [ticker]);

//     if (loading || !price)
//         return <div className="h-4 animate-pulse bg-gray-200 rounded w-full mt-1"></div>;

//     return (
//         <>
//             {listView ? (
//                 <>
//                     <td className="px-4 py-3 text-right">${price}</td>
//                     <td
//                         className={`px-4 py-3 text-right ${
//                             change >= 0 ? 'text-green-600' : 'text-red-600'
//                         }`}
//                     >
//                         {change >= 0 ? '+' : ''}
//                         {change.toFixed(2)}%
//                     </td>
//                 </>
//             ) : (
//                 <div className={`text-xs ${selected ? 'font-medium' : ''}`}>
//                     <div>${price}</div>
//                     <div className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
//                         {change >= 0 ? '+' : ''}
//                         {change.toFixed(2)}%
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }
