// src/components/crm/VisitCalendarView.jsx — Visit Calendar & Agenda View
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function VisitCalendarView({ visits = [], onScheduleVisit, onUpdateVisitStatus }) {
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitForm, setVisitForm] = useState({
    seeker_name: '',
    seeker_phone: '',
    listing_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '11:00'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onScheduleVisit(visitForm);
      setIsModalOpen(false);
      setVisitForm({ seeker_name: '', seeker_phone: '', listing_id: '', visit_date: new Date().toISOString().split('T')[0], visit_time: '11:00' });
    } catch {
      // error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled':
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-[#222831]">Visit Scheduler Hub</h3>
          <p className="text-xs text-[#393E46]">
            Manage property site visits with accommodation seekers and property owners.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-white rounded-lg p-0.5 border border-[#D9D9D9] text-xs font-bold">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'agenda' ? 'bg-[#00ADB5] text-white' : 'text-[#393E46]'}`}
            >
              Agenda View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-[#00ADB5] text-white' : 'text-[#393E46]'}`}
            >
              Calendar Grid
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Schedule Site Visit
          </Button>
        </div>
      </div>

      {viewMode === 'agenda' ? (
        <div className="space-y-4">
          {visits.length === 0 ? (
            <Card className="text-center py-12 text-xs text-[#393E46]/70">
              No visits scheduled yet. Click "+ Schedule Site Visit" to book property viewings.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visits.map((visit) => (
                <Card key={visit._id} className="p-4 bg-white border border-[#D9D9D9] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#222831]">
                        {visit.seeker_name || 'Seeker Visit'}
                      </h4>
                      <p className="text-xs text-[#00ADB5] font-semibold">
                        📍 Property ID: {visit.listing_id || 'Assigned Property'}
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStatusBadge(visit.status)}`}>
                      {visit.status || 'scheduled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-[#393E46] bg-[#EEEEEE]/50 p-2.5 rounded border border-[#D9D9D9]">
                    <span>📅 {visit.visit_date || 'Today'}</span>
                    <span>⏰ {visit.visit_time || '11:00 AM'}</span>
                    {visit.seeker_phone && <span>📞 {visit.seeker_phone}</span>}
                  </div>

                  <div className="pt-2 border-t border-[#D9D9D9] flex justify-end space-x-2 text-xs font-semibold">
                    {visit.status !== 'completed' && (
                      <button
                        onClick={() => onUpdateVisitStatus(visit._id, 'completed')}
                        className="bg-green-600 text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-green-700"
                      >
                        Mark Completed
                      </button>
                    )}
                    {visit.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateVisitStatus(visit._id, 'cancelled')}
                        className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Calendar Grid View Representation */
        <Card className="p-6 bg-white border border-[#D9D9D9]">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#393E46] pb-3 border-b border-[#D9D9D9]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 pt-3 text-xs min-h-[300px]">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const dayVisits = visits.filter(v => v.visit_date?.endsWith(`-${day < 10 ? '0' + day : day}`));
              return (
                <div key={day} className="border border-[#D9D9D9] rounded p-1.5 h-24 flex flex-col justify-between bg-[#EEEEEE]/20 hover:bg-white">
                  <span className="font-bold text-[11px] text-[#222831]">{day}</span>
                  {dayVisits.length > 0 && (
                    <div className="space-y-1">
                      {dayVisits.map(v => (
                        <div key={v._id} className="text-[9px] font-extrabold bg-[#00ADB5] text-white p-1 rounded truncate">
                          {v.visit_time || '11:00'} - {v.seeker_name || 'Visit'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Schedule Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">
              Schedule Property Site Visit
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Seeker Name</label>
              <input
                required
                type="text"
                value={visitForm.seeker_name}
                onChange={(e) => setVisitForm({ ...visitForm, seeker_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Contact Phone</label>
              <input
                type="text"
                value={visitForm.seeker_phone}
                onChange={(e) => setVisitForm({ ...visitForm, seeker_phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Listing ID / Address</label>
              <input
                required
                type="text"
                value={visitForm.listing_id}
                onChange={(e) => setVisitForm({ ...visitForm, listing_id: e.target.value })}
                placeholder="Property ID or locality"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Visit Date</label>
                <input
                  required
                  type="date"
                  value={visitForm.visit_date}
                  onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Time</label>
                <input
                  required
                  type="time"
                  value={visitForm.visit_time}
                  onChange={(e) => setVisitForm({ ...visitForm, visit_time: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Book Visit
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
