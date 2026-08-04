// src/components/ml/RentPredictionCard.jsx — XGBoost Fair Rent Prediction Component
import React from 'react';
import Card from '../common/Card';

export default function RentPredictionCard({ prediction }) {
  if (!prediction || prediction.message === 'Prediction unavailable') {
    return (
      <Card className="bg-surface/50 border border-border p-4 text-center">
        <span className="text-xs text-text-secondary">Fair rent prediction unavailable for this listing.</span>
      </Card>
    );
  }

  const { predicted_fair_rent, lower_range, upper_range, confidence } = prediction;

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <h4 className="font-bold text-sm text-text-primary">XGBoost Fair Rent Estimate</h4>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">AI Valuation Signal</span>
          </div>
        </div>
        {confidence && (
          <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {confidence}% Confidence
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-teal-100 pt-3 text-center">
        <div className="bg-white p-2 rounded-lg border border-teal-100">
          <span className="text-[10px] text-text-secondary uppercase block">Lower Range</span>
          <span className="font-extrabold text-sm text-text-primary tabular-nums">
            ₹{lower_range?.toLocaleString()}
          </span>
        </div>

        <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
          <span className="text-[10px] opacity-90 uppercase block font-semibold">Fair Estimate</span>
          <span className="font-extrabold text-base tabular-nums">
            ₹{predicted_fair_rent?.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-2 rounded-lg border border-teal-100">
          <span className="text-[10px] text-text-secondary uppercase block">Upper Range</span>
          <span className="font-extrabold text-sm text-text-primary tabular-nums">
            ₹{upper_range?.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-text-secondary italic text-center">
        Estimated using regional XGBoost valuation trained on Ahmedabad market benchmarks.
      </p>
    </Card>
  );
}
