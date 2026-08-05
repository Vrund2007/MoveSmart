import api from '../lib/api';

/**
 * Super Admin Analytics & CSV Export Helpers
 */
export const exportAdminAnalyticsCSV = async () => {
  const response = await api.get('/admin/analytics/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'admin_platform_analytics.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
