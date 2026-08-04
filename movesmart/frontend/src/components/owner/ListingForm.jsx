import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * ListingForm Component — Reusable Owner/Broker form to create/edit property listings.
 */
const ListingForm = ({ onSubmit, initialValues = {}, loading = false, onCancel }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [dealType, setDealType] = useState(initialValues.deal_type || 'rent');
  const [price, setPrice] = useState(initialValues.price || '');
  const [bhk, setBhk] = useState(initialValues.bhk || '');
  const [areaSqft, setAreaSqft] = useState(initialValues.area_sqft || '');
  const [locality, setLocality] = useState(initialValues.locality || '');
  const [furnishing, setFurnishing] = useState(initialValues.furnishing || 'semi-furnished');
  const [amenitiesStr, setAmenitiesStr] = useState(
    Array.isArray(initialValues.amenities) ? initialValues.amenities.join(', ') : initialValues.amenities || ''
  );
  const [imagesStr, setImagesStr] = useState(
    Array.isArray(initialValues.images) ? initialValues.images.join(', ') : initialValues.images || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const amenities = amenitiesStr
      ? amenitiesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const images = imagesStr
      ? imagesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    onSubmit({
      title,
      description,
      deal_type: dealType,
      price: Number(price),
      bhk: Number(bhk),
      area_sqft: areaSqft ? Number(areaSqft) : null,
      locality,
      furnishing,
      amenities,
      images,
      coordinates: { type: 'Point', coordinates: [72.5714, 23.0225] }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg w-full">
      <Input
        label="Listing Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. 2 BHK Apartment in Vejalpur"
      />
      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
          placeholder="Detail property highlights, maintenance fees, terms..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">Deal Type</label>
          <select
            value={dealType}
            onChange={(e) => setDealType(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
          >
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </div>
        <Input
          label="Locality"
          required
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="e.g. Vejalpur"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Price (₹)" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="BHK" type="number" required value={bhk} onChange={(e) => setBhk(e.target.value)} />
        <Input label="Area (sqft)" type="number" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">Furnishing</label>
          <select
            value={furnishing}
            onChange={(e) => setFurnishing(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
          >
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="fully-furnished">Fully Furnished</option>
          </select>
        </div>
      </div>
      <Input
        label="Amenities (Comma separated)"
        value={amenitiesStr}
        onChange={(e) => setAmenitiesStr(e.target.value)}
        placeholder="e.g. Parking, Elevator, Power Backup, Gym"
      />
      <Input
        label="Image URLs (Comma separated)"
        value={imagesStr}
        onChange={(e) => setImagesStr(e.target.value)}
        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
      />

      <div className="flex gap-3 justify-end mt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialValues._id ? 'Submit Updates for Review' : 'Create & Submit Listing'}
        </Button>
      </div>
    </form>
  );
};

export default ListingForm;
