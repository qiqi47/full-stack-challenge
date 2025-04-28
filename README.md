# Trading AI Dashboard

## Overview

Trading AI Dashboard is a modern full-stack application that combines real-time stock data, watchlist management, and AI assistance for trading and investment research.

## Demo & Live Website

-   **Demo Video**: [Watch Demo](https://www.loom.com/share/a66d125818a949febf268c4b88b91b20?sid=0a4c86fe-79d1-4dae-bcea-bb32a8f17cbf)
-   **Live Website**: [Trading AI Dashboard](https://trading-ai-wheat.vercel.app/)

## Features

-   **Interactive Stock Charts**: Real-time TradingView chart integration for comprehensive stock analysis
-   **Personalized Watchlist**: Add, remove, and track your favorite stocks
-   **AI Stock Assistant**: Chat with an AI assistant to:
    -   Check current stock prices
    -   Add stocks to your watchlist
    -   Remove stocks from your watchlist
    -   Get information about stocks
-   **User Authentication**: Secure login system powered by Firebase

## Tech Stack

-   **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn UI components
-   **Charts**: TradingView integration, Recharts
-   **Backend**: Next.js API routes with server actions
-   **Authentication**: Firebase Authentication
-   **External APIs**: Alpaca Markets API for stock data
-   **AI Integration**: OpenAI GPT-3.5 for natural language stock assistant

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Alpaca Markets API credentials
-   OpenAI API key
-   Firebase project

### Installation

1. Clone the repository

    ```
    git clone <repository-url>
    cd trading-ai-dashboard
    ```

2. Install dependencies

    ```
    npm install
    ```

3. Set up environment variables
   Create a `.env` file with the following:

    ```
    ALPACA_API_KEY=your_alpaca_key
    ALPACA_API_SECRET=your_alpaca_secret
    OPENAI_API_KEY=your_openai_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
    ```

4. Run the development server

    ```
    npm run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT

## Acknowledgements

-   [Alpaca Markets](https://alpaca.markets/) for stock data API
-   [TradingView](https://www.tradingview.com/) for charting capabilities
-   [OpenAI](https://openai.com/) for AI assistant capabilities
