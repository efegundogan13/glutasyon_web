import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const productService = {
  getProducts: async (restaurantId) => {
    const endpoint = API_ENDPOINTS.GET_PRODUCTS.replace(':restaurantId', restaurantId);
    const response = await api.get(endpoint);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post(API_ENDPOINTS.CREATE_PRODUCT, productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const endpoint = API_ENDPOINTS.UPDATE_PRODUCT.replace(':id', id);
    const response = await api.put(endpoint, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const endpoint = API_ENDPOINTS.DELETE_PRODUCT.replace(':id', id);
    const response = await api.delete(endpoint);
    return response.data;
  },
};
export default productService;
