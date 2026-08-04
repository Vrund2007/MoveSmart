// src/pages/AdminReviewQueue.jsx — Admin Listing Review Queue (PRD §7.5, Architecture.md §4.5, FR-4, FR-5)
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPendingListings, reviewListing } from '../api/admin';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminReviewQueue() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Selected listing for detailed inspection modal
  const [selectedListing, setSelectedListing] = useState(null);

  // Reject modal state
  const [rejectingListing, setRejectingListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch pending review queue
  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingListings('pending_review');
      const data = res.data || res;
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Handle Approve
  const handleApprove = async (id, title) => {
    setSubmitting(true);
    try {
      await reviewListing(id, 'approved');
      setQueue((prev) => prev.filter((item) => item._id !== id));
      if (selectedListing?._id === id) setSelectedListing(null);
      setNotification(`Listing "${title}" Approved & Published successfully.`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve listing.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject Submit (FR-5: Reason mandatory)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('A reason is required when rejecting a listing (FR-5).');
      return;
    }
    setSubmitting(true);
    setRejectError('');
    try {
      await reviewListing(rejectingListing._id, 'rejected', rejectionReason);
      setQueue((prev) => prev.filter((item) => item._id !== rejectingListing._id));
      if (selectedListing?._id === rejectingListing._id) setSelectedListing(null);
      setNotification(`Listing "${rejectingListing.title}" Rejected.`);
      setRejectingListing(null);
      setRejectionReason('');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col font-sans text-[#222831]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 z-10">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart Admin Panel</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#EF4444] uppercase">
            System Admin
          </span>
          <button onClick={handleLogout} className="text-xs font-bold text-[#EF4444] hover:underline">
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-8 space-y-6 max-w-6xl mx-auto w-full">
        {notification && (
          <div className="bg-[#22C55E]/10 border border-[#22C55E] p-4 rounded-xl text-xs text-[#22C55E] font-semibold text-center animate-fade-in">
            {notification}
          </div>
        )}

        <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#222831]">Admin Listing Review Queue</h3>
          <p className="text-xs text-[#393E46] mt-1 leading-relaxed">
            Review submitted listings from Property Owners and Brokers. All listings require explicit Admin approval before becoming visible to accommodation seekers.
          </p>
        </div>

        <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">
              Pending Queue ({queue.length})
            </h3>
            <Button variant="secondary" size="sm" onClick={fetchQueue}>
              Refresh Queue
            </Button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <LoadingSpinner size="lg" message="Fetching pending review queue..." />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-error text-xs font-semibold">{error}</div>
          ) : queue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#393E46] font-semibold bg-[#EEEEEE]/30 rounded-xl border border-dashed border-[#D9D9D9]">
              All listings reviewed! The review queue is empty.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                    <th className="p-4">Listing Title</th>
                    <th className="p-4">Locality</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">BHK / Type</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
                  {queue.map((item) => (
                    <tr key={item._id} className="hover:bg-[#EEEEEE]/20 transition-colors">
                      <td className="p-4 font-bold">{item.title}</td>
                      <td className="p-4 text-[#00ADB5] uppercase">{item.locality}</td>
                      <td className="p-4 tabular-nums">₹{item.price?.toLocaleString()} / mo</td>
                      <td className="p-4 capitalize">{item.bhk} BHK • {item.deal_type}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedListing(item)}
                          className="text-xs font-semibold text-text-secondary hover:underline mr-2"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleApprove(item._id, item.title)}
                          disabled={submitting}
                          className="bg-[#22C55E] hover:bg-[#1ea34d] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingListing(item);
                            setRejectionReason('');
                            setRejectError('');
                          }}
                          disabled={submitting}
                          className="bg-[#EF4444] hover:bg-[#d83c3c] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Inspect Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <h3 className="font-bold text-lg text-text-primary">{selectedListing.title}</h3>
              <span className="text-xs font-bold text-warning uppercase bg-amber-100 px-2 py-0.5 rounded">Pending Review</span>
            </div>
            <div className="space-y-2 text-xs text-text-primary">
              <p><strong>Locality:</strong> {selectedListing.locality}</p>
              <p><strong>Price:</strong> ₹{selectedListing.price?.toLocaleString()} / month ({selectedListing.deal_type})</p>
              <p><strong>BHK / Area:</strong> {selectedListing.bhk} BHK • {selectedListing.area_sqft ? `${selectedListing.area_sqft} sqft` : 'N/A'}</p>
              <p><strong>Furnishing:</strong> {selectedListing.furnishing || 'Not specified'}</p>
              {selectedListing.description && (
                <div>
                  <strong className="block mb-1">Description:</strong>
                  <p className="bg-gray-50 p-2.5 rounded border border-border text-text-secondary">{selectedListing.description}</p>
                </div>
              )}
              {selectedListing.amenities?.length > 0 && (
                <div>
                  <strong className="block mb-1">Amenities:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedListing.amenities.map((a, i) => (
                      <span key={i} className="bg-teal-50 text-primary border border-teal-200 px-2 py-0.5 rounded text-[10px]">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-3 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setSelectedListing(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setRejectingListing(selectedListing);
                  setRejectionReason('');
                  setRejectError('');
                }}
              >
                Reject Listing
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(selectedListing._id, selectedListing.title)}
              >
                Approve Listing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Mandatory Reason (FR-5) */}
      {rejectingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Reject Listing: {rejectingListing.title}</h3>
            <p className="text-xs text-text-secondary">
              Please specify the reason for rejecting this listing. The owner will see this feedback when resubmitting.
            </p>
            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Missing property images, unclear description..."
                className="w-full bg-surface border border-border rounded-md p-2.5 text-xs text-text-primary outline-none focus:border-error"
              />
              {rejectError && <p className="text-xs text-error mt-1">{rejectError}</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={() => setRejectingListing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" loading={submitting}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
