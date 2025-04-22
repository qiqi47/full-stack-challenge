// Helper function to generate mock stock data
export function generateMockStockData(symbol: string, timeframe: string) {
  // Determine number of data points based on timeframe
  const dataPoints = getDataPointsForTimeframe(timeframe)

  // Base price varies by symbol to make charts look different
  const baseMap: Record<string, number> = {
    SPY: 500,
    QQQ: 430,
    NVDA: 800,
    AAPL: 200,
    ORCL: 120,
    WMT: 70,
    NFLX: 650,
    MSFT: 400,
    GOOGL: 170,
    AMZN: 180,
    TSLA: 250,
    META: 500,
  }

  const startPrice = baseMap[symbol] || Math.floor(Math.random() * 1000) + 100

  // Volatility varies by timeframe
  const volatilityMap: Record<string, number> = {
    "5m": 0.0005,
    "15m": 0.001,
    "30m": 0.0015,
    "1h": 0.002,
    "4h": 0.003,
    "1d": 0.005,
    "1m": 0.01,
    "3m": 0.015,
    "1y": 0.03,
  }

  // Different patterns for different symbols
  const patternMap: Record<string, number> = {
    SPY: 0.2, // Slight uptrend
    QQQ: 0.3, // Stronger uptrend
    NVDA: 0.5, // Strong uptrend
    AAPL: 0.1, // Very slight uptrend
    ORCL: -0.1, // Slight downtrend
    WMT: 0, // Neutral
    NFLX: 0.4, // Strong uptrend
  }

  const volatility = volatilityMap[timeframe] || 0.01
  const trend = patternMap[symbol] || (Math.random() > 0.5 ? 0.1 : -0.1) // Default random trend

  const data = []
  let currentPrice = startPrice

  // Current date/time for reference
  const now = new Date()

  for (let i = 0; i < dataPoints; i++) {
    // Add some trend bias to the random walk
    const change = currentPrice * volatility * (Math.random() - 0.5 + trend)
    currentPrice += change

    // Calculate the date/time for this data point
    const date = new Date()

    // Set the date/time based on timeframe
    if (timeframe === "5m") {
      date.setMinutes(now.getMinutes() - (dataPoints - i) * 5)
    } else if (timeframe === "15m") {
      date.setMinutes(now.getMinutes() - (dataPoints - i) * 15)
    } else if (timeframe === "30m") {
      date.setMinutes(now.getMinutes() - (dataPoints - i) * 30)
    } else if (timeframe === "1h") {
      date.setHours(now.getHours() - (dataPoints - i))
    } else if (timeframe === "4h") {
      date.setHours(now.getHours() - (dataPoints - i) * 4)
    } else if (timeframe === "1d") {
      date.setDate(now.getDate() - (dataPoints - i))
    } else if (timeframe === "1m") {
      date.setDate(now.getDate() - (dataPoints - i))
    } else if (timeframe === "3m") {
      date.setDate(now.getDate() - (dataPoints - i) * 3)
    } else if (timeframe === "1y") {
      date.setDate(now.getDate() - (dataPoints - i) * 7)
    }

    // Flag for the most recent data point (for blinking indicator)
    const isLatestPoint = i === dataPoints - 1

    data.push({
      date: date.toISOString(),
      price: Math.max(currentPrice, 1).toFixed(2),
      volume: Math.floor(Math.random() * 10000000),
      isLatestPoint,
    })
  }

  return data
}

// Helper function to determine number of data points based on timeframe
function getDataPointsForTimeframe(timeframe: string): number {
  switch (timeframe) {
    case "5m":
      return 60 // 5 hours (60 5-minute intervals)
    case "15m":
      return 32 // 8 hours (32 15-minute intervals)
    case "30m":
      return 24 // 12 hours (24 30-minute intervals)
    case "1h":
      return 24 // 24 hours
    case "4h":
      return 30 // 5 days (30 4-hour intervals)
    case "1d":
      return 30 // 30 days
    case "1m":
      return 30 // 30 days
    case "3m":
      return 30 // 90 days (shown as 30 points)
    case "1y":
      return 52 // 52 weeks
    default:
      return 30
  }
}
