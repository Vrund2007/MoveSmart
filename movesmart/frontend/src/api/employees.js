import api from '../lib/api';

/**
 * Enterprise Employee Directory API Helpers
 */
export const getCompanyEmployees = async (params = {}) => {
  const response = await api.get('/company/employees', { params });
  return response.data;
};

export const getCompanyEmployeeById = async (employeeId) => {
  const response = await api.get(`/company/employees/${employeeId}`);
  return response.data;
};

export const createCompanyEmployee = async (employeeData) => {
  const response = await api.post('/company/employees', employeeData);
  return response.data;
};

export const updateCompanyEmployee = async (employeeId, employeeData) => {
  const response = await api.put(`/company/employees/${employeeId}`, employeeData);
  return response.data;
};

export const deleteCompanyEmployee = async (employeeId) => {
  const response = await api.delete(`/company/employees/${employeeId}`);
  return response.data;
};
