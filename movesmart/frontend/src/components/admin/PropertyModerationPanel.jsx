// src/components/admin/PropertyModerationPanel.jsx — Super Admin Listing Moderation & Source Filter Panel
import React, { useState, useEffect } from 'react';
import { getAdminListings, bulkListingAction } from '../../api/adminDashboard';
import { reviewListing } from '../../api/admin';
import { deleteListing } from '../../api/listings';
import Card from '../common/Card';
import Button from '../common/Button';
import { MapPinIcon } from '../common/Icons';

export default function PropertyModerationPanel() {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'real_landlords', 'scraped'
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination State for high performance (avoids rendering 2,300+ DOM rows at once)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sourceFilter, search]);

  // Property detail view inspection modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

  // Reject reason prompt modal state
  const [rejectingListing, setRejectingListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getAdminListings({ status: statusFilter === 'all' ? '' : statusFilter });
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setListings(data);
      setSelectedIds([]);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredListings.map(l => l._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSingleAction = async (id, decision, reason = '') => {
    try {
      await reviewListing(id, decision, decision === 'rejected' ? (reason || 'Violates MoveSmart platform guidelines') : '');
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: decision, rejection_reason: decision === 'rejected' ? reason : null } : l));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${decision}`);
    }
  };

  const handleDeleteListing = async (listingObj) => {
    if (!window.confirm(`Permanently delete listing "${listingObj.title}"?`)) return;
    try {
      await deleteListing(listingObj._id);
      setListings(prev => prev.filter(l => l._id !== listingObj._id));
      if (selectedListing?._id === listingObj._id) setSelectedListing(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const handleBulkAction = async (decision) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply bulk ${decision} to ${selectedIds.length} selected properties?`)) return;
    try {
      await bulkListingAction(selectedIds, decision);
      fetchListings();
    } catch {
      alert('Failed to process bulk moderation action.');
    }
  };

  // Strict Bulletproof Source Filter: Real Landlord iff owner_id exists
  const filteredListings = listings.filter(l => {
    const isRealLandlord = Boolean(l.owner_id && String(l.owner_id).trim() !== '' && String(l.owner_id) !== 'null');
    const isScraped = !isRealLandlord;

    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'real_landlords' && isRealLandlord) ||
      (sourceFilter === 'scraped' && isScraped);

    const matchesSearch =
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.locality?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.owner_id || '').toLowerCase().includes(search.toLowerCase());

    return matchesSource && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const paginatedListings = filteredListings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 font-sans">
      {/* Moderation Controls: Status Tabs + Source Filter + Search */}
      <div className="bg-white p-5 rounded-2xl border border-border space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              { id: 'pending_review', label: 'Pending Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 py-2 rounded-xl uppercase tracking-wider font-black transition-all ${
                  statusFilter === st.id
                    ? 'bg-[#00ADB5] text-white shadow-xs'
                    : 'bg-surface text-[#393E46] border border-border hover:bg-gray-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Real Landlords vs Scraped Source Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#393E46]">Publisher Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold border border-border rounded-xl bg-white text-[#222831] outline-none focus:border-[#00ADB5] cursor-pointer shadow-2xs"
            >
              <option value="all">All Sources</option>
              <option value="real_landlords">Verified Real Landlords</option>
              <option value="scraped">Web Scraped / Crawled</option>
            </select>
          </div>
        </div>

        {/* Search & Bulk Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-border">
          <input
            type="text"
            placeholder="Search listing title, locality, or owner ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
          />

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-text-secondary font-mono">{selectedIds.length} Selected:</span>
              <button
                onClick={() => handleBulkAction('approved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => handleBulkAction('rejected')}
                className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
              >
                Bulk Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Moderation Table */}
      {loading ? (
        <div className="py-16 text-center">
          <Button loading variant="primary">Loading listing moderation queue...</Button>
        </div>
      ) : filteredListings.length === 0 ? (
        <Card className="text-center py-16 text-xs text-text-secondary rounded-2xl bg-white border border-border">
          No property listings match current filters ({statusFilter.replace('_', ' ')}, {sourceFilter.replace('_', ' ')}).
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                    />
                  </th>
                  <th className="py-3.5 px-4">Property Title & Locality</th>
                  <th className="py-3.5 px-4">Publisher Source</th>
                  <th className="py-3.5 px-4">Price / Rent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedListings.map((l) => {
                  const isRealLandlord = Boolean(l.owner_id && String(l.owner_id).trim() !== '' && String(l.owner_id) !== 'null');

                  return (
                    <tr key={l._id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(l._id)}
                          onChange={() => handleToggleSelect(l._id)}
                        />
                      </td>
                      <td
                        className="py-4 px-4 cursor-pointer group"
                        onClick={() => { setSelectedListing(l); setActivePhoto(0); }}
                        title="Click to view full property details"
                      >
                        <div className="font-extrabold text-[#222831] group-hover:text-[#00ADB5] transition-colors flex items-center gap-1.5">
                          <span>{l.title}</span>
                          <span className="text-[10px] text-[#00ADB5] opacity-0 group-hover:opacity-100 font-bold transition-opacity">🔍</span>
                        </div>
                        <div className="text-[10px] text-[#00ADB5] font-extrabold flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{l.locality || 'Ahmedabad'}</span>
                          {l.bhk && <span>• {l.bhk} BHK</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {isRealLandlord ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Real Landlord ({String(l.owner_id).slice(-6)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                            Web Scraped
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-600">
                        ₹{Number(l.price || l.rent || 0).toLocaleString('en-IN')}{l.deal_type === 'rent' ? '/mo' : ''}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                          l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          l.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {l.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => { setSelectedListing(l); setActivePhoto(0); }}
                            className="px-2.5 py-1 text-[11px] font-extrabold text-[#00ADB5] bg-teal-50 hover:bg-[#00ADB5] hover:text-white rounded-lg transition-colors border border-teal-200"
                            title="View property details and photos"
                          >
                            View Details
                          </button>
                          {l.status !== 'approved' && (
                            <button
                              onClick={() => handleSingleAction(l._id, 'approved')}
                              className="px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200"
                            >
                              Approve
                            </button>
                          )}
                          {l.status !== 'rejected' && (
                            <button
                              onClick={() => { setRejectingListing(l); setRejectionReason(''); }}
                              className="px-2.5 py-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-colors border border-amber-200"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteListing(l)}
                            className="px-2.5 py-1 text-[11px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-border bg-surface text-xs font-bold text-[#393E46]">
            <div>
              Showing {filteredListings.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredListings.length)} of {filteredListings.length} listings
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="font-mono text-xs px-2">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Property Detail Inspection Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 border border-border">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold text-[#00ADB5] bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedListing.locality || 'Ahmedabad'}
                  </span>
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                    selectedListing.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedListing.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedListing.status || 'pending_review'}
                  </span>
                </div>
                <h3 className="font-black text-lg text-[#222831]">{selectedListing.title}</h3>
              </div>
              <button
                onClick={() => { setSelectedListing(null); setActivePhoto(0); }}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-xl hover:bg-surface transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Photo Gallery */}
            {selectedListing.images && selectedListing.images.length > 0 && (
              <div className="space-y-2">
                <div className="h-64 bg-slate-900 rounded-xl overflow-hidden relative">
                  <img
                    src={selectedListing.images[activePhoto] || selectedListing.images[0]}
                    alt={selectedListing.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Photo {activePhoto + 1} of {selectedListing.images.length}
                  </span>
                </div>
                {selectedListing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedListing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activePhoto === idx ? 'border-[#00ADB5] ring-2 ring-[#00ADB5]/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Property Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-3.5 rounded-xl border border-border text-xs">
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Price / Rent</span>
                <span className="font-black text-[#00ADB5]">₹{Number(selectedListing.price || selectedListing.rent || 0).toLocaleString('en-IN')}{selectedListing.deal_type === 'rent' ? '/mo' : ''}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">BHK & Bath</span>
                <span className="font-extrabold text-text-primary">{selectedListing.bhk || 2} BHK • {selectedListing.bathrooms || 2} Bath</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Area</span>
                <span className="font-extrabold text-text-primary">{selectedListing.area_sqft ? `${selectedListing.area_sqft} sqft` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Furnishing</span>
                <span className="font-extrabold text-text-primary capitalize">{selectedListing.furnishing || 'Unfurnished'}</span>
              </div>
            </div>

            {/* Address & Description */}
            <div className="space-y-3 text-xs">
              {selectedListing.address && (
                <div>
                  <span className="font-extrabold text-text-secondary uppercase text-[10px] block mb-0.5">Full Address</span>
                  <p className="text-text-primary font-medium bg-surface p-2.5 rounded-xl border border-border">{selectedListing.address}</p>
                </div>
              )}
              {selectedListing.description && (
                <div>
                  <span className="font-extrabold text-text-secondary uppercase text-[10px] block mb-0.5">Description</span>
                  <p className="text-text-primary font-medium bg-surface p-2.5 rounded-xl border border-border leading-relaxed">{selectedListing.description}</p>
                </div>
              )}
              {selectedListing.amenities?.length > 0 && (
                <div>
                  <span className="font-extrabold text-text-secondary uppercase text-[10px] block mb-1">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedListing.amenities.map((a, idx) => (
                      <span key={idx} className="bg-teal-50 text-[#00ADB5] border border-teal-200 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Publisher Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-border text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Publisher Source</span>
                <span className="font-extrabold text-text-primary">
                  {selectedListing.owner_id ? `Verified Real Owner (${selectedListing.owner_id})` : 'Web Scraped / Public Data'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Views / Enquiries</span>
                <span className="font-bold text-text-primary">{selectedListing.view_count || 0} views • {selectedListing.enquiry_count || 0} enquiries</span>
              </div>
            </div>

            {/* Rejection Reason if any */}
            {selectedListing.status === 'rejected' && selectedListing.rejection_reason && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                <span className="font-extrabold block">Rejection Reason:</span>
                <p>{selectedListing.rejection_reason}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-border gap-2">
              <button
                onClick={() => handleDeleteListing(selectedListing)}
                className="px-3 py-2 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors border border-rose-200"
              >
                Delete Listing
              </button>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setSelectedListing(null); setActivePhoto(0); }}>
                  Close
                </Button>
                {selectedListing.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      const target = selectedListing;
                      setSelectedListing(null);
                      setRejectingListing(target);
                    }}
                    className="px-4 py-2 text-xs font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-600 hover:text-white rounded-xl transition-colors border border-amber-200"
                  >
                    Reject Listing
                  </button>
                )}
                {selectedListing.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleSingleAction(selectedListing._id, 'approved');
                      setSelectedListing(null);
                    }}
                    className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                  >
                    Approve Listing
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Prompt Modal */}
      {rejectingListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-border font-sans">
            <h4 className="font-extrabold text-base text-[#222831]">
              Reject Listing: "{rejectingListing.title}"
            </h4>
            <p className="text-xs text-text-secondary">
              Please enter the reason for rejection. This feedback will be visible to the property owner.
            </p>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inaccurate pricing, invalid property address, poor quality images..."
                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-text-primary outline-none focus:border-rose-500 font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => { setRejectingListing(null); setRejectionReason(''); }}>
                Cancel
              </Button>
              <button
                onClick={async () => {
                  const reasonToUse = rejectionReason.trim() || 'Violates MoveSmart platform guidelines';
                  await handleSingleAction(rejectingListing._id, 'rejected', reasonToUse);
                  setRejectingListing(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
