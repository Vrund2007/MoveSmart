import api from '../lib/api';

/**
 * Activity Timeline API Client
 */
export const getActivityLogs = async () => {
  const response = await api.get('/activity');
  return response.data;
};
