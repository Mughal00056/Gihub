import React, { useState } from 'react';
import { X, Check, Copy, ArrowRight, ShieldCheck, Sparkles, AlertCircle, QrCode } from 'lucide-react';
import { DEPOSIT_METHODS } from '../../data/mockAssets';
import { sound } from '../../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onTopUp,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('usdt');
  const [amount, setAmount] = useState<number>(100);
  const [applyBonus, setApplyBonus] = useState<boolean>(true);
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedMethod = DEPOSIT_METHODS.find((m) => m.id === selectedMethodId) || DEPOSIT_METHODS[0];
  const bonusMultiplier = applyBonus ? 0.70 : 0;
  const bonusAmount = amount * bonusMultiplier;
  const totalCredited = amount + bonusAmount;

  const mockCryptoAddress = selectedMethod.id === 'trx' || selectedMethod.id === 'usdt'
    ? 'TQy8ZkL5u6rF8s9bT2rD1hM3jW9qV4e7Yx'
    : '0x71C...b29e01B9';

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard?.writeText(mockCryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteDeposit = () => {
    sound.playWin();
    onTopUp(totalCredited);
    setStep('success');
    setTimeout(() => {
      setStep('select');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header (Matches screenshot "Deposit" - "Add funds to your account with crypto or a local payment method") */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Deposit</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Add funds to your account with crypto or a local payment method
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'select' && (
          <div className="p-4 overflow-y-auto space-y-4">
            
            {/* Promo Banner: FIRST DEPOSIT BONUS +70% */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-xl p-3 text-white shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase bg-black/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Limited Offer
                </span>
                <div className="text-base font-extrabold mt-1">First Deposit Bonus +70%</div>
                <p className="text-[11px] text-white/90">Get up to $700 extra trading balance today</p>
              </div>
              <input
                type="checkbox"
                checked={applyBonus}
                onChange={(e) => setApplyBonus(e.target.checked)}
                className="w-5 h-5 accent-yellow-400 rounded cursor-pointer"
                title="Apply 70% Bonus"
              />
            </div>

            {/* Quick Amount Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Select Amount ($)</label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      setAmount(amt);
                    }}
                    className={`py-2 px-3 rounded-xl font-mono font-bold text-sm transition-all border ${
                      amount === amt
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Methods Section: "CHOOSE A METHOD" */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                CHOOSE A METHOD
              </label>
              <div className="space-y-1.5">
                {DEPOSIT_METHODS.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  const isMaintenance = method.isMaintenance;

                  return (
                    <div
                      key={method.id}
                      onClick={() => {
                        if (isMaintenance) return;
                        sound.playClick();
                        setSelectedMethodId(method.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isMaintenance 
                          ? 'opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed'
                          : isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 cursor-pointer shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/80 flex items-center justify-center text-lg">
                          {method.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {method.name}
                            </span>
                            {method.isRecommended && (
                              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                RECOMMENDED
                              </span>
                            )}
                            {method.isMaintenance && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                MAINTENANCE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {method.tag} • {method.speed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        {isSelected && !isMaintenance ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Deposit Amount:</span>
                <span className="font-mono font-bold">${amount.toFixed(2)}</span>
              </div>
              {applyBonus && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Bonus (+70%):</span>
                  <span className="font-mono font-bold">+${bonusAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold text-sm pt-1 border-t border-gray-200">
                <span>Total Added to Balance:</span>
                <span className="font-mono text-indigo-600">${totalCredited.toFixed(2)}</span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => {
                sound.playClick();
                setStep('payment');
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              Continue to Pay ${amount}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-4 overflow-y-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Send payment to address
              </span>
              <div className="text-xl font-mono font-extrabold text-gray-900">
                ${amount.toFixed(2)} {selectedMethod.name}
              </div>
            </div>

            {/* Mock QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-800" />
              </div>
              <span className="text-[11px] text-gray-400 mt-2">Scan with your crypto wallet</span>
            </div>

            {/* Address Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">{selectedMethod.name} Deposit Address</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="font-mono text-xs text-gray-800 truncate flex-1">
                  {mockCryptoAddress}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-1 text-indigo-600 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Funds are automatically detected on the blockchain and credited within 1-2 minutes.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setStep('select')}
                className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCompleteDeposit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Simulate Instant Payment
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Deposit Successful!</h4>
            <p className="text-xs text-gray-500">
              ${totalCredited.toFixed(2)} has been credited to your live trading balance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
