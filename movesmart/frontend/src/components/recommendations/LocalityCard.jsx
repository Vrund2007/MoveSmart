// src/components/recommendations/LocalityCard.jsx — Premium Area Intelligence Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { RecommendationsIcon, CommuteIcon, CostIcon, CheckCircleIcon } from '../common/Icons';

export default function LocalityCard({ item, rank = 1, onSelectLocality }) {
  const navigate = useNavigate();
  if (!item) return null;

  const isTop = rank === 1;

  const handleBrowse = () => {
    if (onSelectLocality) {
      onSelectLocality(item.locality);
    } else {
      navigate(`/dashboard?tab=browse&locality=${encodeURIComponent(item.locality)}&page=1`);
    }
  };

  // Clean address string in case backend returned full Google Maps address
  const cleanWorkArea = item.work_area
    ? item.work_area.split(',')[0].replace(/-/g, '').replace(/\d+/g, '').trim()
    : 'Office';

  // Clean explanation text in case old cached thesis text was passed
  const cleanExplanation = item.explanation
    ? item.explanation.split('based on your')[0].trim()
    : `${item.locality} features high livability metrics and strategic access.`;

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-xl font-sans rounded-2xl p-5 border ${
      isTop ? 'border-2 border-[#00ADB5] bg-white shadow-md' : 'border-border bg-white shadow-xs'
    }`}>
      {/* Rank Header Ribbon */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            isTop 
              ? 'bg-[#00ADB5] text-white shadow-xs' 
              : 'bg-surface text-text-primary border border-border font-bold'
          }`}>
            #{rank} {isTop ? 'Top Recommended Hub' : 'High Alignment'}
          </span>
          {item.is_user_preferred && (
            <span className="bg-amber-50 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
              User Choice
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-[#00ADB5] tabular-nums leading-none">
            {item.score}<span className="text-xs text-text-secondary font-bold">/100</span>
          </div>
          <span className="text-[9px] text-text-secondary font-extrabold uppercase tracking-wider block mt-0.5">Match Score</span>
        </div>
      </div>

      {/* Locality Title & Clean Executive Overview */}
      <div className="space-y-1 mb-3">
        <h3 className="font-extrabold text-xl text-text-primary">{item.locality}</h3>
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          {cleanExplanation}
        </p>
      </div>

      {/* Badges Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.budget_badge && (
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <CostIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{item.budget_badge.replace(/Rs\./g, '₹')}</span>
          </span>
        )}
        {item.work_area && (
          <span className="text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <CommuteIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>~{item.commute_mins_est || 15} mins to {cleanWorkArea}</span>
          </span>
        )}
      </div>

      {/* AI Intelligence Insights */}
      {item.insights?.length > 0 && (
        <div className="bg-surface rounded-xl p-3.5 border border-border space-y-2 mb-4 text-xs">
          <span className="text-[10px] font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <RecommendationsIcon className="w-3.5 h-3.5 text-primary" />
            <span>Locality Intelligence Highlights</span>
          </span>
          <div className="space-y-1.5">
            {item.insights.map((insight, idx) => {
              const cleanText = insight.replace(/📍|🏡|🌿/g, '').replace(/- \d{6}.*?GJ, India/g, '').replace(/Rs\./g, '₹').trim();
              return (
                <div key={idx} className="text-text-primary font-semibold text-xs flex items-start gap-2">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{cleanText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 District Subscore Progress Meters */}
      {item.district_scores && (
        <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-border text-xs">
          <div>
            <div className="flex justify-between text-[10px] font-extrabold text-text-secondary mb-1">
              <span>Residential Livability</span>
              <span className="text-text-primary font-black">{item.district_scores.residential}/100</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.district_scores.residential}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-extrabold text-text-secondary mb-1">
              <span>Business Access</span>
              <span className="text-text-primary font-black">{item.district_scores.business}/100</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.district_scores.business}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-extrabold text-text-secondary mb-1">
              <span>Lifestyle & Vibe</span>
              <span className="text-text-primary font-black">{item.district_scores.lifestyle}/100</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.district_scores.lifestyle}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-extrabold text-text-secondary mb-1">
              <span>Transit Mobility</span>
              <span className="text-text-primary font-black">{item.district_scores.transit}/100</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.district_scores.transit}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-xs font-extrabold text-text-secondary">
          {item.listings_count || 8}+ Verified Properties
        </span>
        <button
          onClick={handleBrowse}
          className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>Browse Properties in {item.locality}</span>
        </button>
      </div>
    </Card>
  );
}
