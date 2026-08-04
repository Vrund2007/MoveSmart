// src/pages/ListingDetail.jsx — Listing Detail View (PRD §7.1, Architecture.md §4.1)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing } from '../api/listings';
import { saveListing, removeSavedListing, getSavedListings } from '../api/savedListings';
import { getCostEstimate } from '../api/costOfLiving';
import { getCommuteEstimate } from '../api/commute';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/listings/StatusBadge';
import CostBreakdownTable from '../components/cost/CostBreakdownTable';
import CommutePanel from '../components/commute/CommutePanel';
import RentPredictionCard from '../components/ml/RentPredictionCard';
import TrustSignalCard from '../components/ml/TrustSignalCard';

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

  // Auxiliary data
  const [costData, setCostData] = useState(null);
  const [commuteData, setCommuteData] = useState(null);
  const [commuteError, setCommuteError] = useState('');

  // Enquiry modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

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
            const cRes = await getCostEstimate(data.locality, data.price);
            setCostData(cRes.data || cRes);
          } catch (e) {
            // ignore
          }

          // Fetch commute estimate
          try {
            const cmRes = await getCommuteEstimate(data.locality, 'SG Highway, Ahmedabad');
            setCommuteData(cmRes.data || cmRes);
          } catch (e) {
            setCommuteError('Commute data temporarily unavailable.');
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Property listing not found or not approved.');
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetail();
  }, [id]);

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      if (isSaved && savedId) {
        await removeSavedListing(savedId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        const res = await saveListing(id);
        const data = res.data || res;
        setIsSaved(true);
        setSavedId(data._id);
      }
    } catch (err) {
      alert('Failed to update bookmark.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEEEEE] flex justify-center items-center">
        <LoadingSpinner size="lg" message="Loading property listing details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center p-6">
        <Card className="text-center max-w-md w-full">
          <span className="text-4xl block mb-2">🏠</span>
          <h2 className="text-lg font-bold text-text-primary mb-1">Listing Unavailable</h2>
          <p className="text-xs text-text-secondary mb-6">{error || 'This listing does not exist or has not been approved.'}</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard?tab=browse')}>
            Return to Browse Listings
          </Button>
        </Card>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="min-h-screen bg-[#EEEEEE] py-8 px-6 font-sans text-[#222831]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard?tab=browse')}
            className="text-xs font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            ← Back to Listings
          </button>
          <div className="flex gap-2">
            <Button
              variant={isSaved ? 'secondary' : 'primary'}
              size="sm"
              loading={saving}
              onClick={handleToggleSave}
            >
              {isSaved ? '★ Saved in Bookmarks' : '☆ Save Listing'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsEnquiryOpen(true)}>
              Contact / Enquiry
            </Button>
          </div>
        </div>

        {/* Main Listing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Property Card & Specs */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{listing.locality}</span>
                    <StatusBadge status={listing.status} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-text-primary">{listing.title}</h1>
                  <p className="text-xs text-text-secondary mt-1">
                    Deal Type: <strong className="uppercase">{listing.deal_type}</strong> • Source: {listing.source}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-extrabold text-text-primary tabular-nums">
                    ₹{listing.price?.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Monthly Rent</span>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-3">
                <div className="h-80 bg-gray-100 rounded-xl overflow-hidden border border-border">
                  <img src={images[activePhoto]} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(idx)}
                        className={`w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activePhoto === idx ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 border-y border-border py-4 text-xs font-bold text-text-primary">
                <div className="text-center bg-surface p-3 rounded-lg border border-border">
                  <span className="block text-[10px] text-text-secondary font-semibold mb-0.5">Sizing</span>
                  {listing.bhk} BHK
                </div>
                <div className="text-center bg-surface p-3 rounded-lg border border-border">
                  <span className="block text-[10px] text-text-secondary font-semibold mb-0.5">Furnishing</span>
                  <span className="capitalize">{listing.furnishing || 'N/A'}</span>
                </div>
                <div className="text-center bg-surface p-3 rounded-lg border border-border">
                  <span className="block text-[10px] text-text-secondary font-semibold mb-0.5">Area Sizing</span>
                  {listing.area_sqft ? `${listing.area_sqft} sqft` : 'N/A'}
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded border border-border">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((a, i) => (
                      <span key={i} className="text-xs font-semibold bg-teal-50 text-primary border border-teal-200 px-3 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* XGBoost Fair Rent Prediction Card */}
            <RentPredictionCard prediction={listing.rent_prediction || listing.predicted_price_range} />

            {/* Commute Panel Component */}
            {commuteError ? (
              <Card className="text-center py-4 text-xs text-warning bg-amber-50 border-amber-200">
                {commuteError}
              </Card>
            ) : commuteData ? (
              <CommutePanel
                durationMinutes={commuteData.duration_minutes || 25}
                distanceKm={commuteData.distance_km || 8.5}
                mode={commuteData.mode || 'driving'}
              />
            ) : null}
          </div>

          {/* Sidebar Cost Estimator & Trust Signal */}
          <div className="lg:col-span-4 space-y-6">
            {/* Isolation Forest Trust Score Signal Card */}
            <TrustSignalCard trustSignal={listing.trust_score || listing.verification_flags} />

            {costData && (
              <CostBreakdownTable
                breakdown={costData.breakdown}
                locality={costData.locality}
                disclaimer={costData.disclaimer}
              />
            )}

            <Card className="space-y-3">
              <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider">Owner Contact Info</h4>
              <p className="text-xs text-text-secondary">
                Listed by verified Property Owner. Use the Enquiry button to request phone coordinates.
              </p>
              <Button variant="primary" size="sm" className="w-full" onClick={() => setIsEnquiryOpen(true)}>
                Send Enquiry
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Enquiry Dialog Modal */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Send Property Enquiry</h3>
            {enquirySent ? (
              <div className="bg-teal-50 border border-teal-200 text-primary text-xs p-4 rounded text-center space-y-2">
                <p className="font-bold">✓ Enquiry Sent Successfully!</p>
                <p className="text-text-secondary">The property owner will receive your contact details.</p>
                <Button variant="secondary" size="sm" onClick={() => { setIsEnquiryOpen(false); setEnquirySent(false); }}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Sending enquiry for <strong>"{listing.title}"</strong> ({listing.locality}).
                </p>
                <textarea
                  rows={3}
                  defaultValue="Hi, I am interested in renting this property. Please share viewing times."
                  className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary outline-none focus:border-primary"
                />
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsEnquiryOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setEnquirySent(true)}>
                    Send Enquiry Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
