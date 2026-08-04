// src/api/payments.js — Owner payment / income tracking API wrappers
import api from '../lib/api';

export const getPayments = async () => {
  const res = await api.get('/owner/payments/');
  return res.data;
};

export const createPayment = async (data) => {
  const res = await api.post('/owner/payments/', data);
  return res.data;
};

export const updatePayment = async (id, data) => {
  const res = await api.put(`/owner/payments/${id}/`, data);
  return res.data;
};

export const deletePayment = async (id) => {
  const res = await api.delete(`/owner/payments/${id}/`);
  return res.data;
};
