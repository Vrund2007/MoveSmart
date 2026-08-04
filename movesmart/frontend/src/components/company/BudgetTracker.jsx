import React from 'react';
import Card from '../common/Card';

/**
 * BudgetTracker Component — Company HR Relocation budget stats.
 */
const BudgetTracker = ({ budget = 0, budgetUsed = 0, budgetRemaining = 0 }) => {
  return (
    <Card className="grid grid-cols-3 gap-4 text-center">
      <div>
        <span className="text-xs text-text-secondary block">Total Budget</span>
        <span className="text-lg font-bold text-text-primary tabular-nums">₹{budget.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-xs text-text-secondary block">Allocated</span>
        <span className="text-lg font-bold text-primary tabular-nums">₹{budgetUsed.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-xs text-text-secondary block">Remaining</span>
        <span className="text-lg font-bold text-success tabular-nums">₹{budgetRemaining.toLocaleString()}</span>
      </div>
    </Card>
  );
};

export default BudgetTracker;
