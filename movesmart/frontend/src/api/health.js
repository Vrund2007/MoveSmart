import api from '../lib/api';

/**
 * Perform a lightweight health check against the Django/DRF backend (GET /api/health/).
 * Used to verify server connectivity and track backend wake-up state on Render.
 */
export const checkHealth = async () => {
  const response = await api.get('/health/', { timeout: 60000 });
  return response.data;
};
