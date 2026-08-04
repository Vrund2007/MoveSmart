import React from 'react';

/**
 * TrustBadge Component — Isolation Forest anomaly flag output (Rules.md §7, Design.md §2.1).
 * HEDGED COPY: "looks unusual compared to similar listings" — never claims fraud.
 */
const TrustBadge = ({ isSuspicious = false, checkedAt }) => {
  if (!isSuspicious) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 text-warning border border-amber-300 rounded-md">
      <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Price looks unusual compared to similar listings</span>
    </div>
  );
};

export default TrustBadge;
