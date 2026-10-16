import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ArrowLeftRight,
  SlidersHorizontal
} from 'lucide-react';
import { Asset, TradeDirection } from '../types/trading';
import { sound } from '../utils/audio';

interface TradingPanelProps {
  asset: Asset;
  balance: number;
  investmentAmount: number;
  durationSeconds: number;
  oneClickTrading: boolean;
  onUpdateInvestment: (val: number) => void;
  onUpdateDuration: (val: number) => void;
  onOpenPendingOrderModal: () => void;
  onExecuteTrade: (direction: TradeDirection) => void;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  asset,
  balance,
  investmentAmount,
  durationSeconds,
  oneClickTrading,
  onUpdateInvestment,
  onUpdateDuration,
  onOpenPendingOrderModal,
  onExecuteTrade,
}) => {
  const [isPendingEnabled, setIsPendingEnabled] = useState(false);
  const [showQuickAmounts, setShowQuickAmounts] = useState(false);
  const [showQuickTimes, setShowQuickTimes] = useState(false);

  const profitAmount = investmentAmount * (asset.payout / 100);

  // Format duration into mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border-t border-gray-200/70 px-3 sm:px-4 pt-2.5 pb-2 flex flex-col gap-2 z-20 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      
      {/* Top Controls Row: Investments & Expiration */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* 1. Investments Card */}
        <div className="relative flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1 px-0.5">
            <span>Investments</span>
            <button
              onClick={() => {
                sound.playClick();
                setShowQuickAmounts(!showQuickAmounts);
              }}
              className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer active:scale-95"
              title="Quick Amounts"
            >
              <ArrowLeftRight className="w-3 h-3 text-indigo-500" />
              <span className="font-mono text-[10px] font-bold">$</span>
            </button>
          </div>

          <div 
            onClick={() => setShowQuickAmounts(!showQuickAmounts)}
            className="flex items-center justify-between bg-white/90 backdrop-blur-sm border border-gray-200/90 hover:border-gray-300 rounded-xl px-3 py-2 shadow-2xs transition-all cursor-pointer"
          >
            <input
              type="number"
              min="1"
              max="5000"
              value={investmentAmount}
              onChange={(e) => onUpdateInvestment(Math.max(1, Number(e.target.value) || 1))}
              onClick={(e) => e.stopPropagation()}
              className="w-20 font-mono font-extrabold text-[15px] sm:text-base text-gray-900 bg-transparent focus:outline-none"
            />
            <span className="font-mono font-bold text-gray-400 text-sm">$</span>
          </div>

          {/* Quick Amounts Popover */}
          {showQuickAmounts && (
            <div className="absolute left-0 bottom-14 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-2 grid grid-cols-4 gap-1.5 z-40 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
              {[1, 5, 10, 25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playClick();
                    onUpdateInvestment(amt);
                    setShowQuickAmounts(false);
                  }}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all active:scale-95 ${
                    investmentAmount === amt ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Expiration Card */}
        <div className="relative flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1 px-0.5">
            <span>Expiration</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onOpenPendingOrderModal();
                  sound.playClick();
                }}
                className="flex items-center gap-0.5 text-gray-500 hover:text-indigo-600 text-[10px] cursor-pointer"
                title="Pending Trade"
              >
                <Clock className="w-2.5 h-2.5 text-gray-400" />
                <span className="hidden xs:inline">Pending trade</span>
              </button>
              {/* iOS style toggle */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPendingEnabled(!isPendingEnabled);
                  if (!isPendingEnabled) onOpenPendingOrderModal();
                }}
                className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                  isPendingEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                title="Toggle Pending Order"
              >
                <span className={`block w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                  isPendingEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div 
            onClick={() => setShowQuickTimes(!showQuickTimes)}
            className="flex items-center justify-between bg-white/90 backdrop-blur-sm border border-gray-200/90 hover:border-gray-300 rounded-xl px-3 py-2 shadow-2xs transition-all cursor-pointer"
          >
            <span className="font-mono font-extrabold text-[15px] sm:text-base text-gray-900">
              {formatTime(durationSeconds)}
            </span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>

          {/* Quick Durations Popover */}
          {showQuickTimes && (
            <div className="absolute right-0 bottom-14 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-2 grid grid-cols-3 gap-1.5 z-40 min-w-[210px] animate-in fade-in zoom-in-95 duration-100">
              {[
                { label: '30s', val: 30 },
                { label: '01:00', val: 60 },
                { label: '02:00', val: 120 },
                { label: '03:00', val: 180 },
                { label: '05:00', val: 300 },
                { label: '15:00', val: 900 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    sound.playClick();
                    onUpdateDuration(item.val);
                    setShowQuickTimes(false);
                  }}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all active:scale-95 ${
                    durationSeconds === item.val ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profit Line: Profit: +81% on left, +$0.81 on right in green */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold">
        <div className="flex items-center gap-1 text-gray-500 text-[11px]">
          <span>Profit:</span>
          <span className="text-[#00b15d] font-bold font-mono">+{asset.payout}%</span>
        </div>
        <div className="text-[#00b15d] font-mono font-extrabold text-xs">
          +${profitAmount.toFixed(2)}
        </div>
      </div>

      {/* Action Buttons: LOWER (Red with Lucide ArrowDown) & HIGHER (Green with Lucide ArrowUp) */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* LOWER BUTTON (Red with Lucide ArrowDown and red tint) */}
        <button
          onClick={() => onExecuteTrade('LOWER')}
          className="group relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#ea2e3f] hover:bg-[#d92233] active:bg-[#c01828] text-white rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer overflow-hidden font-extrabold tracking-wider border border-red-400/30"
          style={{
            boxShadow: '0 4px 16px -2px rgba(234, 46, 63, 0.45)'
          }}
          title="Lower (Put) Trade"
        >
          {/* Subtle Glass light streak */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/10 pointer-events-none" />

          <span className="text-sm sm:text-[15px] font-black tracking-wider uppercase drop-shadow-xs relative z-10">
            LOWER
          </span>
          
          {/* Lucide React ArrowDown with Red Tint */}
          <div className="relative z-10 w-6 h-6 rounded-full bg-red-950/25 ring-1 ring-red-300/40 flex items-center justify-center text-white transition-transform group-hover:translate-y-0.5">
            <ArrowDown className="w-4 h-4 stroke-[2.8]" />
          </div>
        </button>

        {/* HIGHER BUTTON (Green with Lucide ArrowUp and green tint) */}
        <button
          onClick={() => onExecuteTrade('HIGHER')}
          className="group relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#00b15d] hover:bg-[#009e53] active:bg-[#008947] text-white rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer overflow-hidden font-extrabold tracking-wider border border-emerald-400/30"
          style={{
            boxShadow: '0 4px 16px -2px rgba(0, 177, 93, 0.45)'
          }}
          title="Higher (Call) Trade"
        >
          {/* Subtle Glass light streak */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/10 pointer-events-none" />

          <span className="text-sm sm:text-[15px] font-black tracking-wider uppercase drop-shadow-xs relative z-10">
            HIGHER
          </span>

          {/* Lucide React ArrowUp with Green Tint */}
          <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-950/25 ring-1 ring-emerald-300/40 flex items-center justify-center text-white transition-transform group-hover:-translate-y-0.5">
            <ArrowUp className="w-4 h-4 stroke-[2.8]" />
          </div>
        </button>
      </div>
    </div>
  );
};
