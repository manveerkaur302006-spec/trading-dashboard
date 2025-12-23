import { useState, useEffect, useRef } from "react";

export default function ProChart({ symbol, onPriceUpdate = () => {} }) {
  const [priceData, setPriceData] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const maxDataPoints = 300;
  const lastUpdateRef = useRef(0);
  const UPDATE_INTERVAL = 300; 

  useEffect(() => {
    // 1. CLEAR OLD DATA IMMEDIATELY
    setPriceData([]); 
    
    // 2. RESET THROTTLE TIMER
    // This ensures the first tick of the new symbol displays immediately
    lastUpdateRef.current = 0; 

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const now = Date.now();
      // Simple throttling to prevent too many re-renders
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;

      lastUpdateRef.current = now;

      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.p);
      const timestamp = data.T;

      onPriceUpdate(newPrice);

      setPriceData((prev) => {
        const updated = [...prev, { price: newPrice, time: timestamp }];
        return updated.length > maxDataPoints
          ? updated.slice(updated.length - maxDataPoints)
          : updated;
      });
    };

    return () => ws.close();
  }, [symbol]); // <--- Triggers whenever 'symbol' changes

  // ==========================================
  // DRAWING LOGIC (Same as before)
  // ==========================================
  useEffect(() => {
    // If we just cleared data, don't try to draw yet
    if (priceData.length < 2) {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen
        }
        return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = 320 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `320px`;

    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 320;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const prices = priceData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Color Logic
    const startPrice = prices[0];
    const currentPrice = prices[prices.length - 1];
    const isBullish = currentPrice >= startPrice;
    const primaryColor = isBullish ? "#10B981" : "#EF4444"; 
    const gradientStart = isBullish ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";

    const padding = { top: 20, bottom: 30, left: 10, right: 60 };
    const chartWidth = width - (padding.left + padding.right);
    const chartHeight = height - (padding.top + padding.bottom);

    // GRID
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.font = "11px 'Roboto Mono', monospace";
    ctx.fillStyle = "#9CA3AF";
    ctx.textAlign = "left";

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const priceVal = maxPrice - (priceRange / gridLines) * i;
      ctx.fillText(priceVal.toFixed(2), width - padding.right + 10, y + 4);
    }
    ctx.setLineDash([]);

    // GRADIENT
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    priceData.forEach((point, index) => {
      const x = padding.left + (chartWidth / (priceData.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.fillStyle = gradient;
    ctx.fill();

    // LINE
    ctx.beginPath();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 10;
    
    priceData.forEach((point, index) => {
      const x = padding.left + (chartWidth / (priceData.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // INDICATOR & LABELS
    const lastY = padding.top + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight;
    const lastX = width - padding.right;

    ctx.strokeStyle = primaryColor;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padding.left, lastY);
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    const labelHeight = 20;
    const labelWidth = 60;
    ctx.fillStyle = primaryColor;
    ctx.fillRect(lastX + 5, lastY - labelHeight / 2, labelWidth, labelHeight);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px 'Roboto Mono', monospace";
    ctx.fillText(currentPrice.toFixed(2), lastX + 10, lastY + 4);

    // TIME LABELS
    ctx.fillStyle = "#6B7280";
    ctx.textAlign = "center";
    ctx.font = "10px sans-serif";

    const labelInterval = Math.floor(priceData.length / 4) || 1;
    priceData.forEach((point, index) => {
      if (index > 0 && index % labelInterval === 0 && index < priceData.length - 10) {
        const x = padding.left + (chartWidth / (priceData.length - 1)) * index;
        const time = new Date(point.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
        ctx.fillText(time, x, height - 10);
      }
    });

  }, [priceData]);

  const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  const startPrice = priceData.length > 0 ? priceData[0].price : 0;
  const isUp = currentPrice >= startPrice;
  const percentChange = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  return (
    <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#1F2937]/50 backdrop-blur-sm">
        <div>
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            {symbol} Pair
          </h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {priceData.length > 0 && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-500 font-semibold uppercase">Live</span>
            </>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[320px] bg-[#111827]">
        <canvas 
          ref={canvasRef}
          className="block w-full h-full cursor-crosshair touch-none"
        />
        
        {/* Loading Overlay: Shows when data is empty */}
        {priceData.length < 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin"></div>
            <span>Connecting to {symbol}...</span>
          </div>
        )}
      </div>
    </div>
  );
}