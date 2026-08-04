import api from '../lib/api';

/**
 * Cost of Living API Client Wrapper
 */
export const getCostEstimate = async (locality, rentBudget) => {
  const response = await api.get('/cost-of-living', {
    params: { locality, rent_budget: rentBudget }
  });
  return response.data;
};
