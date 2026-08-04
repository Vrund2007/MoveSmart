// src/pages/CompareListings.jsx — Property Comparison Workspace
import React, { useState, useEffect } from 'react';
import { getListings } from '../api/listings';
import PropertyComparisonTable from '../components/seeker/PropertyComparisonTable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CompareListings() {
  const [allListings, setAllListings] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedListings = async () => {
      setLoading(true);
      try {
        const res = await getListings();
        const data = res.data || res;
        const list = Array.isArray(data) ? data : [];
        setAllListings(list);
        if (list.length >= 2) {
          setSelectedIds([list[0]._id, list[1]._id]);
        } else if (list.length === 1) {
          setSelectedIds([list[0]._id]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedListings();
  }, []);

  const handleToggleListing = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        alert('You can compare up to 5 properties at a time.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedListings = allListings.filter((l) => selectedIds.includes(l._id));

  return (
    <div className="space-y-6 animate-fade-in font-sans text-[#222831]">
      <Card className="bg-white border border-border">
        <h3 className="font-bold text-lg text-text-primary mb-1">Side-by-Side Property Comparison</h3>
        <p className="text-xs text-text-secondary mb-4">
          Select 2 to 5 verified properties to evaluate rents, XGBoost valuations, Isolation Forest trust signals, and amenity specs.
        </p>

        {/* Selection Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {allListings.map((l) => {
            const isSelected = selectedIds.includes(l._id);
            return (
              <button
                key={l._id}
                onClick={() => handleToggleListing(l._id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface text-text-primary border-border hover:border-primary'
                }`}
              >
                {isSelected ? '✓ ' : '+ '} {l.title} (₹{l.price?.toLocaleString()})
              </button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" message="Loading listings for comparison..." />
        </div>
      ) : (
        <PropertyComparisonTable
          listings={comparedListings}
          onRemove={(id) => setSelectedIds(selectedIds.filter((item) => item !== id))}
        />
      )}
    </div>
  );
}
