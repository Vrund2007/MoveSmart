import api from '../lib/api';

/**
 * Property Visit Scheduling Client Wrappers
 */
export const scheduleVisit = async (visitData) => {
  const response = await api.post('/visits', visitData);
  return response.data;
};

export const getVisits = async () => {
  const response = await api.get('/visits');
  return response.data;
};

export const updateVisitStatus = async (visitId, status, notes = '') => {
  const response = await api.put(`/visits/${visitId}/status`, { status, notes });
  return response.data;
};
