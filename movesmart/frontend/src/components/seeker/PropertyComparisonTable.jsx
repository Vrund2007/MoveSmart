// src/components/seeker/PropertyComparisonTable.jsx — Side-by-Side Property Comparison Matrix
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';

export default function PropertyComparisonTable({ listings, onRemove }) {
  const navigate = useNavigate();

  if (!listings || listings.length === 0) {
    return (
      <Card className="text-center py-12 text-xs text-text-secondary">
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
    <div className="overflow-x-auto border border-border rounded-xl bg-white shadow-sm font-sans">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-surface text-text-primary border-b border-border">
            <th className="p-4 w-48 font-bold text-xs uppercase text-text-secondary">Specification / Feature</th>
            {listings.map((l) => {
              const isBuy = String(l.deal_type || '').toLowerCase() === 'buy';
              const isBestValue = (isBuy && l._id === bestValueBuyId) || (!isBuy && l._id === bestValueRentId);

              return (
                <th key={l._id} className="p-4 min-w-[240px] max-w-[280px] text-center border-l border-border align-top">
                  <div className="space-y-2">
                    <div className="h-32 rounded-lg overflow-hidden border border-border bg-gray-100 relative">
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
                      <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase text-white ${
                        isBuy ? 'bg-indigo-600' : 'bg-teal-600'
                      }`}>
                        {isBuy ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-text-primary line-clamp-2 min-h-[32px]">{l.title}</h4>
                    <span className="text-[10px] font-bold text-primary uppercase block">{l.locality}</span>
                    {isBestValue && (
                      <span className="bg-teal-100 text-teal-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase inline-block">
                        {isBuy ? '★ Lowest Sale Price' : '★ Best Rent Value'}
                      </span>
                    )}
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/listings/${l._id}`)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        View Details
                      </button>
                      {onRemove && (
                        <button
                          onClick={() => onRemove(l._id)}
                          className="text-[10px] text-error hover:underline font-bold"
                        >
                          Remove
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
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Listing Price</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border font-extrabold text-sm tabular-nums text-text-primary">
                {formatPrice(l.price, l.deal_type)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Deal Type</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border capitalize font-bold">
                {String(l.deal_type || '').toLowerCase() === 'buy' ? 'For Sale (Ownership)' : 'For Rent (Lease)'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">BHK Configuration</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border font-bold">
                {l.bhk} BHK
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Sizing / Carpet Area</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border">
                {l.area_sqft ? `${l.area_sqft} sqft` : l.sqft ? `${l.sqft} sqft` : `${l.bhk * 550} sqft (Est.)`}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Furnishing Status</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border capitalize">
                {l.furnishing || 'Unfurnished'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">AI Fair Valuation Range</td>
            {listings.map((l) => {
              const pred = l.rent_prediction || l.predicted_price_range;
              return (
                <td key={l._id} className="p-4 text-center border-l border-border text-teal-700 font-bold">
                  {formatValuation(pred, l.deal_type)}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Isolation Forest Trust Signal</td>
            {listings.map((l) => {
              const trust = l.trust_score || l.verification_flags;
              return (
                <td key={l._id} className="p-4 text-center border-l border-border">
                  {trust ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      trust.is_suspicious ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {trust.is_suspicious ? 'Unusual Price' : 'Verified Standard'}
                    </span>
                  ) : 'N/A'}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Amenities & Features</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 border-l border-border align-top">
                {l.amenities?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {l.amenities.map((a, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-gray-100 text-text-primary px-2 py-0.5 rounded border border-border">
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


