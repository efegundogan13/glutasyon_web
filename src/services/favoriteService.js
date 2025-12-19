import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const favoriteService = {
  getFavorites: async () => {
    const response = await api.get(API_ENDPOINTS.GET_FAVORITES);
    return response.data;
  },

  addFavorite: async (restaurantId) => {
    const response = await api.post(API_ENDPOINTS.ADD_FAVORITE, { restaurantId });
    return response.data;
  },

  removeFavorite: async (restaurantId) => {
    const endpoint = API_ENDPOINTS.REMOVE_FAVORITE.replace(':restaurantId', restaurantId);
    const response = await api.delete(endpoint);
    return response.data;
  },
};
export default favoriteService;
