import api from '../lib/api';

/**
 * Client Management API Helpers
 */
export const getClients = async (params = {}) => {
  const response = await api.get('/broker/clients', { params });
  return response.data;
};

export const getClientById = async (clientId) => {
  const response = await api.get(`/broker/clients/${clientId}`);
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await api.post('/broker/clients', clientData);
  return response.data;
};

export const updateClient = async (clientId, clientData) => {
  const response = await api.put(`/broker/clients/${clientId}`, clientData);
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await api.delete(`/broker/clients/${clientId}`);
  return response.data;
};

export const addClientNote = async (clientId, noteText) => {
  const response = await api.post(`/broker/clients/${clientId}/notes`, { note: noteText });
  return response.data;
};
