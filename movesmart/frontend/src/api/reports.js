import api from '../lib/api';

/**
 * Universal Platform Reports API Client
 */
export const getPlatformReport = async (reportType = 'overview') => {
  const response = await api.get('/reports', { params: { type: reportType } });
  return response.data;
};

export const exportPlatformReportCSV = async () => {
  const response = await api.get('/reports/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'platform_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
