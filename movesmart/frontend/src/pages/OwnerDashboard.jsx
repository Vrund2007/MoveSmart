// src/pages/OwnerDashboard.jsx — Phase 10: Complete Property Owner SaaS Hub
// 10-tab dashboard: Hub, Properties, Add/Edit Wizard, Analytics, Visit Requests,
//                   Inbox, Payments, Reviews, Documents, Profile
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getMyListings, createListing, updateListing, deleteListing
} from '../api/listings';
import {
  getPayments, createPayment, updatePayment, deletePayment
} from '../api/payments';
import { getOwnerReviews, replyToReview } from '../api/reviews';
import { getDocuments, uploadDocument, deleteDocument } from '../api/documents';
import { getOwnerVisits, updateOwnerVisitStatus } from '../api/ownerVisits';
import StatusBadge from '../components/listings/StatusBadge';
import ListingForm from '../components/owner/ListingForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ──────────────────────────────────────────────────────────────────────
// HELPERS & SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────────────

const SIDEBAR_TABS = [
  { id: 'hub',       icon: '🏢', label: 'Dashboard Hub'     },
  { id: 'properties',icon: '🏠', label: 'My Properties'     },
  { id: 'wizard',    icon: '➕', label: 'Add Property'      },
  { id: 'analytics', icon: '📊', label: 'Analytics'         },
  { id: 'visits',    icon: '📅', label: 'Visit Requests'    },
  { id: 'inbox',     icon: '💬', label: 'Owner Inbox'       },
  { id: 'payments',  icon: '💰', label: 'Payments & Income' },
  { id: 'reviews',   icon: '⭐', label: 'Tenant Reviews'    },
  { id: 'documents', icon: '📄', label: 'Documents'         },
  { id: 'profile',   icon: '👤', label: 'Account & Profile' },
];

function StatCard({ value, label, icon, color = 'text-primary', trend }) {
  return (
    <Card className="bg-white border border-border py-5 px-4 flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
          }`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <div className={`text-3xl font-extrabold ${color} tabular-nums mt-1`}>{value}</div>
      <div className="text-[10px] text-text-secondary font-bold">{label}</div>
    </Card>
  );
}

function VisitStatusBadge({ status }) {
  const map = {
    requested: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-rose-100 text-rose-600',
  };
  return (
    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${map[status] || 'bg-surface text-text-secondary'}`}>
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────
// WIZARD STEPS
// ──────────────────────────────────────────────────────────────────────
const WIZARD_STEPS = ['Basic Info', 'Location', 'Details', 'Pricing', 'Preview'];

