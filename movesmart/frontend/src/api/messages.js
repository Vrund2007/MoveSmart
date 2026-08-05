import api from '../lib/api';

/**
 * User Messaging Client Wrappers
 */
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const startConversation = async (recipientId, listingId = null, initialMessage = '') => {
  const response = await api.post('/messages/conversations', {
    recipient_id: recipientId,
    listing_id: listingId,
    initial_message: initialMessage
  });
  return response.data;
};

export const getConversationDetail = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  return response.data;
};

export const getConversationById = getConversationDetail;

export const sendMessageToConversation = async (conversationId, text) => {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, { text });
  return response.data;
};

export const sendMessage = sendMessageToConversation;
