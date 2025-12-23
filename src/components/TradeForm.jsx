import { useState } from "react";

export default function TradeForm({
  currentPrice,
  portfolio,
  onPortfolioUpdate
}) {
  const [qty, setQty] = useState("");

  const handleBuy = () => {
    if (!currentPrice || qty <= 0) return;

    const buyQty = parseFloat(qty);

    const totalCost =
      portfolio.quantity * portfolio.avgPrice +
      buyQty * currentPrice;

    const newQty = portfolio.quantity + buyQty;
    const newAvgPrice = totalCost / newQty;

    onPortfolioUpdate({
      ...portfolio,
      quantity: newQty,
      avgPrice: newAvgPrice
    });

    setQty("");
  };

  const handleSell = () => {
    if (!currentPrice || qty <= 0) return;

    const sellQty = parseFloat(qty);
    if (sellQty > portfolio.quantity) return;

    const pnlFromSell =
      (currentPrice - portfolio.avgPrice) * sellQty;

    onPortfolioUpdate({
      ...portfolio,
      quantity: portfolio.quantity - sellQty,
      realizedPnL:
        (portfolio.realizedPnL ?? 0) + pnlFromSell
    });

    setQty("");
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Trade</h2>

      <div className="text-sm mb-2">
        Price:{" "}
        <span className="text-white">
          {currentPrice
            ? `$${currentPrice.toFixed(2)}`
            : "--"}
        </span>
      </div>

      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="Quantity (BTC)"
        className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
      />

      <div className="flex gap-2">
        <button
          onClick={handleBuy}
          className="flex-1 bg-green-600 p-2 rounded"
        >
          BUY
        </button>

        <button
          onClick={handleSell}
          className="flex-1 bg-red-600 p-2 rounded"
        >
          SELL
        </button>
      </div>
    </div>
  );
}
