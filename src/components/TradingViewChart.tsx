'use client';
import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
    symbol: string;
    interval?: string;
}

export default function TradingViewChart({ symbol, interval = 'D' }: TradingViewChartProps) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
        script.innerHTML = `
    {
      "autosize": true,
      "symbol": "${symbol || 'SPY'}",
      "interval": "${interval}",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "support_host": "https://www.tradingview.com"
    }`;

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
    }, [symbol, interval]);

    return (
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
                        <span className="blue-text">Track all markets on TradingView</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
