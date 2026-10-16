import React, { useState } from 'react';
import { 
  ChevronDown, 
  RotateCcw, 
  Check, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Asset } from '../types/trading';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentAsset: Asset;
  balanceDemo: number;
  balanceReal: number;
  accountType: 'demo' | 'real';
  soundEnabled: boolean;
  mobileFrameMode: boolean;
  activeTradeProfitDiff?: number;
  onToggleSound: () => void;
  onToggleMobileFrame: () => void;
  onSelectAccountType: (type: 'demo' | 'real') => void;
  onResetDemoBalance: () => void;
  onOpenAssetSelector: () => void;
  onOpenDeposit: () => void;
  onOpenProfile: () => void;
  onOpenAssetInfo?: () => void;
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsset,
  balanceDemo,
  balanceReal,
  accountType,
  soundEnabled,
  mobileFrameMode,
  activeTradeProfitDiff = -1.0,
  onToggleSound,
  onToggleMobileFrame,
  onSelectAccountType,
  onResetDemoBalance,
  onOpenAssetSelector,
  onOpenDeposit,
  onOpenProfile,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const currentBalance = accountType === 'demo' ? balanceDemo : balanceReal;

  return (
    <header className="h-13 bg-white/85 backdrop-blur-xl border-b border-gray-200/70 px-2 sm:px-3 flex items-center justify-between z-30 sticky top-0 shadow-[0_1px_4px_rgba(0,0,0,0.02)] shrink-0">
      
      {/* Left: Asset Selector (Matches exact screenshot layout) */}
      <button
        onClick={() => {
          onOpenAssetSelector();
          sound.playClick();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md hover:bg-gray-50 border border-gray-200/90 rounded-xl shadow-2xs transition-all active:scale-95 text-left cursor-pointer"
        title="Change Asset"
      >
        {/* Flags Container */}
        <div className="flex items-center text-sm sm:text-base leading-none">
          <span>{currentAsset.flag1}</span>
          {currentAsset.flag2 && <span className="-ml-1">{currentAsset.flag2}</span>}
        </div>

        {/* Name and Subtitle (81% -$1.0) */}
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-bold text-xs text-gray-900 tracking-tight">
              {currentAsset.symbol}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 transition-transform" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
            <span className="text-[#00b15d]">+{currentAsset.payout}%</span>
            <span className={activeTradeProfitDiff >= 0 ? 'text-[#00b15d]' : 'text-[#f03d3d]'}>
              {activeTradeProfitDiff >= 0 ? `+$${activeTradeProfitDiff.toFixed(1)}` : `-$${Math.abs(activeTradeProfitDiff).toFixed(1)}`}
            </span>
          </div>
        </div>
      </button>

      {/* Right: Balance Pill & Purple Deposit Wallet Icon */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Balance Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAccountDropdown(!showAccountDropdown);
              sound.playClick();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-md hover:bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-800 shadow-2xs transition-all cursor-pointer"
          >
            {/* Safe / Vault Icon */}
            <span className="text-sm leading-none" role="img" aria-label="vault">
              🏦
            </span>
            <span className="font-mono font-extrabold text-xs sm:text-[13px] text-gray-900">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
              accountType === 'demo' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {accountType}
            </span>
          </button>

          {/* Account Switcher Popover */}
          {showAccountDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountDropdown(false)} 
              />
              <div 
                className="absolute right-0 mt-1.5 w-60 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Select Account
                </div>

                <div 
                  onClick={() => {
                    onSelectAccountType('demo');
                    sound.playClick();
                    setShowAccountDropdown(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    accountType === 'demo' ? 'bg-amber-50/90 border border-amber-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      Demo Account
                      {accountType === 'demo' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-gray-900">
                      ${balanceDemo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetDemoBalance();
                      sound.playClick();
                    }}
                    className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-100/60 rounded transition-colors"
                    title="Reset Balance to $10,000"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div 
                  onClick={() => {
                    onSelectAccountType('real');
                    sound.playClick();
                    setShowAccountDropdown(false);
                  }}
                  className={`flex items-center justify-between p-2 mt-1 rounded-lg cursor-pointer transition-colors ${
                    accountType === 'real' ? 'bg-emerald-50/90 border border-emerald-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      Live Account
                      {accountType === 'real' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-gray-900">
                      ${balanceReal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeposit();
                      sound.playClick();
                    }}
                    className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                  >
                    Top Up
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Purple Round Deposit / Wallet Button with "!" badge (Exact match from screenshot) */}
        <button
          onClick={() => {
            onOpenDeposit();
            sound.playClick();
          }}
          className="relative w-8 h-8 rounded-full bg-[#5b54d6] hover:bg-[#4f46e5] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
          title="Deposit & Wallet"
        >
          <ShoppingBag className="w-4 h-4 fill-white/10" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-400/90 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
            !
          </span>
        </button>
      </div>
    </header>
  );
};
