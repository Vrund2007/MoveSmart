import React from 'react';
import Card from '../common/Card';
import StatusBadge from './StatusBadge';
import TrustBadge from './TrustBadge';

/**
 * ListingCard Component — displays property listing preview.
 */
const ListingCard = ({ listing, onClick, showStatus = false }) => {
  if (!listing) return null;

  return (
    <Card onClick={onClick} className="flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-lg text-text-primary line-clamp-1">{listing.title}</h3>
          {showStatus && <StatusBadge status={listing.status} />}
        </div>
        <p className="text-sm font-semibold text-primary mb-1">
          ₹{listing.price?.toLocaleString()} <span className="text-xs text-text-secondary font-normal">/ month</span>
        </p>
        <p className="text-xs text-text-secondary mb-3">
          {listing.bhk} BHK • {listing.locality} {listing.area_sqft ? `• ${listing.area_sqft} sqft` : ''}
        </p>
        {listing.verification_flags?.is_suspicious && (
          <div className="mb-3">
            <TrustBadge isSuspicious={true} />
          </div>
        )}
      </div>
      <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-text-secondary">
        <span>{listing.deal_type === 'rent' ? 'For Rent' : 'For Sale'}</span>
        {listing.furnishing && <span className="capitalize">{listing.furnishing}</span>}
      </div>
    </Card>
  );
};

export default ListingCard;
