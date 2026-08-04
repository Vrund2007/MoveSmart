import React from 'react';
import Card from '../common/Card';

/**
 * CostBreakdownTable Component (Design.md §3.4 tabular-nums, Rules.md §3 estimate disclaimer).
 */
const CostBreakdownTable = ({ breakdown = {}, locality = '', disclaimer = '' }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h3 className="font-bold text-sm text-text-primary">Cost of Living: {locality}</h3>
        <span className="text-xs bg-amber-100 text-warning px-2 py-0.5 rounded font-semibold">Directional Estimate</span>
      </div>
      <table className="w-full text-xs text-text-primary tabular-nums">
        <tbody>
          {Object.entries(breakdown).map(([key, val]) => (
            <tr key={key} className="border-b border-gray-100 last:border-0">
              <td className="py-2 capitalize font-medium text-text-secondary">{key}</td>
              <td className="py-2 text-right font-bold">₹{Number(val).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {disclaimer && (
        <p className="text-[10px] text-text-secondary italic mt-1">{disclaimer}</p>
      )}
    </Card>
  );
};

export default CostBreakdownTable;
