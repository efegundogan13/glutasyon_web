import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const restaurantService = {
  getRestaurants: async (filters = {}) => {
    const response = await api.get(API_ENDPOINTS.GET_RESTAURANTS, { params: filters });
    return response.data;
  },

  getRestaurant: async (id) => {
    const endpoint = API_ENDPOINTS.GET_RESTAURANT.replace(':id', id);
    const response = await api.get(endpoint);
    return response.data;
  },

  applyRestaurant: async (formData) => {
    const response = await api.post(API_ENDPOINTS.APPLY_RESTAURANT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRestaurant: async (id, data) => {
    const endpoint = API_ENDPOINTS.UPDATE_RESTAURANT.replace(':id', id);
    const response = await api.put(endpoint, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteRestaurant: async (id) => {
    const endpoint = API_ENDPOINTS.DELETE_RESTAURANT.replace(':id', id);
    const response = await api.delete(endpoint);
    return response.data;
  },

  getPendingRestaurants: async () => {
    const response = await api.get(API_ENDPOINTS.GET_PENDING_RESTAURANTS);
    return response.data;
  },

  approveRestaurant: async (id) => {
    const endpoint = API_ENDPOINTS.APPROVE_RESTAURANT.replace(':id', id);
    const response = await api.put(endpoint);
    return response.data;
  },

  rejectRestaurant: async (id, reason) => {
    const endpoint = API_ENDPOINTS.REJECT_RESTAURANT.replace(':id', id);
    const response = await api.put(endpoint, { reason });
    return response.data;
  },

  getMyRestaurants: async () => {
    const response = await api.get('/restaurants/my');
    return response.data.restaurants || response.data;
  },

  uploadMenu: async (restaurantId, file) => {
    const formData = new FormData();
    formData.append('menuPdf', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name || 'menu.pdf',
    });

    const response = await api.put(`/restaurants/${restaurantId}/menu`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default restaurantService;
