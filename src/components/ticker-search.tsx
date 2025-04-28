'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Plus, Star, Loader2 } from 'lucide-react';
import { STOCK_SUGGESTIONS } from '@/data/stock';
import { toast, ToastContainer } from 'react-toastify';

interface TickerSearchProps {
    watchlistId: string;
    refetchWatchlist: () => void;
    currentSymbols: string[];
    handleTickerSelect: (ticker: string) => void;
}

const TickerSearch: React.FC<TickerSearchProps> = ({
    watchlistId,
    refetchWatchlist,
    currentSymbols,
    handleTickerSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<typeof STOCK_SUGGESTIONS>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Filter suggestions based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSuggestions([]);
            return;
        }

        const query = searchQuery.toUpperCase();
        const filtered = STOCK_SUGGESTIONS.filter(
            (stock) =>
                stock.ticker.includes(query) || stock.title.toUpperCase().includes(query),
        ).slice(0, 10); // Limit to 10 suggestions

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [searchQuery]);

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectSuggestion = (ticker: string) => {
        setSearchQuery(ticker);
        setShowSuggestions(false);
        handleTickerSelect(ticker);
    };

    const handleAddToWatchlist = async (ticker: string) => {
        if (!ticker || !watchlistId || currentSymbols.includes(ticker)) return;

        setIsAdding((prev) => ({ ...prev, [ticker]: true }));

        try {
            const response = await fetch(`/api/watchlist/${watchlistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol: ticker }),
            });
            const result = await response.json();

            if (result.success) {
                setSearchQuery('');
                refetchWatchlist();
                setShowSuggestions(false);
                toast.success(result.message);
            } else {
                // Handle potential errors returned from the API
                toast.error(result.message || `Failed to add ${ticker} to watchlist.`);
            }
        } catch (error) {
            console.error('Network or unexpected error adding ticker:', error);
            toast.error('An error occurred while adding the ticker.');
        } finally {
            setIsAdding((prev) => ({ ...prev, [ticker]: false }));
        }
    };

    return (
        <div className="relative w-full">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search ticker symbols..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                    />
                </div>
            </div>

            {showSuggestions && (
                <div
                    ref={suggestionRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
                >
                    {suggestions.map((stock) => (
                        <div
                            key={stock.ticker}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => handleSelectSuggestion(stock.ticker)}
                        >
                            <div>
                                <span className="font-medium">{stock.ticker}</span>
                                <span className="text-gray-500 text-sm truncate ml-2">
                                    {stock.title}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToWatchlist(stock.ticker);
                                }}
                                disabled={
                                    !!isAdding[stock.ticker] ||
                                    currentSymbols.includes(stock.ticker)
                                }
                                className="hover:bg-gray-200"
                            >
                                {isAdding[stock.ticker] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : currentSymbols.includes(stock.ticker) ? (
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                ) : (
                                    <Star className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default TickerSearch;
