"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockChart } from "@/components/stock-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StockCardProps {
  symbol: string
}

export function StockCard({ symbol }: StockCardProps) {
  const [stockData, setStockData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1D")

  useEffect(() => {
    // Simulate fetching stock data
    setLoading(true)

    // Generate mock data for the stock
    setTimeout(() => {
      const mockData = generateMockStockData(symbol, timeframe)

      const firstPrice = Number.parseFloat(mockData[0]?.price || "0")
      const lastPrice = Number.parseFloat(mockData[mockData.length - 1]?.price || "0")
      const priceChange = lastPrice - firstPrice
      const percentChange = (priceChange / firstPrice) * 100

      setStockData({
        symbol,
        timeframe,
        data: mockData,
        currentPrice: lastPrice.toFixed(2),
        priceChange: priceChange.toFixed(2),
        percentChange: percentChange.toFixed(2),
        isPositive: priceChange >= 0,
      })

      setLoading(false)
    }, 1000)
  }, [symbol, timeframe])

  // Function to handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{symbol}</span>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="text-right">
              <span className="text-xl font-bold">${stockData?.currentPrice}</span>
              <span className={`ml-2 text-sm ${stockData?.isPositive ? "text-green-600" : "text-red-600"}`}>
                {stockData?.isPositive ? "+" : ""}
                {stockData?.percentChange}%
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1D" onValueChange={handleTimeframeChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <StockChart symbol={stockData.symbol} timeframe={stockData.timeframe} data={stockData.data} />
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to generate mock stock data
function generateMockStockData(symbol: string, timeframe: string) {
  const dataPoints =
    timeframe === "1D" ? 24 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : timeframe === "3M" ? 90 : 365 // 1Y

  // Base price varies by symbol to make charts look different
  const baseMap: Record<string, number> = {
    NVDA: 800,
    AAPL: 200,
    ORCL: 120,
    MSFT: 400,
    GOOGL: 170,
    AMZN: 180,
    TSLA: 250,
    META: 500,
  }

  const startPrice = baseMap[symbol] || Math.floor(Math.random() * 1000) + 100

  // Volatility varies by timeframe
  const volatilityMap: Record<string, number> = {
    "1D": 0.005,
    "1W": 0.01,
    "1M": 0.015,
    "3M": 0.02,
    "1Y": 0.03,
  }

  const volatility = volatilityMap[timeframe] || 0.01
  const trend = Math.random() > 0.4 ? 1 : -1 // 60% chance of uptrend

  const data = []
  let currentPrice = startPrice

  for (let i = 0; i < dataPoints; i++) {
    // Add some trend bias to the random walk
    const change = currentPrice * volatility * (Math.random() - 0.5 + trend * 0.1)
    currentPrice += change

    const date = new Date()
    if (timeframe === "1D") {
      date.setHours(9 + Math.floor(i / 2))
      date.setMinutes((i % 2) * 30)
    } else {
      date.setDate(date.getDate() - (dataPoints - i))
    }

    data.push({
      date: date.toISOString(),
      price: Math.max(currentPrice, 1).toFixed(2),
      volume: Math.floor(Math.random() * 10000000),
    })
  }

  return data
}
