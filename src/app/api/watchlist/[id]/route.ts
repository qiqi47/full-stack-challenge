import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const watchlistId = request.nextUrl.pathname.split('/').pop();
    if (!watchlistId) {
        return NextResponse.json({ message: 'Watchlist ID is required' }, { status: 400 });
    }

    try {
        const url = `https://paper-api.alpaca.markets/v2/watchlists/${watchlistId}`;
        const response = await fetch(url, {
            headers: {
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                accept: 'application/json',
            },
        });
        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Failed to fetch watchlist by id' },
                { status: 500 },
            );
        }
        const res = await response.json();
        return NextResponse.json({ success: true, response: res });
    } catch (error) {
        console.error(`API error fetching watchlist ${watchlistId}:`, error);
        return NextResponse.json({ message: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const watchlistId = id;
    const body = await request.json();
    const symbolToAdd = body.symbol.toUpperCase();

    try {
        const url = `https://paper-api.alpaca.markets/v2/watchlists/${watchlistId}`;
        // Make the actual API call to Alpaca to add the symbol
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({ symbol: symbolToAdd }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Failed to add symbol' },
                { status: 500 },
            );
        }
        const res = await response.json();

        // Return the successful response from Alpaca (or a custom success message)
        return NextResponse.json(
            {
                success: true,
                data: res,
                message: `${symbolToAdd} has been added to watchlist ${watchlistId}`,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(
            `API error adding symbol ${symbolToAdd} to watchlist ${watchlistId}:`,
            error,
        );

        return NextResponse.json(
            { success: false, message: 'Failed to add symbol' },
            { status: 500 },
        );
    }
}
