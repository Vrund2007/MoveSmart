// src/components/ml/TrustSignalCard.jsx — Isolation Forest Anomaly Signal Component
import React from 'react';
import Card from '../common/Card';

export default function TrustSignalCard({ trustSignal }) {
  if (!trustSignal) return null;

  const { is_suspicious, confidence, reason } = trustSignal;

  return (
    <Card className={`p-4 border-2 transition-all ${
      is_suspicious 
        ? 'bg-amber-50/60 border-amber-300' 
        : 'bg-emerald-50/60 border-emerald-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{is_suspicious ? '⚠️' : '🛡️'}</span>
          <div>
            <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider">
              {is_suspicious ? 'Market Anomaly Signal' : 'Verified Market Benchmark'}
            </h4>
            <span className="text-[10px] text-text-secondary">Isolation Forest Anomaly Check</span>
          </div>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
          is_suspicious ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
        }`}>
          {confidence}% Score
        </span>
      </div>

      <p className="text-xs font-medium text-text-primary mt-2">
        {reason}
      </p>

      <div className="mt-2 text-[9px] text-text-secondary border-t border-border pt-1">
        Isolation Forest anomaly detector evaluates price-to-area ratios against local neighborhood samples.
      </div>
    </Card>
  );
}
