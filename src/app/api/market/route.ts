import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define mockStockData or import it if it exists elsewhere
const mockStockData = { bar: {}, symbol: 'MOCK', isValid: true }; // Placeholder

// Common headers to add to responses
const responseHeaders = {
    'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
};

// This endpoint expects a query parameter like /api/market?symbol=AAPL
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json(
            { message: 'Symbol query parameter is required' },
            { status: 400, headers: responseHeaders }, // Add headers
        );
    }

    const upperSymbol = symbol.toUpperCase();

    try {
        const response = await fetch(
            `https://data.alpaca.markets/v2/stocks/${upperSymbol}/bars/latest`,
            {
                method: 'GET',
                headers: {
                    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                    accept: 'application/json',
                },
            },
        );
        const res = await response.json();

        return NextResponse.json(
            {
                ...(res as any), // Assuming response is the data object
                symbol: upperSymbol,
                isValid: true,
            },
            { status: 200, headers: responseHeaders }, // Add headers
        );
    } catch (error) {
        console.error(`API error fetching market data for ${upperSymbol}:`, error);

        // Check if this is a 404 (Not Found) error from Alpaca

        return NextResponse.json(
            {
                isValid: false,
                symbol: upperSymbol,
                error: 'Invalid symbol',
                message: `Symbol ${upperSymbol} not found.`, // Add a user-friendly message
            },
            { status: 404, headers: responseHeaders }, // Add headers
        );
    }
}
