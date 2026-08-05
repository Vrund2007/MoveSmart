import api from '../lib/api';

/**
 * Super Admin CMS Content Manager API Helpers
 */
export const getCMSPage = async (slug) => {
  const response = await api.get(`/admin/cms/${slug}`);
  return response.data;
};

export const updateCMSPage = async (slug, title, content) => {
  const response = await api.put(`/admin/cms/${slug}`, { title, content });
  return response.data;
};
