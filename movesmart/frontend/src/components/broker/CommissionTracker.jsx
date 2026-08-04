import React from 'react';
import Card from '../common/Card';

/**
 * CommissionTracker Component — Displays broker commissions.
 */
const CommissionTracker = ({ commissions = [] }) => {
  const totalAmount = commissions.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex justify-between items-center bg-teal-50 border-primary">
        <span className="font-semibold text-text-primary text-sm">Total Commissions Recorded</span>
        <span className="text-xl font-bold text-primary tabular-nums">₹{totalAmount.toLocaleString()}</span>
      </Card>
      <div className="flex flex-col gap-2">
        {commissions.map((item) => (
          <Card key={item._id} className="flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-text-primary">Lead #{item.lead_id?.substring(0, 8)}</p>
              <p className="text-text-secondary">{new Date(item.deal_date).toLocaleDateString()}</p>
            </div>
            <span className="font-bold text-sm text-primary tabular-nums">₹{item.amount?.toLocaleString()}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommissionTracker;
