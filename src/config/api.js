// API Configuration
// For development, use local URL
// For production, this should be replaced with your production backend URL
const isDevelopment = false; // Use production backend

export const API_BASE_URL = isDevelopment 
  ? 'http://192.168.1.101:3001/api' 
  : 'https://glutasyon-backend-production.up.railway.app/api';

export const BACKEND_URL = isDevelopment 
  ? 'http://192.168.1.101:3001' 
  : 'https://glutasyon-backend-production.up.railway.app';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400';
  // If it's base64 data URI, return as is
  if (imagePath.startsWith('data:')) return imagePath;
  // If it's already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it's a local upload path, prepend backend URL
  return `${BACKEND_URL}/${imagePath}`;
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GET_PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  
  // Restaurants
  GET_RESTAURANTS: '/restaurants',
  GET_RESTAURANT: '/restaurants/:id',
  CREATE_RESTAURANT: '/restaurants',
  UPDATE_RESTAURANT: '/restaurants/:id',
  DELETE_RESTAURANT: '/restaurants/:id',
  APPLY_RESTAURANT: '/restaurants/apply',
  APPROVE_RESTAURANT: '/restaurants/:id/approve',
  REJECT_RESTAURANT: '/restaurants/:id/reject',
  GET_PENDING_RESTAURANTS: '/restaurants/pending',
  
  // Reviews
  GET_REVIEWS: '/reviews/restaurant/:restaurantId',
  CREATE_REVIEW: '/reviews',
  APPROVE_REVIEW: '/reviews/:id/approve',
  DELETE_REVIEW: '/reviews/:id',
  
  // Favorites
  GET_FAVORITES: '/favorites',
  ADD_FAVORITE: '/favorites',
  REMOVE_FAVORITE: '/favorites/:restaurantId',
  
  // Recipes
  GET_RECIPES: '/recipes',
  GET_RECIPE: '/recipes/:id',
  CREATE_RECIPE: '/recipes',
  UPDATE_RECIPE: '/recipes/:id',
  DELETE_RECIPE: '/recipes/:id',
  GET_MY_RECIPES: '/recipes/my/recipes',
  
  // Events/Campaigns
  GET_EVENTS: '/events/restaurant/:restaurantId',
  GET_EVENT: '/events/:id',
  CREATE_EVENT: '/events',
  UPDATE_EVENT: '/events/:id',
  DELETE_EVENT: '/events/:id',
  
  // Products
  GET_PRODUCTS: '/products/restaurant/:restaurantId',
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: '/products/:id',
  DELETE_PRODUCT: '/products/:id',
};
