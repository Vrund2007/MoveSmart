import api from '../lib/api';

/**
 * Enquiries API Client Wrappers
 */
export const sendEnquiry = async (listingId, message) => {
  const response = await api.post('/enquiries', { listing_id: listingId, message });
  return response.data;
};

export const getOwnerEnquiries = async () => {
  const response = await api.get('/enquiries', { params: { listing_owner: 'me' } });
  return response.data;
};
