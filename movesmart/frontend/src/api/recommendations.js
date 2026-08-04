import api from '../lib/api';

/**
 * Recommendations API Client Wrappers
 */
export const getAreaRecommendations = async (profilePayload) => {
  const response = await api.post('/recommendations/areas', profilePayload);
  return response.data;
};
