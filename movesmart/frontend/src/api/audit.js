import api from '../lib/api';

/**
 * Super Admin Audit Logs API Helper
 */
export const getAdminAuditLogs = async (params = {}) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};
