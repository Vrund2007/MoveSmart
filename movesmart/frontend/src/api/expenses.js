import api from '../lib/api';

/**
 * Enterprise Relocation Expense Tracker API Helpers
 */
export const getCompanyExpenses = async (params = {}) => {
  const response = await api.get('/company/expenses', { params });
  return response.data;
};

export const createCompanyExpense = async (expenseData) => {
  const response = await api.post('/company/expenses', expenseData);
  return response.data;
};

export const deleteCompanyExpense = async (expenseId) => {
  const response = await api.delete(`/company/expenses/${expenseId}`);
  return response.data;
};
