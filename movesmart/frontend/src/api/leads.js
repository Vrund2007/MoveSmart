import api from '../lib/api';

/**
 * Leads API Client Wrappers
 */
export const getLeads = async () => {
  const response = await api.get('/leads?broker=me');
  return response.data;
};

export const updateLeadStatus = async (leadId, status) => {
  const response = await api.patch(`/leads/${leadId}`, { lead_status: status });
  return response.data;
};

export const updateLeadDetails = async (leadId, payload) => {
  const response = await api.patch(`/leads/${leadId}`, payload);
  return response.data;
};
