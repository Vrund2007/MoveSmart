import api from '../lib/api';

/**
 * Listings API Client Wrappers
 */
export const getListings = async (params = {}) => {
  const response = await api.get('/listings', { params });
  return response.data;
};

export const getMyListings = async () => {
  const response = await api.get('/listings/my');
  return response.data;
};

export const getListingById = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const getListing = getListingById;

export const createListing = async (listingData) => {
  const response = await api.post('/listings', listingData);
  return response.data;
};

export const updateListing = async (id, listingData) => {
  const response = await api.put(`/listings/${id}`, listingData);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data;
};

export const getListingAnalytics = async (id) => {
  const response = await api.get(`/listings/${id}/analytics`);
  return response.data;
};

export const saveListing = async (listingId) => {
  const response = await api.post('/saved-listings', { listing_id: listingId });
  return response.data;
};

export const getSavedListings = async () => {
  const response = await api.get('/saved-listings');
  return response.data;
};

export const removeSavedListing = async (savedId) => {
  const response = await api.delete(`/saved-listings/${savedId}`);
  return response.data;
};
