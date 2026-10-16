import React, { useState } from 'react';
import { X, Clock, Calendar, CheckCircle, Info, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { Asset } from '../../types/trading';
import { sound } from '../../utils/audio';

interface AssetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export const AssetInfoModal: React.FC<AssetInfoModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'conditions'>('info');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header (Matches screenshot: EUR/AUD (OTC) • Open) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl leading-none">
              <span>{asset.flag1}</span>
              {asset.flag2 && <span>{asset.flag2}</span>}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{asset.name}</h3>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{asset.group}</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Quote & 24h Change */}
        <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Live Quote</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-gray-900">
                {asset.currentPrice.toFixed(asset.precision)}
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                +{asset.change24h}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Payout</span>
            <div className="text-base font-bold font-mono text-[#00b15d]">
              +{asset.payout}%
            </div>
          </div>
        </div>

        {/* Segmented Tabs: Information | Trading Conditions */}
        <div className="p-2 border-b border-gray-100 flex bg-gray-50/70">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('info');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Information
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('conditions');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'conditions'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Trading Conditions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto max-h-[380px] text-xs space-y-4">
          {activeTab === 'info' ? (
            <>
              {/* 24h Change Card */}
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-emerald-700 font-bold font-mono text-sm">
                    +{asset.changeAmount.toFixed(asset.precision)} (+{asset.change24h}%)
                  </div>
                  <div className="text-emerald-600/90 text-[11px] mt-0.5">
                    Change over the last 24 hours
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">Current price</span>
                  <div className="font-mono font-bold text-gray-900 text-xs">
                    {asset.currentPrice.toFixed(asset.precision)}
                  </div>
                </div>
              </div>

              {/* Asset Details (Forex, Group, Pair, Precision) */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Asset details
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2.5 border border-gray-100">
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold text-gray-800 capitalize">{asset.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                    <span className="text-gray-500">Group</span>
                    <span className="font-semibold text-gray-800">{asset.group}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                    <span className="text-gray-500">Pair</span>
                    <span className="font-mono font-bold text-gray-800 flex items-center gap-1">
                      {asset.symbol}
                      <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500">Precision</span>
                    <span className="font-semibold text-gray-800">{asset.precision} decimals</span>
                  </div>
                </div>
              </div>

              {/* Market Hours */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Market hours
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Schedule
                    </span>
                    <span className="font-semibold text-gray-800">24 Hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Trading days
                    </span>
                    <span className="font-semibold text-gray-800">Sun, Mon, Tue, Wed, Thu, Fri, Sat</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Trading Conditions */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2.5 border border-gray-100">
                <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                  <span className="text-gray-500">Profit Rate</span>
                  <span className="font-mono font-bold text-emerald-600">+{asset.payout}%</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                  <span className="text-gray-500">Min investment</span>
                  <span className="font-mono font-semibold text-gray-900">${asset.minInvestment}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                  <span className="text-gray-500">Max investment</span>
                  <span className="font-mono font-semibold text-gray-900">${asset.maxInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-200/40">
                  <span className="text-gray-500">Durations</span>
                  <span className="font-semibold text-gray-800">{asset.durations.slice(0, 4).join(', ')}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500">Commission</span>
                  <span className="font-semibold text-emerald-600">0% (Zero Fee)</span>
                </div>
              </div>

              {/* Schedule Table (Monday to Sunday 00:00 - 23:59) */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Trading schedule
                </h4>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 divide-y divide-gray-200/40">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex justify-between py-1 font-mono text-[11px]">
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900 font-semibold">00:00 - 23:59</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
