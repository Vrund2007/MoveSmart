import React from 'react';
import Card from '../common/Card';
import StatusBadge from './StatusBadge';
import TrustBadge from './TrustBadge';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
];

const getRandomFallback = (id = '') => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
};

/**
 * ListingCard Component — displays property listing preview.
 */
const ListingCard = ({ listing, onClick, showStatus = false }) => {
  if (!listing) return null;

  const fallback = getRandomFallback(listing._id || listing.title || 'default');
  const imageUrl = listing.images?.length && listing.images[0] ? listing.images[0] : fallback;

  return (
    <Card onClick={onClick} className="flex flex-col justify-between h-full overflow-hidden p-0 group">
      {/* Property Thumbnail Image */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallback;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {showStatus && <StatusBadge status={listing.status} />}
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-bold text-[10px] uppercase">
            {listing.deal_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="font-bold text-base text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>
          <p className="text-sm font-extrabold text-primary mb-1">
            ₹{listing.price?.toLocaleString()}
            <span className="text-xs text-text-secondary font-normal">
              {listing.deal_type === 'rent' ? ' / month' : ''}
            </span>
          </p>
          <p className="text-xs text-text-secondary mb-3">
            {listing.bhk} BHK • {listing.locality} {listing.area_sqft ? `• ${listing.area_sqft} sqft` : ''}
          </p>
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-text-secondary">
          <span className="capitalize">{listing.furnishing || 'Unfurnished'}</span>
          <span className="text-primary font-bold text-[11px] group-hover:underline">View Details →</span>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;

