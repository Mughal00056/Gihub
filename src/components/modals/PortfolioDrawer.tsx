import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ActiveTrade, Asset } from '../../types/trading';
import { sound } from '../../utils/audio';

interface PortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrades: ActiveTrade[];
  tradeHistory: ActiveTrade[];
  currentPrice: number;
  currentAsset: Asset;
}

export const PortfolioDrawer: React.FC<PortfolioDrawerProps> = ({
  isOpen,
  onClose,
  activeTrades,
  tradeHistory,
  currentPrice,
  currentAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Calculate total live active P/L
  const activeNetPL = activeTrades.reduce((acc, t) => {
    const isWinning = t.direction === 'HIGHER' ? currentPrice > t.openPrice : currentPrice < t.openPrice;
    return acc + (isWinning ? t.expectedPayout : -t.amount);
  }, 0);

  // Calculate history stats
  const totalTrades = tradeHistory.length;
  const wonTrades = tradeHistory.filter((t) => t.status === 'won').length;
  const winRate = totalTrades > 0 ? Math.round((wonTrades / totalTrades) * 100) : 0;
  const totalHistoricPL = tradeHistory.reduce((acc, t) => {
    return acc + (t.status === 'won' ? (t.actualPayout || t.expectedPayout) : -t.amount);
  }, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header (Matches screenshot "Portfolio (1)" and "P/L +$0.81") */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">Portfolio</h3>
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              {activeTrades.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Active P/L</span>
              <span className={`text-xs font-mono font-bold ${
                activeNetPL >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {activeNetPL >= 0 ? `+$${activeNetPL.toFixed(2)}` : `-$${Math.abs(activeNetPL).toFixed(2)}`}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 border-b border-gray-100 flex gap-1 bg-gray-50/60">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('active');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Active Trades ({activeTrades.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Trade History ({tradeHistory.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {activeTab === 'active' ? (
            activeTrades.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-gray-300" />
                <span>No active open trades.</span>
                <span className="text-[11px] text-gray-500">
                  Select an amount and click HIGHER or LOWER to trade!
                </span>
              </div>
            ) : (
              activeTrades.map((trade) => {
                const timeLeft = Math.max(0, trade.expireTime - now);
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                
                const isWinning = trade.direction === 'HIGHER' ? currentPrice > trade.openPrice : currentPrice < trade.openPrice;
                const currentDiff = (currentPrice - trade.openPrice).toFixed(currentAsset.precision);

                return (
                  <div
                    key={trade.id}
                    className="p-3 bg-white border border-gray-200/90 rounded-xl shadow-xs space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white ${
                          trade.direction === 'HIGHER' ? 'bg-[#00b15d]' : 'bg-[#f03d3d]'
                        }`}>
                          {trade.direction === 'HIGHER' ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">
                            {trade.assetName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Open: {trade.openPrice.toFixed(currentAsset.precision)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-indigo-600 block">
                          {timeStr}
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${
                          isWinning ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isWinning ? `+$${trade.expectedPayout.toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                      <span className="text-gray-500">Invest: <strong className="text-gray-900 font-mono">${trade.amount}</strong></span>
                      <span className="text-gray-500">Live Quote: <strong className="font-mono text-gray-900">{currentPrice.toFixed(currentAsset.precision)}</strong></span>
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        isWinning ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isWinning ? 'IN PROFIT' : 'OUT'}
                      </span>
                    </div>

                    {/* Progress Bar of Time Remaining */}
                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isWinning ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (timeLeft / trade.durationSeconds) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <>
              {/* History Statistics Card */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total</span>
                  <span className="font-bold text-gray-900 font-mono">{totalTrades}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Win Rate</span>
                  <span className="font-bold text-emerald-600 font-mono">{winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Net P/L</span>
                  <span className={`font-bold font-mono ${totalHistoricPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {totalHistoricPL >= 0 ? `+$${totalHistoricPL.toFixed(2)}` : `-$${Math.abs(totalHistoricPL).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* History List */}
              {tradeHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No completed trades yet.
                </div>
              ) : (
                tradeHistory.map((trade) => {
                  const isWon = trade.status === 'won';
                  return (
                    <div
                      key={trade.id}
                      className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/60 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {isWon ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1">
                            {trade.assetName}
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({trade.direction})
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ${trade.amount} • {new Date(trade.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold ${
                          isWon ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isWon ? `+$${(trade.actualPayout || trade.expectedPayout).toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                        </span>
                        <span className="block text-[10px] text-gray-400 uppercase">
                          {isWon ? 'Profit' : 'Loss'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
