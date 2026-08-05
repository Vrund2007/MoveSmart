// src/pages/Reports.jsx — Platform Universal Report Hub Page
import React, { useState, useEffect } from 'react';
import { getPlatformReport, exportPlatformReportCSV } from '../api/reports';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await getPlatformReport();
        setReport(res.data || res);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#222831]">Universal Platform Report Hub</h2>
          <p className="text-xs text-[#393E46]">Generate role-based analytics, activity summaries, and CSV exports.</p>
        </div>

        <Button variant="secondary" size="sm" onClick={exportPlatformReportCSV}>
          📥 Export CSV Report
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Generating platform report...</div>
      ) : (
        <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
          <h3 className="font-bold text-sm text-[#222831] uppercase">
            {report?.role} Platform Analytics Summary
          </h3>
          <pre className="bg-[#EEEEEE] p-4 rounded-lg text-xs font-mono text-[#222831] overflow-x-auto max-h-96">
            {JSON.stringify(report?.content || report, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
