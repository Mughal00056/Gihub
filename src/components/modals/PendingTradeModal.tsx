import React, { useState } from 'react';
import { X, Plus, Minus, ArrowUpRight, ArrowDownRight, Clock, Target } from 'lucide-react';
import { Asset, TradeDirection, PendingOrder } from '../../types/trading';
import { sound } from '../../utils/audio';

interface PendingTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onCreatePendingOrder: (order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>) => void;
}

export const PendingTradeModal: React.FC<PendingTradeModalProps> = ({
  isOpen,
  onClose,
  asset,
  onCreatePendingOrder,
}) => {
  const [mode, setMode] = useState<'PRICE' | 'TIME'>('PRICE');
  const [targetPrice, setTargetPrice] = useState<number>(() => Number((asset.currentPrice - 0.00005).toFixed(asset.precision)));
  const [direction, setDirection] = useState<TradeDirection>('HIGHER');
  const [amount, setAmount] = useState<number>(1);
  const [expirationMinutes, setExpirationMinutes] = useState<number>(1);
  const [opensMinutesAhead, setOpensMinutesAhead] = useState<number>(1);

  if (!isOpen) return null;

  const profitAmount = amount * (asset.payout / 100);
  const totalPayout = amount + profitAmount;

  // Format Time ahead
  const now = new Date();
  const openTime = new Date(now.getTime() + opensMinutesAhead * 60 * 1000);
  const openTimeStr = openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const expireTime = new Date(openTime.getTime() + expirationMinutes * 60 * 1000);
  const expireTimeStr = expireTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleCreate = () => {
    sound.playTradeOpen();
    onCreatePendingOrder({
      assetId: asset.id,
      assetName: asset.name,
      mode,
      targetPrice: mode === 'PRICE' ? targetPrice : undefined,
      targetTime: mode === 'TIME' ? openTime.getTime() : undefined,
      direction,
      amount,
      durationSeconds: expirationMinutes * 60,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header Tabs: BY PRICE | BY TIME */}
        <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex-1 flex gap-1 bg-gray-200/60 p-1 rounded-xl">
            <button
              onClick={() => {
                sound.playClick();
                setMode('PRICE');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'PRICE' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              BY PRICE
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMode('TIME');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'TIME' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              BY TIME
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 ml-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-4 space-y-3.5 text-xs">
          {mode === 'PRICE' ? (
            /* BY PRICE SECTION */
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                <span>TARGET PRICE</span>
                <span className="font-mono text-gray-400">Current quote: {asset.currentPrice.toFixed(asset.precision)}</span>
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                <button
                  onClick={() => setTargetPrice((p) => Number((p - 0.00005).toFixed(asset.precision)))}
                  className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.00001"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-sm text-gray-900 bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => setTargetPrice((p) => Number((p + 0.00005).toFixed(asset.precision)))}
                  className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* BY TIME SECTION */
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                <span>OPENS AT</span>
                <span className="text-indigo-600 font-mono font-bold">in {opensMinutesAhead} min</span>
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                <button
                  onClick={() => setOpensMinutesAhead((m) => Math.max(1, m - 1))}
                  className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="flex-1 text-center font-mono font-bold text-sm text-gray-900">
                  {openTimeStr}
                </span>
                <button
                  onClick={() => setOpensMinutesAhead((m) => m + 1)}
                  className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick time chips matching screenshot: +1m, +2m, +3m, +5m, +10m, +15m, +30m, +60m */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[1, 2, 3, 5, 10, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      sound.playClick();
                      setOpensMinutesAhead(mins);
                    }}
                    className={`py-1 text-[11px] font-mono font-bold rounded-md transition-colors ${
                      opensMinutesAhead === mins ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expiration Input */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>EXPIRATION</span>
              {mode === 'TIME' && <span className="font-mono text-gray-400">Expires at: {expireTimeStr}</span>}
            </div>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
              <button
                onClick={() => setExpirationMinutes((m) => Math.max(1, m - 1))}
                className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center font-mono font-bold text-sm text-gray-900">
                {expirationMinutes} min
              </span>
              <button
                onClick={() => setExpirationMinutes((m) => m + 1)}
                className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Investment Amount Input */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">INVESTMENTS</span>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
              <button
                onClick={() => setAmount((a) => Math.max(1, a - 1))}
                className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 flex items-center justify-center font-mono font-bold text-sm text-gray-900">
                <span className="text-gray-400 mr-0.5">$</span>
                {amount}
              </div>
              <button
                onClick={() => setAmount((a) => a + 1)}
                className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Direction Selector (Higher / Lower) */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">ORDER DIRECTION</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setDirection('LOWER');
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  direction === 'LOWER'
                    ? 'bg-[#f03d3d] text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                LOWER
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setDirection('HIGHER');
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  direction === 'HIGHER'
                    ? 'bg-[#00b15d] text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                HIGHER
              </button>
            </div>
          </div>

          {/* Payout calculation badge */}
          <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200/60 font-mono text-xs">
            <span className="text-gray-600 font-sans font-medium">Profit ({asset.payout}%):</span>
            <span className="font-bold text-emerald-600">+${profitAmount.toFixed(2)} (${totalPayout.toFixed(2)})</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            Create Pending Order
          </button>
        </div>
      </div>
    </div>
  );
};
