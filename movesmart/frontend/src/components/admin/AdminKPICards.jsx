// src/components/admin/AdminKPICards.jsx — Super Admin KPI Metric Widgets Component
import React from 'react';
import Card from '../common/Card';

export default function AdminKPICards({ summary = {} }) {
  const u = summary.user_metrics || {};
  const l = summary.listing_metrics || {};
  const e = summary.engagement_metrics || {};
  const h = summary.system_health || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Total Ecosystem Users</span>
        <span className="text-2xl font-black text-[#222831]">{u.total_users || 0}</span>
        <p className="text-[11px] text-[#393E46]">
          {u.seekers || 0} Seekers • {u.owners || 0} Owners • {u.brokers || 0} Brokers • {u.companies || 0} HR
        </p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Property Moderation Pipeline</span>
        <div className="flex items-center space-x-2 text-sm font-bold text-[#222831]">
          <span className="text-amber-500 font-black">{l.pending || 0} Pending</span>
          <span className="text-gray-300">/</span>
          <span className="text-green-600 font-black">{l.approved || 0} Approved</span>
        </div>
        <p className="text-[11px] text-[#393E46]">{l.total_listings || 0} total listings cataloged</p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Platform Engagement</span>
        <span className="text-2xl font-black text-[#00ADB5]">{e.active_conversations || 0}</span>
        <p className="text-[11px] text-[#393E46]">{e.pending_visits || 0} pending site visits queued</p>
      </Card>

      <Card className="p-4 bg-white border border-[#D9D9D9] space-y-1">
        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">AI / ML System Health</span>
        <span className="text-sm font-extrabold text-green-600 uppercase flex items-center space-x-1">
          <span>●</span>
          <span>{h.server_status || 'Operational'}</span>
        </span>
        <p className="text-[11px] text-[#393E46]">Gemini API: {h.gemini_status || 'Healthy'} • Model: {h.ml_model_version || 'v1.2'}</p>
      </Card>
    </div>
  );
}
