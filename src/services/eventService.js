import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const eventService = {
  getEvents: async (restaurantId) => {
    const endpoint = API_ENDPOINTS.GET_EVENTS.replace(':restaurantId', restaurantId);
    const response = await api.get(endpoint);
    return response.data;
  },

  getEvent: async (id) => {
    const endpoint = API_ENDPOINTS.GET_EVENT.replace(':id', id);
    const response = await api.get(endpoint);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post(API_ENDPOINTS.CREATE_EVENT, eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const endpoint = API_ENDPOINTS.UPDATE_EVENT.replace(':id', id);
    const response = await api.put(endpoint, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const endpoint = API_ENDPOINTS.DELETE_EVENT.replace(':id', id);
    const response = await api.delete(endpoint);
    return response.data;
  },
};
export default eventService;
