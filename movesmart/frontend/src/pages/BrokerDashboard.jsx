// src/pages/BrokerDashboard.jsx — Broker CRM Portal (PRD §6.3, Architecture.md §4.3)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getBrokerListings,
  createBrokerListing,
  updateBrokerListing,
  deleteBrokerListing,
  matchClient
} from '../api/broker';
import { getLeads, updateLeadStatus } from '../api/leads';
import { getCommissions, createCommission, updateCommissionStatus } from '../api/commissions';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/listings/StatusBadge';
import ListingForm from '../components/owner/ListingForm';
import LocalityCard from '../components/recommendations/LocalityCard';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BrokerDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'inventory';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // 1. Managed Inventory State
  const [inventory, setInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);

  // 2. Lead Management State
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // 3. Commission Accounting State
  const [commissions, setCommissions] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [commForm, setCommForm] = useState({ lead_id: '', amount: '', listing_id: '' });

  // 4. Client Matcher State
  const [clientForm, setClientForm] = useState({ rent_budget: 30000, commute_tolerance_minutes: 30, lifestyle_pref: 'vibrant' });
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  // Form Submitting flags
  const [submitting, setSubmitting] = useState(false);

  // Fetch Managed Inventory
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await getBrokerListings();
      const data = res.data || res;
      setInventory(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setInvLoading(false);
    }
  }, []);

  // Fetch Leads
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await getLeads();
      const data = res.data || res;
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  // Fetch Commissions
  const fetchCommissions = useCallback(async () => {
    setCommLoading(true);
    try {
      const res = await getCommissions();
      const data = res.data || res;
      setCommissions(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setCommLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchLeads();
    fetchCommissions();
  }, [fetchInventory, fetchLeads, fetchCommissions]);

  // Handlers for Inventory
  const handleCreateSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await createBrokerListing({
        ...formData,
        owner_id: formData.owner_id || '66b0ef3a9d8c2f1e4a7b901a'
      });
      setIsCreateOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!editingListing) return;
    setSubmitting(true);
    try {
      await updateBrokerListing(editingListing._id, formData);
      setEditingListing(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;
    try {
      await deleteBrokerListing(deletingListing._id);
      setDeletingListing(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Handlers for Lead Status Transitions (new -> contacted -> converted | lost)
  const handleLeadStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid lead status transition.');
    }
  };

  // Handlers for Commission Creation
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCommission({
        lead_id: commForm.lead_id,
        amount: Number(commForm.amount),
        listing_id: commForm.listing_id || null,
        payment_status: 'pending'
      });
      setIsCommModalOpen(false);
      setCommForm({ lead_id: '', amount: '', listing_id: '' });
      fetchCommissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log commission. Lead must be converted.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCommissionPayment = async (commId, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      await updateCommissionStatus(commId, nextStatus);
      fetchCommissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  // Handler for Client Matcher (Reuses Recommendation Engine)
  const handleClientMatchSubmit = async (e) => {
    e.preventDefault();
    setMatchLoading(true);
    try {
      const res = await matchClient({
        rent_budget: Number(clientForm.rent_budget),
        commute_tolerance_minutes: Number(clientForm.commute_tolerance_minutes),
        lifestyle_pref: clientForm.lifestyle_pref
      });
      setMatchResult(res.data || res);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate client match.');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalEarnings = commissions.reduce((sum, c) => c.payment_status === 'paid' ? sum + c.amount : sum, 0);

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Logo">🤝</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Broker CRM Portal</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'inventory', label: `Managed Inventory (${inventory.length})`, icon: '📋' },
              { id: 'leads', label: `Lead Pipeline (${leads.length})`, icon: '⚡' },
              { id: 'commissions', label: `Commissions (₹${totalEarnings.toLocaleString()})`, icon: '💵' },
              { id: 'client-match', label: 'AI Client Matcher', icon: '🎯' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white' : 'text-[#393E46] hover:bg-[#EEEEEE]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#D9D9D9]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#222831] capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#00ADB5] uppercase">
            Broker Partner
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {/* TAB 1: Managed Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-text-primary">Managed Property Inventory</h3>
                <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                  + Add Property (for Owner)
                </Button>
              </div>

              {invLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading broker inventory..." />
                </div>
              ) : inventory.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No property listings submitted yet. Click "+ Add Property" to register listings on behalf of owners.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map((item) => (
                    <Card key={item._id} className="flex flex-col justify-between h-full bg-white relative">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-bold text-base text-text-primary line-clamp-1">{item.title}</h4>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="text-sm font-bold text-primary mb-1">
                          ₹{item.price?.toLocaleString()} <span className="text-xs text-text-secondary font-normal">/ mo ({item.deal_type})</span>
                        </p>
                        <p className="text-xs text-text-secondary mb-3">
                          {item.bhk} BHK • {item.locality}
                        </p>

                        {/* Rejection Alert Card */}
                        {item.status === 'rejected' && item.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 rounded p-2.5 text-xs mb-3">
                            <span className="font-bold text-error block mb-1">Rejection Reason:</span>
                            <p className="italic text-text-primary">"{item.rejection_reason}"</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border flex justify-end gap-2 text-xs">
                        <button onClick={() => setEditingListing(item)} className="font-semibold text-primary hover:underline">
                          Edit
                        </button>
                        <button onClick={() => setDeletingListing(item)} className="font-semibold text-error hover:underline">
                          Delete
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Lead Pipeline */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-text-primary">Seeker Leads Pipeline</h3>

              {leadsLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Fetching leads pipeline..." />
                </div>
              ) : leads.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No active leads found in pipeline. Enquiries on your managed listings will register here automatically.
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface text-[10px] font-bold text-text-secondary uppercase border-b border-border">
                        <th className="p-4">Seeker Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Current Stage</th>
                        <th className="p-4 text-right">Advance Stage Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-semibold text-text-primary">
                      {leads.map((l) => (
                        <tr key={l._id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4 font-bold">{l.seeker_name}</td>
                          <td className="p-4 text-text-secondary">{l.seeker_phone || l.seeker_email || 'Coordinates on file'}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              l.lead_status === 'converted' ? 'bg-green-100 text-green-700' :
                              l.lead_status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                              l.lead_status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {l.lead_status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {l.lead_status === 'new' && (
                              <button
                                onClick={() => handleLeadStatusChange(l._id, 'contacted')}
                                className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                              >
                                Mark Contacted
                              </button>
                            )}
                            {l.lead_status === 'contacted' && (
                              <>
                                <button
                                  onClick={() => handleLeadStatusChange(l._id, 'converted')}
                                  className="bg-green-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                                >
                                  Mark Converted
                                </button>
                                <button
                                  onClick={() => handleLeadStatusChange(l._id, 'lost')}
                                  className="bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                                >
                                  Mark Lost
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: Commission Accounting */}
          {activeTab === 'commissions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Commission Tracker</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Record commissions for converted deals. Total Earned: <strong className="text-green-600 tabular-nums">₹{totalEarnings.toLocaleString()}</strong>
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsCommModalOpen(true)}>
                  + Log Commission
                </Button>
              </div>

              {commLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading commissions ledger..." />
                </div>
              ) : commissions.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No commission entries recorded. Log commissions for converted leads.
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface text-[10px] font-bold text-text-secondary uppercase border-b border-border">
                        <th className="p-4">Lead ID</th>
                        <th className="p-4">Commission Amount</th>
                        <th className="p-4">Deal Date</th>
                        <th className="p-4">Payment Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-semibold text-text-primary">
                      {commissions.map((c) => (
                        <tr key={c._id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4 font-mono text-[11px]">{c.lead_id}</td>
                          <td className="p-4 font-bold text-green-600 tabular-nums">₹{c.amount?.toLocaleString()}</td>
                          <td className="p-4 text-text-secondary">{c.deal_date || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              c.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {c.payment_status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleCommissionPayment(c._id, c.payment_status)}
                              className="text-xs font-bold text-primary hover:underline"
                            >
                              Toggle {c.payment_status === 'paid' ? 'Pending' : 'Paid'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: AI Client Matcher */}
          {activeTab === 'client-match' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="space-y-4">
                <h3 className="font-bold text-lg text-text-primary">AI Client Matcher</h3>
                <p className="text-xs text-text-secondary">
                  Match client accommodation preferences with regional locality scores and approved inventory using the MoveSmart recommendation engine.
                </p>

                <form onSubmit={handleClientMatchSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Client Monthly Budget (₹)"
                      type="number"
                      value={clientForm.rent_budget}
                      onChange={(e) => setClientForm({ ...clientForm, rent_budget: e.target.value })}
                    />
                    <Input
                      label="Commute Tolerance (mins)"
                      type="number"
                      value={clientForm.commute_tolerance_minutes}
                      onChange={(e) => setClientForm({ ...clientForm, commute_tolerance_minutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Lifestyle Preference</label>
                    <select
                      value={clientForm.lifestyle_pref}
                      onChange={(e) => setClientForm({ ...clientForm, lifestyle_pref: e.target.value })}
                      className="w-full bg-surface border border-border rounded p-2 text-xs text-text-primary"
                    >
                      <option value="quiet">Quiet Residential</option>
                      <option value="vibrant">Vibrant & Commercial</option>
                      <option value="transit">Transit Centric</option>
                    </select>
                  </div>
                  <Button type="submit" variant="primary" loading={matchLoading} className="w-full">
                    Compute Client Recommendations
                  </Button>
                </form>
              </Card>

              {matchResult && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-3">Top Recommended Localities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {matchResult.recommended_localities?.map((loc, idx) => (
                        <LocalityCard key={loc.locality} item={loc} rank={idx + 1} isTop={idx === 0} />
                      ))}
                    </div>
                  </div>

                  {matchResult.matched_properties?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-3">Matched Approved Properties</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchResult.matched_properties.map((prop) => (
                          <ListingCard key={prop._id} listing={prop} onClick={() => navigate(`/listings/${prop._id}`)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Property Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary pb-2 border-b border-border">
              Add Listing for Property Owner
            </h3>
            <ListingForm
              onSubmit={handleCreateSubmit}
              loading={submitting}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary pb-2 border-b border-border">
              Edit Listing: {editingListing.title}
            </h3>
            <ListingForm
              initialValues={editingListing}
              onSubmit={handleEditSubmit}
              loading={submitting}
              onCancel={() => setEditingListing(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deletingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-2">Delete Property Listing?</h3>
            <p className="text-xs text-text-secondary mb-6">
              Are you sure you want to delete <strong>"{deletingListing.title}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeletingListing(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Commission Modal */}
      {isCommModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCommissionSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Log Deal Commission</h3>
            <p className="text-xs text-text-secondary">
              Select a converted lead to record commission earnings.
            </p>
            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Select Converted Lead</label>
              <select
                required
                value={commForm.lead_id}
                onChange={(e) => setCommForm({ ...commForm, lead_id: e.target.value })}
                className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary"
              >
                <option value="">Select a lead...</option>
                {leads.filter(l => l.lead_status === 'converted').map((l) => (
                  <option key={l._id} value={l._id}>{l.seeker_name} (ID: {l._id})</option>
                ))}
              </select>
              {leads.filter(l => l.lead_status === 'converted').length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">No converted leads available. Advance a lead to 'converted' first.</p>
              )}
            </div>
            <Input
              label="Commission Amount (₹)"
              type="number"
              required
              value={commForm.amount}
              onChange={(e) => setCommForm({ ...commForm, amount: e.target.value })}
              placeholder="e.g. 15000"
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsCommModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>Save Commission</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
