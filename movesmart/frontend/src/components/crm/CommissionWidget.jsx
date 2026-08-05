// src/components/crm/CommissionWidget.jsx — Commission Accounting Ledger Component
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function CommissionWidget({ commissions = [], onLogCommission, onToggleStatus }) {
  const totalEarned = commissions.reduce((sum, c) => c.payment_status === 'paid' ? sum + (c.amount || 0) : sum, 0);
  const pendingAmount = commissions.reduce((sum, c) => c.payment_status === 'pending' ? sum + (c.amount || 0) : sum, 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Total Paid Revenue</span>
          <span className="text-2xl font-black text-green-600 tabular-nums">₹{totalEarned.toLocaleString()}</span>
          <p className="text-[11px] text-[#393E46]">Cleared earnings deposited</p>
        </Card>

        <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Pending Commission</span>
          <span className="text-2xl font-black text-amber-600 tabular-nums">₹{pendingAmount.toLocaleString()}</span>
          <p className="text-[11px] text-[#393E46]">Awaiting client settlement</p>
        </Card>

        <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Total Deals Recorded</span>
          <span className="text-2xl font-black text-[#00ADB5] tabular-nums">{commissions.length}</span>
          <p className="text-[11px] text-[#393E46]">Closed lease agreements</p>
        </Card>
      </div>

      {/* Ledger Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-[#222831]">Commission Accounting Ledger</h3>
          <p className="text-xs text-[#393E46]">Track brokerage commissions for converted seeker deals.</p>
        </div>
        <Button variant="primary" size="sm" onClick={onLogCommission}>
          + Log Deal Commission
        </Button>
      </div>

      {/* Ledger Table */}
      {commissions.length === 0 ? (
        <Card className="text-center py-12 text-xs text-[#393E46]/70">
          No commission records logged. Click "+ Log Deal Commission" after converting a lead.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-[#D9D9D9] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                <th className="p-4">Lead ID</th>
                <th className="p-4">Listing ID</th>
                <th className="p-4">Commission Amount</th>
                <th className="p-4">Deal Date</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9] font-semibold text-[#222831]">
              {commissions.map((c) => (
                <tr key={c._id} className="hover:bg-[#EEEEEE]/30 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-gray-600">{c.lead_id}</td>
                  <td className="p-4 font-mono text-[11px] text-gray-600">{c.listing_id || 'N/A'}</td>
                  <td className="p-4 font-bold text-green-600 tabular-nums">₹{c.amount?.toLocaleString()}</td>
                  <td className="p-4 text-gray-500">{c.deal_date || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.payment_status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {c.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onToggleStatus(c._id, c.payment_status)}
                      className="text-xs font-bold text-[#00ADB5] hover:underline"
                    >
                      Toggle {c.payment_status === 'paid' ? 'Pending' : 'Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
