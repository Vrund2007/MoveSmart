import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import PropertyImageUploader from './PropertyImageUploader';

/**
 * ListingForm Component — Reusable Owner/Broker form with Cloudinary Drag & Drop photo uploader.
 */
const ListingForm = ({ onSubmit, initialValues = {}, loading = false, onCancel }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [dealType, setDealType] = useState(initialValues.deal_type || 'rent');
  const [price, setPrice] = useState(initialValues.price || '');
  const [deposit, setDeposit] = useState(initialValues.deposit || '');
  const [bhk, setBhk] = useState(initialValues.bhk || 2);
  const [bathrooms, setBathrooms] = useState(initialValues.bathrooms || 2);
  const [areaSqft, setAreaSqft] = useState(initialValues.area_sqft || '');
  const [locality, setLocality] = useState(initialValues.locality || '');
  const [address, setAddress] = useState(initialValues.address || '');
  const [furnishing, setFurnishing] = useState(initialValues.furnishing || 'Furnished');
  const [amenitiesStr, setAmenitiesStr] = useState(
    Array.isArray(initialValues.amenities) ? initialValues.amenities.join(', ') : initialValues.amenities || ''
  );
  const [images, setImages] = useState(
    Array.isArray(initialValues.images) ? initialValues.images : []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const amenities = amenitiesStr
      ? amenitiesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    onSubmit({
      title,
      description,
      deal_type: dealType,
      price: Number(price),
      deposit: Number(deposit) || 0,
      bhk: Number(bhk),
      bathrooms: Number(bathrooms),
      area_sqft: areaSqft ? Number(areaSqft) : null,
      locality,
      address,
      furnishing,
      amenities,
      images,
      coordinates: initialValues.coordinates || { type: 'Point', coordinates: [72.5714, 23.0225] }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl w-full">
      <Input
        label="Listing Title *"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. 2 BHK Furnished Apartment in Vastrapur"
      />
      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
          placeholder="Detail property highlights, maintenance fees, rules..."
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
            <option value="buy">Sale / Buy</option>
          </select>
        </div>
        <Input
          label="Locality *"
          required
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="e.g. Vastrapur"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Price (₹) *" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="BHK *" type="number" required value={bhk} onChange={(e) => setBhk(e.target.value)} />
        <Input label="Area (sqft)" type="number" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">Furnishing Status</label>
        <select
          value={furnishing}
          onChange={(e) => setFurnishing(e.target.value)}
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
        >
          <option value="Unfurnished">Unfurnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Furnished">Fully Furnished</option>
        </select>
      </div>

      <Input
        label="Amenities (Comma separated)"
        value={amenitiesStr}
        onChange={(e) => setAmenitiesStr(e.target.value)}
        placeholder="Parking, Elevator, Power Backup, Gym, Pool"
      />

      {/* Cloudinary Drag & Drop Photo Uploader */}
      <div>
        <label className="text-xs font-bold text-text-primary mb-1.5 block">
          Property Photos (Cloudinary Upload & Sync)
        </label>
        <PropertyImageUploader
          images={images}
          onChange={(newImages) => setImages(newImages)}
        />
      </div>

      <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border">
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
