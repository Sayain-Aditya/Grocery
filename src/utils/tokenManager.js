import axios from 'axios';
import { clearAuth, isTokenValid } from './auth';

// Create axios interceptor to handle token expiration
const setupAxiosInterceptors = (navigate) => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && isTokenValid(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        clearAuth();
        navigate('/login');
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      return Promise.reject(error);
    }
  );
};

// Check token validity on app load
const checkTokenOnLoad = (navigate) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    if (!isTokenValid(token)) {
      clearAuth();
      navigate('/login');
      return false;
    }
    return true;
  }
  return false;
};

export { setupAxiosInterceptors, checkTokenOnLoad };