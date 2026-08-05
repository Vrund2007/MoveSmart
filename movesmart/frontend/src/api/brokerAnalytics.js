import api from '../lib/api';

/**
 * Broker Analytics & Reports API Helpers
 */
export const getBrokerAnalytics = async () => {
  const response = await api.get('/broker/analytics');
  return response.data;
};

export const getBrokerReport = async (reportType = 'leads') => {
  const response = await api.get('/broker/reports', { params: { type: reportType } });
  return response.data;
};

export const exportBrokerReportCSV = async (reportType = 'leads') => {
  const response = await api.get('/broker/reports/export', {
    params: { type: reportType },
    responseType: 'blob'
  });

  // Create download link for CSV file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `broker_${reportType}_report.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
