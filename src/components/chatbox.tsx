'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Info, Plus, Minus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chatbox({
    refetchWatchlist,
    handleTickerSelect,
}: {
    refetchWatchlist?: () => void;
    handleTickerSelect?: (ticker: string) => void;
}) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>(
        [],
    );
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

            // Check for watchlist actions in the response metadata
            if (
                data.action &&
                ['add_to_watchlist', 'remove_from_watchlist'].includes(data.action) &&
                refetchWatchlist
            ) {
                refetchWatchlist();
            }

            // If AI response contains a stock symbol, update the TradingView chart
            if (data.symbol && handleTickerSelect) {
                handleTickerSelect(data.symbol);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full flex flex-col max-w-md mx-auto m-4 border-0 shadow-lg h-screen">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Stock Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pb-0">
                <ScrollArea className="h-4/5 pr-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                            <Info className="h-12 w-12 mb-4 text-primary/40" />
                            <p className="mb-3 font-medium">Welcome to your stock assistant!</p>
                            <p className="text-sm mb-3">You can ask about:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                    <span>
                                        Stock prices (e.g., "What's the price of AAPL?")
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-primary" />
                                    <span>
                                        Add stocks to watchlist (e.g., "Add TSLA to my
                                        watchlist")
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Minus className="h-4 w-4 text-primary" />
                                    <span>
                                        Remove stocks (e.g., "Remove MSFT from my list")
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex',
                                        msg.role === 'user' ? 'justify-end' : 'justify-start',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[80%] px-4 py-2 rounded-lg',
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a stock..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading} size="icon">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
