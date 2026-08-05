// src/components/shared/UniversalCalendarWidget.jsx — Multi-view Universal Calendar Widget
import React, { useState, useEffect } from 'react';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../../api/calendar';
import Card from '../common/Card';
import Button from '../common/Button';

export default function UniversalCalendarWidget() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('agenda'); // month, week, day, agenda
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', event_type: 'task', description: '', location: '' });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getCalendarEvents({ type: filterType });
      setEvents(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCalendarEvent(form);
      setIsModalOpen(false);
      setForm({ title: '', event_type: 'task', description: '', location: '' });
      fetchEvents();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCalendarEvent(id);
      fetchEvents();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-lg text-[#222831]">Universal Calendar Hub</h3>
          <p className="text-xs text-[#393E46]">Visits, Meetings, Move Dates & Relocation Milestones</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-[#D9D9D9] rounded p-1 text-xs font-bold">
            {['agenda', 'month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded capitalize transition-colors ${
                  viewMode === mode ? 'bg-[#00ADB5] text-white' : 'text-[#393E46] hover:bg-gray-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Add Calendar Event
          </Button>
        </div>
      </div>

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
          <h4 className="font-bold text-sm text-[#222831] border-b border-[#D9D9D9] pb-2">
            Upcoming Scheduled Events ({events.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">No events scheduled.</div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e._id} className="p-4 rounded-lg bg-[#EEEEEE]/40 border border-[#D9D9D9] flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#00ADB5] text-white uppercase">
                        {e.event_type}
                      </span>
                      <h5 className="font-bold text-sm text-[#222831]">{e.title}</h5>
                    </div>
                    {e.description && <p className="text-xs text-gray-500 pt-1">{e.description}</p>}
                    {e.location && <p className="text-[11px] text-[#00ADB5] font-semibold">📍 {e.location}</p>}
                  </div>

                  <button onClick={() => handleDelete(e._id)} className="text-xs font-bold text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Grid Placeholder for Month / Week / Day */}
      {viewMode !== 'agenda' && (
        <Card className="p-12 bg-white border border-[#D9D9D9] text-center text-xs text-[#393E46]">
          <span className="text-3xl block mb-2">📅</span>
          Showing {events.length} events in <strong className="uppercase">{viewMode}</strong> calendar grid view.
        </Card>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">Add Calendar Event</h3>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Title</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Site Visit with Property Owner"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              >
                <option value="visit">Property Visit</option>
                <option value="meeting">Meeting</option>
                <option value="move_date">Move Date</option>
                <option value="relocation_event">Relocation Milestone</option>
                <option value="task">Broker Task</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Satellite, Ahmedabad"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Event
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
