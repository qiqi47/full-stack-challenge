import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { generateMockStockData } from "./mock-data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to handle API failures with fallback to mock data
export async function fetchStockData(symbol: string, timeframe: string) {
  try {
    const response = await fetch(`/api/stocks?symbol=${symbol}&timeframe=${timeframe}`);
    
    if (!response.ok) {
      // If API request failed, fall back to mock data
      console.warn(`API request failed for ${symbol}, using mock data as fallback`);
      const mockData = generateMockStockData(symbol, timeframe);
      
      const firstPrice = Number.parseFloat(mockData[0]?.price || "0");
      const lastPrice = Number.parseFloat(mockData[mockData.length - 1]?.price || "0");
      const priceChange = lastPrice - firstPrice;
      const percentChange = (priceChange / firstPrice) * 100;

      return {
        symbol,
        timeframe,
        data: mockData,
        currentPrice: lastPrice.toFixed(2),
        priceChange: priceChange.toFixed(2),
        percentChange: percentChange.toFixed(2),
        isPositive: priceChange >= 0,
        isMockData: true, // Flag to indicate this is mock data
      };
    }
    
    const data = await response.json();
    
    // If Alpha Vantage returned an error, fall back to mock data
    if (data.error) {
      console.warn(`Alpha Vantage error for ${symbol}: ${data.error}, using mock data as fallback`);
      const mockData = generateMockStockData(symbol, timeframe);
      
      const firstPrice = Number.parseFloat(mockData[0]?.price || "0");
      const lastPrice = Number.parseFloat(mockData[mockData.length - 1]?.price || "0");
      const priceChange = lastPrice - firstPrice;
      const percentChange = (priceChange / firstPrice) * 100;

      return {
        symbol,
        timeframe,
        data: mockData,
        currentPrice: lastPrice.toFixed(2),
        priceChange: priceChange.toFixed(2),
        percentChange: percentChange.toFixed(2),
        isPositive: priceChange >= 0,
        isMockData: true, // Flag to indicate this is mock data
      };
    }
    
    // Add flag to indicate this is real data
    return {
      ...data,
      isMockData: false
    };
  } catch (error) {
    // If there's any error in the fetch, fall back to mock data
    console.error(`Error fetching data for ${symbol}:`, error);
    const mockData = generateMockStockData(symbol, timeframe);
    
    const firstPrice = Number.parseFloat(mockData[0]?.price || "0");
    const lastPrice = Number.parseFloat(mockData[mockData.length - 1]?.price || "0");
    const priceChange = lastPrice - firstPrice;
    const percentChange = (priceChange / firstPrice) * 100;

    return {
      symbol,
      timeframe,
      data: mockData,
      currentPrice: lastPrice.toFixed(2),
      priceChange: priceChange.toFixed(2),
      percentChange: percentChange.toFixed(2),
      isPositive: priceChange >= 0,
      isMockData: true, // Flag to indicate this is mock data
    };
  }
}
