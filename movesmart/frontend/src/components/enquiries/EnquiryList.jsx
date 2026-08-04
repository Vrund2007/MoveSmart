import React from 'react';
import Card from '../common/Card';

/**
 * EnquiryList Component — List of received enquiries.
 */
const EnquiryList = ({ enquiries = [] }) => {
  if (!enquiries || enquiries.length === 0) {
    return <p className="text-sm text-text-secondary">No enquiries received yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {enquiries.map((item) => (
        <Card key={item._id || item.id} className="text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-text-primary">Listing ID: {item.listing_id}</span>
            <span className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-text-secondary bg-gray-50 p-2.5 rounded border border-border mt-2">{item.message}</p>
        </Card>
      ))}
    </div>
  );
};

export default EnquiryList;
