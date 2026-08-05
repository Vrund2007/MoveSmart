import api from '../lib/api';

/**
 * User Profile & Role Settings Client Wrappers
 */
export const updateRoleProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

