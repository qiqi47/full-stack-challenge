'use client';

import { useState } from 'react';
import { sendChatMessage } from '@/api/chat/route'; // 记得路径对上！

export default function Chatbox({ refetchWatchlist }: { refetchWatchlist?: () => void }) {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded shadow space-y-4">
            <div className="h-80 overflow-y-auto border p-2 rounded bg-gray-50">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <span
                            className={`inline-block px-3 py-2 rounded ${
                                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'
                            }`}
                        >
                            {msg.content}
                        </span>
                    </div>
                ))}
                {loading && (
                    <div className="text-left">
                        <span className="inline-block px-3 py-2 rounded bg-gray-300">
                            Thinking...
                        </span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
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
