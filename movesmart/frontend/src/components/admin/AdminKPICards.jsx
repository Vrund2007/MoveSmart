// src/components/admin/AdminKPICards.jsx — Super Admin KPI Metric Widgets Component
import React from 'react';
import Card from '../common/Card';
import { UserIcon, BrowseIcon, CalendarIcon, CheckCircleIcon } from '../common/Icons';

export default function AdminKPICards({ summary }) {
  const s = summary || {};
  const u = s.user_metrics || {};
  const l = s.listing_metrics || {};
  const e = s.engagement_metrics || {};
  const h = s.system_health || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Total Ecosystem Users</span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[#00ADB5]">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#222831]">{u.total_users || 0}</div>
        <p className="text-[11px] text-text-secondary font-semibold">
          {u.seekers || 0} Seekers • {u.owners || 0} Landlords • {u.companies || 0} HR
        </p>
      </Card>

      <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Property Catalog</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <BrowseIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center space-x-2 text-base font-black text-[#222831]">
          <span className="text-amber-600 font-black">{l.pending || 0} Pending</span>
          <span className="text-gray-300">/</span>
          <span className="text-emerald-600 font-black">{l.approved || 0} Approved</span>
        </div>
        <p className="text-[11px] text-text-secondary font-semibold">{l.total_listings || 0} total properties cataloged</p>
      </Card>

      <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Platform Engagement</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#00ADB5]">{e.active_conversations || 0}</div>
        <p className="text-[11px] text-text-secondary font-semibold">{e.pending_visits || 0} site visit requests queued</p>
      </Card>

      <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">AI / ML System Status</span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircleIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-sm font-extrabold text-emerald-600 uppercase flex items-center space-x-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{h.server_status || 'Operational'}</span>
        </div>
        <p className="text-[11px] text-text-secondary font-semibold">Gemini API: {h.gemini_status || 'Healthy'} • Model: {h.ml_model_version || 'v1.2'}</p>
      </Card>
    </div>
  );
}
