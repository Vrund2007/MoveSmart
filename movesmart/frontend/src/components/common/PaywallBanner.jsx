import React, { useState } from 'react';
import Card from './Card';
import { triggerRazorpayUnlock } from '../../utils/razorpay';

export default function PaywallBanner({ feature, title, description, user, onUnlocked }) {
  const [unlocking, setUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = () => {
    setUnlocking(true);
    setErrorMsg('');

    triggerRazorpayUnlock({
      feature,
      user,
      onSuccess: (data) => {
        setUnlocking(false);
        if (onUnlocked) onUnlocked(data);
      },
      onError: (msg) => {
        setUnlocking(false);
        if (msg && !msg.includes('closed')) {
          setErrorMsg(msg);
        }
      },
    });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 text-white p-8 rounded-2xl shadow-xl text-center space-y-5 max-w-xl mx-auto my-8 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-3xl mx-auto border border-teal-500/40 shadow-inner">
        🔒
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full">
          Premium Feature Locked
        </span>
        <h3 className="text-xl font-extrabold text-white">
          Unlock {title}
        </h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between text-left max-w-md mx-auto">
        <div>
          <span className="text-[10px] text-gray-400 block font-semibold uppercase">One-Time Access Fee</span>
          <span className="text-2xl font-black text-teal-300">₹30</span>
          <span className="text-[10px] text-gray-400 ml-1">only</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/30">
          Instant Razorpay Unlock
        </span>
      </div>

      {errorMsg && (
        <div className="text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 p-2.5 rounded-lg max-w-md mx-auto">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleUnlock}
        disabled={unlocking}
        className="w-full max-w-md mx-auto bg-gradient-to-r from-[#00ADB5] to-teal-500 hover:from-teal-500 hover:to-[#00ADB5] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span>💳</span>
        <span>{unlocking ? 'Opening Razorpay...' : 'Unlock Now for ₹30'}</span>
      </button>

      <p className="text-[10px] text-gray-400">
        🔒 Test Mode Active
      </p>
    </Card>
  );
}
