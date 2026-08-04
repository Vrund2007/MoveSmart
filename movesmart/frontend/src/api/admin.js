import api from '../lib/api';

/**
 * Admin API Client Wrappers
 */
export const getAdminReviewQueue = async (statusFilter = 'pending_review') => {
  const response = await api.get('/admin/listings', { params: { status: statusFilter } });
  return response.data;
};

export const getPendingListings = async (statusFilter = 'pending_review') => {
  return getAdminReviewQueue(statusFilter);
};

export const reviewListingAction = async (listingId, decision, reason = '') => {
  const response = await api.patch(`/admin/listings/${listingId}/review`, { decision, reason });
  return response.data;
};

export const reviewListing = async (listingId, decision, reason = '') => {
  return reviewListingAction(listingId, decision, reason);
};
