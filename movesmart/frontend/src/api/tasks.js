import api from '../lib/api';

/**
 * Task Management API Helpers
 */
export const getTasks = async (params = {}) => {
  const response = await api.get('/broker/tasks', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/broker/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/broker/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/broker/tasks/${taskId}`);
  return response.data;
};
