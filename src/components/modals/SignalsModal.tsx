import React from 'react';
import { X, Zap, ArrowUpRight, ArrowDownRight, Bell, Sparkles } from 'lucide-react';
import { Asset, TradeDirection } from '../../types/trading';
import { sound } from '../../utils/audio';

interface SignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignal: (assetId: string, direction: TradeDirection) => void;
}

interface SignalItem {
  id: string;
  assetId: string;
  name: string;
  timeframe: string;
  direction: TradeDirection;
  signalType: 'STRONG BUY' | 'BUY' | 'STRONG SELL' | 'SELL';
  accuracy: number;
  timeAgo: string;
}

const SIGNALS: SignalItem[] = [
  { id: '1', assetId: 'eur-aud-otc', name: 'EUR/AUD (OTC)', timeframe: '1m', direction: 'HIGHER', signalType: 'STRONG BUY', accuracy: 94, timeAgo: 'Just now' },
  { id: '2', assetId: 'eur-usd', name: 'EUR/USD', timeframe: '1m', direction: 'HIGHER', signalType: 'BUY', accuracy: 88, timeAgo: '1 min ago' },
  { id: '3', assetId: 'gbp-jpy-otc', name: 'GBP/JPY (OTC)', timeframe: '5m', direction: 'LOWER', signalType: 'STRONG SELL', accuracy: 91, timeAgo: '2 mins ago' },
  { id: '4', assetId: 'btc-usd', name: 'BTC/USD', timeframe: '1m', direction: 'HIGHER', signalType: 'BUY', accuracy: 84, timeAgo: '4 mins ago' },
  { id: '5', assetId: 'xau-usd', name: 'Gold (XAU/USD)', timeframe: '2m', direction: 'HIGHER', signalType: 'STRONG BUY', accuracy: 92, timeAgo: '5 mins ago' },
  { id: '6', assetId: 'eur-nzd-otc', name: 'EUR/NZD (OTC)', timeframe: '1m', direction: 'LOWER', signalType: 'SELL', accuracy: 81, timeAgo: '7 mins ago' },
];

export const SignalsModal: React.FC<SignalsModalProps> = ({
  isOpen,
  onClose,
  onApplySignal,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Live Trading Signals</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Algorithmic indicators updated continuously</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signals List */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
          {SIGNALS.map((sig) => {
            const isBuy = sig.direction === 'HIGHER';
            return (
              <div
                key={sig.id}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    isBuy ? 'bg-[#00b15d]' : 'bg-[#f03d3d]'
                  }`}>
                    {isBuy ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">{sig.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                        {sig.timeframe}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] mt-0.5">
                      <span className={`font-bold ${isBuy ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {sig.signalType}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-mono">Confidence: {sig.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onApplySignal(sig.assetId, sig.direction);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs transition-all cursor-pointer ${
                      isBuy ? 'bg-[#00b15d] hover:bg-[#009e52]' : 'bg-[#f03d3d] hover:bg-[#dc2626]'
                    }`}
                  >
                    Apply {isBuy ? 'Higher' : 'Lower'}
                  </button>
                  <span className="text-[10px] text-gray-400">{sig.timeAgo}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-400 text-[11px]">Signals are computed with RSI & EMA cross</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
