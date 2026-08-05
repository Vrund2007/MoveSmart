// src/pages/CompareListings.jsx — Property Comparison Workspace
import React, { useState, useEffect, useCallback } from 'react';

import { getListings } from '../api/listings';
import { getSavedListings } from '../api/savedListings';
import PropertyComparisonTable from '../components/seeker/PropertyComparisonTable';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CompareListings() {
  const [allListings, setAllListings]     = useState([]);
  const [savedItems, setSavedItems]       = useState([]);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page_size: 100 };
      if (dealTypeFilter !== 'all') params.deal_type = dealTypeFilter;
      if (searchTerm.trim()) params.locality = searchTerm.trim();

      const [listingsRes, savedRes] = await Promise.allSettled([
        getListings(params),
        getSavedListings()
      ]);

      const rawListings = listingsRes.status === 'fulfilled' ? (listingsRes.value?.data || listingsRes.value) : [];
      const list = Array.isArray(rawListings) ? rawListings : [];
      
      setAllListings((prev) => {
        const map = new Map(prev.map((item) => [item._id, item]));
        list.forEach((item) => map.set(item._id, item));
        return Array.from(map.values());
      });

      const rawSaved = savedRes.status === 'fulfilled' ? (savedRes.value?.data || savedRes.value) : [];
      const savedList = Array.isArray(rawSaved) ? rawSaved : [];
      setSavedItems(savedList);

      if (selectedIds.length === 0) {
        if (list.length >= 2) {
          setSelectedIds([list[0]._id, list[1]._id]);
        } else if (list.length === 1) {
          setSelectedIds([list[0]._id]);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [dealTypeFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const filteredSelectionList = allListings.filter((l) => {
    const matchesType = dealTypeFilter === 'all' || String(l.deal_type || '').toLowerCase() === dealTypeFilter.toLowerCase();
    const matchesSearch = !searchTerm.trim() || 
      (l.title && l.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.locality && l.locality.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const comparedListings = allListings.filter((l) => selectedIds.includes(l._id));


  return (
    <div className="space-y-6 animate-fade-in font-sans text-[#222831]">
      <Card className="bg-white border border-border space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
          <div>
            <h3 className="font-bold text-lg text-text-primary">Side-by-Side Property Comparison Matrix</h3>
            <p className="text-xs text-text-secondary">
              Evaluate 2 to 5 properties across rents/sale prices, XGBoost AI valuations, Isolation Forest trust signals, and amenity specs.
            </p>
          </div>
          <div className="text-xs font-bold bg-surface px-3 py-1.5 rounded-full border border-border text-primary">
            {selectedIds.length} / 5 Selected
          </div>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <Input
              label="Search Properties by Locality or Title"
              placeholder="e.g. Bodakdev, Vastrapur, 3 BHK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-primary mb-1 block">Filter Type</label>
            <select
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary"
            >
              <option value="all">All Deals (Rent & Sale)</option>
              <option value="rent">For Rent Only</option>
              <option value="buy">For Sale Only</option>
            </select>
          </div>
        </div>

        {/* Property Selector Pills */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
            <span>Click to add/remove properties from matrix:</span>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-error hover:underline text-[11px]"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 bg-surface rounded-xl border border-border">
            {filteredSelectionList.length === 0 ? (
              <span className="text-xs text-text-secondary p-3">No matching properties found for search term.</span>
            ) : (
              filteredSelectionList.map((l) => {
                const isSelected = selectedIds.includes(l._id);
                return (
                  <button
                    key={l._id}
                    onClick={() => handleToggleListing(l._id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-text-primary border-border hover:border-primary'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {l.locality ? `[${l.locality}] ` : ''}{l.title?.slice(0, 35)}... (₹{l.price?.toLocaleString()})
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" message="Loading property matrix..." />
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

