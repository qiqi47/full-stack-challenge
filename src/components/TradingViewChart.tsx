'use client';
import { useEffect, useRef, useState } from 'react';

// Export the interface
export interface TradingViewChartProps {
    symbol: string;
    interval?: string;
    loading?: boolean;
}

export default function TradingViewChart({
    symbol,
    interval = 'D',
    loading,
}: TradingViewChartProps) {
    const container = useRef<HTMLDivElement>(null);
    const [display, setDisplay] = useState(false);

    useEffect(() => {
        if (loading) {
            setDisplay(false);
        } else {
            setTimeout(() => {
                setDisplay(true);
            }, 1000);
        }
    }, [loading]);

    useEffect(() => {
        // Skip if display is false to avoid unnecessary script loading
        if (!display) return;

        if (container.current) {
            while (container.current.firstChild) {
                container.current.removeChild(container.current.firstChild);
            }
        }

        const script = document.createElement('script');
        script.src =
            'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;

        // Use SPY as fallback if symbol is empty
        const safeSymbol = symbol || 'SPY';

        script.innerHTML = `
    {
      "autosize": true,
      "symbol": "${safeSymbol}",
      "interval": "${interval}",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "support_host": "https://www.tradingview.com"
    }`;

        console.log('Loading TradingView chart with symbol:', safeSymbol);

        if (container.current) {
            container.current.appendChild(script);
        }

        // 组件卸载时清理
        return () => {
            if (container.current) {
                while (container.current.firstChild) {
                    container.current.removeChild(container.current.firstChild);
                }
            }
        };
    }, [symbol, interval, display]);

    return (
        <div className="h-full w-full">
            {!display && (
                <div className="h-full w-full flex items-center justify-center">
                    Loading chart...
                </div>
            )}
            {display && (
                <div className="h-full w-full">
                    <div
                        className="tradingview-widget-container"
                        ref={container}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <div
                            className="tradingview-widget-container__widget"
                            style={{
                                height: 'calc(100% - 32px)',
                                width: '100%',
                            }}
                        ></div>
                        <div className="tradingview-widget-copyright">
                            <a
                                href="https://www.tradingview.com/"
                                rel="noopener nofollow"
                                target="_blank"
                            >
                                <span className="blue-text">
                                    Track all markets on TradingView
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
