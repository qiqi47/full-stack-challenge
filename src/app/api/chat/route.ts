// src/api/chat/service.ts

'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { message } = await request.json();

    // Add a check to ensure message is a string
    if (typeof message !== 'string') {
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
            const response = await fetch(
                `https://data.alpaca.markets/v2/stocks/${parsedArgs.symbol}/bars/latest`,
                {
                    headers: {
                        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                        Accept: 'application/json',
                    },
                },
            );

            const res = await response.json();
            if (res && !res.message && res.symbol) {
                try {
                    result = `Current price of ${parsedArgs.symbol.toUpperCase()} is $${
                        'bar' in res && res.bar && 'c' in res.bar ? res.bar.c : 0
                    }`;
                    symbol = parsedArgs.symbol.toUpperCase();
                    action = 'get_stock_price';
                } catch (error) {
                    console.log(error, 'error');
                    result = `Sorry, I couldn't find the stock symbol "${parsedArgs.symbol.toUpperCase()}". Please check if the symbol is correct.`;
                }
            } else {
                result = `Sorry, I couldn't find the stock symbol "${parsedArgs.symbol.toUpperCase()}". Please check if the symbol is correct.`;
            }
        } else if (name === 'add_to_watchlist') {
            const response = await fetch(
                `https://data.alpaca.markets/v2/stocks/${parsedArgs.symbol}/bars/latest`,
                {
                    headers: {
                        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                        Accept: 'application/json',
                    },
                },
            );

            const res = await response.json();
            if (!res || res.message || !res.symbol) {
                result = `Sorry, I couldn't find the stock symbol "${parsedArgs.symbol.toUpperCase()}". Please check if the symbol is correct.`;
            } else {
                const addResult = await fetch(
                    `https://paper-api.alpaca.markets/v2/watchlists/6fc50fc6-a23e-4d30-89bf-062afb5e31e9`,
                    {
                        method: 'POST',
                        headers: {
                            'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                            'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ symbol: res.symbol }),
                    },
                ).then((res) => res.json());
                console.log(addResult, 'addResult');
                if (
                    addResult.message === `duplicate symbol: ${parsedArgs.symbol.toUpperCase()}`
                ) {
                    result = `${parsedArgs.symbol.toUpperCase()} is already in your watchlist`;
                    action = null;
                    symbol = parsedArgs.symbol.toUpperCase();
                } else if (addResult) {
                    result = `Added ${parsedArgs.symbol.toUpperCase()} to your watchlist ✅`;
                    action = 'add_to_watchlist';
                    symbol = parsedArgs.symbol.toUpperCase();
                }
            }
        } else if (name === 'remove_from_watchlist') {
            const removeResult = await fetch(
                `https://paper-api.alpaca.markets/v2/watchlists/6fc50fc6-a23e-4d30-89bf-062afb5e31e9/${parsedArgs.symbol.toUpperCase()}`,
                {
                    method: 'DELETE',
                    headers: {
                        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                        Accept: 'application/json',
                    },
                },
            ).then((res) => res.json());

            if (removeResult) {
                result = `Removed ${parsedArgs.symbol.toUpperCase()} from your watchlist 🗑️`;
                action = 'remove_from_watchlist';
                symbol = parsedArgs.symbol.toUpperCase();
            } else {
                result = `Failed to remove ${parsedArgs.symbol.toUpperCase()} from your watchlist 🚫`;
                action = null;
                symbol = parsedArgs.symbol.toUpperCase();
            }
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
