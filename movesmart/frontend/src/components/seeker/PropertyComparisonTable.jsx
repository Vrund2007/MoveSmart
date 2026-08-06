// src/components/seeker/PropertyComparisonTable.jsx — Side-by-Side Property Comparison Matrix
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { ShieldCheckIcon, AlertTriangleIcon, MapPinIcon, XIcon } from '../common/Icons';

export default function PropertyComparisonTable({ listings, onRemove }) {
  const navigate = useNavigate();

  if (!listings || listings.length === 0) {
    return (
      <Card className="text-center py-12 text-xs text-text-secondary bg-white border border-border rounded-2xl p-8">
        Select 2 to 5 property listings to launch side-by-side comparison.
      </Card>
    );
  }

  // Calculate best value badges separately for Rent and Sale
  const rentListings = listings.filter((l) => String(l.deal_type || 'rent').toLowerCase() === 'rent');
  const minRentPrice = rentListings.length > 0 ? Math.min(...rentListings.map((l) => l.price || Infinity)) : null;
  const bestValueRentId = minRentPrice !== null ? rentListings.find((l) => l.price === minRentPrice)?._id : null;

  const buyListings = listings.filter((l) => String(l.deal_type || '').toLowerCase() === 'buy');
  const minBuyPrice = buyListings.length > 0 ? Math.min(...buyListings.map((l) => l.price || Infinity)) : null;
  const bestValueBuyId = minBuyPrice !== null ? buyListings.find((l) => l.price === minBuyPrice)?._id : null;

  const formatPrice = (price, dealType) => {
    if (!price) return 'N/A';
    const isBuy = String(dealType || '').toLowerCase() === 'buy';
    if (isBuy && price >= 100000) {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(price / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${price.toLocaleString()} ${isBuy ? '' : '/ mo'}`;
  };

  const formatValuation = (pred, dealType) => {
    if (!pred || (!pred.lower_range && !pred.predicted_fair_rent)) return 'N/A';
    const isBuy = String(dealType || '').toLowerCase() === 'buy' || (pred.deal_type && String(pred.deal_type).toLowerCase() === 'buy');
    const low = pred.lower_range;
    const high = pred.upper_range;

    if (isBuy && low >= 100000) {
      const lowStr = low >= 10000000 ? `₹${(low / 10000000).toFixed(2)} Cr` : `₹${(low / 100000).toFixed(1)} L`;
      const highStr = high >= 10000000 ? `₹${(high / 10000000).toFixed(2)} Cr` : `₹${(high / 100000).toFixed(1)} L`;
      return `${lowStr} - ${highStr}`;
    }
    return `₹${low?.toLocaleString()} - ₹${high?.toLocaleString()} / mo`;
  };

  return (
    <div className="overflow-x-auto border border-border rounded-2xl bg-white shadow-xs font-sans">
      <table className="w-full text-left border-collapse text-xs table-fixed min-w-[700px]">
        <thead>
          <tr className="bg-slate-900 text-white border-b border-border">
            <th className="p-4 w-52 font-extrabold text-xs uppercase tracking-wider text-teal-400 align-middle border-r border-slate-800">
              Property Specs Matrix
            </th>
            {listings.map((l) => {
              const isBuy = String(l.deal_type || '').toLowerCase() === 'buy';
              const isBestValue = (isBuy && l._id === bestValueBuyId) || (!isBuy && l._id === bestValueRentId);

              return (
                <th key={l._id} className="p-4 w-72 text-center border-r border-slate-800 last:border-r-0 align-top bg-white text-text-primary">
                  <div className="space-y-3">
                    {/* Fixed Height Uniform Photo Container */}
                    <div className="h-40 w-full rounded-xl overflow-hidden border border-border bg-slate-900 relative shadow-sm">
                      <img
                        src={l.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                        alt={l.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-2 left-2 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs ${
                        isBuy ? 'bg-indigo-600' : 'bg-[#00ADB5]'
                      }`}>
                        {isBuy ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-text-primary line-clamp-2 h-8 leading-snug">{l.title}</h4>
                      <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-primary uppercase">
                        <MapPinIcon className="w-3 h-3 text-primary flex-shrink-0" />
                        <span>{l.locality}</span>
                      </div>
                    </div>

                    {isBestValue && (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-black px-3 py-1 rounded-full uppercase inline-block tracking-wider">
                        {isBuy ? 'Best Sale Price' : 'Best Rent Value'}
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2 pt-2 border-t border-border/60">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/listings/${l._id}`)}
                        className="text-[10px] font-bold px-3 py-1 rounded-lg"
                      >
                        View Details
                      </Button>
                      {onRemove && (
                        <button
                          onClick={() => onRemove(l._id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 text-[10px] font-bold"
                          title="Remove from comparison"
                        >
                          <XIcon className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-xs text-text-primary font-semibold">
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Listing Price</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 font-black text-sm tabular-nums text-[#00ADB5]">
                {formatPrice(l.price, l.deal_type)}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Deal Type</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 capitalize font-bold">
                {String(l.deal_type || '').toLowerCase() === 'buy' ? 'Ownership Sale' : 'Rental Lease'}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">BHK Configuration</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 font-bold">
                {l.bhk} BHK
              </td>
            ))}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Carpet Area</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 font-bold">
                {l.area_sqft ? `${l.area_sqft} sqft` : l.sqft ? `${l.sqft} sqft` : `${l.bhk * 550} sqft (Est.)`}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Furnishing Status</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 capitalize font-bold">
                {l.furnishing || 'Unfurnished'}
              </td>
            ))}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">AI Fair Valuation Range</td>
            {listings.map((l) => {
              const pred = l.rent_prediction || l.predicted_price_range;
              return (
                <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0 text-teal-800 font-extrabold tabular-nums">
                  {formatValuation(pred, l.deal_type)}
                </td>
              );
            })}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Market Trust Signal</td>
            {listings.map((l) => {
              const trust = l.trust_score || l.verification_flags;
              const isSuspicious = trust?.is_suspicious;

              return (
                <td key={l._id} className="p-4 text-center border-r border-border last:border-r-0">
                  {trust ? (
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 border ${
                      isSuspicious ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    }`}>
                      {isSuspicious ? (
                        <>
                          <AlertTriangleIcon className="w-3 h-3 text-amber-700" />
                          <span>Price Anomaly</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheckIcon className="w-3 h-3 text-emerald-700" />
                          <span>Verified Standard</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-text-secondary text-[10px]">Standard</span>
                  )}
                </td>
              );
            })}
          </tr>
          <tr className="hover:bg-surface/50 transition-colors">
            <td className="p-4 bg-surface/60 font-extrabold text-text-secondary border-r border-border">Amenities & Features</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 border-r border-border last:border-r-0 align-top">
                {l.amenities?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {l.amenities.map((a, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-teal-50 text-primary px-2.5 py-1 rounded-xl border border-teal-200">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-secondary text-center block text-[11px]">Standard amenities</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
