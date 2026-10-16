import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
import { Asset, TradeDirection } from '../../types/trading';
import { sound } from '../../utils/audio';

interface OrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  direction: TradeDirection;
  amount: number;
  durationSeconds: number;
  currentPrice: number;
  onConfirm: (rememberOneClick: boolean) => void;
}

export const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  isOpen,
  onClose,
  asset,
  direction,
  amount,
  durationSeconds,
  currentPrice,
  onConfirm,
}) => {
  const [oneClick, setOneClick] = useState(false);

  if (!isOpen) return null;

  const durationStr = durationSeconds < 60 ? `${durationSeconds} sec` : `${Math.round(durationSeconds / 60)} min`;
  const isHigher = direction === 'HIGHER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150 p-4">
        
        {/* Header (Matches screenshot: EUR/USD Higher ↗) */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">
              {asset.name}
            </span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              isHigher ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {isHigher ? 'Higher' : 'Lower'}
              {isHigher ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trade Attributes (Matches screenshot rows: Open price, Invest, Expiration) */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-gray-500">
            <span>Open price</span>
            <span className="font-mono font-bold text-gray-900">
              {currentPrice.toFixed(asset.precision)}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>Invest</span>
            <span className="font-mono font-bold text-gray-900">
              ${amount}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>Expiration</span>
            <span className="font-semibold text-gray-900">
              {durationStr}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-500 pt-1 border-t border-gray-100">
            <span>Potential Payout</span>
            <span className="font-mono font-bold text-emerald-600">
              +${(amount * (asset.payout / 100)).toFixed(2)} (+{asset.payout}%)
            </span>
          </div>
        </div>

        {/* Action Button: [✓ Confirm Higher] / [Confirm Lower] */}
        <button
          onClick={() => {
            sound.playTradeOpen();
            onConfirm(oneClick);
          }}
          className={`w-full py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isHigher
              ? 'bg-[#00b15d] hover:bg-[#009e52]'
              : 'bg-[#f03d3d] hover:bg-[#dc2626]'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Confirm {isHigher ? 'Higher' : 'Lower'}</span>
        </button>

        {/* Checkbox: Always purchase in one click */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer text-xs text-gray-600 select-none">
          <input
            type="checkbox"
            checked={oneClick}
            onChange={(e) => setOneClick(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
          />
          <span>Always purchase in one click</span>
        </label>
      </div>
    </div>
  );
};
