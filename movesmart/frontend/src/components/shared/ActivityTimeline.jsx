// src/components/shared/ActivityTimeline.jsx — System Audit Activity Logs Feed Component
import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '../../api/activity';
import Card from '../common/Card';

export default function ActivityTimeline() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await getActivityLogs();
        setLogs(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
      <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-3">
        <div>
          <h3 className="font-extrabold text-base text-[#222831]">Activity & Audit Timeline</h3>
          <p className="text-xs text-gray-500">Security audit history and platform interaction record</p>
        </div>
        <span className="text-xs font-bold text-[#00ADB5] uppercase">{logs.length} Logged Actions</span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-500">Loading audit feed...</div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">No activity logs recorded yet.</div>
      ) : (
        <div className="relative pl-6 space-y-4 border-l-2 border-[#D9D9D9] ml-2">
          {logs.map((log) => (
            <div key={log._id} className="relative group">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#00ADB5] border-2 border-white ring-2 ring-[#00ADB5]/20" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                    {log.action?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#222831] pt-1">{log.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
