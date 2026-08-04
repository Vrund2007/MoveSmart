import React from 'react';
import Card from '../common/Card';

/**
 * AllocationGrid Component.
 */
const AllocationGrid = ({ allocations = [] }) => {
  return (
    <div className="flex flex-col gap-2">
      {allocations.map((a, idx) => (
        <Card key={idx} className="flex justify-between items-center text-xs">
          <div>
            <span className="font-semibold text-text-primary">Employee #{a.employee_id}</span>
            <span className="text-text-secondary ml-2">→ Listing #{a.listing_id}</span>
          </div>
          <span className="font-bold text-primary tabular-nums">₹{a.cost?.toLocaleString()}</span>
        </Card>
      ))}
    </div>
  );
};

export default AllocationGrid;
