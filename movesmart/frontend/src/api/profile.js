import api from '../lib/api';

/**
 * User Profile & Role Settings Client Wrappers
 */
export const updateRoleProfile = async (profileData) => {
  const response = await api.post('/auth/role', profileData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
