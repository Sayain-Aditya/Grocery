import axios from 'axios';
import { clearAuth, isTokenValid } from './auth';

let isInterceptorSetup = false;

// Create axios interceptor to handle token expiration
const setupAxiosInterceptors = (navigate) => {
  // Prevent multiple interceptor setups
  if (isInterceptorSetup) return;
  isInterceptorSetup = true;

  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      // Skip adding token for login and register endpoints
      const isAuthEndpoint = config.url?.includes('/login') || config.url?.includes('/register');
      
      if (!isAuthEndpoint) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only handle auth errors for protected routes, not login/register
      const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      const currentPath = window.location.pathname;
      
      // Only redirect on 401 with specific error messages
      if (!isAuthEndpoint && error.response?.status === 401 && 
          currentPath !== '/login' && currentPath !== '/register') {
        const errorMessage = error.response?.data?.message || '';
        // Be more specific about when to redirect
        if (errorMessage.includes('expired') || errorMessage.includes('No token provided') || 
            errorMessage.includes('User not found')) {
          console.warn('Authentication error:', errorMessage);
          clearAuth();
          if (navigate && window.location.pathname !== '/login') {
            navigate('/login');
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Check token validity on app load
const checkTokenOnLoad = (navigate) => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Just check if token and user exist, let server validate
    return !!(token && user);
  } catch (error) {
    console.error('Error checking token on load:', error);
    return false;
  }
};

// Reset interceptor setup flag (useful for testing or re-initialization)
const resetInterceptors = () => {
  isInterceptorSetup = false;
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();
};

export { setupAxiosInterceptors, checkTokenOnLoad, resetInterceptors };