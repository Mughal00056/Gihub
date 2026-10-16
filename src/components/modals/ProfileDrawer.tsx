import React from 'react';
import { 
  X, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  TrendingUp, 
  BarChart3, 
  ShieldAlert, 
  Trophy, 
  Zap, 
  Users, 
  HelpCircle, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified: boolean;
  onOpenDeposit: () => void;
  onOpenLeaderboard: () => void;
  onOpenPortfolio: () => void;
  onOpenSignals: () => void;
  onOpenKYC: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  isVerified,
  onOpenDeposit,
  onOpenLeaderboard,
  onOpenPortfolio,
  onOpenSignals,
  onOpenKYC,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* User Card Header (Exact reference from screenshot: Apex Store, ownerofapexstore@gmail.com, ! Not Verified, ID: 1328493897) */}
        <div className="p-4 bg-gray-50/90 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">Apex Store</span>
                <span className="text-[11px] text-gray-500 font-mono">ownerofapexstore@gmail.com</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Verification Status & ID */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60">
            <button
              onClick={() => {
                sound.playClick();
                onOpenKYC();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isVerified 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
              }`}
            >
              {isVerified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>! Not Verified</span>
                </>
              )}
            </button>
            <span className="text-xs font-mono font-medium text-gray-500">
              ID: 1328493897
            </span>
          </div>
        </div>

        {/* ACCOUNT Section */}
        <div className="p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
            ACCOUNT
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                sound.playClick();
                onOpenPortfolio();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-gray-500" />
                Personal Area
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 text-indigo-600">
                <ArrowUpRight className="w-4 h-4" />
                Top Up
              </span>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                +70%
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <ArrowDownLeft className="w-4 h-4 text-gray-500" />
                Withdrawals
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-gray-500" />
                Transactions
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenPortfolio();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                Trades & Portfolio
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenPortfolio();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Trading Stats
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* FEATURES & HELP CENTER Section */}
        <div className="p-3 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
            SERVICES & HELP CENTER
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 text-amber-600">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </span>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                Rank #1 $30k+
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSignals();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 text-emerald-600">
                <Zap className="w-4 h-4" />
                Signals & Market Alerts
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenKYC();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                KYC Verification
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-gray-500" />
                Join Us (Community)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                Help / Support
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                Report Issue
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-800 text-xs font-semibold transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-gray-500" />
                Settings
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="mt-auto p-4 border-t border-gray-100">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
