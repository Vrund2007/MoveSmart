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

  const handleSingleAction = async (id, decision) => {
    try {
      await reviewListing(id, decision, decision === 'rejected' ? 'Violates MoveSmart platform guidelines' : '');
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: decision } : l));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${decision}`);
    }
  };

  const handleDeleteListing = async (listingObj) => {
    if (!window.confirm(`Permanently delete listing "${listingObj.title}"?`)) return;
    try {
      await deleteListing(listingObj._id);
      setListings(prev => prev.filter(l => l._id !== listingObj._id));
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
              { id: 'all', label: 'All Statuses' },
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

          {/* Real Landlords vs Scraped Source Filter Dropdown (Emojis Removed) */}
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
                {filteredListings.map((l) => {
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
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-[#222831]">{l.title}</div>
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
                              onClick={() => handleSingleAction(l._id, 'rejected')}
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
        </Card>
      )}
    </div>
  );
}
