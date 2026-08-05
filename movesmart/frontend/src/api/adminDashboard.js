import api from '../lib/api';

/**
 * Super Admin Dashboard API Helpers
 */
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAIMLMonitoring = async () => {
  const response = await api.get('/admin/ai-monitoring');
  return response.data;
};

export const getAdminListings = async (params = {}) => {
  const response = await api.get('/admin/listings', { params });
  return response.data;
};

export const bulkListingAction = async (listingIds, decision, reason = '') => {
  const response = await api.post('/admin/listings/bulk', {
    listing_ids: listingIds,
    decision,
    reason
  });
  return response.data;
};
