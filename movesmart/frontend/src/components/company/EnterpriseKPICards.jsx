// src/components/company/EnterpriseKPICards.jsx — Enterprise KPI Widgets
import React from 'react';
import Card from '../common/Card';

export default function EnterpriseKPICards({ widgets = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Active Relocation Batches</span>
        <span className="text-2xl font-black text-[#00ADB5]">{widgets.active_batches || 0}</span>
        <p className="text-[11px] text-[#393E46]">{widgets.total_employees || 0} total employees</p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Relocation Funnel</span>
        <div className="flex items-center space-x-2 text-sm font-bold text-[#222831]">
          <span className="text-amber-600 font-extrabold">{widgets.employees_waiting || 0}</span>
          <span className="text-gray-400">/</span>
          <span className="text-blue-600 font-extrabold">{widgets.employees_allocated || 0}</span>
          <span className="text-gray-400">/</span>
          <span className="text-green-600 font-extrabold">{widgets.employees_moved || 0}</span>
        </div>
        <p className="text-[10px] text-gray-500">Waiting / Allocated / Moved</p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Budget Utilization</span>
        <span className="text-2xl font-black text-indigo-600 tabular-nums">
          ₹{widgets.budget_used ? (widgets.budget_used / 100000).toFixed(1) + 'L' : '0L'}
        </span>
        <p className="text-[11px] text-[#393E46]">
          {widgets.utilization_rate || 0}% of ₹{widgets.budget_allocated ? (widgets.budget_allocated / 100000).toFixed(1) + 'L' : '0L'} allocated
        </p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Open HR Approvals</span>
        <span className="text-2xl font-black text-amber-500">{widgets.pending_approvals || 0}</span>
        <p className="text-[11px] text-[#393E46]">{widgets.available_brokers || 0} partner brokers online</p>
      </Card>
    </div>
  );
}
