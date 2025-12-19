import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const reviewService = {
  getReviews: async (restaurantId) => {
    const endpoint = API_ENDPOINTS.GET_REVIEWS.replace(':restaurantId', restaurantId);
    const response = await api.get(endpoint);
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/my');
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await api.post(API_ENDPOINTS.CREATE_REVIEW, reviewData);
    return response.data;
  },

  approveReview: async (id) => {
    const endpoint = API_ENDPOINTS.APPROVE_REVIEW.replace(':id', id);
    const response = await api.post(endpoint);
    return response.data;
  },

  deleteReview: async (id) => {
    const endpoint = API_ENDPOINTS.DELETE_REVIEW.replace(':id', id);
    const response = await api.delete(endpoint);
    return response.data;
  },
};
export default reviewService;
