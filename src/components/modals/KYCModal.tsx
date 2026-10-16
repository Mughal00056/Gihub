import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Upload, FileText, Lock } from 'lucide-react';
import { sound } from '../../utils/audio';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified: boolean;
  onVerifySuccess: () => void;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  isVerified,
  onVerifySuccess,
}) => {
  const [docType, setDocType] = useState<'passport' | 'id_card' | 'drivers_license'>('passport');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepSuccess, setStepSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    sound.playClick();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStepSuccess(true);
      sound.playWin();
      onVerifySuccess();
      setTimeout(() => {
        setStepSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">KYC Verification</h3>
              <p className="text-[11px] text-gray-500">Apex Store (ID: 1328493897)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {stepSuccess || isVerified ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-gray-900 text-base">Account Fully Verified!</h4>
            <p className="text-xs text-gray-500">
              Your profile is verified. Daily withdrawal limits removed.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Select Document Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'passport', label: 'Passport' },
                  { id: 'id_card', label: 'National ID' },
                  { id: 'drivers_license', label: 'License' },
                ].map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      sound.playClick();
                      setDocType(doc.id as any);
                    }}
                    className={`py-2 px-1 text-center font-semibold rounded-xl border transition-all ${
                      docType === doc.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <Upload className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="font-semibold text-gray-800">identity_document_front.jpg</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Pre-scanned document ready to submit</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Data encrypted with 256-bit bank grade security.</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Submit Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
