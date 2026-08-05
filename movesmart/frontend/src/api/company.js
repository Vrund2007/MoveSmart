import api from '../lib/api';

/**
 * Company HR API Client Wrappers
 */
export const getCompanyDashboard = async () => {
  const response = await api.get('/company/dashboard');
  return response.data;
};

export const createCompanyProfile = async (profileData) => {
  const response = await api.post('/company/profile', profileData);
  return response.data;
};

export const getRelocationBatches = async () => {
  const response = await api.get('/company/relocation-batches');
  return response.data;
};

export const createRelocationBatch = async (batchData) => {
  const response = await api.post('/company/relocation-batches', batchData);
  return response.data;
};

export const getRelocationBatchDetail = async (batchId) => {
  const response = await api.get(`/company/relocation-batches/${batchId}`);
  return response.data;
};

export const updateRelocationBatch = async (batchId, updateData) => {
  const response = await api.put(`/company/relocation-batches/${batchId}`, updateData);
  return response.data;
};

export const deleteRelocationBatch = async (batchId) => {
  const response = await api.delete(`/company/relocation-batches/${batchId}`);
  return response.data;
};

export const addEmployeeToBatch = async (batchId, employeeData) => {
  const response = await api.post(`/company/relocation-batches/${batchId}/employees`, employeeData);
  return response.data;
};

export const removeEmployeeFromBatch = async (batchId, employeeId) => {
  const response = await api.delete(`/company/relocation-batches/${batchId}/employees/${employeeId}`);
  return response.data;
};

export const searchBatchHousing = async (batchId) => {
  const response = await api.post(`/company/relocation-batches/${batchId}/search`);
  return response.data;
};

export const allocateEmployeeToListing = async (batchId, allocationData) => {
  const response = await api.post(`/company/relocation-batches/${batchId}/allocate`, allocationData);
  return response.data;
};

export const getBatchReport = async (batchId) => {
  const response = await api.get(`/company/relocation-batches/${batchId}/report`);
  return response.data;
};
