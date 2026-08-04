import api from '../lib/api';

/**
 * Send grounded user message to Gemini Assistant
 * @param {string} message - User question
 * @returns {Promise<object>} Assistant response payload { reply: string }
 */
export const sendMessage = async (message) => {
  const response = await api.post('/assistant/chat', { message });
  return response.data;
};
