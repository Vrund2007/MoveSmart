// src/components/admin/AIMLMonitoringPanel.jsx — Privacy-Safe AI & ML Operational Health Monitoring
import React, { useState, useEffect } from 'react';
import { getAIMLMonitoring } from '../../api/adminDashboard';
import Card from '../common/Card';

export default function AIMLMonitoringPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const res = await getAIMLMonitoring();
        setMetrics(res.data || res);
      } catch {
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const ai = metrics?.ai_metrics || {};
  const ml = metrics?.ml_metrics || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <h3 className="font-extrabold text-base text-[#222831]">AI & ML Platform Operational Health</h3>
        <p className="text-xs text-[#393E46]">Privacy-safe system monitoring (API request volumes, response latency & model status).</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading AI/ML operational metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gemini AI API Metrics */}
          <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
            <div className="flex justify-between items-start border-b border-[#D9D9D9] pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#00ADB5] uppercase tracking-wider block">AI Provider</span>
                <h4 className="font-extrabold text-base text-[#222831]">{ai.provider || 'Google Gemini API'}</h4>
              </div>
              <span className="text-xs font-bold text-green-600 uppercase px-2 py-0.5 bg-green-100 rounded border border-green-200">
                ● {ai.status || 'Healthy'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Total Requests</span>
                <span className="font-bold text-sm text-[#222831]">{ai.total_requests || 0}</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Avg Latency</span>
                <span className="font-bold text-sm text-[#00ADB5]">{ai.average_response_ms || 0} ms</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Failed Requests</span>
                <span className="font-bold text-sm text-red-600">{ai.failed_requests || 0}</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Daily Quota</span>
                <span className="font-bold text-sm text-[#222831]">{ai.quota_used || 0} / {ai.quota_limit || 10000}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 italic">
              🔒 Privacy Guarantee: Prompt text contents and conversations are never stored or exposed.
            </p>
          </Card>

          {/* ML Inferences Metrics */}
          <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
            <div className="flex justify-between items-start border-b border-[#D9D9D9] pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">ML Scoring Engine</span>
                <h4 className="font-extrabold text-base text-[#222831]">LightGBM & Isolation Forest</h4>
              </div>
              <span className="text-xs font-bold text-green-600 uppercase px-2 py-0.5 bg-green-100 rounded border border-green-200">
                ● {ml.status || 'Operational'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Rent Model Version</span>
                <span className="font-bold text-xs text-[#222831]">{ml.rent_model_version || 'v1.2'}</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Anomaly Model Version</span>
                <span className="font-bold text-xs text-[#222831]">{ml.anomaly_model_version || 'v1.0'}</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Total Inferences</span>
                <span className="font-bold text-sm text-[#222831]">{ml.total_inferences || 0}</span>
              </div>

              <div className="p-3 bg-[#EEEEEE]/50 rounded border border-[#D9D9D9]">
                <span className="text-gray-500 block text-[10px] font-semibold">Anomalies Detected</span>
                <span className="font-bold text-sm text-amber-600">{ml.anomaly_detections || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
