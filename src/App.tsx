/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Zap, 
  History, 
  Wallet,
  Menu,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

import { Asset, ActiveTrade, PendingOrder, TradeDirection } from './types/trading';
import { INITIAL_ASSETS } from './data/mockAssets';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { Chart } from './components/Chart';
import { TradingPanel } from './components/TradingPanel';

import { AssetSelectorModal } from './components/modals/AssetSelectorModal';
import { AssetInfoModal } from './components/modals/AssetInfoModal';
import { PendingTradeModal } from './components/modals/PendingTradeModal';
import { DepositModal } from './components/modals/DepositModal';
import { ProfileDrawer } from './components/modals/ProfileDrawer';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { PortfolioDrawer } from './components/modals/PortfolioDrawer';
import { SignalsModal } from './components/modals/SignalsModal';
import { OrderConfirmModal } from './components/modals/OrderConfirmModal';
import { KYCModal } from './components/modals/KYCModal';

export default function App() {
  // Assets & Current Asset
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [currentLivePrice, setCurrentLivePrice] = useState<number>(INITIAL_ASSETS[0].basePrice);

  // Balances
  const [balanceDemo, setBalanceDemo] = useState<number>(10000.00);
  const [balanceReal, setBalanceReal] = useState<number>(0.00);
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');

  // Trade inputs
  const [investmentAmount, setInvestmentAmount] = useState<number>(1);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [oneClickTrading, setOneClickTrading] = useState<boolean>(true);

  // Trades & Orders
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ActiveTrade[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  // User stats
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userTradesToday, setUserTradesToday] = useState<number>(0);
  const [userProfitToday, setUserProfitToday] = useState<number>(0);

  // Settings & Modes
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);

  // Sleek floating toast notification (auto-dismissing, non-intrusive)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Modals visibility
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showAssetInfo, setShowAssetInfo] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Order confirmation modal state
  const [pendingConfirmDirection, setPendingConfirmDirection] = useState<TradeDirection | null>(null);

  const showToastNotification = (message: string, type: 'success' | 'danger' | 'info') => {
    setToast({ message, type });
  };

  // Auto-dismiss toast in 2.2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Toggle Sound
  const handleToggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Place Trade Execution
  const executeTradeAction = useCallback((direction: TradeDirection) => {
    const currentBalance = accountType === 'demo' ? balanceDemo : balanceReal;
    if (currentBalance < investmentAmount) {
      sound.playLoss();
      showToastNotification(`Insufficient balance ($${currentBalance.toFixed(2)}). Please top up.`, 'danger');
      if (accountType === 'real') {
        setShowDepositModal(true);
      }
      return;
    }

    // Deduct Balance
    if (accountType === 'demo') {
      setBalanceDemo((b) => Number((b - investmentAmount).toFixed(2)));
    } else {
      setBalanceReal((b) => Number((b - investmentAmount).toFixed(2)));
    }

    const now = Math.floor(Date.now() / 1000);
    const newTrade: ActiveTrade = {
      id: 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      direction,
      openPrice: currentLivePrice,
      amount: investmentAmount,
      payoutRate: selectedAsset.payout / 100,
      expectedPayout: Number((investmentAmount * (selectedAsset.payout / 100)).toFixed(2)),
      openTime: Date.now(),
      durationSeconds,
      expireTime: now + durationSeconds,
      status: 'active',
    };

    setActiveTrades((prev) => [...prev, newTrade]);
    setUserTradesToday((t) => t + 1);
    sound.playTradeOpen();
    showToastNotification(`Trade opened: ${selectedAsset.name} ${direction} ($${investmentAmount})`, 'info');
  }, [accountType, balanceDemo, balanceReal, investmentAmount, selectedAsset, currentLivePrice, durationSeconds]);

  // Click Higher / Lower button handler
  const handleInitiateTrade = (direction: TradeDirection) => {
    if (oneClickTrading) {
      executeTradeAction(direction);
    } else {
      setPendingConfirmDirection(direction);
    }
  };

  // Confirmed from popup dialog
  const handleConfirmTradePopup = (rememberOneClick: boolean) => {
    if (rememberOneClick) {
      setOneClickTrading(true);
    }
    if (pendingConfirmDirection) {
      executeTradeAction(pendingConfirmDirection);
      setPendingConfirmDirection(null);
    }
  };

  // Create Pending Order
  const handleCreatePendingOrder = (orderData: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: PendingOrder = {
      ...orderData,
      id: 'pending_' + Date.now(),
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingOrders((prev) => [...prev, newOrder]);
    showToastNotification(`Pending order created for ${orderData.assetName}`, 'info');
  };

  // Live Trade Settlement Engine
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);

      // 1. Check Active Trades Expiration
      setActiveTrades((prevActive) => {
        const stillActive: ActiveTrade[] = [];
        const settled: ActiveTrade[] = [];

        prevActive.forEach((trade) => {
          if (now >= trade.expireTime) {
            settled.push(trade);
          } else {
            stillActive.push(trade);
          }
        });

        if (settled.length > 0) {
          settled.forEach((trade) => {
            const isWon = trade.direction === 'HIGHER'
              ? currentLivePrice > trade.openPrice
              : currentLivePrice < trade.openPrice;

            const finalStatus = isWon ? 'won' : 'lost';
            const payout = isWon ? trade.amount + trade.expectedPayout : 0;
            const netProfit = isWon ? trade.expectedPayout : -trade.amount;

            if (isWon) {
              sound.playWin();
              try {
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.8 },
                });
              } catch {}
              showToastNotification(`Trade Won! +$${trade.expectedPayout.toFixed(2)} on ${trade.assetName}`, 'success');
              
              if (accountType === 'demo') {
                setBalanceDemo((b) => Number((b + payout).toFixed(2)));
              } else {
                setBalanceReal((b) => Number((b + payout).toFixed(2)));
              }
            } else {
              sound.playLoss();
              showToastNotification(`Trade expired: -$${trade.amount.toFixed(2)} on ${trade.assetName}`, 'danger');
            }

            setUserProfitToday((p) => Number((p + netProfit).toFixed(2)));

            setTradeHistory((hist) => [
              {
                ...trade,
                status: finalStatus,
                closePrice: currentLivePrice,
                actualPayout: isWon ? trade.expectedPayout : 0,
              },
              ...hist,
            ]);
          });
        }

        return stillActive;
      });

      // 2. Check Pending Orders Trigger Conditions
      setPendingOrders((prevOrders) => {
        const remaining: PendingOrder[] = [];
        prevOrders.forEach((po) => {
          let triggered = false;
          if (po.mode === 'TIME' && po.targetTime && Date.now() >= po.targetTime) {
            triggered = true;
          } else if (po.mode === 'PRICE' && po.targetPrice) {
            if (Math.abs(currentLivePrice - po.targetPrice) < 0.00008) {
              triggered = true;
            }
          }

          if (triggered) {
            executeTradeAction(po.direction);
            showToastNotification(`Pending order triggered: ${po.assetName}`, 'info');
          } else {
            remaining.push(po);
          }
        });
        return remaining;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [currentLivePrice, accountType, executeTradeAction]);

  // Handle Asset Switch
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCurrentLivePrice(asset.currentPrice);
  };

  // Handle Top Up
  const handleTopUpBalance = (amount: number) => {
    setBalanceReal((b) => Number((b + amount).toFixed(2)));
    setAccountType('real');
    showToastNotification(`Successfully added $${amount.toFixed(2)} to Live balance!`, 'success');
  };

  // Reset Demo Balance
  const handleResetDemoBalance = () => {
    setBalanceDemo(10000.00);
    showToastNotification('Demo balance reset to $10,000.00', 'info');
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden bg-[#edf0f5] text-[#1c2127] flex flex-col justify-between">
      
      {/* Floating Compact Notification Toast (Fixed non-intrusive bar with close button) */}
      {toast && (
        <div className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold text-white transition-all animate-in fade-in slide-in-from-top-2 max-w-[90vw] ${
          toast.type === 'success' 
            ? 'bg-emerald-600/95 border border-emerald-400' 
            : toast.type === 'danger' 
              ? 'bg-rose-600/95 border border-rose-400' 
              : 'bg-gray-900/95 border border-gray-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          {toast.type === 'danger' && <XCircle className="w-3.5 h-3.5 shrink-0" />}
          {toast.type === 'info' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer ml-1 text-white/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Container - strictly constrained to viewport height (screen se bhar na jaya) */}
      <div className={`w-full h-full flex flex-col overflow-hidden ${
        mobileFrameMode 
          ? 'max-w-[430px] mx-auto h-[92vh] my-auto rounded-[36px] border-[10px] border-gray-900 shadow-2xl relative bg-white' 
          : 'max-w-full'
      }`}>

        {/* 1. Header Bar */}
        <Header
          currentAsset={selectedAsset}
          balanceDemo={balanceDemo}
          balanceReal={balanceReal}
          accountType={accountType}
          soundEnabled={soundEnabled}
          mobileFrameMode={mobileFrameMode}
          onToggleSound={handleToggleSound}
          onToggleMobileFrame={() => setMobileFrameMode(!mobileFrameMode)}
          onSelectAccountType={setAccountType}
          onResetDemoBalance={handleResetDemoBalance}
          onOpenAssetSelector={() => setShowAssetSelector(true)}
          onOpenAssetInfo={() => setShowAssetInfo(true)}
          onOpenDeposit={() => setShowDepositModal(true)}
          onOpenProfile={() => setShowProfileDrawer(true)}
          onOpenAlerts={() => setShowSignalsModal(true)}
        />

        {/* 2. Interactive Candlestick Chart (with i button next to GMT+5, Panning, and Zoom) */}
        <main className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <Chart
            asset={selectedAsset}
            activeTrades={activeTrades.filter((t) => t.assetId === selectedAsset.id)}
            onPriceUpdate={setCurrentLivePrice}
            selectedDurationSeconds={durationSeconds}
            onOpenAssetInfo={() => setShowAssetInfo(true)}
          />
        </main>

        {/* 3. Bottom Trading Control Panel (Investments, Expiration, LOWER, HIGHER) */}
        <TradingPanel
          asset={selectedAsset}
          balance={accountType === 'demo' ? balanceDemo : balanceReal}
          investmentAmount={investmentAmount}
          durationSeconds={durationSeconds}
          oneClickTrading={oneClickTrading}
          onUpdateInvestment={setInvestmentAmount}
          onUpdateDuration={setDurationSeconds}
          onOpenPendingOrderModal={() => setShowPendingModal(true)}
          onExecuteTrade={handleInitiateTrade}
        />

        {/* 4. USER REQUIREMENT: Bottom Navigation Bar at the BOTTOM of screen with Glass Blur UI (Trades History, Leaderboard, Signals, Menu) */}
        <nav className="bg-white/80 backdrop-blur-xl border-t border-gray-200/70 px-2 sm:px-6 py-1.5 flex items-center justify-between text-xs shrink-0 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center w-full justify-around">
            
            {/* Trades History Tab */}
            <button
              onClick={() => {
                setShowPortfolioDrawer(true);
                sound.playClick();
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-gray-100/70 text-gray-700 hover:text-indigo-600 transition-all cursor-pointer active:scale-95"
              title="Trades History"
            >
              <div className="relative flex items-center justify-center">
                <History className="w-4 h-4 text-indigo-600" />
                {activeTrades.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {activeTrades.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight">Trades</span>
            </button>

            {/* Leaderboard Tab */}
            <button
              onClick={() => {
                setShowLeaderboardModal(true);
                sound.playClick();
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-gray-100/70 text-gray-700 hover:text-amber-600 transition-all cursor-pointer active:scale-95"
              title="Top Traders Leaderboard"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold tracking-tight">Leaderboard</span>
            </button>

            {/* Signals Tab */}
            <button
              onClick={() => {
                setShowSignalsModal(true);
                sound.playClick();
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-gray-100/70 text-gray-700 hover:text-emerald-600 transition-all cursor-pointer active:scale-95"
              title="Live Technical Signals"
            >
              <div className="relative flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Signals</span>
            </button>

            {/* Deposit Quick Tab */}
            <button
              onClick={() => {
                setShowDepositModal(true);
                sound.playClick();
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-indigo-50/80 text-indigo-600 transition-all cursor-pointer active:scale-95"
              title="Deposit Wallet"
            >
              <div className="relative flex items-center justify-center">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span className="absolute -top-1.5 -right-3 text-[8px] font-black bg-indigo-600 text-white px-1 rounded-full ring-1 ring-white">
                  +70%
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-tight">Deposit</span>
            </button>

            {/* Menu / Profile Drawer Tab */}
            <button
              onClick={() => {
                setShowProfileDrawer(true);
                sound.playClick();
              }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-gray-100/70 text-gray-700 hover:text-gray-900 transition-all cursor-pointer active:scale-95"
              title="Apex Store Menu"
            >
              <Menu className="w-4 h-4 text-gray-600" />
              <span className="text-[10px] font-bold tracking-tight">Menu</span>
            </button>
          </div>
        </nav>
      </div>

      {/* --- Modals & Drawers --- */}

      {/* 1. Asset Selector Modal */}
      <AssetSelectorModal
        isOpen={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
        assets={assets}
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
      />

      {/* 2. Asset Information & Conditions Modal */}
      <AssetInfoModal
        isOpen={showAssetInfo}
        onClose={() => setShowAssetInfo(false)}
        asset={selectedAsset}
      />

      {/* 3. Pending Trade Modal (By Price / By Time) */}
      <PendingTradeModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        asset={selectedAsset}
        onCreatePendingOrder={handleCreatePendingOrder}
      />

      {/* 4. Deposit & Top Up Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onTopUp={handleTopUpBalance}
      />

      {/* 5. Profile & Services Drawer */}
      <ProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        isVerified={isVerified}
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenPortfolio={() => setShowPortfolioDrawer(true)}
        onOpenSignals={() => setShowSignalsModal(true)}
        onOpenKYC={() => setShowKYCModal(true)}
      />

      {/* 6. Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        userTradesToday={userTradesToday}
        userProfitToday={userProfitToday}
      />

      {/* 7. Portfolio & Trades Drawer */}
      <PortfolioDrawer
        isOpen={showPortfolioDrawer}
        onClose={() => setShowPortfolioDrawer(false)}
        activeTrades={activeTrades}
        tradeHistory={tradeHistory}
        currentPrice={currentLivePrice}
        currentAsset={selectedAsset}
      />

      {/* 8. Live Signals Modal */}
      <SignalsModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
        onApplySignal={(assetId, direction) => {
          const target = assets.find((a) => a.id === assetId);
          if (target) {
            handleSelectAsset(target);
          }
          handleInitiateTrade(direction);
        }}
      />

      {/* 9. Order Confirmation Dialog (when 1-click is disabled) */}
      {pendingConfirmDirection && (
        <OrderConfirmModal
          isOpen={true}
          onClose={() => setPendingConfirmDirection(null)}
          asset={selectedAsset}
          direction={pendingConfirmDirection}
          amount={investmentAmount}
          durationSeconds={durationSeconds}
          currentPrice={currentLivePrice}
          onConfirm={handleConfirmTradePopup}
        />
      )}

      {/* 10. KYC Identity Verification Modal */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        isVerified={isVerified}
        onVerifySuccess={() => {
          setIsVerified(true);
          showToastNotification('KYC Verified successfully! Unrestricted trading activated.', 'success');
        }}
      />
    </div>
  );
}
