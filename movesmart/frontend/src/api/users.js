import api from '../lib/api';

/**
 * Super Admin User Management API Helpers
 */
export const getUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const createAdminAccount = async (adminData) => {
  const response = await api.post('/admin/users', adminData);
  return response.data;
};

export const updateUserStatus = async (userId, accountStatus) => {
  const response = await api.patch(`/admin/users/${userId}`, { account_status: accountStatus });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getBrokers = async () => {
  const response = await api.get('/admin/brokers');
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/admin/companies');
  return response.data;
};
