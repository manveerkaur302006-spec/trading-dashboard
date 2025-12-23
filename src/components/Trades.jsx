import { useEffect, useState } from "react";

export default function Trades({ symbol = "BTCUSDT" }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const trade = {
        price: parseFloat(data.p),
        qty: parseFloat(data.q),
        side: data.m ? "SELL" : "BUY",
        time: data.T
      };

      setTrades((prev) => {
        const updated = [trade, ...prev];
        return updated.slice(0, 20); // keep last 20 only
      });
    };

    ws.onerror = (err) => {
      console.error("Trades WS error:", err);
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>

      <div className="space-y-1 max-h-72 overflow-y-auto">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Side</span>
          <span>Price</span>
          <span>Qty</span>
        </div>

        {trades.map((trade, i) => (
          <div
            key={trade.time + i}
            className={`flex justify-between text-sm ${
              trade.side === "BUY"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            <span>{trade.side}</span>
            <span>{trade.price.toFixed(2)}</span>
            <span>{trade.qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
