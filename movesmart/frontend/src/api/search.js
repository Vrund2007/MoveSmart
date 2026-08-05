import api from '../lib/api';

/**
 * Global Search Engine API Client
 */
export const globalSearch = async (queryStr) => {
  const response = await api.get('/search', { params: { q: queryStr } });
  return response.data;
};
