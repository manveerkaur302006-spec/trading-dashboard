export default function Header({
  selectedSymbol,
  currentPrice,
  onSymbolChange
}) {
  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {selectedSymbol.replace("USDT", "")}/USDT
          </h1>
          <p className="text-gray-400 text-sm">
            Selected Market
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          {/* Price Display */}
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                currentPrice ? "text-green-400" : "text-gray-400"
              }`}
            >
              {currentPrice
                ? currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                : "Loading..."}
            </div>
            <div className="text-gray-400 text-sm">
              Live Price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
