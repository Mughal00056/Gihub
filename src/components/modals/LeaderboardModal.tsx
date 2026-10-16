import React, { useState } from 'react';
import { X, Trophy, HelpCircle, Medal, TrendingUp, Sparkles } from 'lucide-react';
import { LEADERBOARD_DATA } from '../../data/mockAssets';
import { sound } from '../../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTradesToday: number;
  userProfitToday: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  userTradesToday,
  userProfitToday,
}) => {
  const [showRatingInfo, setShowRatingInfo] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Leaderboard</h3>
              <p className="text-[11px] text-gray-500">Top traders by net daily profit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card (Matches screenshot: Apex Store +$0.00 0 trades today) */}
        <div className="p-3 bg-gradient-to-r from-indigo-50/70 via-purple-50/60 to-pink-50/50 border-b border-indigo-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 text-xs">Apex Store</span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded">
                    You
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  {userTradesToday} trades today
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-sm font-mono font-bold ${
                userProfitToday >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {userProfitToday >= 0 ? `+$${userProfitToday.toFixed(2)}` : `-$${Math.abs(userProfitToday).toFixed(2)}`}
              </span>
              <div className="text-[10px] text-gray-400 font-medium">Rank #0</div>
            </div>
          </div>
        </div>

        {/* "How does this rating work?" Tooltip Bar */}
        <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setShowRatingInfo(!showRatingInfo);
            }}
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How does this rating work?</span>
          </button>
          <span className="text-[10px] text-gray-400 font-medium">Updates in real time</span>
        </div>

        {showRatingInfo && (
          <div className="p-3 bg-blue-50/70 border-b border-blue-200/60 text-xs text-blue-900 leading-relaxed">
            The leaderboard ranks traders by their total net profit generated within the current 24-hour cycle across all currency pairs, crypto, and commodities.
          </div>
        )}

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
          <div className="col-span-2">Rank</div>
          <div className="col-span-7">Trader</div>
          <div className="col-span-3 text-right">P&L</div>
        </div>

        {/* Top Traders List (Matches Screenshot data: Ishara, Kabir, Jawahir, Fatima, Valeria, Zephyr, etc.) */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {LEADERBOARD_DATA.map((trader) => {
            const isTop3 = trader.rank <= 3;
            const medalColors = [
              'bg-amber-100 text-amber-800 border-amber-300', // Gold
              'bg-slate-100 text-slate-700 border-slate-300', // Silver
              'bg-amber-50 text-amber-900 border-amber-200',  // Bronze
            ];

            return (
              <div
                key={trader.rank}
                className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Rank Badge */}
                <div className="col-span-2 flex items-center">
                  {isTop3 ? (
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${medalColors[trader.rank - 1]}`}>
                      {trader.rank}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 pl-2">
                      {trader.rank}
                    </span>
                  )}
                </div>

                {/* Trader Name & Flag */}
                <div className="col-span-7 flex items-center gap-2">
                  <span className="text-base leading-none">{trader.country}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {trader.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {trader.tradesToday} trades
                    </span>
                  </div>
                </div>

                {/* P&L */}
                <div className="col-span-3 text-right">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#00b15d]">
                    {trader.profit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-400">Next daily reset: 00:00 UTC</span>
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
