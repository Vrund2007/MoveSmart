import React from 'react';
import StatusBadge from '../listings/StatusBadge';

/**
 * ReviewQueueTable Component — Admin pending listing review queue.
 */
const ReviewQueueTable = ({ listings = [], onSelectListing }) => {
  return (
    <div className="overflow-x-auto bg-surface border border-border rounded-lg shadow-sm">
      <table className="w-full text-left text-xs text-text-primary">
        <thead className="bg-gray-100 uppercase font-semibold text-text-secondary border-b border-border">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Locality</th>
            <th className="p-3">Price</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="p-3 font-semibold">{item.title}</td>
              <td className="p-3">{item.locality}</td>
              <td className="p-3 font-bold text-primary tabular-nums">₹{item.price?.toLocaleString()}</td>
              <td className="p-3"><StatusBadge status={item.status} /></td>
              <td className="p-3">
                <button
                  onClick={() => onSelectListing(item)}
                  className="text-primary font-semibold hover:underline"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewQueueTable;
