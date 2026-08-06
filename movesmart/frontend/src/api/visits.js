import api from '../lib/api';

/**
 * Property Visit Scheduling Client Wrappers
 */
export const scheduleVisit = async (visitData) => {
  const response = await api.post('/visits', visitData);
  return response.data;
};

export const createVisit = scheduleVisit;

export const getVisits = async (listingId = null) => {
  const url = listingId ? `/visits?listing_id=${listingId}` : '/visits';
  const response = await api.get(url);
  return response.data;
};

export const getSeekerVisits = getVisits;

export const updateVisitStatus = async (visitId, status, notes = '') => {
  const response = await api.put(`/visits/${visitId}/status`, { status, notes });
  return response.data;
};

