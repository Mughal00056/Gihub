import React, { useState } from 'react';
import { 
  ChevronDown, 
  Info, 
  Bell, 
  RotateCcw, 
  Check, 
  Wallet,
  Menu,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor
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
  onToggleSound: () => void;
  onToggleMobileFrame: () => void;
  onSelectAccountType: (type: 'demo' | 'real') => void;
  onResetDemoBalance: () => void;
  onOpenAssetSelector: () => void;
  onOpenAssetInfo: () => void;
  onOpenDeposit: () => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsset,
  balanceDemo,
  balanceReal,
  accountType,
  soundEnabled,
  mobileFrameMode,
  onToggleSound,
  onToggleMobileFrame,
  onSelectAccountType,
  onResetDemoBalance,
  onOpenAssetSelector,
  onOpenAssetInfo,
  onOpenDeposit,
  onOpenProfile,
  onOpenAlerts,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const currentBalance = accountType === 'demo' ? balanceDemo : balanceReal;

  return (
    <header className="h-14 sm:h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-2 sm:px-4 flex items-center justify-between z-30 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Asset Selector & Info */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button
          onClick={() => {
            sound.playClick();
            onOpenAssetSelector();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all active:scale-95 group text-left cursor-pointer"
          title="Change Asset"
        >
          <div className="flex items-center text-base sm:text-lg leading-none">
            <span>{currentAsset.flag1}</span>
            {currentAsset.flag2 && <span className="-ml-1">{currentAsset.flag2}</span>}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                {currentAsset.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 ml-0.5">
            {currentAsset.payout}%
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenAssetInfo();
          }}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
          title="Asset Info & Conditions"
        >
          <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* Center/Right: Account Balance & Deposit */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Balance Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick();
              setShowAccountDropdown(!showAccountDropdown);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-800 transition-all cursor-pointer"
          >
            <span className="font-mono font-bold tracking-tight text-gray-900">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              accountType === 'demo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {accountType}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showAccountDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAccountDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Accounts
                </div>

                <div 
                  onClick={() => {
                    sound.playClick();
                    onSelectAccountType('demo');
                    setShowAccountDropdown(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    accountType === 'demo' ? 'bg-amber-50/80 border border-amber-200/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                      Demo Account
                      {accountType === 'demo' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-900">
                      ${balanceDemo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onResetDemoBalance();
                    }}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-100/60 rounded-md transition-colors"
                    title="Reset to $10,000"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div 
                  onClick={() => {
                    sound.playClick();
                    onSelectAccountType('real');
                    setShowAccountDropdown(false);
                  }}
                  className={`flex items-center justify-between p-2.5 mt-1 rounded-lg cursor-pointer transition-colors ${
                    accountType === 'real' ? 'bg-emerald-50/80 border border-emerald-200/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                      Live Account
                      {accountType === 'real' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-900">
                      ${balanceReal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onOpenDeposit();
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Deposit / Trade Now Button (Screenshot purple gradient) */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenDeposit();
          }}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#6d28d9] hover:from-[#4f46e5] hover:to-[#5b21b6] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Trade Now</span>
          <span className="xs:hidden">Deposit</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="hidden md:flex p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>

        {/* View Mode Toggle (Mobile simulation preview vs Full responsive) */}
        <button
          onClick={onToggleMobileFrame}
          className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={mobileFrameMode ? 'Switch to Fullscreen Workstation View' : 'Preview Exact Mobile Frame View'}
        >
          {mobileFrameMode ? <Monitor className="w-4 h-4 text-indigo-600" /> : <Smartphone className="w-4 h-4" />}
        </button>

        {/* Alerts Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAlerts();
          }}
          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors relative cursor-pointer"
          title="Alerts & Signals"
        >
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </button>

        {/* User / Profile Drawer Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 p-1 sm:p-1.5 pl-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 transition-all cursor-pointer"
          title="Apex Store Profile"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
            A
          </div>
          <span className="hidden sm:inline font-semibold text-gray-700 max-w-[80px] truncate">
            Apex Store
          </span>
          <Menu className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  );
};
