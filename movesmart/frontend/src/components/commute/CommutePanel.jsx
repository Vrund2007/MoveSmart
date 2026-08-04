import React from 'react';
import Card from '../common/Card';

/**
 * CommutePanel Component — displays travel duration and distance insights.
 */
const CommutePanel = ({ durationMinutes, distanceKm, mode = 'driving' }) => {
  return (
    <Card className="flex justify-between items-center bg-teal-50 border-primary">
      <div>
        <span className="text-xs text-text-secondary capitalize block">Commute by {mode}</span>
        <span className="text-2xl font-black text-primary tabular-nums">{durationMinutes} min</span>
      </div>
      {distanceKm && (
        <span className="text-sm font-semibold text-text-secondary tabular-nums">{distanceKm} km</span>
      )}
    </Card>
  );
};

export default CommutePanel;
