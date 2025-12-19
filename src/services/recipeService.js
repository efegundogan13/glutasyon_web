import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const recipeService = {
  getRecipes: async (filters = {}) => {
    const response = await api.get(API_ENDPOINTS.GET_RECIPES, { params: filters });
    return response.data;
  },

  getRecipe: async (id) => {
    const endpoint = API_ENDPOINTS.GET_RECIPE.replace(':id', id);
    const response = await api.get(endpoint);
    return response.data;
  },

  getMyRecipes: async () => {
    const response = await api.get(API_ENDPOINTS.GET_MY_RECIPES);
    return response.data;
  },

  createRecipe: async (recipeData) => {
    const response = await api.post(API_ENDPOINTS.CREATE_RECIPE, recipeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRecipe: async (id, recipeData) => {
    const endpoint = API_ENDPOINTS.UPDATE_RECIPE.replace(':id', id);
    const response = await api.put(endpoint, recipeData);
    return response.data;
  },

  deleteRecipe: async (id) => {
    const endpoint = API_ENDPOINTS.DELETE_RECIPE.replace(':id', id);
    const response = await api.delete(endpoint);
    return response.data;
  },
};
export default recipeService;
