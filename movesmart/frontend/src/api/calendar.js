import api from '../lib/api';

/**
 * Universal Calendar API Client
 */
export const getCalendarEvents = async (params = {}) => {
  const response = await api.get('/calendar/events', { params });
  return response.data;
};

export const createCalendarEvent = async (eventData) => {
  const response = await api.post('/calendar/events', eventData);
  return response.data;
};

export const deleteCalendarEvent = async (eventId) => {
  const response = await api.delete(`/calendar/events/${eventId}`);
  return response.data;
};
