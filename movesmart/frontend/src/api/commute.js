import api from '../lib/api';

/**
 * Commute API Client Wrapper
 */
export const getCommuteEstimate = async (fromLocality, toDestination, mode = 'driving') => {
  const response = await api.get('/commute', {
    params: { from: fromLocality, to: toDestination, mode }
  });
  return response.data;
};
