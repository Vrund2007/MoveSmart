// src/components/crm/PipelineBoard.jsx — 7-Stage Lead Pipeline Kanban Board
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'contacted', label: 'Contacted', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { id: 'visit_scheduled', label: 'Visit Scheduled', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'converted', label: 'Converted', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'lost', label: 'Lost', color: 'bg-red-50 border-red-200 text-red-700' }
];

export default function PipelineBoard({ leads = [], onUpdateStatus, onAddNote }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteInput.trim() || !selectedLead) return;
    setSubmittingNote(true);
    try {
      await onAddNote(selectedLead._id, noteInput.trim());
      setNoteInput('');
      setSelectedLead(null);
    } catch {
      // error handled in parent
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-[#222831]">Lead Pipeline Board</h3>
          <p className="text-xs text-[#393E46]">
            Track seeker enquiries through 7 conversion stages from initial contact to deal closure.
          </p>
        </div>
      </div>

      {/* Kanban Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.lead_status === stage.id);
          return (
            <div key={stage.id} className="bg-white rounded-xl p-3 border border-[#D9D9D9] flex flex-col min-w-[200px]">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#D9D9D9]">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-bold text-[#393E46] bg-[#EEEEEE] px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-[11px] text-[#393E46]/60 text-center py-6 border border-dashed border-[#D9D9D9] rounded-lg">
                    No leads
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <Card key={lead._id} className="p-3 bg-[#EEEEEE]/40 border border-[#D9D9D9] hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-xs text-[#222831] line-clamp-1">{lead.seeker_name}</h4>
                        {lead.priority && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            lead.priority === 'high' ? 'bg-red-100 text-red-700' :
                            lead.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {lead.priority}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#393E46] mb-2 truncate">
                        {lead.seeker_phone || lead.seeker_email || 'Contact on record'}
                      </p>

                      {lead.notes && lead.notes.length > 0 && (
                        <p className="text-[10px] text-[#393E46]/80 italic line-clamp-2 mb-2 bg-white p-1.5 rounded border border-[#D9D9D9]">
                          "{lead.notes[lead.notes.length - 1]}"
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-[#D9D9D9] text-[10px]">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-[#00ADB5] font-bold hover:underline"
                        >
                          + Note
                        </button>

                        <div className="flex space-x-1">
                          {stage.id !== 'converted' && stage.id !== 'lost' && (
                            <button
                              onClick={() => {
                                const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === stage.id);
                                const nextStage = PIPELINE_STAGES[currentIndex + 1]?.id;
                                if (nextStage) onUpdateStatus(lead._id, nextStage);
                              }}
                              title="Advance to next stage"
                              className="bg-[#00ADB5] text-white px-2 py-0.5 rounded text-[9px] font-bold hover:bg-[#00ADB5]/90"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Note Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleNoteSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#222831]">
              Add Timeline Note — {selectedLead.seeker_name}
            </h3>
            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Activity Note</label>
              <textarea
                required
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Discussed budget expectations, prefers 2 BHK near Metro station."
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831] focus:ring-1 focus:ring-[#00ADB5]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedLead(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submittingNote}>
                Save Note
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
