// src/pages/VisitScheduler.jsx — Property Visit Scheduling Manager
import React, { useState, useEffect } from 'react';
import { getVisits, scheduleVisit, updateVisitStatus } from '../api/visits';
import { getListings } from '../api/listings';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VisitScheduler() {
  const [visits, setVisits] = useState([]);
  const [approvedListings, setApprovedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    listing_id: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    time_slot: '10:00 AM - 11:00 AM',
    notes: ''
  });

  const fetchVisitsList = async () => {
    setLoading(true);
    try {
      const res = await getVisits();
      const data = res.data || res;
      setVisits(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await getListings();
      const data = res.data || res;
      setApprovedListings(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchVisitsList();
    fetchListings();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await scheduleVisit(form);
      setIsModalOpen(false);
      setForm({ listing_id: '', scheduled_date: new Date().toISOString().split('T')[0], time_slot: '10:00 AM - 11:00 AM', notes: '' });
      fetchVisitsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule property visit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelVisit = async (visitId) => {
    try {
      await updateVisitStatus(visitId, 'cancelled', 'Cancelled by Seeker');
      fetchVisitsList();
    } catch {
      alert('Failed to cancel visit.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-[#222831]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-text-primary">Property Visit Scheduler</h3>
          <p className="text-xs text-text-secondary mt-0.5">Request and track in-person or virtual property tours with owners and brokers.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          + Schedule New Visit
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" message="Loading scheduled visits..." />
        </div>
      ) : visits.length === 0 ? (
        <Card className="text-center py-12 text-xs text-text-secondary">
          No property visits scheduled. Click "+ Schedule New Visit" to pick a date and time slot.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visits.map((v) => (
            <Card key={v._id} className="bg-white border border-border flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-primary uppercase">{v.listing?.locality || 'Property Visit'}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    v.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-text-primary">{v.listing?.title || 'Property Visit'}</h4>
                <p className="text-xs text-text-secondary mt-1">
                  Date: <strong>{v.scheduled_date}</strong> • Time: <strong>{v.time_slot}</strong>
                </p>
                {v.notes && <p className="text-xs italic text-text-secondary mt-2 bg-surface p-2 rounded">"{v.notes}"</p>}
              </div>

              {v.status !== 'cancelled' && v.status !== 'completed' && (
                <div className="pt-2 border-t border-border flex justify-end">
                  <Button variant="danger" size="sm" onClick={() => handleCancelVisit(v._id)}>
                    Cancel Visit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleScheduleSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Schedule Property Visit</h3>
            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Select Verified Property</label>
              <select
                required
                value={form.listing_id}
                onChange={(e) => setForm({ ...form, listing_id: e.target.value })}
                className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary"
              >
                <option value="">Select property...</option>
                {approvedListings
                  .filter((p) => p.owner_id || p.submitted_by_broker_id || p.source === 'landlord_portal')
                  .map((p) => (
                    <option key={p._id} value={p._id}>{p.title} ({p.locality}) — ₹{p.price?.toLocaleString()}</option>
                  ))}
              </select>
              <p className="text-[10px] text-text-secondary mt-1">
                ℹ️ Only properties with registered platform Landlords / Brokers can be scheduled online.
              </p>
            </div>
            <Input
              label="Visit Date"
              type="date"
              required
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
            />
            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Time Slot</label>
              <select
                value={form.time_slot}
                onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary"
              >
                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
              </select>
            </div>
            <Input
              label="Notes for Owner / Broker"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Requesting weekend viewing"
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>Schedule Visit</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
