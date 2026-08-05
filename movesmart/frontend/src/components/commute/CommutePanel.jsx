// src/components/commute/CommutePanel.jsx — Premium Multi-Mode Commute Intelligence Component
import React from 'react';

export default function CommutePanel({ 
  durationMinutes = 20, 
  distanceKm = 8.5, 
  mode = 'driving', 
  originLocality = 'Bodakdev', 
  destOffice = 'Navrangpura',
  multiModeData = null 
}) {
  // Compute financial & travel efficiency metrics
  const drivingMins = durationMinutes;
  const transitMins = Math.round(durationMinutes * 1.25);
  const bikeMins = Math.round(durationMinutes * 0.85);
  const walkMins = Math.round((distanceKm / 4.5) * 60);

  const monthlyFuelCost = Math.round(distanceKm * 2 * 22 * 6.5); // ~₹6.5 per km fuel
  const monthlyMetroCost = Math.round(distanceKm * 2 * 22 * 2.2); // ~₹2.2 per km metro
  const caloriesBurned = Math.round((distanceKm / 4.5) * 220); // ~220 kcal per 4.5km

  return (
    <div className="space-y-4 font-sans text-xs animate-fade-in">
      {/* Route Summary Header */}
      <div className="bg-gradient-to-r from-teal-900 to-indigo-900 text-white rounded-xl p-4 shadow-md flex justify-between items-center">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 block mb-1">
            📍 Commute Route Analysis
          </span>
          <div className="font-extrabold text-sm flex items-center gap-1.5 flex-wrap">
            <span>{originLocality}</span>
            <span className="text-teal-400">➔</span>
            <span className="text-amber-300">{destOffice}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-teal-300 tabular-nums">{distanceKm} km</div>
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Total Travel Distance</span>
        </div>
      </div>

      {/* Multi-Mode Commute Matrix Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Driving / Car */}
        <div className={`p-3 rounded-xl border transition-all ${
          mode === 'driving' || mode === 'car' 
            ? 'bg-white border-2 border-primary shadow-md' 
            : 'bg-surface border-border'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-text-primary text-[11px]">🚗 Driving</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Car</span>
          </div>
          <div className="text-xl font-black text-primary tabular-nums mb-1">{drivingMins} min</div>
          <p className="text-[10px] text-text-secondary">Fuel ~₹{monthlyFuelCost.toLocaleString()}/mo</p>
        </div>

        {/* Public Transport / Metro */}
        <div className={`p-3 rounded-xl border transition-all ${
          mode === 'transit' || mode === 'public transport' 
            ? 'bg-white border-2 border-primary shadow-md' 
            : 'bg-surface border-border'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-text-primary text-[11px]">🚇 Metro / BRTS</span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Transit</span>
          </div>
          <div className="text-xl font-black text-emerald-600 tabular-nums mb-1">{transitMins} min</div>
          <p className="text-[10px] text-text-secondary">Fare ~₹{monthlyMetroCost.toLocaleString()}/mo</p>
        </div>

        {/* Bike / Two-Wheeler */}
        <div className={`p-3 rounded-xl border transition-all ${
          mode === 'bike' 
            ? 'bg-white border-2 border-primary shadow-md' 
            : 'bg-surface border-border'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-text-primary text-[11px]">🏍️ Two-Wheeler</span>
            <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">Fast</span>
          </div>
          <div className="text-xl font-black text-amber-600 tabular-nums mb-1">{bikeMins} min</div>
          <p className="text-[10px] text-text-secondary">Quick Traffic Bypass</p>
        </div>

        {/* Walking */}
        <div className={`p-3 rounded-xl border transition-all ${
          mode === 'walking' 
            ? 'bg-white border-2 border-primary shadow-md' 
            : 'bg-surface border-border'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-extrabold text-text-primary text-[11px]">🚶 Walking</span>
            <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">Eco</span>
          </div>
          <div className="text-xl font-black text-teal-600 tabular-nums mb-1">{walkMins} min</div>
          <p className="text-[10px] text-text-secondary">~{caloriesBurned} kcal burned</p>
        </div>
      </div>

      {/* Financial & Time Savings Highlights */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <span>💡</span>
          <span>Commute Savings & Relocation Insight</span>
        </div>
        <p className="text-[11px] leading-relaxed text-emerald-800">
          Choosing <b>Public Metro/Transit</b> for this route saves approximately <b>₹{(monthlyFuelCost - monthlyMetroCost).toLocaleString()}/month</b> in fuel compared to driving, while keeping your daily commute under <b>{transitMins} minutes</b>.
        </p>
      </div>
    </div>
  );
}

