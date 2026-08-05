// src/components/crm/ActivityFeed.jsx — Real-time Activity Timeline Feed Component
import React from 'react';
import Card from '../common/Card';

export default function ActivityFeed({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-4 bg-white border border-[#D9D9D9] text-center text-xs text-[#393E46]">
        No recent activities logged today.
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-white border border-[#D9D9D9] space-y-3">
      <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider border-b border-[#D9D9D9] pb-2">
        Recent Activity Timeline
      </h4>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {activities.map((act, idx) => (
          <div key={idx} className="flex items-start space-x-3 text-xs">
            <span className="p-1.5 bg-[#EEEEEE] rounded-full text-sm">
              {act.type === 'lead' ? '⚡' : act.type === 'task' ? '✅' : act.type === 'visit' ? '📅' : '💵'}
            </span>
            <div className="flex-1">
              <p className="font-bold text-[#222831]">{act.title}</p>
              <span className="text-[10px] text-gray-500">{act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
