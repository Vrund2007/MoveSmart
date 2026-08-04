import React from 'react';
import Card from '../common/Card';

/**
 * LeadStatusBoard Component.
 */
const LeadStatusBoard = ({ leads = [], onStatusUpdate }) => {
  const columns = ['new', 'contacted', 'converted', 'lost'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.lead_status === col);
        return (
          <div key={col} className="bg-gray-100 p-3 rounded-lg border border-border">
            <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">{col} ({colLeads.length})</h4>
            <div className="flex flex-col gap-2">
              {colLeads.map((lead) => (
                <Card key={lead._id} className="p-3 text-xs bg-surface">
                  <p className="font-semibold text-text-primary mb-1">Enquiry #{lead.enquiry_id?.substring(0, 8)}</p>
                  <select
                    value={lead.lead_status}
                    onChange={(e) => onStatusUpdate(lead._id, e.target.value)}
                    className="w-full mt-2 bg-background border border-border rounded px-2 py-1 text-xs text-text-primary"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadStatusBoard;
