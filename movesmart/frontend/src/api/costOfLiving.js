import api from '../lib/api';

/**
 * Cost of Living API Client Wrapper — supports dynamic locality, BHK, household type, lifestyle & commute mode
 */
export const getCostEstimate = async (locality, rentBudget, bhk, householdType, lifestyle, commuteMode) => {
  const response = await api.get('/cost-of-living', {
    params: {
      locality,
      rent_budget: rentBudget,
      bhk,
      household_type: householdType,
      lifestyle,
      commute_mode: commuteMode
    }
  });
  return response.data;
};
