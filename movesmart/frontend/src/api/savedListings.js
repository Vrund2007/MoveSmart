import api from '../lib/api';

/**
 * Saved Listings API Client Wrappers
 */
export const getSavedListings = async () => {
  const response = await api.get('/saved-listings');
  return response.data;
};

export const saveListing = async (listingId) => {
  const response = await api.post('/saved-listings', { listing_id: listingId });
  return response.data;
};

export const removeSavedListing = async (savedId) => {
  const response = await api.delete(`/saved-listings/${savedId}`);
  return response.data;
};
