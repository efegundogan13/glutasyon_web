import api from './axios';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post(API_ENDPOINTS.VERIFY_EMAIL, { email, code });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post(API_ENDPOINTS.RESEND_VERIFICATION, { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (email, code, password) => {
    const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, { email, code, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, userData);
    return response.data;
  },
};

export default authService;
