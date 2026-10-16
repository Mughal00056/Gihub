import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart2, 
  Activity, 
  PenTool, 
  Plus, 
  Minus, 
  Info,
  RotateCcw,
  Radio
} from 'lucide-react';
import { Candle, Asset, ActiveTrade } from '../types/trading';

interface ChartProps {
  asset: Asset;
  activeTrades: ActiveTrade[];
  onPriceUpdate: (newPrice: number) => void;
  selectedDurationSeconds: number;
  onOpenAssetInfo?: () => void;
}

export const Chart: React.FC<ChartProps> = ({
  asset,
  activeTrades,
  onPriceUpdate,
  selectedDurationSeconds,
  onOpenAssetInfo,
}) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<'5s' | '10s' | '30s' | '1m' | '5m'>('1m');
  const [chartType, setChartType] = useState<'candles' | 'area' | 'bars' | 'heikin'>('candles');
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [showDrawingTools, setShowDrawingTools] = useState<boolean>(false);
  const [drawingLineY, setDrawingLineY] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(36); // visible candles
  const [panOffset, setPanOffset] = useState<number>(0); // pan offset back in time
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; price: number; timeStr: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<'tf' | 'type' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ clientX: number; initialPan: number } | null>(null);
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
    const count = 90;
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
    setPanOffset(0);
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
          return [...prev.slice(-120), newCandle];
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

  // Visible Candles Slice (with Pan Offset for panning backward and forward)
  const visibleCandles = useMemo(() => {
    if (candles.length === 0) return [];
    if (panOffset <= 0) {
      return candles.slice(-zoomLevel);
    }
    const end = Math.max(zoomLevel, candles.length - panOffset);
    const start = Math.max(0, end - zoomLevel);
    return candles.slice(start, end);
  }, [candles, zoomLevel, panOffset]);

  // Current Live Price & Last Candle
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

  // Chart Dimensions
  const isMobile = dimensions.width < 640;
  const axisWidth = isMobile ? 62 : 75;
  const chartWidth = Math.max(dimensions.width - axisWidth, 80);
  const chartHeight = Math.max(dimensions.height - 30, 80);

  const getY = (val: number) => {
    const normalized = (val - minPrice) / (priceRange || 1);
    return chartHeight - normalized * chartHeight;
  };

  const getPriceAtY = (y: number) => {
    const normalized = (chartHeight - y) / chartHeight;
    return minPrice + normalized * priceRange;
  };

  const candleSpacing = chartWidth / Math.max(visibleCandles.length, 1);
  const candleBodyWidth = Math.max(candleSpacing * 0.65, 2.5);

  // Moving Average 9
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

  // Handle Drag / Pan (Horizontal Scrolling "Aage Piche")
  const handleStartPan = (clientX: number) => {
    dragStartRef.current = { clientX, initialPan: panOffset };
  };

  const handleMovePan = (clientX: number) => {
    if (!dragStartRef.current) return;
    const deltaX = clientX - dragStartRef.current.clientX;
    const candleDelta = Math.round(deltaX / Math.max(candleSpacing, 3));
    const maxPan = Math.max(0, candles.length - zoomLevel);
    // Dragging right moves back in time (increases panOffset)
    const nextPan = Math.max(0, Math.min(maxPan, dragStartRef.current.initialPan + candleDelta));
    setPanOffset(nextPan);
  };

  const handleEndPan = () => {
    dragStartRef.current = null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      handleStartPan(e.clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragStartRef.current) {
      handleMovePan(e.clientX);
    }

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

  const handleMouseUp = () => {
    handleEndPan();
  };

  // Touch Handlers for Mobile Panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartPan(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMovePan(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleEndPan();
  };

  // Zoom wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomLevel((z) => Math.max(16, z - 4));
    } else {
      setZoomLevel((z) => Math.min(90, z + 4));
    }
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
    const count = 5;
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
      className="relative flex-1 w-full h-full bg-[#f8f9fc] overflow-hidden select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleEndPan();
        setCrosshair(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={handleChartClick}
    >
      {/* Top Chart Info Bar (Matches Reference Screenshot & User Request) */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-xs pointer-events-none z-10 max-w-[calc(100%-16px)]">
        
        {/* Left: i Button NEXT TO GMT+5 Timer + Quote */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/85 backdrop-blur-xl px-2.5 py-1 rounded-xl border border-gray-200/70 shadow-xs pointer-events-auto max-w-full overflow-hidden shrink">
          {/* USER REQUIREMENT: i button on left side of GMT+5 timer */}
          {onOpenAssetInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAssetInfo();
              }}
              className="p-1 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
              title="Asset Info & Trading Conditions"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-gray-700 font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold">{currentTimeStr || '12:00:12 GMT+5'}</span>
          </div>

          <div className="h-3 w-[1px] bg-gray-200 shrink-0" />

          <div className="flex items-center gap-1 shrink-0">
            <span className="font-bold text-gray-900 text-[11px] sm:text-xs font-mono">
              {currentPrice.toFixed(asset.precision)}
            </span>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded ${
              asset.change24h >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
            </span>
          </div>
        </div>

        {/* Trade Cycle Header Notice (Matches Screenshot) */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 font-medium bg-white/80 px-2 py-0.5 rounded border border-gray-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Beginning of trade
          </span>
          <span className="flex items-center gap-1 font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            End: {selectedDurationSeconds}s
          </span>
        </div>
      </div>

      {/* Snap to Live Button (When user pans back in history) */}
      {panOffset > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPanOffset(0);
          }}
          className="absolute bottom-16 right-16 sm:right-20 z-20 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer pointer-events-auto"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Snap to Live</span>
        </button>
      )}

      {/* Main SVG Chart Canvas */}
      <svg className="w-full h-full block">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <pattern id="gridPattern" width="50" height="35" patternUnits="userSpaceOnUse">
            <line x1="0" y1="35" x2="50" y2="35" stroke="#edf0f5" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="50" y1="0" x2="50" y2="35" stroke="#edf0f5" strokeWidth="1" strokeDasharray="2,2" />
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
                stroke="#e2e8f0" 
                strokeWidth={1} 
                strokeDasharray="3,3" 
              />
              <text 
                x={chartWidth + 4} 
                y={y + 3.5} 
                fill="#94a3b8" 
                fontSize={isMobile ? 9 : 10} 
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
              y={drawingLineY - 7} 
              width={axisWidth - 4} 
              height={15} 
              fill="#3b82f6" 
              rx={3} 
            />
            <text 
              x={chartWidth + axisWidth / 2} 
              y={drawingLineY + 3.5} 
              fill="#ffffff" 
              fontSize={9} 
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
          visibleCandles.map((candle, idx) => {
            const x = idx * candleSpacing + candleSpacing / 2;
            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? '#00b15d' : '#f03d3d';
            
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

        {/* Left Vertical Sentiment Bar (Matches Screenshot 24% Green / 76% Red) */}
        <g>
          {/* Green Top (Bullish Sentiment ~28%) */}
          <rect x={1} y={24} width={3.5} height={chartHeight * 0.28} fill="#00b15d" rx={1.5} />
          <text x={1} y={18} fill="#00b15d" fontSize={8} fontWeight="bold" fontFamily="JetBrains Mono, monospace">
            28%
          </text>
          {/* Red Bottom (Bearish Sentiment ~72%) */}
          <rect x={1} y={24 + chartHeight * 0.28 + 2} width={3.5} height={chartHeight * 0.72 - 28} fill="#f03d3d" rx={1.5} />
          <text x={1} y={chartHeight - 4} fill="#f03d3d" fontSize={8} fontWeight="bold" fontFamily="JetBrains Mono, monospace">
            72%
          </text>
        </g>

        {/* Trade Expiration Vertical Boundary Line (End of trade) */}
        {panOffset === 0 && (
          <g>
            <line
              x1={chartWidth - 55}
              y1={0}
              x2={chartWidth - 55}
              y2={chartHeight}
              stroke="#fca5a5"
              strokeWidth={1.2}
              strokeDasharray="3,3"
            />
            <text
              x={chartWidth - 52}
              y={24}
              fill="#94a3b8"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
            >
              « End of trade
            </text>
            <text
              x={chartWidth - 52}
              y={34}
              fill="#64748b"
              fontSize={8.5}
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
            >
              01:00
            </text>
          </g>
        )}

        {/* Active Trades Overlays on Chart (Matches Exact Screenshot: "↑ $1 00:43" + Direction Arrow) */}
        {activeTrades.map((trade) => {
          const tradeY = getY(trade.openPrice);
          const isWinning = trade.direction === 'HIGHER' ? currentPrice > trade.openPrice : currentPrice < trade.openPrice;
          const statusColor = isWinning ? '#00b15d' : '#f03d3d';
          const nowSec = Math.floor(Date.now() / 1000);
          const secsLeft = Math.max(0, trade.expireTime - nowSec);
          const formattedSecs = `${Math.floor(secsLeft / 60)}:${secsLeft % 60 < 10 ? '0' : ''}${secsLeft % 60}`;

          return (
            <g key={trade.id} className="transition-all">
              {/* Entry Horizontal Line with endpoints */}
              <line
                x1={chartWidth * 0.3}
                y1={tradeY}
                x2={chartWidth}
                y2={tradeY}
                stroke={statusColor}
                strokeWidth={1.5}
                strokeDasharray="3,2"
              />
              <circle cx={chartWidth * 0.3} cy={tradeY} r={3} fill="#ffffff" stroke={statusColor} strokeWidth={1.5} />
              <circle cx={chartWidth - 10} cy={tradeY} r={3} fill="#ffffff" stroke={statusColor} strokeWidth={1.5} />

              {/* Exact Screenshot Active Trade Tag: "↑ $1 00:43" */}
              <g transform={`translate(${Math.max(chartWidth * 0.35, 20)}, ${Math.max(tradeY - 18, 20)})`}>
                <rect
                  x={0}
                  y={0}
                  width={68}
                  height={17}
                  rx={4}
                  fill={trade.direction === 'HIGHER' ? '#00b15d' : '#ea2e3f'}
                  className="shadow-sm"
                />
                <text
                  x={34}
                  y={12}
                  fontSize={9}
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {trade.direction === 'HIGHER' ? '↑' : '↓'} ${trade.amount} {formattedSecs}
                </text>
              </g>

              {/* Tilted Directional Indicator Arrow (Exact match from screenshot) */}
              <g transform={`translate(${chartWidth - 45}, ${tradeY + (trade.direction === 'HIGHER' ? -22 : 10)})`}>
                <filter id={`arrowShadow_${trade.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={trade.direction === 'HIGHER' ? '#00b15d' : '#ea2e3f'} floodOpacity="0.4" />
                </filter>
                <rect
                  x={0}
                  y={0}
                  width={22}
                  height={22}
                  rx={6}
                  fill="#ffffff"
                  stroke={trade.direction === 'HIGHER' ? '#00b15d' : '#ea2e3f'}
                  strokeWidth={1.5}
                  filter={`url(#arrowShadow_${trade.id})`}
                />
                <path
                  d={trade.direction === 'HIGHER' ? "M 6 15 L 15 6 M 9 6 L 15 6 L 15 12" : "M 6 6 L 15 15 M 9 15 L 15 15 L 15 9"}
                  fill="none"
                  stroke={trade.direction === 'HIGHER' ? '#00b15d' : '#ea2e3f'}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Entry Price Tag next to line */}
              <text
                x={chartWidth * 0.3 + 6}
                y={tradeY - 4}
                fontSize={8.5}
                fontWeight="bold"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {trade.openPrice.toFixed(asset.precision)}
              </text>
            </g>
          );
        })}

        {/* Current Price Tracking Line & Solid Badge (Teal or Red matching screenshot) */}
        {currentCandle && (
          <g>
            <line
              x1={0}
              y1={getY(currentPrice)}
              x2={chartWidth}
              y2={getY(currentPrice)}
              stroke={currentCandle.close >= currentCandle.open ? "#00b15d" : "#ea2e3f"}
              strokeWidth={1.2}
              strokeDasharray="3,2"
            />
            {/* Pulsing indicator */}
            <circle
              cx={chartWidth - 2}
              cy={getY(currentPrice)}
              r={3}
              fill={currentCandle.close >= currentCandle.open ? "#00b15d" : "#ea2e3f"}
            />
            {/* Solid Right-Axis Current Price Badge with Countdown */}
            <g transform={`translate(${chartWidth}, ${getY(currentPrice) - 10})`}>
              <rect
                x={0}
                y={0}
                width={axisWidth}
                height={20}
                rx={3}
                fill={currentCandle.close >= currentCandle.open ? "#00b15d" : "#ea2e3f"}
              />
              <text
                x={axisWidth / 2}
                y={9}
                fill="#ffffff"
                fontSize={8.5}
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {currentPrice.toFixed(asset.precision)}
              </text>
              <text
                x={axisWidth / 2}
                y={17}
                fill="#ffffff"
                fontSize={7.5}
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                00:{new Date().getSeconds() < 10 ? `0${new Date().getSeconds()}` : new Date().getSeconds()}
              </text>
            </g>
          </g>
        )}

        {/* Crosshair Cursor */}
        {crosshair && (
          <g pointerEvents="none">
            <line
              x1={crosshair.x}
              y1={0}
              x2={crosshair.x}
              y2={chartHeight}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <line
              x1={0}
              y1={crosshair.y}
              x2={chartWidth}
              y2={crosshair.y}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <rect
              x={chartWidth}
              y={crosshair.y - 8}
              width={axisWidth}
              height={16}
              fill="#334155"
              rx={3}
            />
            <text
              x={chartWidth + axisWidth / 2}
              y={crosshair.y + 3.5}
              fill="#ffffff"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {crosshair.price.toFixed(asset.precision)}
            </text>
            <rect
              x={crosshair.x - 22}
              y={chartHeight + 3}
              width={44}
              height={15}
              fill="#334155"
              rx={3}
            />
            <text
              x={crosshair.x}
              y={chartHeight + 13}
              fill="#ffffff"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {crosshair.timeStr}
            </text>
          </g>
        )}

        {/* Time X-Axis Ticks */}
        {visibleCandles.filter((_, i) => i % (isMobile ? 10 : 8) === 0).map((c) => {
          const idx = visibleCandles.indexOf(c);
          const x = idx * candleSpacing + candleSpacing / 2;
          const time = new Date(c.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          return (
            <text
              key={c.time}
              x={x}
              y={chartHeight + 14}
              fill="#94a3b8"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {time}
            </text>
          );
        })}
      </svg>

      {/* Floating Chart Control Tool Panel on Left (Matching Screenshot) */}
      <div className="absolute left-2 bottom-12 flex flex-col gap-1 z-20 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-0.5 shadow-md border border-gray-200/80 flex flex-col gap-0.5">
          {/* Timeframe Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === 'tf' ? null : 'tf');
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              title="Timeframe"
            >
              {timeframe}
            </button>
            {activeMenu === 'tf' && (
              <div className="absolute left-9 bottom-0 bg-white shadow-xl rounded-xl border border-gray-200 p-1 flex flex-col gap-0.5 z-30 min-w-[65px]">
                {(['5s', '10s', '30s', '1m', '5m'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setActiveMenu(null);
                    }}
                    className={`px-2 py-1 text-[11px] rounded-md text-left font-semibold ${
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
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              title="Chart Style"
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {activeMenu === 'type' && (
              <div className="absolute left-9 bottom-0 bg-white shadow-xl rounded-xl border border-gray-200 p-1 flex flex-col gap-0.5 z-30 min-w-[100px]">
                <button
                  onClick={() => {
                    setChartType('candles');
                    setActiveMenu(null);
                  }}
                  className={`px-2 py-1 text-[11px] rounded-md text-left font-medium ${
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
                  className={`px-2 py-1 text-[11px] rounded-md text-left font-medium ${
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
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
              showIndicators ? 'text-amber-600 bg-amber-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="SMA 9 Indicator"
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Drawing Tool */}
          <button
            onClick={() => {
              setShowDrawingTools(!showDrawingTools);
              if (showDrawingTools) setDrawingLineY(null);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
              showDrawingTools ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Drawing Line"
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Zoom Controls ("trade zoom ok fix") */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-0.5 shadow-md border border-gray-200/80 flex flex-col gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(14, z - 5));
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(85, z + 5));
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
