// src/pages/OwnerDashboard.jsx — Phase 10: Complete Property Owner SaaS Hub
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getMyListings, createListing, updateListing, deleteListing
} from '../api/listings';
import { getOwnerVisits, updateOwnerVisitStatus } from '../api/ownerVisits';
import StatusBadge from '../components/listings/StatusBadge';
import PropertyImageUploader, { extractPublicIdFromUrl } from '../components/owner/PropertyImageUploader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OwnerAnalytics from '../components/owner/OwnerAnalytics';
import Inbox from './Inbox';
import { getUserDisplayName } from '../utils/user';
import { changePassword, deleteAccount } from '../api/auth';
import {
  HubIcon,
  BrowseIcon,
  MessageIcon,
  CalendarIcon,
  UserIcon,
  CostIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  TrashIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from '../components/common/Icons';

const SIDEBAR_TABS = [
  { id: 'hub', icon: HubIcon, label: 'Dashboard Hub' },
  { id: 'properties', icon: BrowseIcon, label: 'My Properties' },
  { id: 'wizard', icon: CheckCircleIcon, label: 'Add Property' },
  { id: 'analytics', icon: CostIcon, label: 'Analytics' },
  { id: 'visits', icon: CalendarIcon, label: 'Visit Requests' },
  { id: 'inbox', icon: MessageIcon, label: 'Owner Inbox' },
  { id: 'profile', icon: UserIcon, label: 'Account & Profile' },
];

function StatCard({ value, label, icon: IconComponent, color = 'text-primary', trend }) {
  return (
    <Card className="bg-white border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-2">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
          <IconComponent className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-500 border border-rose-200'
          }`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl sm:text-3xl font-black ${color} tabular-nums leading-tight`}>{value}</div>
        <div className="text-xs text-text-secondary font-bold mt-1">{label}</div>
      </div>
    </Card>
  );
}

