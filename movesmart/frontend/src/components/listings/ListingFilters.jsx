import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * ListingFilters Component — Filter controls for browsing listings.
 */
const ListingFilters = ({ onFilterChange }) => {
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [dealType, setDealType] = useState('rent');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    onFilterChange({ locality, bhk, deal_type: dealType, max_price: maxPrice });
  };

  return (
    <form onSubmit={handleApply} className="bg-surface p-4 border border-border rounded-lg mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      <Input
        label="Locality"
        placeholder="e.g. Vejalpur"
        value={locality}
        onChange={(e) => setLocality(e.target.value)}
      />
      <div>
        <label className="text-sm font-medium text-text-primary mb-1 block">Deal Type</label>
        <select
          value={dealType}
          onChange={(e) => setDealType(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
        >
          <option value="rent">Rent</option>
          <option value="buy">Buy</option>
        </select>
      </div>
      <Input
        label="BHK"
        type="number"
        placeholder="e.g. 2"
        value={bhk}
        onChange={(e) => setBhk(e.target.value)}
      />
      <Input
        label="Max Price (₹)"
        type="number"
        placeholder="e.g. 25000"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <Button type="submit" variant="primary" className="w-full">
        Apply Filters
      </Button>
    </form>
  );
};

export default ListingFilters;
