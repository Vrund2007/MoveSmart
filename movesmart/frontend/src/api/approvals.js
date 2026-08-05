import api from '../lib/api';

/**
 * Enterprise Approval Workflow API Helpers
 */
export const getCompanyApprovals = async (params = {}) => {
  const response = await api.get('/company/approvals', { params });
  return response.data;
};

export const createCompanyApproval = async (approvalData) => {
  const response = await api.post('/company/approvals', approvalData);
  return response.data;
};

export const processCompanyApproval = async (approvalId, status, reason = '') => {
  const response = await api.patch(`/company/approvals/${approvalId}`, { status, reason });
  return response.data;
};
