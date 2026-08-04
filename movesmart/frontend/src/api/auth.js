import api from '../lib/api';

/**
 * Auth API Client Wrappers
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (err) {
    return { success: true };
  }
};

export const refreshToken = async (refresh) => {
  const response = await api.post('/auth/refresh', { refresh });
  return response.data;
};

export const setUserRole = async (role) => {
  const response = await api.patch('/auth/role', { role });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};
