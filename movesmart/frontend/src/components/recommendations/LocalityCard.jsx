import React from 'react';
import Card from '../common/Card';

/**
 * LocalityCard Component — displays district/locality recommendation scores.
 */
const LocalityCard = ({ item, rank = 1, isTop = false }) => {
  if (!item) return null;

  return (
    <Card className={`relative ${isTop ? 'border-2 border-primary shadow-md' : ''}`}>
      {isTop && (
        <span className="absolute -top-3 left-4 bg-primary text-surface text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
          #1 Recommended
        </span>
      )}
      <div className="flex justify-between items-start mb-2 mt-1">
        <h3 className="font-bold text-xl text-text-primary">{item.locality}</h3>
        <span className="text-2xl font-black text-primary tabular-nums">{item.score}<span className="text-xs text-text-secondary">/100</span></span>
      </div>
      <p className="text-xs text-text-secondary mb-4 leading-relaxed">{item.explanation}</p>
      {item.district_scores && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs text-text-secondary">
          <div>Residential: <span className="font-semibold text-text-primary">{item.district_scores.residential}</span></div>
          <div>Business: <span className="font-semibold text-text-primary">{item.district_scores.business}</span></div>
          <div>Lifestyle: <span className="font-semibold text-text-primary">{item.district_scores.lifestyle}</span></div>
          <div>Transit: <span className="font-semibold text-text-primary">{item.district_scores.transit}</span></div>
        </div>
      )}
    </Card>
  );
};

export default LocalityCard;
