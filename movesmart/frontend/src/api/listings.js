import api from '../lib/api';

let listingsCache = null;
let listingsCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute in-memory cache


/**
 * Listings API Client Wrappers
 */
export const getListings = async (params = {}, forceRefresh = false) => {
  const isDefaultFetch = !params || Object.keys(params).length === 0;
  const now = Date.now();

  if (!forceRefresh && isDefaultFetch && listingsCache && (now - listingsCacheTime < CACHE_TTL_MS)) {
    return listingsCache;
  }

  const response = await api.get('/listings', { params });
  const data = response.data;

  if (isDefaultFetch) {
    listingsCache = data;
    listingsCacheTime = now;
  }

  return data;
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
