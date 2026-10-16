import React from 'react';
import { CandlestickChart, History, Trophy, Zap, Menu } from 'lucide-react';
import { sound } from '../utils/audio';

interface BottomNavBarProps {
  activeTab: 'trade' | 'history' | 'leaderboard' | 'signals' | 'menu';
  activeTradesCount: number;
  onOpenHistory: () => void;
  onOpenLeaderboard: () => void;
  onOpenSignals: () => void;
  onOpenMenu: () => void;
  onSelectTrade: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  activeTradesCount,
  onOpenHistory,
  onOpenLeaderboard,
  onOpenSignals,
  onOpenMenu,
  onSelectTrade,
}) => {
  return (
    <nav className="h-12 bg-white/90 backdrop-blur-md border-t border-gray-200/80 px-4 flex items-center justify-around z-30 shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.03)]">
      {/* 1. Trade Chart Icon */}
      <button
        onClick={() => {
          onSelectTrade();
          sound.playClick();
        }}
        className={`flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
          activeTab === 'trade' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-700'
        }`}
        title="Trading Chart"
      >
        <CandlestickChart className="w-5 h-5 stroke-[2]" />
      </button>

      {/* 2. Trades History Icon (with purple badge matching screenshot: "1") */}
      <button
        onClick={() => {
          onOpenHistory();
          sound.playClick();
        }}
        className="relative flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-indigo-600 transition-all cursor-pointer"
        title="Trades History"
      >
        <div className="relative">
          <History className="w-5 h-5 stroke-[2]" />
          {activeTradesCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#7c3aed] text-white font-mono text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
              {activeTradesCount}
            </span>
          )}
        </div>
      </button>

      {/* 3. Leaderboard Icon */}
      <button
        onClick={() => {
          onOpenLeaderboard();
          sound.playClick();
        }}
        className="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-amber-500 transition-all cursor-pointer"
        title="Leaderboard"
      >
        <Trophy className="w-5 h-5 stroke-[2]" />
      </button>

      {/* 4. Signals Icon */}
      <button
        onClick={() => {
          onOpenSignals();
          sound.playClick();
        }}
        className="relative flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-emerald-500 transition-all cursor-pointer"
        title="Trading Signals"
      >
        <Zap className="w-5 h-5 stroke-[2]" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </button>

      {/* 5. Menu Icon (3 horizontal lines) */}
      <button
        onClick={() => {
          onOpenMenu();
          sound.playClick();
        }}
        className="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
        title="Menu & Profile"
      >
        <Menu className="w-5 h-5 stroke-[2]" />
      </button>
    </nav>
  );
};
