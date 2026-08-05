import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * ListingFilters Component — Filter controls for browsing listings.
 */
const ListingFilters = ({ initialFilters = {}, onFilterChange }) => {
  const [locality, setLocality] = useState(initialFilters.locality || initialFilters.search || '');
  const [bhk, setBhk]           = useState(initialFilters.bhk || '');
  const [dealType, setDealType] = useState(initialFilters.deal_type || 'all');
  const [maxPrice, setMaxPrice] = useState(initialFilters.max_price || '');

  useEffect(() => {
    setLocality(initialFilters.locality || initialFilters.search || '');
    setBhk(initialFilters.bhk || '');
    setDealType(initialFilters.deal_type || 'all');
    setMaxPrice(initialFilters.max_price || '');
  }, [initialFilters.locality, initialFilters.search, initialFilters.bhk, initialFilters.deal_type, initialFilters.max_price]);

  const handleApply = (e) => {
    if (e) e.preventDefault();
    onFilterChange({
      locality: locality.trim(),
      bhk: bhk ? bhk : undefined,
      deal_type: dealType !== 'all' ? dealType : undefined,
      max_price: maxPrice ? maxPrice : undefined,
    });
  };

  const handleReset = () => {
    setLocality('');
    setBhk('');
    setDealType('all');
    setMaxPrice('');
    onFilterChange({});
  };


  return (
    <form onSubmit={handleApply} className="bg-surface p-4 border border-border rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end shadow-xs">
      <div className="lg:col-span-2">
        <Input
          label="Locality / Keyword"
          placeholder="e.g. Bodakdev, Ambli, Vastrapur"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-text-primary mb-1 block">Deal Type</label>
        <select
          value={dealType}
          onChange={(e) => setDealType(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary"
        >
          <option value="all">All Types</option>
          <option value="rent">For Rent</option>
          <option value="buy">For Sale</option>
        </select>
      </div>
      <div>
        <Input
          label="BHK"
          type="number"
          placeholder="e.g. 2, 3"
          value={bhk}
          onChange={(e) => setBhk(e.target.value)}
        />
      </div>
      <div>
        <Input
          label="Max Price (₹)"
          type="number"
          placeholder="e.g. 30000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1 py-2 text-xs font-bold">
          Filter
        </Button>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 text-xs font-bold text-text-secondary bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default ListingFilters;