function PropertyWizard({ listings, onComplete, initialValues = null }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', deal_type: 'rent', bhk: 1,
    locality: '', area_sqft: '', floor: '',
    furnishing: 'Unfurnished', amenities: [],
    price: '', deposit: '', available_from: '',
    description: '', ...(initialValues || {})
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const amenityOptions = [
    'Lift', 'Parking', 'Gym', 'Pool', 'Power Backup',
    'Security', 'Water Supply', 'Internet', 'Garden', 'Club House'
  ];
  const toggleAmenity = (a) => {
    const cur = Array.isArray(form.amenities) ? form.amenities : [];
    set('amenities', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onComplete({
        ...form,
        bhk: Number(form.bhk),
        price: Number(form.price),
        area_sqft: Number(form.area_sqft) || undefined,
        deposit: Number(form.deposit) || undefined,
      });
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-primary transition-colors';
  const labelCls = 'text-xs font-bold text-text-primary mb-1 block';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {WIZARD_STEPS.map((s, i) => (
            <button key={s} onClick={() => i < step && setStep(i)}
              className={`text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
                i === step ? 'text-primary' : i < step ? 'text-emerald-600 cursor-pointer' : 'text-text-secondary'
              }`}>
              {i < step ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        <div className="h-1.5 bg-surface border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="bg-white border border-border space-y-5">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <h3 className="font-bold text-base text-text-primary">Basic Information</h3>
            <div>
              <label className={labelCls}>Property Title *</label>
              <input className={inputCls} placeholder="e.g. Spacious 2 BHK in Vastrapur" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Deal Type *</label>
                <select className={inputCls} value={form.deal_type} onChange={e => set('deal_type', e.target.value)}>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>BHK *</label>
                <select className={inputCls} value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} placeholder="Describe your property..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <>
            <h3 className="font-bold text-base text-text-primary">Location Details</h3>
            <div>
              <label className={labelCls}>Locality *</label>
              <input className={inputCls} placeholder="e.g. Vastrapur" value={form.locality} onChange={e => set('locality', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Floor Number</label>
                <input type="number" className={inputCls} placeholder="e.g. 3" value={form.floor} onChange={e => set('floor', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Area (sq ft)</label>
                <input type="number" className={inputCls} placeholder="e.g. 900" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Details & Amenities */}
        {step === 2 && (
          <>
            <h3 className="font-bold text-base text-text-primary">Property Details</h3>
            <div>
              <label className={labelCls}>Furnishing Status</label>
              <div className="flex flex-wrap gap-2">
                {['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'].map(f => (
                  <button key={f} type="button" onClick={() => set('furnishing', f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                      form.furnishing === f ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-primary hover:border-primary'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-colors ${
                      (Array.isArray(form.amenities) && form.amenities.includes(a))
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-surface border-border text-text-primary hover:border-primary'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <>
            <h3 className="font-bold text-base text-text-primary">Pricing & Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Monthly Rent / Price (₹) *</label>
                <input type="number" className={inputCls} placeholder="e.g. 18000" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Security Deposit (₹)</label>
                <input type="number" className={inputCls} placeholder="e.g. 50000" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Available From</label>
              <input type="date" className={inputCls} value={form.available_from} onChange={e => set('available_from', e.target.value)} />
            </div>
          </>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <>
            <h3 className="font-bold text-base text-text-primary">Review & Submit</h3>
            <div className="bg-surface border border-border rounded-lg p-4 space-y-2 text-xs">
              {[
                ['Title', form.title], ['Deal Type', form.deal_type], ['BHK', `${form.bhk} BHK`],
                ['Locality', form.locality], ['Area', form.area_sqft ? `${form.area_sqft} sq ft` : '—'],
                ['Furnishing', form.furnishing], ['Price', form.price ? `₹${Number(form.price).toLocaleString()}` : '—'],
                ['Deposit', form.deposit ? `₹${Number(form.deposit).toLocaleString()}` : '—'],
                ['Available From', form.available_from || '—'],
                ['Amenities', Array.isArray(form.amenities) && form.amenities.length ? form.amenities.join(', ') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-text-secondary font-semibold">{k}</span>
                  <span className="font-bold text-text-primary text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-medium">
              ⚠️ After submission, your listing will be sent for Admin review before it is published on MoveSmart.
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← Back
          </Button>
          {step < WIZARD_STEPS.length - 1 ? (
            <Button variant="primary" size="sm" onClick={() => setStep(s => s + 1)}>
              Next →
            </Button>
          ) : (
            <Button variant="primary" size="sm" loading={saving} onClick={handleSubmit}>
              Submit Listing
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ──────────────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'hub';
  const setTab = (t) => setSearchParams({ tab: t });

  // Listings
  const [listings, setListings]     = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Payments
  const [paymentData, setPaymentData]   = useState({ payments: [], summary: {} });
  const [payLoading, setPayLoading]     = useState(false);
  const [showPayForm, setShowPayForm]   = useState(false);
  const [editPayment, setEditPayment]   = useState(null);
  const [payForm, setPayForm] = useState({
    property_id: '', tenant_name: '', amount: '',
    payment_date: '', payment_status: 'received',
    payment_method: 'bank_transfer', notes: ''
  });

  // Reviews
  const [reviewData, setReviewData]   = useState({ reviews: [], average_rating: 0 });
  const [reviewLoading, setRevLoading] = useState(false);
  const [replyText, setReplyText]     = useState({});

  // Documents
  const [documents, setDocuments]    = useState([]);
  const [docLoading, setDocLoading]  = useState(false);
  const [docForm, setDocForm]        = useState({ property_id: '', title: '', doc_type: 'other', file_url: '', notes: '' });
  const [showDocForm, setShowDocForm] = useState(false);

  // Visits
  const [visits, setVisits]           = useState([]);
  const [visitLoading, setVisitLoading] = useState(false);

  // Fetch all data
  const fetchListings = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getMyListings();
      setListings(Array.isArray(res.data || res) ? (res.data || res) : []);
    } catch { /* ignore */ }
    finally { setListLoading(false); }
  }, []);

  const fetchPayments = useCallback(async () => {
    setPayLoading(true);
    try {
      const res = await getPayments();
      setPaymentData(res.data || res || { payments: [], summary: {} });
    } catch { /* ignore */ }
    finally { setPayLoading(false); }
  }, []);

  const fetchReviews = useCallback(async () => {
    setRevLoading(true);
    try {
      const res = await getOwnerReviews();
      setReviewData(res.data || res || { reviews: [], average_rating: 0 });
    } catch { /* ignore */ }
    finally { setRevLoading(false); }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setDocLoading(true);
    try {
      const res = await getDocuments();
      const data = res.data || res;
      setDocuments(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setDocLoading(false); }
  }, []);

  const fetchVisits = useCallback(async () => {
    setVisitLoading(true);
    try {
      const res = await getOwnerVisits();
      const data = res.data || res;
      setVisits(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setVisitLoading(false); }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchPayments();
    fetchReviews();
    fetchDocuments();
    fetchVisits();
  }, [fetchListings, fetchPayments, fetchReviews, fetchDocuments, fetchVisits]);

  // Derived stats
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'approved').length,
    pending: listings.filter(l => l.status === 'pending_review').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
    pendingVisits: visits.filter(v => v.status === 'requested').length,
    totalRevenue: paymentData?.summary?.total_received || 0,
    pendingPayments: paymentData?.summary?.pending || 0,
    avgRating: reviewData?.average_rating || 0,
  };

  // Listing helpers
  const handleWizardComplete = async (formData) => {
    try {
      if (editingListing) {
        await updateListing(editingListing._id, formData);
        setEditingListing(null);
      } else {
        await createListing(formData);
        setTab('properties');
      }
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save listing.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;
    try {
      await deleteListing(deletingListing._id);
      setDeletingListing(null);
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Payment helpers
  const handlePaymentSave = async () => {
    try {
      if (editPayment) {
        await updatePayment(editPayment._id, payForm);
        setEditPayment(null);
      } else {
        await createPayment({ ...payForm, amount: Number(payForm.amount) });
      }
      setShowPayForm(false);
      setPayForm({ property_id: '', tenant_name: '', amount: '', payment_date: '', payment_status: 'received', payment_method: 'bank_transfer', notes: '' });
      fetchPayments();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save payment.'); }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try { await deletePayment(id); fetchPayments(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  // Review helpers
  const handleReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    try {
      await replyToReview(reviewId, text);
      setReplyText(r => ({ ...r, [reviewId]: '' }));
      fetchReviews();
    } catch (err) { alert(err.response?.data?.message || 'Failed to reply.'); }
  };

  // Document helpers
  const handleDocUpload = async () => {
    try {
      await uploadDocument(docForm);
      setDocForm({ property_id: '', title: '', doc_type: 'other', file_url: '', notes: '' });
      setShowDocForm(false);
      fetchDocuments();
    } catch (err) { alert(err.response?.data?.message || 'Failed to upload.'); }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Remove this document?')) return;
    try { await deleteDocument(id); fetchDocuments(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  // Visit helpers
  const handleVisitAction = async (visitId, action) => {
    try {
      await updateOwnerVisitStatus(visitId, action);
      fetchVisits();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch = !searchQ || l.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      l.locality?.toLowerCase().includes(searchQ.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const inputCls = 'w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-primary transition-colors';
  const labelCls = 'text-xs font-bold text-text-primary mb-1 block';

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20 overflow-y-auto">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl">🏢</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Property Owner Panel</span>
            </div>
          </div>

          {/* User Summary */}
          {user && (
            <div className="px-4 py-3 border-b border-[#D9D9D9] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {user.email?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">{user.email}</p>
                <p className="text-[9px] text-text-secondary">{listings.length} Properties</p>
              </div>
            </div>
          )}

          <nav className="p-3 space-y-0.5">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              let badge = null;
              if (tab.id === 'properties') badge = listings.length;
              if (tab.id === 'visits') badge = stats.pendingVisits;
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-sm' : 'text-[#393E46] hover:bg-[#EEEEEE]'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
                    }`}>{badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#D9D9D9]">
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-base font-bold text-[#222831]">
            {SIDEBAR_TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <Button variant="primary" size="sm" onClick={() => setTab('wizard')}>+ Add Property</Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#EEEEEE]">

          {/* ── HUB ──────────────────────────────────────────────────── */}
          {activeTab === 'hub' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#00ADB5] to-teal-600 rounded-xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold">Welcome, {user?.email?.split('@')[0]} 👋</h3>
                  <p className="text-sm opacity-90 mt-1">Your property management headquarters.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setTab('wizard')}
                  className="bg-white text-primary font-bold border-0">
                  + Add New Property
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard value={stats.total}         label="Total Properties"   icon="🏘️" color="text-primary" />
                <StatCard value={stats.active}        label="Live / Approved"    icon="✅" color="text-emerald-600" />
                <StatCard value={stats.pending}       label="Under Review"       icon="🔄" color="text-amber-600" />
                <StatCard value={stats.rejected}      label="Rejected"           icon="❌" color="text-rose-500" />
                <StatCard value={stats.pendingVisits} label="Pending Visits"     icon="📅" color="text-blue-600" />
                <StatCard value={`₹${stats.totalRevenue.toLocaleString()}`} label="Total Revenue Logged" icon="💰" color="text-teal-600" />
                <StatCard value={`₹${stats.pendingPayments.toLocaleString()}`} label="Pending Payments"  icon="⏳" color="text-orange-500" />
                <StatCard value={stats.avgRating > 0 ? `${stats.avgRating} ★` : '—'} label="Avg Tenant Rating"  icon="⭐" color="text-yellow-500" />
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: '➕', label: 'Add Property', tab: 'wizard', color: 'bg-primary/10 text-primary' },
                    { icon: '📅', label: 'Review Visits', tab: 'visits', color: 'bg-blue-100 text-blue-700' },
                    { icon: '💰', label: 'Log Payment', tab: 'payments', color: 'bg-teal-100 text-teal-700' },
                    { icon: '📊', label: 'View Analytics', tab: 'analytics', color: 'bg-purple-100 text-purple-700' },
                  ].map(a => (
                    <button key={a.tab} onClick={() => setTab(a.tab)}
                      className="bg-white border border-border rounded-xl p-4 text-left hover:shadow-md hover:border-primary/40 transition-all group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${a.color}`}>{a.icon}</div>
                      <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Properties */}
              {listings.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Recent Properties</h3>
                    <button onClick={() => setTab('properties')} className="text-xs text-primary font-bold hover:underline">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {listings.slice(0, 3).map(l => (
                      <Card key={l._id} className="bg-white border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-text-primary truncate">{l.title}</h4>
                          <StatusBadge status={l.status} />
                        </div>
                        <p className="text-[10px] text-text-secondary">{l.bhk} BHK · {l.locality} · ₹{l.price?.toLocaleString()}/mo</p>
                        <p className="text-[10px] text-text-secondary">👁 {l.view_count||0} views · ✉️ {l.enquiry_count||0} enquiries</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Visit Requests */}
              {visits.filter(v => v.status === 'requested').length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Pending Visit Requests</h3>
                    <button onClick={() => setTab('visits')} className="text-xs text-primary font-bold hover:underline">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visits.filter(v => v.status === 'requested').slice(0, 3).map(v => (
                      <Card key={v._id} className="bg-white border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-text-primary truncate">{v.listing?.locality || 'Property'}</span>
                          <VisitStatusBadge status={v.status} />
                        </div>
                        <p className="text-[10px] text-text-secondary">📅 {v.scheduled_date} · {v.time_slot}</p>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleVisitAction(v._id, 'confirmed')}
                            className="flex-1 text-[9px] font-bold py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => handleVisitAction(v._id, 'cancelled')}
                            className="flex-1 text-[9px] font-bold py-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">
                            Decline
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROPERTIES ───────────────────────────────────────────── */}
          {activeTab === 'properties' && (
            <div className="space-y-5 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'approved', 'pending_review', 'rejected'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
                        statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-secondary hover:border-primary'
                      }`}>
                      {s === 'all' ? 'All' : s === 'pending_review' ? 'Pending Review' : s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${listings.length})` : `(${listings.filter(l => l.status === s).length})`}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="🔍 Search by title or locality..."
                  className="bg-white border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-primary transition-colors w-full sm:w-60"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>

              {listLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading properties..." /></div>
              ) : filteredListings.length === 0 ? (
                <Card className="text-center py-16 bg-white border border-border">
                  <span className="text-5xl mb-4 block">🏢</span>
                  <h3 className="font-bold text-lg text-text-primary mb-2">No Properties Found</h3>
                  <p className="text-xs text-text-secondary mb-6">Add your first property to get started.</p>
                  <Button variant="primary" onClick={() => setTab('wizard')}>+ Add Property</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredListings.map(l => (
                    <Card key={l._id} className="bg-white border border-border flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-text-primary line-clamp-1">{l.title}</h3>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="text-sm font-bold text-primary">₹{l.price?.toLocaleString()} <span className="text-xs text-text-secondary font-normal">/ mo ({l.deal_type})</span></p>
                      <p className="text-xs text-text-secondary">{l.bhk} BHK · {l.locality} {l.area_sqft ? `· ${l.area_sqft} sqft` : ''}</p>
                      <div className="flex gap-4 text-[10px] text-text-secondary">
                        <span>👁 {l.view_count || 0} views</span>
                        <span>✉️ {l.enquiry_count || 0} enquiries</span>
                      </div>
                      {l.status === 'rejected' && l.rejection_reason && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
                          <strong>Rejection Reason:</strong> {l.rejection_reason}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button onClick={() => { setEditingListing(l); setTab('wizard'); }}
                          className="flex-1 text-xs font-bold text-primary hover:bg-primary/5 py-1.5 rounded-md transition-colors">Edit</button>
                        <button onClick={() => navigate(`/listings/${l._id}`)}
                          className="flex-1 text-xs font-bold text-teal-600 hover:bg-teal-50 py-1.5 rounded-md transition-colors">Preview</button>
                        <button onClick={() => setDeletingListing(l)}
                          className="flex-1 text-xs font-bold text-rose-500 hover:bg-rose-50 py-1.5 rounded-md transition-colors">Delete</button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── WIZARD ───────────────────────────────────────────────── */}
          {activeTab === 'wizard' && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-lg text-text-primary mb-6">
                {editingListing ? `Edit Property: ${editingListing.title}` : 'Add New Property'}
              </h3>
              <PropertyWizard
                initialValues={editingListing}
                listings={listings}
                onComplete={handleWizardComplete}
              />
            </div>
          )}

          {/* ── ANALYTICS ────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard value={listings.reduce((s, l) => s + (l.view_count || 0), 0)}      label="Total Views"     icon="👁" color="text-primary" />
                <StatCard value={listings.reduce((s, l) => s + (l.enquiry_count || 0), 0)}   label="Total Enquiries" icon="✉️" color="text-teal-600" />
                <StatCard value={visits.length}   label="Total Visit Requests" icon="📅" color="text-blue-600" />
                <StatCard value={stats.avgRating > 0 ? `${stats.avgRating} ★` : '—'} label="Avg Rating" icon="⭐" color="text-yellow-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {listings.map(l => (
                  <Card key={l._id} className="bg-white border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-text-primary">{l.title}</h4>
                        <p className="text-[10px] text-text-secondary">{l.locality} · ₹{l.price?.toLocaleString()}/mo</p>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Views', value: l.view_count || 0, color: 'text-primary' },
                        { label: 'Enquiries', value: l.enquiry_count || 0, color: 'text-teal-600' },
                        { label: 'Visits', value: visits.filter(v => v.listing_id === l._id).length, color: 'text-blue-600' },
                      ].map(m => (
                        <div key={m.label} className="text-center bg-surface rounded-lg py-3 border border-border">
                          <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
                          <div className="text-[9px] text-text-secondary font-bold mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                {listings.length === 0 && (
                  <Card className="text-center py-12 col-span-2 text-xs text-text-secondary bg-white border border-border">
                    No properties to show analytics for.
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ── VISIT REQUESTS ───────────────────────────────────────── */}
          {activeTab === 'visits' && (
            <div className="space-y-5 animate-fade-in">
              {visitLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading visit requests..." /></div>
              ) : visits.length === 0 ? (
                <Card className="text-center py-12 bg-white border border-border text-xs text-text-secondary">
                  No visit requests yet. They will appear here when seekers request property tours.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visits.map(v => (
                    <Card key={v._id} className="bg-white border border-border space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{v.listing?.title || 'Property Visit'}</p>
                          <p className="text-[10px] text-text-secondary">{v.listing?.locality}</p>
                        </div>
                        <VisitStatusBadge status={v.status} />
                      </div>
                      <p className="text-[10px] text-text-secondary">📅 {v.scheduled_date} · ⏰ {v.time_slot}</p>
                      {v.notes && <p className="text-[10px] italic text-text-secondary bg-surface rounded p-2">"{v.notes}"</p>}
                      {v.status === 'requested' && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <button onClick={() => handleVisitAction(v._id, 'confirmed')}
                            className="flex-1 text-xs font-bold py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">✓ Confirm</button>
                          <button onClick={() => handleVisitAction(v._id, 'cancelled')}
                            className="flex-1 text-xs font-bold py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">✗ Decline</button>
                        </div>
                      )}
                      {v.status === 'confirmed' && (
                        <button onClick={() => handleVisitAction(v._id, 'completed')}
                          className="w-full text-xs font-bold py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Mark as Completed</button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── INBOX (Owner) ─────────────────────────────────────────── */}
          {activeTab === 'inbox' && (
            <div className="animate-fade-in">
              <Card className="bg-white border border-border py-12 text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="font-bold text-lg text-text-primary">Owner Inbox</h3>
                <p className="text-xs text-text-secondary mt-2 max-w-sm mx-auto">
                  Messaging between seekers and property owners is handled through the shared conversation module. Conversations appear when seekers contact you from your listings.
                </p>
              </Card>
            </div>
          )}

          {/* ── PAYMENTS ─────────────────────────────────────────────── */}
          {activeTab === 'payments' && (
            <div className="space-y-5 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard value={`₹${(paymentData?.summary?.total_received || 0).toLocaleString()}`} label="Total Received" icon="💰" color="text-emerald-600" />
                <StatCard value={`₹${(paymentData?.summary?.pending || 0).toLocaleString()}`} label="Pending" icon="⏳" color="text-amber-500" />
                <StatCard value={(paymentData?.payments || []).length} label="Total Records" icon="📋" color="text-primary" />
              </div>

              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-text-primary">Payment Records</h3>
                <Button variant="primary" size="sm" onClick={() => setShowPayForm(true)}>+ Log Payment</Button>
              </div>

              {/* Payment Form */}
              {(showPayForm || editPayment) && (
                <Card className="bg-white border border-border space-y-4">
                  <h4 className="font-bold text-sm text-text-primary">{editPayment ? 'Edit Payment' : 'Log New Payment'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Property</label>
                      <select className={inputCls} value={payForm.property_id} onChange={e => setPayForm(f => ({ ...f, property_id: e.target.value }))}>
                        <option value="">Select property...</option>
                        {listings.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tenant Name</label>
                      <input className={inputCls} placeholder="Tenant name" value={payForm.tenant_name} onChange={e => setPayForm(f => ({ ...f, tenant_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Amount (₹)</label>
                      <input type="number" className={inputCls} placeholder="e.g. 18000" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Payment Date</label>
                      <input type="date" className={inputCls} value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select className={inputCls} value={payForm.payment_status} onChange={e => setPayForm(f => ({ ...f, payment_status: e.target.value }))}>
                        {['received', 'pending', 'overdue', 'refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Method</label>
                      <select className={inputCls} value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
                        {['bank_transfer', 'cash', 'upi', 'cheque', 'other'].map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <input className={inputCls} placeholder="Optional notes..." value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => { setShowPayForm(false); setEditPayment(null); }}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handlePaymentSave}>Save Payment</Button>
                  </div>
                </Card>
              )}

              {payLoading ? (
                <LoadingSpinner size="md" message="Loading payments..." />
              ) : (paymentData?.payments || []).length === 0 ? (
                <Card className="text-center py-12 bg-white border border-border text-xs text-text-secondary">
                  No payment records yet. Use the button above to log your first payment.
                </Card>
              ) : (
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        {['Property', 'Tenant', 'Amount', 'Date', 'Status', 'Method', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-extrabold text-text-secondary uppercase tracking-wider text-[9px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(paymentData?.payments || []).map(p => {
                        const listing = listings.find(l => l._id === p.property_id);
                        return (
                          <tr key={p._id} className="hover:bg-surface/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-text-primary truncate max-w-[120px]">{listing?.title || p.property_id}</td>
                            <td className="px-4 py-3 text-text-secondary">{p.tenant_name}</td>
                            <td className="px-4 py-3 font-bold text-primary">₹{Number(p.amount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-text-secondary">{p.payment_date}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                p.payment_status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                p.payment_status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                                p.payment_status === 'overdue'  ? 'bg-rose-100 text-rose-600' :
                                'bg-surface text-text-secondary'
                              }`}>{p.payment_status}</span>
                            </td>
                            <td className="px-4 py-3 text-text-secondary capitalize">{(p.payment_method || '').replace('_', ' ')}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setEditPayment(p); setPayForm({ ...p }); }}
                                  className="text-primary hover:underline font-bold">Edit</button>
                                <button onClick={() => handleDeletePayment(p._id)}
                                  className="text-rose-500 hover:underline font-bold">Del</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ──────────────────────────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-extrabold text-primary">{reviewData?.average_rating || '—'}</div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Average Rating</p>
                  <p className="text-xs text-text-secondary">{(reviewData?.reviews || []).length} review(s) across all properties</p>
                </div>
              </div>

              {reviewLoading ? (
                <LoadingSpinner size="md" message="Loading reviews..." />
              ) : (reviewData?.reviews || []).length === 0 ? (
                <Card className="text-center py-12 bg-white border border-border text-xs text-text-secondary">
                  No tenant reviews yet.
                </Card>
              ) : (
                <div className="space-y-4">
                  {(reviewData?.reviews || []).map(r => (
                    <Card key={r._id} className="bg-white border border-border space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-text-primary">{r.tenant_name}</p>
                          <p className="text-[10px] text-text-secondary">{r.listing?.locality || r.property_id}</p>
                        </div>
                        <div className="text-sm font-extrabold text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed">{r.review}</p>
                      {r.owner_reply && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <p className="text-[9px] font-extrabold text-primary uppercase mb-1">Owner Reply</p>
                          <p className="text-xs text-text-primary">{r.owner_reply}</p>
                        </div>
                      )}
                      {!r.owner_reply && (
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary transition-colors"
                            placeholder="Write a reply..."
                            value={replyText[r._id] || ''}
                            onChange={e => setReplyText(t => ({ ...t, [r._id]: e.target.value }))}
                          />
                          <Button variant="primary" size="sm" onClick={() => handleReply(r._id)}>Reply</Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENTS ────────────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-text-primary">Property Documents ({documents.length})</h3>
                <Button variant="primary" size="sm" onClick={() => setShowDocForm(v => !v)}>
                  {showDocForm ? 'Cancel' : '+ Add Document'}
                </Button>
              </div>

              {showDocForm && (
                <Card className="bg-white border border-border space-y-4">
                  <h4 className="font-bold text-sm text-text-primary">Add Document Metadata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Property</label>
                      <select className={inputCls} value={docForm.property_id} onChange={e => setDocForm(f => ({ ...f, property_id: e.target.value }))}>
                        <option value="">Select property...</option>
                        {listings.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Document Title</label>
                      <input className={inputCls} placeholder="e.g. Title Deed 2023" value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Document Type</label>
                      <select className={inputCls} value={docForm.doc_type} onChange={e => setDocForm(f => ({ ...f, doc_type: e.target.value }))}>
                        {['title_deed', 'property_tax', 'ownership_proof', 'electricity_bill', 'water_bill', 'other'].map(d => (
                          <option key={d} value={d}>{d.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>File URL / Drive Link</label>
                      <input className={inputCls} placeholder="https://drive.google.com/..." value={docForm.file_url} onChange={e => setDocForm(f => ({ ...f, file_url: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <input className={inputCls} placeholder="Optional notes..." value={docForm.notes} onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleDocUpload}>Save Document</Button>
                  </div>
                </Card>
              )}

              {docLoading ? (
                <LoadingSpinner size="md" message="Loading documents..." />
              ) : documents.length === 0 ? (
                <Card className="text-center py-12 bg-white border border-border text-xs text-text-secondary">
                  No documents added yet. Use the button above to track property documents.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map(d => {
                    const listing = listings.find(l => l._id === d.property_id);
                    return (
                      <Card key={d._id} className="bg-white border border-border space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-sm text-text-primary">{d.title}</p>
                            <p className="text-[10px] text-text-secondary">{listing?.title || d.property_id}</p>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-surface border border-border rounded-full text-text-secondary uppercase">
                            {(d.doc_type || 'other').replace('_', ' ')}
                          </span>
                        </div>
                        {d.notes && <p className="text-[10px] text-text-secondary italic">"{d.notes}"</p>}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          {d.file_url && (
                            <a href={d.file_url} target="_blank" rel="noreferrer"
                              className="flex-1 text-center text-xs font-bold text-primary hover:bg-primary/5 py-1.5 rounded-md transition-colors">
                              View / Download
                            </a>
                          )}
                          <button onClick={() => handleDeleteDoc(d._id)}
                            className="flex-1 text-xs font-bold text-rose-500 hover:bg-rose-50 py-1.5 rounded-md transition-colors">
                            Delete
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
              <Card className="bg-white border border-border space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    {user?.email?.[0]?.toUpperCase() || 'O'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">{user?.email}</h3>
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Property Owner</span>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                  {[
                    ['Email', user?.email],
                    ['Account Type', 'Property Owner'],
                    ['Properties Listed', listings.length],
                    ['Account Status', 'Active'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-text-secondary font-medium">{k}</span>
                      <span className="font-bold text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-white border border-border space-y-3">
                <h4 className="font-bold text-sm text-text-primary">Security</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 font-medium">
                  🔒 To reset your password, log out and use the Forgot Password flow on the login page.
                </div>
              </Card>
              <Card className="bg-white border border-rose-200 space-y-3">
                <h4 className="font-bold text-sm text-rose-600">Danger Zone</h4>
                <p className="text-xs text-rose-700">Deleting your account removes all your properties and records permanently.</p>
                <Button variant="danger" size="sm" onClick={() => alert('Contact support@movesmart.in to request account deletion.')}>
                  Request Account Deletion
                </Button>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* Delete Listing Modal */}
      {deletingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-text-primary mb-2">Delete Property?</h3>
            <p className="text-xs text-text-secondary mb-6">
              Are you sure you want to delete <strong>"{deletingListing.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeletingListing(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
