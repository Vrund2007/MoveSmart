// src/components/seeker/PropertyComparisonTable.jsx — Side-by-Side Property Comparison Matrix
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function PropertyComparisonTable({ listings, onRemove }) {
  if (!listings || listings.length === 0) {
    return (
      <Card className="text-center py-12 text-xs text-text-secondary">
        Select 2 to 5 property listings to launch side-by-side comparison.
      </Card>
    );
  }

  // Calculate badges
  const minPrice = Math.min(...listings.map((l) => l.price || Infinity));
  const bestValueId = listings.find((l) => l.price === minPrice)?._id;

  return (
    <div className="overflow-x-auto border border-border rounded-xl bg-white shadow-sm font-sans">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-surface text-text-primary border-b border-border">
            <th className="p-4 w-48 font-bold text-xs uppercase text-text-secondary">Feature Specification</th>
            {listings.map((l) => (
              <th key={l._id} className="p-4 min-w-[220px] text-center border-l border-border">
                <div className="space-y-2">
                  <div className="h-28 rounded-lg overflow-hidden border border-border">
                    <img
                      src={l.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-text-primary line-clamp-1">{l.title}</h4>
                  <span className="text-[10px] font-bold text-primary uppercase block">{l.locality}</span>
                  {l._id === bestValueId && (
                    <span className="bg-teal-100 text-teal-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase inline-block">
                      ★ Best Value Rent
                    </span>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(l._id)}
                      className="text-[10px] text-error hover:underline block mx-auto font-bold pt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-xs text-text-primary font-semibold">
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Monthly Rent</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border font-extrabold text-sm tabular-nums text-text-primary">
                ₹{l.price?.toLocaleString()} / mo
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">BHK Sizing</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border">
                {l.bhk} BHK
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Carpet Area</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border">
                {l.area_sqft ? `${l.area_sqft} sqft` : 'N/A'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Furnishing Status</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border capitalize">
                {l.furnishing || 'N/A'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">XGBoost Rent Valuation</td>
            {listings.map((l) => {
              const pred = l.rent_prediction || l.predicted_price_range;
              return (
                <td key={l._id} className="p-4 text-center border-l border-border text-teal-600 font-bold">
                  {pred ? `₹${pred.lower_range?.toLocaleString()} - ₹${pred.upper_range?.toLocaleString()}` : 'N/A'}
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
                      {trust.is_suspicious ? 'Unusual' : 'Verified Standard'}
                    </span>
                  ) : 'N/A'}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-4 bg-surface/40 font-bold text-text-secondary">Amenities Count</td>
            {listings.map((l) => (
              <td key={l._id} className="p-4 text-center border-l border-border">
                {l.amenities?.length || 0} Amenities
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
