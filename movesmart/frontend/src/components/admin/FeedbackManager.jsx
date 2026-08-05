// src/components/admin/FeedbackManager.jsx — User Feedback & Bug Reports Manager Component
import React, { useState, useEffect } from 'react';
import { getAdminFeedback, updateFeedbackStatus } from '../../api/feedback';
import Card from '../common/Card';
import Button from '../common/Button';

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await getAdminFeedback({ status: statusFilter });
      setFeedback(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingId) return;
    try {
      await updateFeedbackStatus(resolvingId, 'resolved', noteInput.trim());
      setResolvingId(null);
      setNoteInput('');
      fetchFeedback();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div>
          <h3 className="font-extrabold text-base text-[#222831]">Feedback & Bug Reports Center</h3>
          <p className="text-xs text-[#393E46]">Review user feedback, feature requests, bug submissions & contact forms.</p>
        </div>

        <div className="flex space-x-2 text-xs font-bold">
          {['open', 'in_review', 'resolved', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded uppercase transition-colors ${
                statusFilter === st ? 'bg-[#00ADB5] text-white' : 'bg-[#EEEEEE] text-[#393E46] hover:bg-gray-300'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading feedback queue...</div>
      ) : feedback.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No feedback submissions found for '{statusFilter}'.</Card>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <Card key={f._id} className="p-4 bg-white border border-[#D9D9D9] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase">
                    {f.category || 'general'}
                  </span>
                  <h4 className="font-bold text-sm text-[#222831] pt-1">{f.subject || 'User Feedback'}</h4>
                  <p className="text-[11px] text-gray-500">From: {f.name} ({f.email || 'Anonymous'})</p>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
                </span>
              </div>

              <p className="text-xs text-[#393E46] bg-[#EEEEEE]/40 p-3 rounded border border-[#D9D9D9]">
                "{f.message}"
              </p>

              {f.resolution_note && (
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 italic">
                  Resolution Note: "{f.resolution_note}"
                </p>
              )}

              {statusFilter === 'open' && resolvingId !== f._id && (
                <div className="pt-2 border-t border-[#D9D9D9] flex justify-end space-x-2 text-xs font-semibold">
                  <button
                    onClick={() => setResolvingId(f._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}

              {resolvingId === f._id && (
                <form onSubmit={handleResolveSubmit} className="pt-2 space-y-2 border-t border-[#D9D9D9]">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Enter resolution notes for user..."
                    className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setResolvingId(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Confirm Resolve
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