function VisitStatusBadge({ status }) {
  const map = {
    requested: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${map[status] || 'bg-surface text-text-secondary border-border'}`}>
      {status}
    </span>
  );
}

const WIZARD_STEPS = ['Basic Info', 'Location & Pin', 'Details & Amenities', 'Cloudinary Photos', 'Pricing', 'Preview & Submit'];

function PropertyWizard({ listings, onComplete, initialValues = null }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', deal_type: 'rent', bhk: 2, bathrooms: 2,
    locality: '', address: '', area_sqft: '', floor: '', total_floors: '',
    furnishing: 'Furnished', amenities: [], images: [], coordinates: null,
    price: '', deposit: '', available_from: '',
    description: '', ...(initialValues || {})
  });

  const [pendingImageItems, setPendingImageItems] = useState(() =>
    ((initialValues?.images) || []).map((url, idx) => ({
      id: `existing_${idx}`,
      file: null,
      previewUrl: url,
      isUploaded: true,
      url: url,
    }))
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const amenityOptions = [
    'Lift', 'Car Parking', 'Gym', 'Swimming Pool', 'Power Backup',
    '24x7 Security', 'Gas Pipeline', 'Garden / Park', 'Clubhouse', 'EV Charging',
    'Water Supply 24x7', 'Children Play Area'
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
        bhk: Number(form.bhk) || 2,
        bathrooms: Number(form.bathrooms) || 2,
        price: Number(form.price) || 0,
        deposit: Number(form.deposit) || 0,
        area_sqft: Number(form.area_sqft) || 0,
        floor: Number(form.floor) || 1,
        total_floors: Number(form.total_floors) || 5,
        amenities: Array.isArray(form.amenities) ? form.amenities : [],
        images: Array.isArray(form.images) ? form.images : [],
        status: 'pending_review'
      });
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-surface border border-border rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary transition-colors font-medium';
  const labelCls = 'text-xs font-bold text-text-primary mb-1 block';

  return (
    <div className="max-w-3xl mx-auto font-sans">
      {/* Progress Bar */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex justify-between mb-3 overflow-x-auto gap-2">
          {WIZARD_STEPS.map((s, i) => (
            <button key={s} onClick={() => i < step && setStep(i)}
              className={`text-[9px] font-black uppercase tracking-wider transition-colors whitespace-nowrap px-2.5 py-1 rounded-lg ${
                i === step ? 'bg-primary text-white' : i < step ? 'bg-emerald-50 text-emerald-700 cursor-pointer' : 'text-text-secondary'
              }`}>
              {i < step ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        <div className="h-2 bg-surface border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="bg-white border border-border rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary">Step 1: Basic Property Information</h3>
            <div>
              <label className={labelCls}>Property Title *</label>
              <input className={inputCls} placeholder="e.g. Luxurious 3 BHK Furnished Apartment in Bodakdev" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Deal Type *</label>
                <select className={inputCls} value={form.deal_type} onChange={e => set('deal_type', e.target.value)}>
                  <option value="rent">Rent</option>
                  <option value="buy">Sale / Buy</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>BHK Size *</label>
                <select className={inputCls} value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Bathrooms</label>
                <select className={inputCls} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Bathrooms</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Detailed Property Description</label>
              <textarea className={inputCls} rows={4} placeholder="Highlight key features, society vibe, proximity to metro/schools, and tenant preferences..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 1: Locality & Address */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary">Step 2: Locality & Property Address</h3>
            <div>
              <label className={labelCls}>Locality / Neighborhood Name *</label>
              <input className={inputCls} placeholder="e.g. Bodakdev, Ahmedabad" value={form.locality} onChange={e => set('locality', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Full Property Address *</label>
              <textarea className={inputCls} rows={3} placeholder="e.g. A-502, Orchid Elegance, Opposite Iskcon Temple, SG Highway, Bodakdev, Ahmedabad - 380054" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2: Details & Amenities */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary">Step 3: Property Details & Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Furnishing Status</label>
                <select className={inputCls} value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Furnished">Fully Furnished</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Super Area (sq. ft)</label>
                <input type="number" className={inputCls} placeholder="e.g. 1450" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Floor / Total Floors</label>
                <div className="flex gap-2">
                  <input type="number" className={inputCls} placeholder="Floor" value={form.floor} onChange={e => set('floor', e.target.value)} />
                  <input type="number" className={inputCls} placeholder="Total" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Select Available Amenities</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {amenityOptions.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      (Array.isArray(form.amenities) && form.amenities.includes(a))
                        ? 'bg-[#00ADB5] text-white border-primary shadow-xs'
                        : 'bg-surface border-border text-text-primary hover:border-primary'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cloudinary Photos */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Step 4: Property Photos & Cloudinary Synchronization</h3>
                <p className="text-xs text-text-secondary font-medium">Drag & drop photos or select from computer. Photos are uploaded to Cloudinary and stored in MongoDB.</p>
              </div>
            </div>

            <PropertyImageUploader
              pendingItems={pendingImageItems}
              onPendingItemsChange={(items) => {
                setPendingImageItems(items);
                const cloudUrls = items.filter(it => it.isUploaded && it.url).map(it => it.url);
                set('images', cloudUrls);
              }}
            />
          </div>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary">Step 5: Pricing & Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Monthly Rent / Sale Price (₹) *</label>
                <input type="number" className={inputCls} placeholder="e.g. 24000" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Security Deposit (₹)</label>
                <input type="number" className={inputCls} placeholder="e.g. 48000" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Available From Date</label>
              <input type="date" className={inputCls} value={form.available_from} onChange={e => set('available_from', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 5: Preview & Submit */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary">Step 6: Review & Submit to Admin Queue</h3>
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2 text-xs">
              {[
                ['Property Title', form.title || '—'],
                ['Deal Type', form.deal_type.toUpperCase()],
                ['BHK & Bathrooms', `${form.bhk} BHK • ${form.bathrooms || 2} Baths`],
                ['Locality & Address', `${form.locality || '—'} (${form.address || 'Address provided'})`],
                ['Super Area', form.area_sqft ? `${form.area_sqft} sq. ft` : '—'],
                ['Floor Info', form.floor ? `Floor ${form.floor} of ${form.total_floors || '—'}` : '—'],
                ['Furnishing Status', form.furnishing],
                ['Monthly Rent / Price', form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'],
                ['Security Deposit', form.deposit ? `₹${Number(form.deposit).toLocaleString('en-IN')}` : '—'],
                ['Available From', form.available_from || 'Immediate'],
                ['Cloudinary Photos', Array.isArray(form.images) ? `${form.images.length} photos synced` : '0 photos'],
                ['Amenities', Array.isArray(form.amenities) && form.amenities.length ? form.amenities.join(', ') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-0.5">
                  <span className="text-text-secondary font-semibold">{k}</span>
                  <span className="font-bold text-text-primary text-right">{v}</span>
                </div>
              ))}
            </div>

            {/* Photos Preview */}
            {pendingImageItems && pendingImageItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary block">
                    Property Photos ({pendingImageItems.length})
                  </span>
                  {pendingImageItems.some(it => !it.isUploaded) && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Some photos not yet synced to Cloudinary
                    </span>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {pendingImageItems.map((item, idx) => {
                    const displayPublicId = item.publicId || (item.url ? extractPublicIdFromUrl(item.url) : null);
                    return (
                      <div key={item.id} className="relative flex-shrink-0 w-28 rounded-xl overflow-hidden border shadow-xs bg-slate-900 flex flex-col">
                        <img
                          src={item.previewUrl || item.url}
                          alt={`Property view ${idx + 1}`}
                          className={`w-full h-16 object-cover ${
                            item.isUploaded ? 'border-b border-emerald-400' : 'border-b border-amber-400'
                          }`}
                        />
                        <div className={`p-1 text-white text-[8px] font-bold text-center truncate ${
                          item.isUploaded ? 'bg-emerald-950/90 text-emerald-300' : 'bg-amber-950/90 text-amber-300'
                        }`} title={displayPublicId || 'Local'}>
                          {item.isUploaded ? `ID: ${displayPublicId}` : 'Local'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>After clicking <b>Submit Listing</b>, your property will be saved to MongoDB with status <b>"Pending Approval"</b>. Once approved by Admin, it will be published live!</span>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="font-bold text-xs rounded-xl">
            ← Back
          </Button>
          {step < WIZARD_STEPS.length - 1 ? (
            <Button variant="primary" size="sm" onClick={() => setStep(s => s + 1)} className="font-bold text-xs rounded-xl">
              Next Step →
            </Button>
          ) : (
            <Button variant="primary" size="sm" loading={saving} onClick={handleSubmit} className="font-bold text-xs rounded-xl">
              Submit Property for Approval
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

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Listings
  const [listings, setListings] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);
  const [previewListing, setPreviewListing] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Visits
  const [visits, setVisits] = useState([]);
  const [visitLoading, setVisitLoading] = useState(false);

  // Change Password state
  const [passState, setPassState] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Delete Account state
  const [deletePass, setDeletePass] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passState.old_password || !passState.new_password || !passState.confirm_password) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (passState.new_password !== passState.confirm_password) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    if (passState.new_password.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({
        old_password: passState.old_password,
        new_password: passState.new_password,
      });
      setPassSuccess('Password updated successfully.');
      setPassState({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPassError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePass) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }
    if (!deleteConfirmed) {
      setDeleteError('Please check the confirmation box to proceed.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount({ password: deletePass });
      alert('Your owner account has been permanently deleted.');
      if (logout) logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Account deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch all data
  const fetchListings = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getMyListings();
      setListings(Array.isArray(res.data || res) ? (res.data || res) : []);
    } catch { /* ignore */ }
    finally { setListLoading(false); }
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
    fetchVisits();
  }, [fetchListings, fetchVisits]);

  // Derived stats
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'approved').length,
    pending: listings.filter(l => l.status === 'pending_review').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
    pendingVisits: visits.filter(v => v.status === 'requested').length,
  };

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

  const handleVisitAction = async (visitId, action) => {
    try {
      await updateOwnerVisitStatus(visitId, action);
      fetchVisits();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
  };

  const filteredListings = listings.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch = !searchQ || l.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      l.locality?.toLowerCase().includes(searchQ.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Off-Canvas Mobile Navigation Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Off-Canvas Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 transform ease-in-out md:hidden flex flex-col justify-between ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-border flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#00ADB5] via-teal-400 to-[#00ADB5] shadow-md flex-shrink-0">
                <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block leading-none">
                  Move<span className="text-[#00ADB5]">Smart</span>
                </span>
                <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Owner Portal</span>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-5 py-4 border-b border-border bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-xs">
                {getUserDisplayName(user)[0]?.toUpperCase() || 'O'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-text-primary truncate">Hello, {getUserDisplayName(user)}</p>
                <p className="text-[10px] text-text-secondary font-medium truncate">{user.email}</p>
                <span className="text-[10px] text-[#00ADB5] font-extrabold block mt-0.5">{listings.length} Properties • Owner Account</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {SIDEBAR_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              let badge = null;
              if (tab.id === 'properties') badge = listings.length;
              if (tab.id === 'visits') badge = stats.pendingVisits;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setTab(tab.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-text-primary hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#00ADB5]'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer Logout Button */}
        <div className="p-4 border-t border-border bg-white">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all"
          >
            <XIcon className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#D9D9D9] flex-col justify-between flex-shrink-0 z-20 overflow-y-auto">
        <div>
          <div className="p-5 border-b border-[#D9D9D9] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5] shadow-md flex-shrink-0">
              <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-[#222831] block leading-none">
                Move<span className="text-[#00ADB5]">Smart</span>
              </span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider mt-1">Property Owner Panel</span>
            </div>
          </div>

          {/* User Summary */}
          {user && (
            <div className="px-4 py-3 border-b border-[#D9D9D9] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {user.email?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">{user.email}</p>
                <p className="text-[9px] text-[#00ADB5] font-bold">{listings.length} Properties</p>
              </div>
            </div>
          )}

          <nav className="p-3 space-y-1">
            {SIDEBAR_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              let badge = null;
              if (tab.id === 'properties') badge = listings.length;
              if (tab.id === 'visits') badge = stats.pendingVisits;
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-[#393E46] hover:bg-[#EEEEEE]'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
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
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all">
            <XIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Header Bar with Left Hamburger Menu */}
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* 3-Lines Far-Left Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-text-primary hover:bg-surface border border-border transition-colors flex items-center justify-center"
              title="Open Navigation Menu"
            >
              <MenuIcon className="w-5 h-5 text-[#222831]" />
            </button>

            <h2 className="text-base font-extrabold text-[#222831] truncate">
              {SIDEBAR_TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setTab('wizard')}
            className="whitespace-nowrap flex-shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-xl"
          >
            + Add Property
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#EEEEEE]">
          {/* ── HUB TAB ──────────────────────────────────────────────── */}
          {activeTab === 'hub' && (
            <div className="space-y-6 animate-fade-in font-sans">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#00ADB5] to-teal-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black">Welcome back, {user?.email?.split('@')[0]}</h3>
                  <p className="text-xs opacity-90 mt-1 font-medium">Your Property Owner Management Headquarters</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('wizard')}
                  className="bg-white text-[#222831] hover:bg-[#EEEEEE] font-black text-xs rounded-xl px-4 py-2.5 shadow-sm transition-all flex-shrink-0"
                >
                  + Add New Property
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard value={stats.total} label="Total Properties" icon={HubIcon} color="text-primary" />
                <StatCard value={stats.active} label="Live / Approved" icon={CheckCircleIcon} color="text-emerald-600" />
                <StatCard value={stats.pending} label="Under Review" icon={CalendarIcon} color="text-amber-600" />
                <StatCard value={stats.rejected} label="Rejected" icon={AlertTriangleIcon} color="text-rose-500" />
                <StatCard value={stats.pendingVisits} label="Pending Visits" icon={UserIcon} color="text-blue-600" />
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: CheckCircleIcon, label: 'Add Property', tab: 'wizard', color: 'bg-primary/10 text-primary' },
                    { icon: CalendarIcon, label: 'Review Visits', tab: 'visits', color: 'bg-blue-100 text-blue-700' },
                    { icon: CostIcon, label: 'View Analytics', tab: 'analytics', color: 'bg-purple-100 text-purple-700' },
                  ].map(a => {
                    const ActIcon = a.icon;
                    return (
                      <button key={a.tab} onClick={() => setTab(a.tab)}
                        className="bg-white border border-border rounded-2xl p-4 text-left hover:shadow-md hover:border-primary/40 transition-all group shadow-xs">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${a.color}`}>
                          <ActIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{a.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Properties */}
              {listings.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Recent Properties</h3>
                    <button onClick={() => setTab('properties')} className="text-xs text-primary font-bold hover:underline">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {listings.slice(0, 3).map(l => (
                      <Card key={l._id} className="bg-white border border-border rounded-2xl p-4 space-y-2 shadow-xs">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold text-text-primary truncate">{l.title}</h4>
                          <StatusBadge status={l.status} />
                        </div>
                        <p className="text-xs text-text-secondary font-medium">{l.bhk} BHK · {l.locality} · ₹{l.price?.toLocaleString()}/mo</p>
                        <div className="flex gap-3 text-[10px] text-text-secondary font-semibold pt-1 border-t border-border/50">
                          <span>{l.view_count||0} views</span>
                          <span>{l.enquiry_count||0} enquiries</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROPERTIES TAB ────────────────────────────────────────── */}
          {activeTab === 'properties' && (
            <div className="space-y-5 animate-fade-in font-sans">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-border shadow-xs">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'approved', 'pending_review', 'rejected'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-colors ${
                        statusFilter === s ? 'bg-[#00ADB5] text-white border-primary shadow-xs' : 'bg-surface border-border text-text-secondary hover:border-primary'
                      }`}>
                      {s === 'all' ? 'All' : s === 'pending_review' ? 'Pending Review' : s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${listings.length})` : `(${listings.filter(l => l.status === s).length})`}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Search by title or locality..."
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary outline-none focus:border-primary transition-colors w-full sm:w-64 font-medium"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>

              {listLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading properties..." /></div>
              ) : filteredListings.length === 0 ? (
                <Card className="text-center py-16 bg-white border border-border rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-3 text-primary">
                    <BrowseIcon className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-base text-text-primary mb-1">No Properties Found</h3>
                  <p className="text-xs text-text-secondary mb-5">Add your first property to get started on MoveSmart.</p>
                  <Button variant="primary" size="sm" onClick={() => setTab('wizard')} className="font-bold text-xs rounded-xl">
                    + Add Property
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredListings.map(l => (
                    <Card key={l._id} className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-extrabold text-sm text-text-primary line-clamp-1">{l.title}</h3>
                          <StatusBadge status={l.status} />
                        </div>
                        <p className="text-base font-black text-[#00ADB5]">
                          ₹{l.price?.toLocaleString()} <span className="text-xs text-text-secondary font-semibold">/ mo ({l.deal_type})</span>
                        </p>
                        <p className="text-xs text-text-secondary font-medium">{l.bhk} BHK · {l.locality} {l.area_sqft ? `· ${l.area_sqft} sqft` : ''}</p>
                      </div>

                      {l.status === 'rejected' && l.rejection_reason && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                          <strong>Rejection Reason:</strong> {l.rejection_reason}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button onClick={() => { setEditingListing(l); setTab('wizard'); }}
                          className="flex-1 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 py-1.5 rounded-xl transition-colors">
                          Edit
                        </button>
                        <button onClick={() => { setPreviewListing(l); setSelectedImageIdx(0); }}
                          className="flex-1 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 py-1.5 rounded-xl transition-colors">
                          Preview
                        </button>
                        <button onClick={() => setDeletingListing(l)}
                          className="flex-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 py-1.5 rounded-xl transition-colors">
                          Delete
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── WIZARD TAB ───────────────────────────────────────────── */}
          {activeTab === 'wizard' && (
            <div className="animate-fade-in font-sans space-y-4">
              <h3 className="font-extrabold text-xl text-text-primary">
                {editingListing ? `Edit Property: ${editingListing.title}` : 'Add New Property'}
              </h3>
              <PropertyWizard
                initialValues={editingListing}
                listings={listings}
                onComplete={handleWizardComplete}
              />
            </div>
          )}

          {/* ── ANALYTICS TAB ────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <OwnerAnalytics listings={listings} visits={visits} />
          )}

          {/* ── VISIT REQUESTS TAB ───────────────────────────────────── */}
          {activeTab === 'visits' && (
            <div className="space-y-5 animate-fade-in font-sans">
              {visitLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading visit requests..." /></div>
              ) : visits.length === 0 ? (
                <Card className="text-center py-16 bg-white border border-border rounded-2xl text-xs text-text-secondary">
                  No visit requests yet. They will appear here when seekers request property tours.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visits.map(v => (
                    <Card key={v._id} className="bg-white border border-border rounded-2xl p-4 space-y-3 shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-extrabold text-text-primary">{v.listing?.title || 'Property Visit'}</p>
                          <p className="text-[11px] text-primary font-bold">{v.listing?.locality}</p>
                        </div>
                        <VisitStatusBadge status={v.status} />
                      </div>
                      <p className="text-xs text-text-secondary font-medium">📅 {v.scheduled_date} · ⏰ {v.time_slot}</p>
                      {v.notes && <p className="text-xs italic text-text-secondary bg-surface rounded-xl p-2.5 border border-border/50">"{v.notes}"</p>}
                      {v.status === 'requested' && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <button onClick={() => handleVisitAction(v._id, 'confirmed')}
                            className="flex-1 text-xs font-extrabold py-2 bg-[#00ADB5] text-white rounded-xl hover:bg-teal-600 transition-colors shadow-xs">
                            Confirm Visit
                          </button>
                          <button onClick={() => handleVisitAction(v._id, 'cancelled')}
                            className="flex-1 text-xs font-extrabold py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-xs">
                            Decline
                          </button>
                        </div>
                      )}
                      {v.status === 'confirmed' && (
                        <button onClick={() => handleVisitAction(v._id, 'completed')}
                          className="w-full text-xs font-extrabold py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs">
                          Mark as Completed
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── INBOX TAB ────────────────────────────────────────────── */}
          {activeTab === 'inbox' && (
            <div className="animate-fade-in space-y-4 font-sans">
              <div>
                <h3 className="font-extrabold text-xl text-text-primary">Owner Inbox & Messages</h3>
                <p className="text-xs text-text-secondary font-medium">
                  Real-time chat threads with prospective tenants and relocation seekers.
                </p>
              </div>
              <Inbox />
            </div>
          )}

          {/* ── PROFILE TAB ──────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in font-sans">
              <Card className="bg-white border border-border rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                    {getUserDisplayName(user)[0]?.toUpperCase() || 'O'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-text-primary">Hello, {getUserDisplayName(user)}</h3>
                    <p className="text-xs text-text-secondary font-medium">{user?.email}</p>
                    <span className="text-[10px] font-black text-[#00ADB5] bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">Property Owner</span>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4 space-y-2.5 text-xs">
                  {[
                    ['Email Address', user?.email],
                    ['Account Role', 'Property Owner'],
                    ['Properties Listed', listings.length],
                    ['Account Status', 'Active'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-text-secondary font-medium">{k}</span>
                      <span className="font-extrabold text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Change Password Form */}
              <Card className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
                <h4 className="font-black text-xs text-text-primary uppercase tracking-wider">🔒 Change Password</h4>

                {passError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                    ⚠️ {passError}
                  </div>
                )}
                {passSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                    ✅ {passSuccess}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <Input
                    label="Current / Old Password"
                    type="password"
                    placeholder="Enter current password"
                    value={passState.old_password}
                    onChange={(e) => setPassState({ ...passState, old_password: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={passState.new_password}
                      onChange={(e) => setPassState({ ...passState, new_password: e.target.value })}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={passState.confirm_password}
                      onChange={(e) => setPassState({ ...passState, confirm_password: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" size="md" loading={passLoading} className="font-bold rounded-xl">
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Danger Zone: Account Deletion */}
              <Card className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div>
                  <h4 className="font-black text-xs text-rose-600 uppercase tracking-wider">Danger Zone</h4>
                  <p className="text-xs font-bold text-rose-900 mt-1">Permanent Account Deletion</p>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">
                    Deleting your owner account is permanent and cannot be undone. All your listed properties, analytics, visit requests, and messages will be permanently removed.
                  </p>
                </div>

                {deleteError && (
                  <div className="bg-rose-100 border border-rose-300 text-rose-900 px-3.5 py-2 rounded-xl text-xs font-bold">
                    ⚠️ {deleteError}
                  </div>
                )}

                <form onSubmit={handleDeleteAccount} className="space-y-3">
                  <Input
                    label="Confirm Password to Delete Account"
                    type="password"
                    placeholder="Enter your account password"
                    value={deletePass}
                    onChange={(e) => setDeletePass(e.target.value)}
                  />

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={deleteConfirmed}
                      onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-rose-900 select-none">
                      I understand that deleting my owner account is permanent and all my data will be permanently erased.
                    </span>
                  </label>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="danger"
                      size="md"
                      loading={deleteLoading}
                      disabled={!deletePass || !deleteConfirmed || deleteLoading}
                      className="w-full sm:w-auto font-bold rounded-xl shadow-xs"
                    >
                      🗑️ Delete Account Permanently
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Delete Listing Modal */}
      {deletingListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-text-primary">Delete Property?</h3>
            <p className="text-xs text-text-secondary font-medium">
              Are you sure you want to delete <strong>"{deletingListing.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeletingListing(null)} className="font-bold text-xs rounded-xl">Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm} className="font-bold text-xs rounded-xl">Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Property Preview Modal */}
      {previewListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border flex flex-col font-sans">
            
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#00ADB5] bg-[#00ADB5]/10 px-3 py-1 rounded-full">Property Preview</span>
                <StatusBadge status={previewListing.status} />
              </div>
              <button
                onClick={() => setPreviewListing(null)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-border/60 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                title="Close Modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Image Gallery */}
              {(() => {
                const imgList = (previewListing.images && previewListing.images.length > 0)
                  ? previewListing.images
                  : (previewListing.photos && previewListing.photos.length > 0)
                  ? previewListing.photos
                  : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];
                
                const activeImg = imgList[selectedImageIdx] || imgList[0];

                return (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 border border-border shadow-inner">
                      <img
                        src={activeImg}
                        alt={previewListing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full">
                        📷 {selectedImageIdx + 1} of {imgList.length}
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {imgList.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {imgList.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIdx(idx)}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                              selectedImageIdx === idx ? 'border-[#00ADB5] ring-2 ring-[#00ADB5]/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Title & Key Highlights */}
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text-primary">{previewListing.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-secondary">
                  <span className="text-[#00ADB5] font-extrabold">📍 {previewListing.locality || 'Ahmedabad'}</span>
                  <span>•</span>
                  <span>🏠 {previewListing.bhk || 1} BHK</span>
                  {previewListing.area_sqft && (
                    <>
                      <span>•</span>
                      <span>📐 {previewListing.area_sqft} sqft</span>
                    </>
                  )}
                  {previewListing.furnishing && (
                    <>
                      <span>•</span>
                      <span className="capitalize">🛋️ {previewListing.furnishing}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-[#00ADB5]/5 border border-[#00ADB5]/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#00ADB5]">Monthly Rent</p>
                  <p className="text-2xl font-black text-[#00ADB5]">
                    ₹{previewListing.price?.toLocaleString() || '1,084'} <span className="text-xs font-semibold text-text-secondary">/ month</span>
                  </p>
                </div>
                {previewListing.deposit && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Security Deposit</p>
                    <p className="text-sm font-extrabold text-text-primary">₹{previewListing.deposit?.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {previewListing.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-text-secondary tracking-wider">Property Description</h4>
                  <p className="text-xs text-text-primary leading-relaxed font-medium bg-surface p-3.5 rounded-2xl border border-border/60">
                    {previewListing.description}
                  </p>
                </div>
              )}

              {/* Amenities / Features */}
              {previewListing.amenities && previewListing.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-text-secondary tracking-wider">Amenities & Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewListing.amenities.map((am, i) => (
                      <span key={i} className="text-xs font-bold text-text-primary bg-white border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                        ✨ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Alert if rejected */}
              {previewListing.status === 'rejected' && previewListing.rejection_reason && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 space-y-1">
                  <p className="font-extrabold">⚠️ Listing Rejected by Admin</p>
                  <p className="font-medium">{previewListing.rejection_reason}</p>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-border flex justify-end items-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPreviewListing(null)}
                className="w-full sm:w-auto font-bold rounded-xl text-xs px-6"
              >
                Close Preview
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
