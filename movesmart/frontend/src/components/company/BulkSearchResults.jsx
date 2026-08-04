import React from 'react';
import Card from '../common/Card';

/**
 * BulkSearchResults Component.
 */
const BulkSearchResults = ({ results = [] }) => {
  if (!results || results.length === 0) {
    return <p className="text-sm text-text-secondary">No candidates found for this batch search.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((item) => (
        <Card key={item.listing_id} className="flex justify-between items-center text-sm">
          <div>
            <h4 className="font-bold text-text-primary">{item.title}</h4>
            <p className="text-xs text-text-secondary">{item.locality}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary tabular-nums">₹{item.price?.toLocaleString()}</p>
            <span className="text-xs font-medium text-success">Match {item.match_score}%</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BulkSearchResults;
