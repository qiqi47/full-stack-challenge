'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Plus, Star } from 'lucide-react';
import { addSymbolToWatchlist } from '@/api/stocks/trading/service';
import { STOCK_SUGGESTIONS } from '@/data/stock';

interface TickerSearchProps {
    watchlistId: string;
    refetchWatchlist: () => void;
    currentSymbols: string[];
}

const TickerSearch: React.FC<TickerSearchProps> = ({
    watchlistId,
    refetchWatchlist,
    currentSymbols,
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<typeof STOCK_SUGGESTIONS>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
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
    };

    const handleAddToWatchlist = async (ticker: string) => {
        if (!ticker || !watchlistId || currentSymbols.includes(ticker)) return;

        try {
            setIsAdding(true);
            await addSymbolToWatchlist(watchlistId, ticker);
            setSearchQuery('');
            refetchWatchlist();
            setShowSuggestions(false); // Hide suggestions after adding
        } catch (error) {
            console.error('Failed to add ticker to watchlist:', error);
        } finally {
            setIsAdding(false);
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
                            <span className="font-medium">{stock.ticker}</span>
                            <div className="flex flex-row gap-4 items-center ">
                                <span className="text-gray-500 text-sm truncate ml-2">
                                    {stock.title}
                                </span>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToWatchlist(stock.ticker);
                                    }}
                                    disabled={
                                        !stock.ticker ||
                                        isAdding ||
                                        currentSymbols.includes(stock.ticker)
                                    }
                                    size="icon"
                                    className="hover:bg-transparent hover:border-1 hover:border-black hover:text-black cursor-pointer "
                                >
                                    <Star className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TickerSearch;
