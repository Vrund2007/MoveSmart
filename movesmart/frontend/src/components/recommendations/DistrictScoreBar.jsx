import React from 'react';

/**
 * DistrictScoreBar Component — render score bar proportional to district rating.
 */
const DistrictScoreBar = ({ label, score = 0 }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-xs">
      <div className="flex justify-between font-medium text-text-primary">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-primary">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

export default DistrictScoreBar;
