import api from '../lib/api';

/**
 * Enterprise Broker Assignment API Helpers
 */
export const getBrokerAssignments = async (params = {}) => {
  const response = await api.get('/company/broker-assignments', { params });
  return response.data;
};

export const createBrokerAssignment = async (assignmentData) => {
  const response = await api.post('/company/broker-assignments', assignmentData);
  return response.data;
};

export const updateBrokerAssignmentStatus = async (assignmentId, status) => {
  const response = await api.patch(`/company/broker-assignments/${assignmentId}`, { status });
  return response.data;
};
