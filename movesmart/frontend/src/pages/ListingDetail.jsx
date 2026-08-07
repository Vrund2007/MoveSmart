// src/pages/ListingDetail.jsx — Listing Detail View (PRD §7.1, Architecture.md §4.1)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing } from '../api/listings';
import { saveListing, removeSavedListing, getSavedListings } from '../api/savedListings';
import { getCostEstimate } from '../api/costOfLiving';
import { createVisit, getVisits, updateVisitStatus } from '../api/visits';
import { sendEnquiry } from '../api/enquiries';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/listings/StatusBadge';
import CostBreakdownTable from '../components/cost/CostBreakdownTable';
import RentPredictionCard from '../components/ml/RentPredictionCard';
import TrustSignalCard from '../components/ml/TrustSignalCard';

import {
  ArrowLeftIcon,
  BookmarkIcon,
  MessageIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon,
} from '../components/common/Icons';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  // Bookmarking state
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auxiliary cost data
  const [costData, setCostData] = useState(null);

  // Visit Scheduling State
  const [listingVisits, setListingVisits] = useState([]);
  const [visitDate, setVisitDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState('10:00 AM');
  const [visitNotes, setVisitNotes] = useState('');
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [visitSuccessMsg, setVisitSuccessMsg] = useState('');
  const [visitErrorMsg, setVisitErrorMsg] = useState('');

  // Enquiry modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState('Hi, I am interested in renting this property. Please share viewing times.');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryErr, setEnquiryErr] = useState('');

  const fetchListingVisits = async () => {
    try {
      const vRes = await getVisits(id);
      const data = vRes.data || vRes;
      if (Array.isArray(data)) {
        setListingVisits(data);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const fetchListingDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getListing(id);
        const data = res.data || res;
        setListing(data);

        // Check if saved
        try {
          const savedRes = await getSavedListings();
          const savedList = savedRes.data || savedRes;
          const match = savedList.find(s => s.listing_id === id || s.listing?._id === id);
          if (match) {
            setIsSaved(true);
            setSavedId(match._id);
          }
        } catch (e) {
          // ignore error
        }

        // Fetch cost of living for this listing's locality
        if (data?.locality) {
          try {
            const rentBudgetForEst = data.deal_type === 'buy' ? 30000 : data.price;
            const cRes = await getCostEstimate(data.locality, rentBudgetForEst);
            setCostData(cRes.data || cRes);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Property listing not found or not approved.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetail();
    fetchListingVisits();
  }, [id]);

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitDate) {
      setVisitErrorMsg('Please select a preferred visit date.');
      return;
    }
    setSchedulingVisit(true);
    setVisitSuccessMsg('');
    setVisitErrorMsg('');

    try {
      await createVisit({
        listing_id: id,
        scheduled_date: visitDate,
        time_slot: visitTimeSlot,
        notes: visitNotes,
      });
      setVisitSuccessMsg('Visit requested successfully! The owner will confirm your appointment.');
      setVisitNotes('');
      fetchListingVisits();
    } catch (err) {
      setVisitErrorMsg(err.response?.data?.message || 'Failed to request visit.');
    } finally {
      setSchedulingVisit(false);
    }
  };

  const handleCancelVisit = async (visitId) => {
    try {
      await updateVisitStatus(visitId, 'cancelled', 'Cancelled by user');
      fetchListingVisits();
    } catch {
      alert('Failed to cancel visit.');
    }
  };

  const handleSendEnquirySubmit = async (e) => {
    if (e) e.preventDefault();
    setEnquirySubmitting(true);
    setEnquiryErr('');
    try {
      await sendEnquiry(id, enquiryMsg);
      setEnquirySent(true);
    } catch (err) {
      setEnquiryErr(err.response?.data?.message || 'Failed to send enquiry message.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      if (isSaved) {
        const targetId = savedId || id;
        await removeSavedListing(targetId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        const res = await saveListing(id);
        const data = res.data || res;
        setIsSaved(true);
        const newSavedId = data._id || data.id || (data.data && data.data._id);
        setSavedId(newSavedId || id);
      }
    } catch (err) {
      console.error('Failed to update bookmark:', err);
      alert('Failed to update bookmark.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
        <LoadingSpinner size="lg" message="Loading property listing details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-6 font-sans">
        <Card className="text-center max-w-md w-full p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-xl font-bold text-text-secondary">
            N/A
          </div>
          <h2 className="text-lg font-bold text-text-primary">Listing Unavailable</h2>
          <p className="text-xs text-text-secondary">{error || 'This listing does not exist or has not been approved.'}</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard?tab=browse')}>
            Return to Browse Listings
          </Button>
        </Card>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-8 font-sans text-[#222831]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Responsive Navigation Bar with Single-Line Labels */}
        <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-xs gap-2">
          <button
            onClick={() => {
              const lastPage = sessionStorage.getItem('last_browse_page') || '1';
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate(`/dashboard?tab=browse&page=${lastPage}`);
              }
            }}
            className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 group px-3 py-2 rounded-xl bg-surface sm:bg-transparent border border-border sm:border-transparent hover:border-border whitespace-nowrap"
          >
            <ArrowLeftIcon className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
            <span>Back<span className="hidden sm:inline"> to Listings</span></span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant={isSaved ? 'secondary' : 'primary'}
              size="sm"
              loading={saving}
              onClick={handleToggleSave}
              className="font-bold text-xs flex items-center gap-1.5 whitespace-nowrap px-3 py-2"
            >
              <BookmarkIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{isSaved ? 'Saved' : 'Save'}<span className="hidden sm:inline">{isSaved ? ' in Bookmarks' : ' Property'}</span></span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEnquiryOpen(true)}
              className="font-bold text-xs flex items-center gap-1.5 whitespace-nowrap px-3 py-2"
            >
              <MessageIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Contact<span className="hidden sm:inline"> Landlord</span></span>
            </Button>
          </div>
        </div>

        {/* Main Property Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photo Gallery & Core Property Specs */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-6 bg-white border border-border shadow-xs rounded-2xl">
              {/* Property Title & Pricing Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3 text-primary" />
                      <span>{listing.locality}</span>
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">{listing.title}</h1>
                  <p className="text-xs text-text-secondary mt-1 font-medium">
                    Deal Type: <strong className="uppercase text-text-primary">{listing.deal_type}</strong> • Data Source: <span className="capitalize">{listing.source}</span>
                  </p>
                </div>

                <div className="sm:text-right bg-surface px-4 py-2.5 rounded-xl border border-border">
                  <span className="block text-2xl font-black text-[#00ADB5] tabular-nums">
                    ₹{listing.price?.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                    {listing.deal_type === 'rent' ? 'Monthly Rent' : 'Total Sale Price'}
                  </span>
                </div>
              </div>

              {/* Photo Gallery with Thumbnail Selector */}
              <div className="space-y-3">
                <div className="h-80 sm:h-96 bg-gray-900 rounded-2xl overflow-hidden border border-border relative group shadow-md">
                  <img
                    src={images[activePhoto]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full">
                    Photo {activePhoto + 1} of {images.length}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(idx)}
                        className={`w-20 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activePhoto === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt="Thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Specification Cards */}
              <div className="grid grid-cols-3 gap-3 border-y border-border py-5">
                <div className="text-center bg-surface p-3.5 rounded-xl border border-border">
                  <span className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Configuration</span>
                  <span className="text-sm font-extrabold text-text-primary">{listing.bhk} BHK</span>
                </div>
                <div className="text-center bg-surface p-3.5 rounded-xl border border-border">
                  <span className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Furnishing</span>
                  <span className="text-sm font-extrabold text-text-primary capitalize">{listing.furnishing || 'Unfurnished'}</span>
                </div>
                <div className="text-center bg-surface p-3.5 rounded-xl border border-border">
                  <span className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Carpet Area</span>
                  <span className="text-sm font-extrabold text-text-primary">{listing.area_sqft ? `${listing.area_sqft} sqft` : 'N/A'}</span>
                </div>
              </div>

              {/* Description Section */}
              {listing.description && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-text-secondary uppercase tracking-wider">Property Description</h4>
                  <p className="text-xs text-text-primary leading-relaxed bg-surface p-4 rounded-xl border border-border">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Amenities Pills */}
              {listing.amenities?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-text-secondary uppercase tracking-wider">Featured Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((a, i) => (
                      <span key={i} className="text-xs font-bold bg-teal-50 text-primary border border-teal-200 px-3 py-1.5 rounded-xl">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* XGBoost Fair Rent Valuation Card */}
            <RentPredictionCard prediction={listing.rent_prediction || listing.predicted_price_range} dealType={listing.deal_type} />
          </div>

          {/* Right Column: Trust Score, Cost of Living, Visit Scheduler & Contact Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Isolation Forest Market Trust Score */}
            <TrustSignalCard trustSignal={listing.trust_score || listing.verification_flags} />

            {/* Locality Cost Breakdown */}
            {costData && (
              <CostBreakdownTable
                breakdown={costData.breakdown}
                locality={costData.locality}
                disclaimer={costData.disclaimer}
              />
            )}

            {/* Property Visit Scheduler Card */}
            {(() => {
              const hasPlatformOwner = Boolean(
                listing?.owner_id || 
                listing?.submitted_by_broker_id || 
                listing?.source === 'landlord_portal'
              );

              return (
                <Card className="space-y-4 bg-white border border-border p-5 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span>Property Visit Scheduler</span>
                    </h4>
                    {hasPlatformOwner ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 border border-emerald-200">
                        <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
                        <span>Verified Owner</span>
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-1 rounded-full uppercase border border-amber-200">
                        Scraped Listing
                      </span>
                    )}
                  </div>

                  {!hasPlatformOwner ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
                      <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Owner Not Registered on Platform</span>
                      </p>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        This property was ingested from public real estate data. Direct online appointment scheduling is unavailable for unverified owners.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-text-secondary font-medium">
                        Schedule an in-person viewing with the verified property representative.
                      </p>

                      {visitSuccessMsg && (
                        <div className="text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{visitSuccessMsg}</span>
                        </div>
                      )}

                      {visitErrorMsg && (
                        <div className="text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
                          <AlertTriangleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>{visitErrorMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleScheduleVisit} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-text-primary block mb-1">Preferred Visit Date</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-medium text-text-primary outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-text-primary block mb-1">Time Slot</label>
                          <select
                            value={visitTimeSlot}
                            onChange={(e) => setVisitTimeSlot(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary"
                          >
                            <option value="10:00 AM">10:00 AM (Morning)</option>
                            <option value="12:00 PM">12:00 PM (Noon)</option>
                            <option value="02:00 PM">02:00 PM (Afternoon)</option>
                            <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                            <option value="06:00 PM">06:00 PM (Evening)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-text-primary block mb-1">Special Requests (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Prefer weekend tour"
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-text-primary outline-none focus:border-primary"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          loading={schedulingVisit}
                          className="w-full font-bold shadow-sm rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Request Property Visit</span>
                        </Button>
                      </form>

                      {/* Scheduled Visits for this Listing */}
                      {listingVisits.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-2">
                          <h5 className="text-[11px] font-extrabold uppercase text-text-secondary tracking-wider">
                            Your Requested Visits ({listingVisits.length})
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                            {listingVisits.map((v) => (
                              <div key={v._id} className="bg-surface border border-border rounded-xl p-3 text-xs flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-text-primary flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                    <span>Date: {v.scheduled_date}</span>
                                    <span className="text-[10px] font-normal text-text-secondary ml-1">({v.time_slot})</span>
                                  </div>
                                  {v.notes && <p className="text-[10px] text-text-secondary italic mt-0.5">{v.notes}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    v.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                    v.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                    v.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {v.status}
                                  </span>
                                  {v.status === 'requested' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelVisit(v._id)}
                                      className="text-[10px] font-bold text-rose-600 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* Direct Messaging Card */}
            {(() => {
              const hasPlatformOwner = Boolean(
                listing?.owner_id || 
                listing?.submitted_by_broker_id || 
                listing?.source === 'landlord_portal'
              );

              return (
                <Card className="space-y-3 bg-white border border-border p-5 rounded-2xl shadow-xs">
                  <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <MessageIcon className="w-4 h-4 text-primary" />
                    <span>Direct Landlord Contact</span>
                  </h4>

                  {!hasPlatformOwner ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs space-y-1">
                      <p className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Owner Not Registered</span>
                      </p>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        This property listing is scraped public data. Direct messaging is unavailable for non-platform owners.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Send an enquiry message to open a direct messaging thread with the verified property representative in your Inbox.
                    </p>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                    onClick={() => setIsEnquiryOpen(true)}
                  >
                    <MessageIcon className="w-3.5 h-3.5" />
                    <span>{hasPlatformOwner ? 'Send Enquiry Message' : 'Listing Information'}</span>
                  </Button>
                </Card>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-border">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <MessageIcon className="w-4 h-4 text-primary" />
                <span>Send Property Enquiry</span>
              </h3>
              <button
                onClick={() => { setIsEnquiryOpen(false); setEnquirySent(false); setEnquiryErr(''); }}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const hasPlatformOwner = Boolean(
                listing?.owner_id || 
                listing?.submitted_by_broker_id || 
                listing?.source === 'landlord_portal'
              );

              if (!hasPlatformOwner) {
                return (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl space-y-1.5">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Scraped Property Listing</span>
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        This property was ingested from public real estate listings. The owner does not have an active MoveSmart account to receive direct inbox messages.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full font-bold"
                      onClick={() => setIsEnquiryOpen(false)}
                    >
                      Close Modal
                    </Button>
                  </div>
                );
              }

              if (enquirySent) {
                return (
                  <div className="bg-teal-50 border border-teal-200 text-primary text-xs p-6 rounded-xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-6 h-6 text-teal-700" />
                    </div>
                    <p className="font-extrabold text-sm text-teal-900">Enquiry Sent & Conversation Started!</p>
                    <p className="text-text-secondary leading-relaxed text-[11px]">
                      A new direct messaging thread has been opened with the property representative.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 font-bold"
                        onClick={() => { setIsEnquiryOpen(false); setEnquirySent(false); }}
                      >
                        Close
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 font-bold flex items-center justify-center gap-1.5"
                        onClick={() => navigate('/dashboard?tab=inbox')}
                      >
                        <MessageIcon className="w-3.5 h-3.5" />
                        <span>Go to Inbox Chat</span>
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <form onSubmit={handleSendEnquirySubmit} className="space-y-4">
                  <p className="text-xs text-text-secondary">
                    Send a direct message for <strong>"{listing.title}"</strong> ({listing.locality}) to start a conversation in your Inbox.
                  </p>

                  {enquiryErr && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{enquiryErr}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-text-primary block mb-1">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-text-primary outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEnquiryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={enquirySubmitting}
                      className="font-bold shadow-sm rounded-xl px-5 flex items-center gap-1.5"
                    >
                      <MessageIcon className="w-3.5 h-3.5" />
                      <span>Send Message & Start Chat</span>
                    </Button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
