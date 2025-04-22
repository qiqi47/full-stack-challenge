"use client"

import { ChartContainer } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip, ReferenceDot } from "recharts"
import { useEffect, useState, useRef } from "react"

interface StockData {
  date: string
  price: string
  volume: number
  isLatestPoint?: boolean
}

interface StockChartProps {
  symbol: string
  timeframe: string
  data: StockData[]
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          Price: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    )
  }

  return null
}

// Update the StockChart component to include hover price display
export function StockChart({ symbol, timeframe, data }: StockChartProps) {
  const [blinkVisible, setBlinkVisible] = useState(true)
  const [hoverInfo, setHoverInfo] = useState<{
    x: number
    y: number
    price: number
    isHovering: boolean
  }>({
    x: 0,
    y: 0,
    price: 0,
    isHovering: false,
  })
  const chartRef = useRef<HTMLDivElement>(null)

  // Blinking effect for the current price point
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((prev) => !prev)
    }, 500) // Toggle every 500ms

    return () => clearInterval(interval)
  }, [])

  // Format data for chart display
  const formattedData = data.map((item) => {
    const date = new Date(item.date)
    let formattedDate

    // Format date based on timeframe
    if (["5m", "15m", "30m", "1h"].includes(timeframe)) {
      formattedDate = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (["4h", "1d", "1m"].includes(timeframe)) {
      formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric" })
    } else {
      formattedDate = date.toLocaleDateString([], { month: "short", year: "2-digit" })
    }

    return {
      date: formattedDate,
      fullDate: date,
      price: Number.parseFloat(item.price),
      volume: item.volume,
      isLatestPoint: item.isLatestPoint,
    }
  })

  // Calculate price change
  const firstPrice = Number.parseFloat(data[0]?.price || "0")
  const lastPrice = Number.parseFloat(data[data.length - 1]?.price || "0")
  const priceChange = lastPrice - firstPrice
  const isPositive = priceChange >= 0

  // Find the latest data point for the blinking dot
  const latestPoint = formattedData.find((point) => point.isLatestPoint)

  // Handle mouse move on chart
  const handleMouseMove = (e: any) => {
    if (e.isTooltipActive && e.activePayload && e.activePayload.length) {
      const containerRect = chartRef.current?.getBoundingClientRect()
      if (containerRect) {
        setHoverInfo({
          x: e.activeCoordinate.x,
          y: e.activeCoordinate.y,
          price: e.activePayload[0].value,
          isHovering: true,
        })
      }
    }
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverInfo((prev) => ({ ...prev, isHovering: false }))
  }

  return (
    <div ref={chartRef} className="relative w-full h-full">
      <ChartContainer
        config={{
          price: {
            label: "Price",
            color: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))",
          },
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={`color${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "var(--color-price)" : "hsl(var(--chart-3))"}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "var(--color-price)" : "hsl(var(--chart-3))"}
                  stopOpacity={0}
                />
              </linearGradient>

              {/* Define the blinking animation */}
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={20} />

            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              width={60}
            />

            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />

            {/* Custom tooltip that shows on hover */}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "4 4" }} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "var(--color-price)" : "hsl(var(--chart-3))"}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${symbol})`}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Blinking dot for the latest price point */}
            {latestPoint && blinkVisible && (
              <ReferenceDot
                x={latestPoint.date}
                y={latestPoint.price}
                r={6}
                fill={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"}
                stroke="white"
                strokeWidth={2}
                className="animate-pulse"
                filter="url(#glow)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Price display that follows the cursor */}
      {hoverInfo.isHovering && (
        <div
          className="absolute pointer-events-none bg-white/90 px-2 py-1 rounded-md shadow-sm border text-sm font-medium"
          style={{
            left: hoverInfo.x + 10,
            top: hoverInfo.y - 30,
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          ${hoverInfo.price.toFixed(2)}
        </div>
      )}
    </div>
  )
}
