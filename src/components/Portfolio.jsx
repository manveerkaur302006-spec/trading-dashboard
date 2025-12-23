export default function Portfolio({ portfolio, currentPrice }) {
  if (!portfolio) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <p className="text-gray-400 text-sm mt-2">
          Loading portfolio...
        </p>
      </div>
    );
  }

  const quantity = portfolio.quantity ?? 0;
  const avgPrice = portfolio.avgPrice ?? 0;
  const realizedPnL = portfolio.realizedPnL ?? 0;

  const unrealizedPnL =
    currentPrice && quantity > 0
      ? (currentPrice - avgPrice) * quantity
      : 0;

  const totalPnL = realizedPnL + unrealizedPnL;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Portfolio</h2>

      <div className="space-y-2 text-sm">
        <div>Asset: BTC</div>

        <div>
          Quantity:{" "}
          <span className="text-white">
            {quantity.toFixed(4)}
          </span>
        </div>

        <div>
          Avg Buy Price:{" "}
          <span className="text-white">
            ${avgPrice.toFixed(2)}
          </span>
        </div>

        <div
          className={
            unrealizedPnL >= 0
              ? "text-green-400"
              : "text-red-400"
          }
        >
          Unrealized PnL: ${unrealizedPnL.toFixed(2)}
        </div>

        <div
          className={
            realizedPnL >= 0
              ? "text-green-400"
              : "text-red-400"
          }
        >
          Realized PnL: ${realizedPnL.toFixed(2)}
        </div>

        <div
          className={
            totalPnL >= 0
              ? "text-green-500 font-semibold"
              : "text-red-500 font-semibold"
          }
        >
          Total PnL: ${totalPnL.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
