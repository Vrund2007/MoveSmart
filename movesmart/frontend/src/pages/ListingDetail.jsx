// src/pages/ListingDetail.jsx
// Full detail view for a single listing (Architecture.md §4.1, PRD §7.1)
// Displays listing specifications, ML predictions, safety metrics, and enquiry form.

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LISTINGS, LOCALITIES } from '../utils/mockData';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find listing from mock database
  const listing = LISTINGS.find(p => p.id === id);

  const [activePhoto, setActivePhoto] = useState(0);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMsg, setEnquiryMsg] = useState('I am interested in this property. Please share contact coordinates.');
  const [submitted, setSubmitted] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-[#222831]">Listing Not Found</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-[#00ADB5] text-white px-4 py-2 rounded-lg font-semibold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find locality details
  const localityDetails = LOCALITIES.find(l => l.name === listing.locality);

  const handleEnquiry = (e) => {
    e.preventDefault();
    if (!enquiryName || !enquiryEmail || !enquiryPhone) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] py-12 px-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/dashboard?tab=search')}
            className="text-xs font-bold text-[#393E46] hover:text-[#00ADB5] transition-colors"
          >
            ← Back to Property Search
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Details / Gallery */}
          <div className="lg:col-span-8 bg-white border border-[#D9D9D9] p-6 rounded-xl space-y-6 shadow-sm">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[#EEEEEE] pb-4">
              <div>
                <span className="text-xs font-bold text-[#00ADB5] uppercase tracking-wider">{listing.locality} Zone</span>
                <h1 className="text-2xl font-extrabold text-[#222831] mt-1">{listing.title}</h1>
                <p className="text-xs text-[#393E46] font-semibold mt-1">
                  Posted on {listing.addedOn} • Listed by {listing.ownerName}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-extrabold text-[#222831] tabular-nums">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-[#393E46] uppercase">Monthly Rent</span>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="space-y-3">
              <div className="h-96 bg-[#EEEEEE] rounded-xl overflow-hidden border border-[#D9D9D9]">
                <img
                  src={listing.photos[activePhoto]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.photos.length > 1 && (
                <div className="flex space-x-3">
                  {listing.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activePhoto === idx ? 'border-[#00ADB5]' : 'border-transparent'
                      }`}
                    >
                      <img src={p} alt="Gallery Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#EEEEEE] py-4 text-xs font-bold text-[#222831]">
              <div className="text-center bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9]">
                <span className="block text-[10px] text-[#393E46] font-semibold mb-0.5">Sizing</span>
                {listing.bhk} BHK
              </div>
              <div className="text-center bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9]">
                <span className="block text-[10px] text-[#393E46] font-semibold mb-0.5">Bathrooms</span>
                {listing.bathrooms} Baths
              </div>
              <div className="text-center bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9]">
                <span className="block text-[10px] text-[#393E46] font-semibold mb-0.5">Area Sizing</span>
                {listing.sizeSqFt} sq ft
              </div>
            </div>

            {/* AI Trust Analysis */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider">AI Trust & Pricing Diagnostics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#EEEEEE] p-4 rounded-xl border border-[#D9D9D9] flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[#393E46] uppercase">XGBoost Rent Model Comparison</span>
                  <div className="text-lg font-extrabold text-[#222831] mt-2 tabular-nums">
                    ₹{listing.predictedPrice.toLocaleString('en-IN')}
                    <span className={`text-xs ml-2 font-bold ${
                      listing.predictedDiff > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'
                    }`}>
                      {listing.predictedDiff > 0 ? `+${listing.predictedDiff}% Over market` : `${listing.predictedDiff}% Under market`}
                    </span>
                  </div>
                </div>

                <div className="bg-[#EEEEEE] p-4 rounded-xl border border-[#D9D9D9] flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[#393E46] uppercase">Isolation Forest Trust Index</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-lg font-extrabold tabular-nums ${
                      listing.isSuspicious ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                    }`}>
                      {listing.trustScore}% Trust
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      listing.isSuspicious ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#22C55E]/10 text-[#22C55E]'
                    }`}>
                      {listing.isSuspicious ? 'Anomalous' : 'Vetted'}
                    </span>
                  </div>
                </div>
              </div>

              {listing.isSuspicious && (
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B] p-4 rounded-xl text-xs text-[#393E46] leading-relaxed">
                  ⚠️ <strong>Anomalous Listing Alert:</strong> Price deviates significantly from neighborhood averages. Listing flagged for manual admin inspection.
                </div>
              )}
            </div>

            {/* Neighborhood amenities */}
            {localityDetails && (
              <div className="space-y-4 pt-4 border-t border-[#EEEEEE]">
                <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider">Neighborhood Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#EEEEEE] p-4 rounded-lg border border-[#D9D9D9]">
                    <strong className="block text-[#393E46] mb-2">Education Quality (Schools Score {localityDetails.schoolsScore}/100)</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[#222831] font-semibold">
                      {localityDetails.schools.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-[#EEEEEE] p-4 rounded-lg border border-[#D9D9D9]">
                    <strong className="block text-[#393E46] mb-2">Medical Services</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[#222831] font-semibold">
                      {localityDetails.hospitals.map((h, idx) => <li key={idx}>{h}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar enquiry */}
          <div className="lg:col-span-4 bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-[#222831] border-b border-[#EEEEEE] pb-2">Enquire Listing</h3>
            
            {submitted ? (
              <div className="bg-[#22C55E]/10 border border-[#22C55E] p-6 rounded-xl text-center space-y-3">
                <span className="text-3xl">✓</span>
                <h4 className="font-bold text-sm text-[#22C55E] uppercase tracking-wider">Enquiry Sent</h4>
                <p className="text-xs text-[#393E46] leading-relaxed">
                  Your enquiry has been dispatched to {listing.ownerName}. The broker will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Custom Message</label>
                  <textarea
                    rows="3"
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00ADB5] hover:bg-[#008C93] text-white font-semibold py-3 rounded-lg text-xs transition-colors shadow-sm"
                >
                  Send Enquiry Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
