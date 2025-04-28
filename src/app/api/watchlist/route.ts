import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://paper-api.alpaca.markets/v2/watchlists', {
            headers: {
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                accept: 'application/json',
            },
        });
        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Failed to fetch watchlists from Alpaca' },
                { status: response.status },
            );
        }
        const watchlists = await response.json();
        if (watchlists && Array.isArray(watchlists)) {
            return NextResponse.json({ success: true, watchlists: watchlists });
        } else {
            return NextResponse.json(
                { success: false, message: 'No watchlists found or invalid format received' },
                { status: 404 },
            );
        }
    } catch (error: any) {
        console.error('API error fetching watchlist:', error);

        // Determine the status code from the error response if possible
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to fetch watchlist';

        return NextResponse.json({ message }, { status });
    }
}
