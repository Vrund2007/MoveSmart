// src/components/crm/AnalyticsCharts.jsx — Performance Analytics Component
import React from 'react';
import Card from '../common/Card';

export default function AnalyticsCharts({ analytics = {} }) {
  const score = analytics.performance_score || 85;
  const convRate = analytics.lead_conversion_rate || 0;
  const suggestions = analytics.ai_suggestions || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Score Gauge Card */}
        <Card className="p-6 bg-white border border-[#D9D9D9] flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Performance Score</span>

          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-[#00ADB5]/20 bg-[#EEEEEE]/30">
            <span className="text-3xl font-black text-[#00ADB5]">{score}</span>
            <span className="text-[10px] text-gray-500 absolute bottom-4 font-bold">/ 100</span>
          </div>

          <div className="text-xs text-[#393E46]">
            <p className="font-bold text-green-600">High Performer</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Based on client conversion and visit completion rates.</p>
          </div>
        </Card>

        {/* Lead Conversion Metrics */}
        <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4 md:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base text-[#222831] mb-1">Conversion Ratios & Revenue Trends</h4>
            <p className="text-xs text-[#393E46]">Key operational metrics computed via PyMongo aggregations.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <span className="text-gray-500 text-[10px] font-bold block uppercase">Conversion Rate</span>
              <span className="text-xl font-bold text-[#00ADB5]">{convRate}%</span>
            </div>
            <div className="bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <span className="text-gray-500 text-[10px] font-bold block uppercase">Active Listings</span>
              <span className="text-xl font-bold text-[#222831]">{analytics.active_listings || 0}</span>
            </div>
            <div className="bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <span className="text-gray-500 text-[10px] font-bold block uppercase">Total Clients</span>
              <span className="text-xl font-bold text-[#222831]">{analytics.total_clients || 0}</span>
            </div>
            <div className="bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <span className="text-gray-500 text-[10px] font-bold block uppercase">Visits Completed</span>
              <span className="text-xl font-bold text-green-600">{analytics.visits_completed || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Performance Recommendations */}
      <Card className="p-6 bg-white border border-[#D9D9D9] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🤖</span>
          <h4 className="font-bold text-sm text-[#222831] uppercase tracking-wider">AI Strategic Suggestions</h4>
        </div>

        <div className="space-y-2">
          {suggestions.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 bg-cyan-50/60 p-3 rounded-lg border border-cyan-100 text-xs text-[#222831]">
              <span className="text-[#00ADB5] font-bold">💡</span>
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
