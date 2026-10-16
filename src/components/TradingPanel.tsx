import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  Clock, 
  DollarSign, 
  Percent,
  SlidersHorizontal,
  ChevronUp
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
  const [showQuickAmounts, setShowQuickAmounts] = useState(false);
  const [showQuickTimes, setShowQuickTimes] = useState(false);
  const [modeCurrency, setModeCurrency] = useState<'$' | '%'>('$');

  const profitAmount = (investmentAmount * (asset.payout / 100));
  const totalReturn = investmentAmount + profitAmount;

  // Format duration into mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInvestmentChange = (delta: number) => {
    sound.playClick();
    const next = Math.max(1, Math.min(5000, investmentAmount + delta));
    onUpdateInvestment(next);
  };

  const handleDurationChange = (delta: number) => {
    sound.playClick();
    const next = Math.max(10, Math.min(3600, durationSeconds + delta));
    onUpdateDuration(next);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-lg z-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
        
        {/* Input Controls Row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          
          {/* 1. Investment Input Box */}
          <div className="relative flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1 px-1">
              <span className="flex items-center gap-1">
                Investments
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setModeCurrency(modeCurrency === '$' ? '%' : '$');
                  }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 text-[10px]"
                  title="Switch $ / %"
                >
                  <DollarSign className="w-3 h-3" />
                  <span className="text-gray-300">/</span>
                  <Percent className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowQuickAmounts(!showQuickAmounts)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showQuickAmounts ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-1.5 py-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-2xs">
              <button
                onClick={() => handleInvestmentChange(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-0.5">
                <span className="text-sm font-bold text-gray-400 font-mono">$</span>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={investmentAmount}
                  onChange={(e) => onUpdateInvestment(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 sm:w-20 text-center font-mono font-bold text-sm sm:text-base text-gray-900 bg-transparent focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleInvestmentChange(1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Amounts Popover */}
            {showQuickAmounts && (
              <div className="absolute left-0 bottom-14 bg-white border border-gray-200 shadow-xl rounded-xl p-2 grid grid-cols-4 gap-1.5 z-30 min-w-[200px] animate-in fade-in">
                {[1, 5, 10, 25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      onUpdateInvestment(amt);
                      setShowQuickAmounts(false);
                    }}
                    className={`py-1 text-xs font-mono font-bold rounded-md transition-colors ${
                      investmentAmount === amt ? 'bg-indigo-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Expiration Input Box */}
          <div className="relative flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1 px-1">
              <span className="flex items-center gap-1">
                Expiration
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenPendingOrderModal();
                }}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                title="Create Pending Trade"
              >
                <Clock className="w-2.5 h-2.5" />
                <span>Pending trade</span>
              </button>
            </div>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-1.5 py-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-2xs">
              <button
                onClick={() => handleDurationChange(-15)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div 
                onClick={() => setShowQuickTimes(!showQuickTimes)}
                className="flex-1 flex items-center justify-center cursor-pointer select-none"
              >
                <span className="text-center font-mono font-bold text-sm sm:text-base text-gray-900">
                  {formatTime(durationSeconds)}
                </span>
              </div>

              <button
                onClick={() => handleDurationChange(15)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Durations Popover */}
            {showQuickTimes && (
              <div className="absolute right-0 bottom-14 bg-white border border-gray-200 shadow-xl rounded-xl p-2 grid grid-cols-3 gap-1.5 z-30 min-w-[210px] animate-in fade-in">
                {[
                  { label: '30s', val: 30 },
                  { label: '1m', val: 60 },
                  { label: '2m', val: 120 },
                  { label: '3m', val: 180 },
                  { label: '5m', val: 300 },
                  { label: '15m', val: 900 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      sound.playClick();
                      onUpdateDuration(item.val);
                      setShowQuickTimes(false);
                    }}
                    className={`py-1 text-xs font-mono font-bold rounded-md transition-colors ${
                      durationSeconds === item.val ? 'bg-indigo-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profit Payout Bar (Matches screenshot: Profit: +88%  +$0.88) */}
        <div className="flex items-center justify-between px-1 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>Profit:</span>
            <span className="text-emerald-600 font-bold font-mono">+{asset.payout}%</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-mono font-bold text-xs sm:text-sm">
            <span>+${profitAmount.toFixed(2)}</span>
            <span className="text-[11px] text-gray-400 font-normal">(${totalReturn.toFixed(2)})</span>
          </div>
        </div>

        {/* Big Action Trading Buttons (LOWER & HIGHER) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-0.5">
          {/* LOWER BUTTON (Red, down-right arrow) */}
          <button
            onClick={() => onExecuteTrade('LOWER')}
            className="group relative flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 bg-[#f03d3d] hover:bg-[#dc2626] active:bg-[#b91c1c] text-white rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer font-extrabold text-sm sm:text-base tracking-wider uppercase overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span>LOWER</span>
            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
          </button>

          {/* HIGHER BUTTON (Green, up-right arrow) */}
          <button
            onClick={() => onExecuteTrade('HIGHER')}
            className="group relative flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 bg-[#00b15d] hover:bg-[#009e52] active:bg-[#008c48] text-white rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer font-extrabold text-sm sm:text-base tracking-wider uppercase overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span>HIGHER</span>
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
