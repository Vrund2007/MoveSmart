// src/api/ownerVisits.js — Owner-scoped visit management API wrappers
import api from '../lib/api';

export const getOwnerVisits = async () => {
  const res = await api.get('/owner/visits/');
  return res.data;
};

export const updateOwnerVisitStatus = async (visitId, status, notes = '') => {
  const res = await api.put(`/owner/visits/${visitId}/status/`, { status, notes });
  return res.data;
};
