// src/api/documents.js — Owner & Universal document management API wrappers
import api from '../lib/api';

export const getDocuments = async (propertyId) => {
  const params = propertyId ? { property_id: propertyId } : {};
  const res = await api.get('/owner/documents/', { params });
  return res.data;
};

export const getOwnerDocuments = getDocuments;

export const uploadDocument = async (data) => {
  const res = await api.post('/owner/documents/', data);
  return res.data;
};

export const createDocument = uploadDocument;

export const deleteDocument = async (id) => {
  const res = await api.delete(`/owner/documents/${id}/`);
  return res.data;
};
