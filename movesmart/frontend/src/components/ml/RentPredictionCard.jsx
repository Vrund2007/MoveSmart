// src/components/ml/RentPredictionCard.jsx — AI Price & Rent Valuation Component
import React from 'react';
import Card from '../common/Card';

export default function RentPredictionCard({ prediction, dealType = 'rent' }) {
  if (!prediction || prediction.message === 'Prediction unavailable') {
    return null;
  }

  const isBuy = dealType === 'buy' || prediction.deal_type === 'buy';
  const fairVal = prediction.predicted_fair_price || prediction.predicted_fair_rent;
  const { lower_range, upper_range, confidence } = prediction;

  const formatCurrency = (val) => {
    if (!val) return 'N/A';
    if (isBuy && val >= 100000) {
      if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString()}`;
  };

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider">
            AI Valuation
          </span>
          <div>
            <h4 className="font-bold text-sm text-text-primary">
              {isBuy ? 'AI Fair Sale Price Valuation' : 'XGBoost Fair Rent Estimate'}
            </h4>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
              {isBuy ? 'Market Valuation Signal' : 'AI Valuation Signal'}
            </span>
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
          <span className="font-extrabold text-xs sm:text-sm text-text-primary tabular-nums">
            {formatCurrency(lower_range)}
          </span>
        </div>

        <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
          <span className="text-[10px] opacity-90 uppercase block font-semibold">Fair Estimate</span>
          <span className="font-extrabold text-sm sm:text-base tabular-nums">
            {formatCurrency(fairVal)}
          </span>
        </div>

        <div className="bg-white p-2 rounded-lg border border-teal-100">
          <span className="text-[10px] text-text-secondary uppercase block">Upper Range</span>
          <span className="font-extrabold text-xs sm:text-sm text-text-primary tabular-nums">
            {formatCurrency(upper_range)}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-text-secondary italic text-center">
        {isBuy 
          ? 'Estimated using regional market valuation benchmarks for Ahmedabad property sales.'
          : 'Estimated using regional XGBoost valuation trained on Ahmedabad rental benchmarks.'
        }
      </p>
    </Card>
  );
}

