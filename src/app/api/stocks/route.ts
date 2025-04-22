import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'; // Use 'demo' for testing

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const timeframe = searchParams.get('timeframe');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    let apiFunction;
    let interval;

    // Map our timeframe to Alpha Vantage parameters
    if (['5m', '15m', '30m', '1h', '4h'].includes(timeframe || '')) {
      apiFunction = 'TIME_SERIES_INTRADAY';
      
      // Map our timeframes to Alpha Vantage intervals
      switch(timeframe) {
        case '5m': interval = '5min'; break;
        case '15m': interval = '15min'; break;
        case '30m': interval = '30min'; break;
        case '1h': interval = '60min'; break;
        case '4h': interval = '60min'; break; // Note: Alpha Vantage doesn't have 4h, closest is 60min
        default: interval = '60min';
      }
    } else if (timeframe === '1d') {
      apiFunction = 'TIME_SERIES_DAILY';
    } else {
      // For longer timeframes like 1m, 3m, 1y
      apiFunction = 'TIME_SERIES_DAILY';
    }

    // Build the API URL
    let url = `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    if (interval) {
      url += `&interval=${interval}`;
    }
    
    // Add outputsize=full for longer timeframes
    if (['1m', '3m', '1y'].includes(timeframe || '')) {
      url += '&outputsize=full';
    }

    const response = await fetch(url);
    const data = await response.json();

    // Process the data based on the timeframe
    const processedData = processAlphaVantageData(data, timeframe || '1d', symbol);
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' }, 
      { status: 500 }
    );
  }
}

function processAlphaVantageData(data: any, timeframe: string, symbol: string) {
  // Handle error response from Alpha Vantage
  if (data['Error Message']) {
    return {
      symbol,
      timeframe,
      error: data['Error Message'],
      data: []
    };
  }
  
  // Extract the time series data
  let timeSeries;
  if (timeframe === '1d' || ['1m', '3m', '1y'].includes(timeframe)) {
    timeSeries = data['Time Series (Daily)'];
  } else {
    timeSeries = data[`Time Series (${timeframe === '1h' ? '60min' : timeframe === '30m' ? '30min' : timeframe === '15m' ? '15min' : '5min'})`];
  }

  if (!timeSeries) {
    return {
      symbol,
      timeframe,
      error: 'No data available',
      data: []
    };
  }

  // Convert the data to our format
  const chartData = [];
  const timestamps = Object.keys(timeSeries).sort();
  
  // Limit data points based on timeframe
  let filteredTimestamps = timestamps;
  if (timeframe === '1m') {
    // Last 30 days
    filteredTimestamps = timestamps.slice(0, 30);
  } else if (timeframe === '3m') {
    // Last 90 days
    filteredTimestamps = timestamps.slice(0, 90);
  } else if (timeframe === '1y') {
    // Last 365 days
    filteredTimestamps = timestamps.slice(0, 365);
  } else if (timeframe === '4h') {
    // For 4h, take every 4th entry of the 1h data
    filteredTimestamps = timestamps.filter((_, index) => index % 4 === 0);
  }

  for (const timestamp of filteredTimestamps) {
    const entry = timeSeries[timestamp];
    chartData.push({
      date: new Date(timestamp).toISOString(),
      price: timeframe === '1d' || ['1m', '3m', '1y'].includes(timeframe) 
        ? entry['4. close'] 
        : entry['4. close'],
      volume: parseInt(entry['5. volume']),
      isLatestPoint: timestamp === filteredTimestamps[0], // Alpha Vantage returns most recent first
    });
  }

  // Sort by date (oldest to newest for chart display)
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate price changes
  const firstPrice = parseFloat(chartData[0]?.price || '0');
  const lastPrice = parseFloat(chartData[chartData.length - 1]?.price || '0');
  const priceChange = lastPrice - firstPrice;
  const percentChange = (priceChange / firstPrice) * 100;

  return {
    symbol,
    timeframe,
    data: chartData,
    currentPrice: lastPrice.toFixed(2),
    priceChange: priceChange.toFixed(2),
    percentChange: percentChange.toFixed(2),
    isPositive: priceChange >= 0,
  };
} 