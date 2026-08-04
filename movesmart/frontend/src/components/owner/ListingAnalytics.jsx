import React from 'react';

/**
 * ListingAnalytics Component — Basic view and enquiry counters for property owners.
 */
const ListingAnalytics = ({ viewCount = 0, enquiryCount = 0 }) => {
  return (
    <div className="flex gap-4 p-3 bg-gray-50 border border-border rounded-md text-xs text-text-secondary">
      <div>Views: <span className="font-bold text-text-primary tabular-nums">{viewCount}</span></div>
      <div>Enquiries: <span className="font-bold text-text-primary tabular-nums">{enquiryCount}</span></div>
    </div>
  );
};

export default ListingAnalytics;
