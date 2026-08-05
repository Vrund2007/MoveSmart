import api from '../lib/api';

/**
 * Enterprise Corporate Reports API Helpers
 */
export const getCompanyReport = async (reportType = 'employees') => {
  const response = await api.get('/company/reports', { params: { type: reportType } });
  return response.data;
};

export const exportCompanyReportCSV = async (reportType = 'employees') => {
  const response = await api.get('/company/reports/export', {
    params: { type: reportType },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `company_${reportType}_report.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const askAIEnterpriseAssistant = async (query) => {
  const response = await api.post('/company/ai-assistant', { query });
  return response.data;
};
