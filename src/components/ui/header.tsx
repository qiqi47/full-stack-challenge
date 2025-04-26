'use client';
import React from 'react';

export const Header = ({ usingMockData }: { usingMockData: boolean }) => {
    return (
        <header className="border-b bg-white p-4">
            <h1 className="text-2xl font-bold">Trading AI Dashboard</h1>
            {usingMockData && (
                <div className="text-xs text-amber-600 mt-1">
                    Using mock data (API limit reached or service unavailable)
                </div>
            )}
        </header>
    );
};

export default Header;
