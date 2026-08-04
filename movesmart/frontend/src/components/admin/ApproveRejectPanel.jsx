import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * ApproveRejectPanel Component — Admin action panel with required reason on rejection (FR-5).
 */
const ApproveRejectPanel = ({ listing, onApprove, onReject }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!listing) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      setError('Rejection reason is required (FR-5).');
      return;
    }
    setError('');
    onReject(listing._id, reason);
  };

  return (
    <Card className="flex flex-col gap-4 border-2 border-primary">
      <h3 className="font-bold text-lg text-text-primary">Reviewing: {listing.title}</h3>
      <p className="text-xs text-text-secondary">Locality: {listing.locality} • Price: ₹{listing.price}</p>
      
      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">Rejection Reason (Required if rejecting)</label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="State reason for rejection..."
          className="w-full bg-surface border border-border rounded-md p-2 text-xs text-text-primary outline-none focus:border-error"
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="danger" size="sm" onClick={handleReject}>
          Reject Listing
        </Button>
        <Button variant="primary" size="sm" onClick={() => onApprove(listing._id)}>
          Approve Listing
        </Button>
      </div>
    </Card>
  );
};

export default ApproveRejectPanel;
