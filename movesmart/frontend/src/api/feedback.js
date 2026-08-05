import api from '../lib/api';

/**
 * Super Admin Feedback Center API Helpers
 */
export const getAdminFeedback = async (params = {}) => {
  const response = await api.get('/admin/feedback', { params });
  return response.data;
};

export const updateFeedbackStatus = async (feedbackId, status, resolutionNote = '') => {
  const response = await api.patch(`/admin/feedback/${feedbackId}`, { status, resolution_note: resolutionNote });
  return response.data;
};

export const submitPublicFeedback = async (data) => {
  const response = await api.post('/platform/feedback', data);
  return response.data;
};
