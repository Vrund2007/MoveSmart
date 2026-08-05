// src/components/admin/PropertyModerationPanel.jsx — Super Admin Listing Moderation Panel
import React, { useState, useEffect } from 'react';
import { getAdminListings, bulkListingAction } from '../../api/adminDashboard';
import { reviewListing } from '../../api/admin';
import Card from '../common/Card';
import Button from '../common/Button';

export default function PropertyModerationPanel() {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getAdminListings({ status: statusFilter });
      setListings(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
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
      setSelectedIds(listings.map(l => l._id));
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
      await reviewListing(id, decision, decision === 'rejected' ? 'Violates guidelines' : '');
      fetchListings();
    } catch {
      // ignore
    }
  };

  const handleBulkAction = async (decision) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply bulk ${decision} to ${selectedIds.length} selected properties?`)) return;
    try {
      await bulkListingAction(selectedIds, decision);
      fetchListings();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* Moderation Status Tabs & Bulk Action Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div className="flex space-x-2 text-xs font-bold">
          {['pending_review', 'approved', 'rejected', 'archived'].map((st) => (
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

        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="text-gray-500 font-mono">{selectedIds.length} Selected:</span>
            <button
              onClick={() => handleBulkAction('approved')}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => handleBulkAction('rejected')}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Bulk Reject
            </button>
          </div>
        )}
      </div>

      {/* Moderation Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading moderation queue...</div>
      ) : listings.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No properties in moderation queue for '{statusFilter}'.</Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-[#D9D9D9] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={listings.length > 0 && selectedIds.length === listings.length}
                  />
                </th>
                <th className="p-4">Property Title</th>
                <th className="p-4">Locality</th>
                <th className="p-4">Monthly Rent</th>
                <th className="p-4">Owner ID</th>
                <th className="p-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9] font-semibold text-[#222831]">
              {listings.map((l) => (
                <tr key={l._id} className="hover:bg-[#EEEEEE]/30 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(l._id)}
                      onChange={() => handleToggleSelect(l._id)}
                    />
                  </td>
                  <td className="p-4 font-bold text-[#222831]">{l.title}</td>
                  <td className="p-4 text-gray-600">{l.locality}</td>
                  <td className="p-4 font-extrabold text-[#00ADB5]">₹{l.rent?.toLocaleString()}</td>
                  <td className="p-4 font-mono text-[11px] text-gray-500">{l.owner_id || 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    {statusFilter !== 'approved' && (
                      <button
                        onClick={() => handleSingleAction(l._id, 'approved')}
                        className="text-xs font-bold text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                    )}
                    {statusFilter !== 'rejected' && (
                      <button
                        onClick={() => handleSingleAction(l._id, 'rejected')}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
