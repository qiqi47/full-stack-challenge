import React, { useState, useEffect } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { fetchStockBars } from '@/api/stocks/market/service';

interface BarData {
    c: number; // close
    h: number; // high
    l: number; // low
    n: number; // number of trades
    o: number; // open
    t: string; // timestamp
    v: number; // volume
    vw: number; // volume weighted average price
}

interface StockData {
    bars: BarData[];
    next_page_token: string | null;
    symbol: string;
}

interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    color: string;
    originalTime: string; // Keep original timestamp for sorting
}

interface StockCardProps {
    symbol: string;
    timeframe?: string;
}

const formatDate = (dateString: string, timeframe: string) => {
    const date = new Date(dateString);

    // For intraday data, show time
    if (
        timeframe === '5m' ||
        timeframe === '15m' ||
        timeframe === '30m' ||
        timeframe === '1h' ||
        timeframe === '4h'
    ) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // For daily data, show date
    if (timeframe === '1d') {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // For weekly/monthly, show month and year
    if (timeframe === '1m' || timeframe === '3m') {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // For yearly data
    if (timeframe === '1y') {
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    }

    // Default
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const StockCard: React.FC<StockCardProps> = ({ symbol, timeframe = '1d' }) => {
    const [data, setData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbol) {
            setData([]);
            setLoading(false);
            return;
        }

        // Set loading state
        setLoading(true);

        // Calculate date range based on timeframe
        const getDateRange = () => {
            const end = new Date();
            const start = new Date();

            switch (timeframe) {
                case '5m':
                case '15m':
                case '30m':
                    // For short timeframes, go back 1 day
                    start.setDate(start.getDate() - 1);
                    break;
                case '1h':
                case '4h':
                    // For hourly, go back 1 week
                    start.setDate(start.getDate() - 7);
                    break;
                case '1d':
                    // For daily, go back 1 month
                    start.setMonth(start.getMonth() - 1);
                    break;
                case '1m':
                    // Go back 3 months
                    start.setMonth(start.getMonth() - 3);
                    break;
                case '3m':
                    // Go back 6 months
                    start.setMonth(start.getMonth() - 6);
                    break;
                case '1y':
                    // Go back 1 year
                    start.setFullYear(start.getFullYear() - 1);
                    break;
                default:
                    // Default: 1 month
                    start.setMonth(start.getMonth() - 1);
            }

            return {
                start: start.toISOString(),
                end: end.toISOString(),
            };
        };

        const { start, end } = getDateRange();

        const loadData = async () => {
            try {
                console.log(
                    `Loading stock data for ${symbol} with timeframe ${timeframe}, range: ${start} to ${end}`,
                );

                // Call the API service
                const response = await fetchStockBars(symbol, timeframe, start, end);

                if (response && response.bars && response.bars.length > 0) {
                    console.log(`Received ${response.bars.length} data points for ${symbol}`);

                    // Transform the data for the chart
                    const chartData = response.bars.map((item) => ({
                        time: formatDate(item.t, timeframe),
                        open: item.o,
                        high: item.h,
                        low: item.l,
                        close: item.c,
                        volume: item.v,
                        color: item.c >= item.o ? '#26a69a' : '#ef5350', // green if close >= open, red otherwise
                        originalTime: item.t, // keep original time for sorting
                    }));

                    // Sort data by timestamp
                    const sortedData = chartData.sort(
                        (a, b) =>
                            new Date(a.originalTime).getTime() -
                            new Date(b.originalTime).getTime(),
                    );

                    setData(sortedData);
                } else {
                    console.error('No data available or invalid response format');
                    setError('No data available for the selected timeframe');
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to load stock data:', err);
                setError('Failed to load stock data');
                setLoading(false);
            }
        };

        loadData();
    }, [symbol, timeframe]);

    // Function to filter data based on dataset size and timeframe
    const filterDataByTimeframe = (data: CandleData[], timeframe: string) => {
        // For very large datasets, sample the data to improve performance
        if (data.length > 100) {
            const sampleInterval = Math.max(1, Math.floor(data.length / 100));
            return data.filter((_, i) => i % sampleInterval === 0);
        }

        return data;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-500">{error}</div>
        );
    }

    if (!symbol || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">
                    {!symbol ? 'Select a symbol to view chart' : 'No data available'}
                </div>
            </div>
        );
    }

    // Filter data based on timeframe
    const filteredData = filterDataByTimeframe(data, timeframe);

    // Find min and max values for better chart scaling
    const minValue = Math.min(...filteredData.map((d) => d.low)) * 0.998;
    const maxValue = Math.max(...filteredData.map((d) => d.high)) * 1.002;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-background border rounded shadow-lg p-2 text-sm">
                    <p className="font-bold">{data.time}</p>
                    <p>Open: ${data.open.toFixed(2)}</p>
                    <p>High: ${data.high.toFixed(2)}</p>
                    <p>Low: ${data.low.toFixed(2)}</p>
                    <p>Close: ${data.close.toFixed(2)}</p>
                    <p>Volume: {data.volume.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    // Set the number of ticks on the x-axis based on data length
    const getTickCount = (dataLength: number) => {
        if (dataLength <= 10) return dataLength;
        if (dataLength <= 30) return 10;
        if (dataLength <= 60) return 15;
        if (dataLength <= 100) return 20;
        return 25;
    };

    return (
        <div className="h-full w-full p-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{symbol} Stock Chart</h3>
                <div className="text-sm text-muted-foreground">
                    Timeframe: {timeframe} • {filteredData.length} data points
                </div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart
                    data={filteredData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        tickCount={getTickCount(filteredData.length)}
                    />
                    <YAxis
                        domain={[minValue, maxValue]}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Candlestick representation */}
                    {filteredData.map((entry, index) => (
                        <React.Fragment key={`candle-${index}`}>
                            {/* High-Low Line */}
                            <Line
                                dataKey="high"
                                data={[entry]}
                                stroke="gray"
                                dot={false}
                                isAnimationActive={false}
                                activeDot={false}
                                legendType="none"
                            />
                            <Line
                                dataKey="low"
                                data={[entry]}
                                stroke="gray"
                                dot={false}
                                isAnimationActive={false}
                                activeDot={false}
                                legendType="none"
                            />

                            {/* Open-Close Bar */}
                            <Bar
                                dataKey={entry.close >= entry.open ? 'close' : 'open'}
                                data={[entry]}
                                fill={entry.color}
                                stroke={entry.color}
                                barSize={8}
                                isAnimationActive={false}
                                legendType="none"
                            />
                        </React.Fragment>
                    ))}

                    {/* Close line - connects all close prices */}
                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#8884d8"
                        dot={false}
                        isAnimationActive={false}
                        name="Close Price"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockCard;
