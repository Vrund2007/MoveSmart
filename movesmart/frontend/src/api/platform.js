import api from '../lib/api';

/**
 * Super Admin Platform Settings API Helpers
 */
export const getPlatformSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updatePlatformSettings = async (settingsData) => {
  const response = await api.put('/admin/settings', settingsData);
  return response.data;
};

export const getPublicPlatformSettings = async () => {
  const response = await api.get('/platform/settings/public');
  return response.data;
};
