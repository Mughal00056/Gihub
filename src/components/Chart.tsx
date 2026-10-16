import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart2, 
  Activity, 
  PenTool, 
  Plus, 
  Minus, 
  Layers, 
  TrendingUp, 
  Maximize2
} from 'lucide-react';
import { Candle, Asset, ActiveTrade } from '../types/trading';

interface ChartProps {
  asset: Asset;
  activeTrades: ActiveTrade[];
  onPriceUpdate: (newPrice: number) => void;
  selectedDurationSeconds: number;
}

export const Chart: React.FC<ChartProps> = ({
  asset,
  activeTrades,
  onPriceUpdate,
  selectedDurationSeconds,
}) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<'5s' | '10s' | '30s' | '1m' | '5m'>('1m');
  const [chartType, setChartType] = useState<'candles' | 'area' | 'bars' | 'heikin'>('candles');
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [showDrawingTools, setShowDrawingTools] = useState<boolean>(false);
  const [drawingLineY, setDrawingLineY] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(36); // number of visible candles
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; price: number; timeStr: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<'tf' | 'type' | 'ind' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate Initial Realistic Candles for selected asset
  useEffect(() => {
    const count = 60;
    const now = Math.floor(Date.now() / 1000);
    const tfSeconds = timeframe === '5s' ? 5 : timeframe === '10s' ? 10 : timeframe === '30s' ? 30 : timeframe === '1m' ? 60 : 300;
    
    let price = asset.basePrice;
    const initialCandles: Candle[] = [];
    const volatility = price * 0.00035;

    for (let i = count; i >= 0; i--) {
      const time = now - i * tfSeconds;
      const change = (Math.random() - 0.49) * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.8;
      const low = Math.min(open, close) - Math.random() * volatility * 0.8;
      price = close;
      initialCandles.push({ time, open, high, low, close });
    }
    setCandles(initialCandles);
  }, [asset.id, timeframe, asset.basePrice]);

  // Live Tick Simulation Engine
  useEffect(() => {
    const tfSeconds = timeframe === '5s' ? 5 : timeframe === '10s' ? 10 : timeframe === '30s' ? 30 : timeframe === '1m' ? 60 : 300;
    
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const now = Math.floor(Date.now() / 1000);
        const last = { ...prev[prev.length - 1] };
        const volatility = last.close * 0.00018;
        const tickChange = (Math.random() - 0.495) * volatility;
        const nextPrice = Number((last.close + tickChange).toFixed(asset.precision));

        // Check if current candle duration elapsed
        if (now - last.time >= tfSeconds) {
          const newCandle: Candle = {
            time: now,
            open: last.close,
            high: Math.max(last.close, nextPrice),
            low: Math.min(last.close, nextPrice),
            close: nextPrice,
          };
          return [...prev.slice(-80), newCandle];
        } else {
          last.close = nextPrice;
          last.high = Math.max(last.high, nextPrice);
          last.low = Math.min(last.low, nextPrice);
          return [...prev.slice(0, -1), last];
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [timeframe, asset.precision]);

  // Safely notify parent of price update after rendering in a dedicated effect
  const onPriceUpdateRef = useRef(onPriceUpdate);
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  useEffect(() => {
    if (candles.length > 0) {
      const latestPrice = candles[candles.length - 1].close;
      onPriceUpdateRef.current(latestPrice);
    }
  }, [candles]);

  // Visible Candles Slice
  const visibleCandles = useMemo(() => {
    return candles.slice(-zoomLevel);
  }, [candles, zoomLevel]);

  // Current Price & Last Candle
  const currentCandle = candles[candles.length - 1];
  const currentPrice = currentCandle ? currentCandle.close : asset.currentPrice;

  // Calculate Price Range (Min / Max with margin)
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { minPrice: asset.basePrice * 0.999, maxPrice: asset.basePrice * 1.001, priceRange: asset.basePrice * 0.002 };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const c of visibleCandles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    }
    // Also include active trades entry price in scale
    activeTrades.forEach((t) => {
      if (t.openPrice < min) min = t.openPrice;
      if (t.openPrice > max) max = t.openPrice;
    });

    const padding = (max - min) * 0.18 || asset.basePrice * 0.0005;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2 || 0.001,
    };
  }, [visibleCandles, activeTrades, asset.basePrice]);

  // Chart Coordinates Helpers
  const chartWidth = Math.max(dimensions.width - 75, 100); // 75px for right price axis
  const chartHeight = Math.max(dimensions.height - 35, 100); // 35px for bottom time axis

  const getY = (val: number) => {
    const normalized = (val - minPrice) / (priceRange || 1);
    return chartHeight - normalized * chartHeight;
  };

  const getPriceAtY = (y: number) => {
    const normalized = (chartHeight - y) / chartHeight;
    return minPrice + normalized * priceRange;
  };

  const candleSpacing = chartWidth / Math.max(visibleCandles.length, 1);
  const candleBodyWidth = Math.max(candleSpacing * 0.65, 3);

  // Moving Average 14
  const maLinePoints = useMemo(() => {
    if (!showIndicators || visibleCandles.length < 5) return '';
    const period = 9;
    const points: string[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      if (i < period) continue;
      const slice = visibleCandles.slice(i - period, i);
      const avg = slice.reduce((acc, c) => acc + c.close, 0) / period;
      const x = i * candleSpacing + candleSpacing / 2;
      const y = getY(avg);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [visibleCandles, showIndicators, candleSpacing, minPrice, priceRange, chartHeight]);

  // Handle Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x <= chartWidth && y <= chartHeight) {
      const price = getPriceAtY(y);
      const candleIndex = Math.min(Math.floor(x / candleSpacing), visibleCandles.length - 1);
      const c = visibleCandles[candleIndex];
      const timeStr = c ? new Date(c.time * 1000).toLocaleTimeString([], { hour12: false }) : '';
      setCrosshair({ x, y, price, timeStr });
    } else {
      setCrosshair(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showDrawingTools) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const y = e.clientY - rect.top;
      if (y <= chartHeight) {
        setDrawingLineY(drawingLineY === null ? y : null);
      }
    }
  };

  // Price Grid Axis Values (5 horizontal ticks)
  const priceGridSteps = useMemo(() => {
    const steps: number[] = [];
    const count = 6;
    for (let i = 0; i <= count; i++) {
      steps.push(minPrice + (priceRange / count) * i);
    }
    return steps;
  }, [minPrice, priceRange]);

  // Current live formatted time for top indicator
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour12: false }) + ' GMT+5');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative flex-1 w-full h-full bg-[#f8f9fc] overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleChartClick}
    >
      {/* Top Chart Info Bar (Matches Reference Screenshot) */}
      <div className="absolute top-2 left-3 right-16 flex items-center justify-between text-xs pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-white/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-gray-200/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">{currentTimeStr || '12:00:12 GMT+5'}</span>
          </div>
          <div className="h-3 w-[1px] bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-800 text-xs font-mono">
              {currentPrice.toFixed(asset.precision)}
            </span>
            <span className={`text-[10px] font-bold px-1 rounded ${
              asset.change24h >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
            </span>
          </div>
        </div>

        {/* Trade Cycle Header Notice (Matches Screenshot "Beginning of trade", "End of trade") */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 font-medium bg-white/70 px-2 py-0.5 rounded border border-gray-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Beginning of trade
          </span>
          <span className="flex items-center gap-1 font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            End of trade: {selectedDurationSeconds}s
          </span>
        </div>
      </div>

      {/* Main SVG Chart Canvas */}
      <svg className="w-full h-full block">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <pattern id="gridPattern" width="60" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="60" y2="40" stroke="#eceef3" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="60" y1="0" x2="60" y2="40" stroke="#eceef3" strokeWidth="1" strokeDasharray="2,2" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="url(#gridPattern)" />

        {/* Horizontal Price Grid Lines */}
        {priceGridSteps.map((price, idx) => {
          const y = getY(price);
          return (
            <g key={idx}>
              <line 
                x1={0} 
                y1={y} 
                x2={chartWidth} 
                y2={y} 
                stroke="#e5e7eb" 
                strokeWidth={1} 
                strokeDasharray="3,3" 
              />
              <text 
                x={chartWidth + 6} 
                y={y + 3.5} 
                fill="#8f9bb3" 
                fontSize={10} 
                fontFamily="JetBrains Mono, monospace"
                textAnchor="start"
              >
                {price.toFixed(asset.precision)}
              </text>
            </g>
          );
        })}

        {/* User Drawn Support / Resistance line */}
        {drawingLineY !== null && (
          <g>
            <line 
              x1={0} 
              y1={drawingLineY} 
              x2={chartWidth} 
              y2={drawingLineY} 
              stroke="#3b82f6" 
              strokeWidth={1.5} 
              strokeDasharray="4,2" 
            />
            <rect 
              x={chartWidth + 2} 
              y={drawingLineY - 8} 
              width={70} 
              height={16} 
              fill="#3b82f6" 
              rx={3} 
            />
            <text 
              x={chartWidth + 37} 
              y={drawingLineY + 3.5} 
              fill="#ffffff" 
              fontSize={10} 
              fontWeight="bold" 
              fontFamily="JetBrains Mono, monospace" 
              textAnchor="middle"
            >
              {getPriceAtY(drawingLineY).toFixed(asset.precision)}
            </text>
          </g>
        )}

        {/* Indicator Line (SMA 9) */}
        {showIndicators && maLinePoints && (
          <polyline 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth={1.5} 
            points={maLinePoints} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Candlesticks Rendering */}
        {chartType === 'area' ? (
          // Area / Mountain chart view
          <g>
            <path
              d={`M 0,${chartHeight} ${visibleCandles.map((c, i) => `L ${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')} L ${chartWidth},${chartHeight} Z`}
              fill="url(#areaGradient)"
            />
            <path
              d={`M 0,${getY(visibleCandles[0]?.close || currentPrice)} ${visibleCandles.map((c, i) => `L ${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
            />
          </g>
        ) : (
          // Candlestick / Bars / Heikin-Ashi view
          visibleCandles.map((candle, idx) => {
            const x = idx * candleSpacing + candleSpacing / 2;
            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? '#00b15d' : '#f03d3d'; // Exact screenshot green & red
            
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(openY - closeY), 1.5);

            return (
              <g key={candle.time}>
                {/* Wick */}
                <line 
                  x1={x} 
                  y1={highY} 
                  x2={x} 
                  y2={lowY} 
                  stroke={candleColor} 
                  strokeWidth={1.5} 
                />
                {/* Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  rx={0.8}
                />
              </g>
            );
          })
        )}

        {/* Trade Expiration Vertical Boundary Line (End of trade) */}
        <g>
          <line
            x1={chartWidth - 45}
            y1={0}
            x2={chartWidth - 45}
            y2={chartHeight}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <rect
            x={chartWidth - 75}
            y={12}
            width={60}
            height={18}
            rx={4}
            fill="#ef4444"
          />
          <text
            x={chartWidth - 45}
            y={24.5}
            fill="#ffffff"
            fontSize={9.5}
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
          >
            END 00:{selectedDurationSeconds < 10 ? `0${selectedDurationSeconds}` : selectedDurationSeconds}
          </text>
        </g>

        {/* Active Trades Overlays on Chart */}
        {activeTrades.map((trade) => {
          const tradeY = getY(trade.openPrice);
          const isWinning = trade.direction === 'HIGHER' ? currentPrice > trade.openPrice : currentPrice < trade.openPrice;
          const statusColor = isWinning ? '#10b981' : '#ef4444';

          return (
            <g key={trade.id} className="transition-all">
              {/* Horizontal Reference Line at Trade Entry */}
              <line
                x1={0}
                y1={tradeY}
                x2={chartWidth}
                y2={tradeY}
                stroke={statusColor}
                strokeWidth={1.5}
                strokeDasharray="4,2"
              />

              {/* Trade Badge Tag */}
              <g transform={`translate(${chartWidth - 165}, ${Math.max(tradeY - 14, 25)})`}>
                <rect
                  x={0}
                  y={0}
                  width={110}
                  height={26}
                  rx={6}
                  fill="#ffffff"
                  stroke={statusColor}
                  strokeWidth={1.5}
                  className="shadow-sm"
                />
                <circle 
                  cx={12} 
                  cy={13} 
                  r={5} 
                  fill={trade.direction === 'HIGHER' ? '#10b981' : '#ef4444'} 
                />
                <text
                  x={24}
                  y={12}
                  fontSize={9}
                  fontWeight="bold"
                  fill="#374151"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${trade.amount} {trade.direction === 'HIGHER' ? '▲' : '▼'}
                </text>
                <text
                  x={24}
                  y={22}
                  fontSize={8.5}
                  fontWeight="bold"
                  fill={isWinning ? '#059669' : '#dc2626'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {isWinning ? `+$${(trade.amount * trade.payoutRate).toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                </text>
              </g>
            </g>
          );
        })}

        {/* Current Price Tracking Line & Badge (Exact Reference Screenshot style) */}
        {currentCandle && (
          <g>
            <line
              x1={0}
              y1={getY(currentPrice)}
              x2={chartWidth}
              y2={getY(currentPrice)}
              stroke="#00b15d"
              strokeWidth={1.2}
              strokeDasharray="2,2"
            />
            {/* Pulsing Dot at Current Price */}
            <circle
              cx={chartWidth - 1}
              cy={getY(currentPrice)}
              r={3.5}
              fill="#00b15d"
              className="pulse-glow"
            />
            {/* Axis Price Badge on Right Border */}
            <g transform={`translate(${chartWidth}, ${getY(currentPrice) - 10})`}>
              <rect
                x={0}
                y={0}
                width={74}
                height={20}
                rx={4}
                fill="#00b15d"
              />
              <text
                x={37}
                y={13.5}
                fill="#ffffff"
                fontSize={10}
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {currentPrice.toFixed(asset.precision)}
              </text>
            </g>
          </g>
        )}

        {/* Crosshair Cursor */}
        {crosshair && (
          <g pointerEvents="none">
            {/* Vertical crosshair line */}
            <line
              x1={crosshair.x}
              y1={0}
              x2={crosshair.x}
              y2={chartHeight}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            {/* Horizontal crosshair line */}
            <line
              x1={0}
              y1={crosshair.y}
              x2={chartWidth}
              y2={crosshair.y}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            {/* Right Axis Crosshair Badge */}
            <rect
              x={chartWidth}
              y={crosshair.y - 9}
              width={74}
              height={18}
              fill="#334155"
              rx={3}
            />
            <text
              x={chartWidth + 37}
              y={crosshair.y + 3.5}
              fill="#ffffff"
              fontSize={9.5}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {crosshair.price.toFixed(asset.precision)}
            </text>
            {/* Bottom Axis Time Badge */}
            <rect
              x={crosshair.x - 26}
              y={chartHeight + 4}
              width={52}
              height={16}
              fill="#334155"
              rx={3}
            />
            <text
              x={crosshair.x}
              y={chartHeight + 15}
              fill="#ffffff"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {crosshair.timeStr}
            </text>
          </g>
        )}

        {/* Time X-Axis Ticks */}
        {visibleCandles.filter((_, i) => i % 8 === 0).map((c) => {
          const idx = visibleCandles.indexOf(c);
          const x = idx * candleSpacing + candleSpacing / 2;
          const time = new Date(c.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          return (
            <text
              key={c.time}
              x={x}
              y={chartHeight + 16}
              fill="#9ca3af"
              fontSize={9.5}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {time}
            </text>
          );
        })}
      </svg>

      {/* Floating Chart Control Tool Panel on Left (Matching Screenshot) */}
      <div className="absolute left-3 bottom-14 sm:bottom-16 flex flex-col gap-1.5 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-gray-200/80 flex flex-col gap-1">
          {/* Timeframe Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === 'tf' ? null : 'tf');
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              title="Timeframe"
            >
              {timeframe}
            </button>
            {activeMenu === 'tf' && (
              <div className="absolute left-10 bottom-0 bg-white shadow-xl rounded-xl border border-gray-200 p-1.5 flex flex-col gap-1 z-30 min-w-[70px]">
                {(['5s', '10s', '30s', '1m', '5m'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setActiveMenu(null);
                    }}
                    className={`px-2 py-1 text-xs rounded-md text-left font-semibold ${
                      timeframe === tf ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chart Type Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === 'type' ? null : 'type');
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              title="Chart Style"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            {activeMenu === 'type' && (
              <div className="absolute left-10 bottom-0 bg-white shadow-xl rounded-xl border border-gray-200 p-1.5 flex flex-col gap-1 z-30 min-w-[110px]">
                <button
                  onClick={() => {
                    setChartType('candles');
                    setActiveMenu(null);
                  }}
                  className={`px-2 py-1 text-xs rounded-md text-left font-medium ${
                    chartType === 'candles' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-gray-100'
                  }`}
                >
                  Candlestick
                </button>
                <button
                  onClick={() => {
                    setChartType('area');
                    setActiveMenu(null);
                  }}
                  className={`px-2 py-1 text-xs rounded-md text-left font-medium ${
                    chartType === 'area' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-gray-100'
                  }`}
                >
                  Area / Line
                </button>
              </div>
            )}
          </div>

          {/* Indicators Toggle */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showIndicators ? 'text-amber-600 bg-amber-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="SMA 9 Indicator"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Drawing Tool (Horizontal Support Line) */}
          <button
            onClick={() => {
              setShowDrawingTools(!showDrawingTools);
              if (showDrawingTools) setDrawingLineY(null);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showDrawingTools ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Drawing Tools (Click chart to place line)"
          >
            <PenTool className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-gray-200/80 flex flex-col gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(16, z - 6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(75, z + 6))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
