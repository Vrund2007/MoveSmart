// src/components/recommendations/LocalityCard.jsx — Premium Area Intelligence Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';

export default function LocalityCard({ item, rank = 1, onSelectLocality }) {
  const navigate = useNavigate();
  if (!item) return null;

  const isTop = rank === 1;

  const handleBrowse = () => {
    if (onSelectLocality) {
      onSelectLocality(item.locality);
    } else {
      navigate(`/dashboard?locality=${encodeURIComponent(item.locality)}`);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg font-sans border ${
      isTop ? 'border-2 border-primary bg-white shadow-md' : 'border-border bg-white'
    }`}>
      {/* Rank Header Ribbon */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isTop 
              ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-sm' 
              : 'bg-surface text-text-primary border border-border'
          }`}>
            #{rank} {isTop ? 'Top Recommended Hub' : 'High Alignment'}
          </span>
          {item.is_user_preferred && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              ★ Your Preferred Choice
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-primary tabular-nums leading-none">
            {item.score}<span className="text-xs text-text-secondary font-bold">/100</span>
          </div>
          <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Match Score</span>
        </div>
      </div>

      {/* Locality Title & Office Commute Bar */}
      <div className="space-y-1 mb-3">
        <h3 className="font-bold text-lg text-text-primary">{item.locality}</h3>
        <p className="text-xs text-text-secondary">{item.explanation}</p>
      </div>

      {/* Badges Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.budget_badge && (
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
            {item.budget_badge}
          </span>
        )}
        {item.work_area && (
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md">
            📍 ~{item.commute_mins_est || 15} mins to {item.work_area} (Office)
          </span>
        )}
      </div>

      {/* AI Intelligence Insights */}
      {item.insights?.length > 0 && (
        <div className="bg-surface/80 rounded-lg p-3 border border-border space-y-1.5 mb-4 text-xs">
          <span className="text-[10px] font-extrabold text-text-primary uppercase tracking-wider block mb-1">
            💡 Locality Intelligence Highlights
          </span>
          {item.insights.map((insight, idx) => (
            <div key={idx} className="text-text-primary font-medium text-[11px] flex items-center gap-1.5">
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4 District Subscore Progress Meters */}
      {item.district_scores && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
          <div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
              <span>Residential Livability</span>
              <span className="text-text-primary font-extrabold">{item.district_scores.residential}/100</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.district_scores.residential}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
              <span>Business Access</span>
              <span className="text-text-primary font-extrabold">{item.district_scores.business}/100</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.district_scores.business}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
              <span>Lifestyle & Vibe</span>
              <span className="text-text-primary font-extrabold">{item.district_scores.lifestyle}/100</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.district_scores.lifestyle}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
              <span>Transit Mobility</span>
              <span className="text-text-primary font-extrabold">{item.district_scores.transit}/100</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.district_scores.transit}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-[11px] font-bold text-text-secondary">
          {item.listings_count || 8}+ Verified Properties
        </span>
        <button
          onClick={handleBrowse}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Browse Properties in {item.locality} →
        </button>
      </div>
    </Card>
  );
}

