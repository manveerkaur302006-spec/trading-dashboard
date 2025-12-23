import { useState } from "react";

import Header from "./components/Header";
import Chart from "./components/Chart";
import OrderBook from "./components/OrderBook";
import Trades from "./components/Trades";
import Portfolio from "./components/Portfolio";
import TradeForm from "./components/TradeForm";

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [portfolio, setPortfolio] = useState({
    asset: selectedSymbol,
    quantity: 0,
    avgPrice: 0,
    realizedPnL: 0
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Header
        selectedSymbol={selectedSymbol}
        currentPrice={currentPrice}
        onSymbolChange={setSelectedSymbol}
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Chart
          symbol={selectedSymbol}
          onPriceUpdate={setCurrentPrice}
        />
        <OrderBook symbol={selectedSymbol} />
        <TradeForm
          symbol={selectedSymbol}
          currentPrice={currentPrice}
          portfolio={portfolio}
          onPortfolioUpdate={setPortfolio}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Trades symbol={selectedSymbol} />
        <Portfolio
          portfolio={portfolio}
          currentPrice={currentPrice}
        />
      </div>
    </div>
  );
}
