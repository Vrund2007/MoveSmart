import api from '../lib/api';

/**
 * Broker API Client Wrappers
 */
export const getBrokerDashboard = async () => {
  const response = await api.get('/broker/dashboard');
  return response.data;
};

export const getBrokerListings = async () => {
  const response = await api.get('/broker/listings');
  return response.data;
};

export const createBrokerListing = async (listingData) => {
  const response = await api.post('/broker/listings', listingData);
  return response.data;
};

export const updateBrokerListing = async (id, listingData) => {
  const response = await api.put(`/broker/listings/${id}`, listingData);
  return response.data;
};

export const deleteBrokerListing = async (id) => {
  const response = await api.delete(`/broker/listings/${id}`);
  return response.data;
};

export const matchClient = async (clientPayload) => {
  const response = await api.post('/broker/client-match', clientPayload);
  return response.data;
};
