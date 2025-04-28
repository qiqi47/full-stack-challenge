import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request, // Standard first arg
    { params }: { params: { id: string; symbol: string } },
) {
    const watchlistId = params.id;
    const symbolToRemove = params.symbol?.toUpperCase();

    if (!watchlistId) {
        return NextResponse.json({ message: 'Watchlist ID is required' }, { status: 400 });
    }
    if (!symbolToRemove) {
        return NextResponse.json({ message: 'Symbol is required' }, { status: 400 });
    }

    const url = `https://paper-api.alpaca.markets/v2/watchlists/${watchlistId}/${symbolToRemove}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                // Keys are checked above, so should be present here
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY!,
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET!,
            },
        });

        // Check if the Alpaca API request was successful
        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Failed to remove symbol' },
                { status: response.status },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: `Symbol ${symbolToRemove} removed from watchlist ${watchlistId}`,
            },
            { status: 200 }, // Use 200 OK for consistency
        );
    } catch (error) {
        // Handle network errors or other exceptions during fetch
        console.error(`Network or unexpected error removing symbol ${symbolToRemove}:`, error);
        return NextResponse.json(
            { success: false, message: 'An unexpected server error occurred.' },
            { status: 500 },
        );
    }
}
