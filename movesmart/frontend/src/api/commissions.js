import api from '../lib/api';

/**
 * Commissions API Client Wrappers
 */
export const getCommissions = async () => {
  const response = await api.get('/commissions');
  return response.data;
};

export const createCommission = async (commissionData) => {
  const response = await api.post('/commissions', commissionData);
  return response.data;
};

export const updateCommissionStatus = async (commissionId, paymentStatus) => {
  const response = await api.patch(`/commissions/${commissionId}`, { payment_status: paymentStatus });
  return response.data;
};
