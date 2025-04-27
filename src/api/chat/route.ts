// src/api/chat/service.ts

import { removeSymbolFromWatchlist } from '../stocks/trading/service';

import { fetchLatestStockBySymbol } from '../stocks/market/service';
import { addSymbolToWatchlist } from '../stocks/trading/service';
import { NextResponse } from 'next/server';

export async function sendChatMessage(message: string) {
    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful stock assistant. Help users check stock prices and manage watchlists.',
                },
                { role: 'user', content: message },
            ],
            functions: [
                {
                    name: 'get_stock_price',
                    description: 'Get current stock price',
                    parameters: {
                        type: 'object',
                        properties: {
                            symbol: { type: 'string', description: 'The stock symbol' },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'add_to_watchlist',
                    description: 'Add stock to watchlist',
                    parameters: {
                        type: 'object',
                        properties: {
                            symbol: { type: 'string', description: 'The stock symbol to add' },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'remove_from_watchlist',
                    description: 'Remove stock from watchlist',
                    parameters: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'The stock symbol to remove',
                            },
                        },
                        required: ['symbol'],
                    },
                },
            ],
        }),
    });

    const data = await response.json();

    const choice = data.choices[0];

    if (choice.finish_reason === 'function_call') {
        const { name, arguments: args } = choice.message.function_call;

        const parsedArgs = JSON.parse(args);

        let result = '';
        let action = null;
        let symbol = null;

        if (name === 'get_stock_price') {
            const stockPrice = await fetchLatestStockBySymbol(parsedArgs.symbol.toUpperCase());

            if (stockPrice.isValid) {
                result = `Current price of ${parsedArgs.symbol.toUpperCase()} is $${
                    'bar' in stockPrice && stockPrice.bar && 'c' in stockPrice.bar
                        ? stockPrice.bar.c
                        : 0
                }`;
                symbol = parsedArgs.symbol.toUpperCase();
                action = 'get_stock_price';
            } else {
                result = `Sorry, I couldn't find the stock symbol "${parsedArgs.symbol.toUpperCase()}". Please check if the symbol is correct.`;
            }
        } else if (name === 'add_to_watchlist') {
            const stockCheck = await fetchLatestStockBySymbol(parsedArgs.symbol.toUpperCase());

            if (!stockCheck.isValid) {
                result = `Sorry, I couldn't find the stock symbol "${parsedArgs.symbol.toUpperCase()}". Please check if the symbol is correct.`;
            } else {
                const addResult = await addSymbolToWatchlist(
                    '6fc50fc6-a23e-4d30-89bf-062afb5e31e9',
                    parsedArgs.symbol.toUpperCase(),
                );

                if (addResult.success) {
                    result = `Added ${parsedArgs.symbol.toUpperCase()} to your watchlist ✅`;
                    action = 'add_to_watchlist';
                    symbol = parsedArgs.symbol.toUpperCase();
                } else if (addResult.error === 'duplicate_symbol') {
                    result = addResult.message;
                    action = null;
                    symbol = parsedArgs.symbol.toUpperCase();
                }
            }
        } else if (name === 'remove_from_watchlist') {
            await removeSymbolFromWatchlist(
                '6fc50fc6-a23e-4d30-89bf-062afb5e31e9',
                parsedArgs.symbol.toUpperCase(),
            );
            result = `Removed ${parsedArgs.symbol.toUpperCase()} from your watchlist 🗑️`;
            action = 'remove_from_watchlist';
            symbol = parsedArgs.symbol.toUpperCase();
        }

        return NextResponse.json({
            reply: result,
            action,
            symbol,
        });
    } else {
        return NextResponse.json({
            reply: choice.message.content,
            action: null,
            symbol: null,
        });
    }
}
