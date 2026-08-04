// src/api/reviews.js — Owner tenant reviews API wrappers
import api from '../lib/api';

export const getOwnerReviews = async () => {
  const res = await api.get('/owner/reviews/');
  return res.data;
};

export const createReview = async (data) => {
  const res = await api.post('/owner/reviews/', data);
  return res.data;
};

export const replyToReview = async (reviewId, reply) => {
  const res = await api.post(`/owner/reviews/${reviewId}/reply/`, { reply });
  return res.data;
};

export const getPropertyReviews = async (propertyId) => {
  const res = await api.get(`/owner/reviews/property/${propertyId}/`);
  return res.data;
};
