'use client';

import { useState } from 'react';
import { sendChatMessage } from '@/api/chat/route';

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
            const response = await sendChatMessage(input);
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
        <div className="max-w-md mx-auto p-4 m-4 border rounded shadow flex flex-col w-full h-screen">
            <div className="flex-grow overflow-y-auto border p-2 rounded bg-gray-50 mb-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 p-4 h-full flex flex-col justify-center">
                        <p className="mb-2 font-medium">Welcome to your stock assistant!</p>
                        <p className="text-sm">You can ask about:</p>
                        <ul className="text-sm mt-2">
                            <li>• Stock prices (e.g., "What's the price of AAPL?")</li>
                            <li>
                                • Add stocks to your watchlist (e.g., "Add TSLA to my
                                watchlist")
                            </li>
                            <li>
                                • Remove stocks from your watchlist (e.g., "Remove MSFT from my
                                list")
                            </li>
                        </ul>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-2 ${
                                msg.role === 'user' ? 'text-right' : 'text-left'
                            }`}
                        >
                            <span
                                className={`inline-block px-3 py-2 rounded ${
                                    msg.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-300'
                                }`}
                            >
                                {msg.content}
                            </span>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="text-left">
                        <span className="inline-block px-3 py-2 rounded bg-gray-300">
                            Thinking...
                        </span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2 mt-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Ask about a stock..."
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
