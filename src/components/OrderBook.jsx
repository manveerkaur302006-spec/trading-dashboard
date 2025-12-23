import { useState, useEffect } from 'react'

export default function OrderBook({ symbol }) {
  const [bids, setBids] = useState([])
  const [asks, setAsks] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    // Fetch order book data
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=10`
        )
        const data = await response.json()
        
        // Format bids and asks
        // Format: [price, quantity]
        setBids(data.bids.map(bid => ({
          price: parseFloat(bid[0]),
          amount: parseFloat(bid[1])
        })))
        
        setAsks(data.asks.map(ask => ({
          price: parseFloat(ask[0]),
          amount: parseFloat(ask[1])
        })))
        
        setLastUpdate(new Date().toLocaleTimeString())
      } catch (error) {
        console.error('Error fetching order book:', error)
      }
    }

    // Initial fetch
    fetchOrderBook()

    // Refresh every 2 seconds
    const interval = setInterval(fetchOrderBook, 2000)

    return () => clearInterval(interval)
  }, [symbol])

  // Calculate spread
  const spread = asks.length > 0 && bids.length > 0 
    ? (asks[0].price - bids[0].price).toFixed(2)
    : '0.00'

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order Book</h2>
        <span className="text-xs text-gray-400">
          {lastUpdate && `Updated: ${lastUpdate}`}
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Asks (Sell Orders) - Reversed to show lowest first */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Price (USDT)</span>
            <span>Amount (BTC)</span>
          </div>
          {[...asks].reverse().map((order, i) => (
            <div key={i} className="flex justify-between text-sm relative">
              {/* Background bar for visualization */}
              <div 
                className="absolute right-0 h-full bg-red-900 bg-opacity-20"
                style={{ width: `${(order.amount / Math.max(...asks.map(a => a.amount))) * 100}%` }}
              />
              <span className="text-red-400 relative z-10">{order.price.toFixed(2)}</span>
              <span className="text-gray-300 relative z-10">{order.amount.toFixed(4)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-2 text-center border-y border-gray-700">
          <span className="text-yellow-400 text-sm font-semibold">
            Spread: ${spread}
          </span>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {bids.map((order, i) => (
            <div key={i} className="flex justify-between text-sm relative">
              {/* Background bar for visualization */}
              <div 
                className="absolute right-0 h-full bg-green-900 bg-opacity-20"
                style={{ width: `${(order.amount / Math.max(...bids.map(b => b.amount))) * 100}%` }}
              />
              <span className="text-green-400 relative z-10">{order.price.toFixed(2)}</span>
              <span className="text-gray-300 relative z-10">{order.amount.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}