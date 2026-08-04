import api from '../lib/api';

/**
 * Fetch XGBoost Fair Rent Prediction for a specific listing
 * @param {string} listingId - Listing ID
 * @returns {Promise<object>} Rent prediction payload
 */
export const getRentPrediction = async (listingId) => {
  const response = await api.get(`/listings/${listingId}/rent-prediction`);
  return response.data;
};

/**
 * Fetch Isolation Forest Suspicious Listing Trust Signal for a specific listing
 * @param {string} listingId - Listing ID
 * @returns {Promise<object>} Trust score payload
 */
export const getTrustSignal = async (listingId) => {
  const response = await api.get(`/listings/${listingId}/trust-score`);
  return response.data;
};
