import axios from 'axios';
import { clearAuth } from './auth';

let isInterceptorSetup = false;

// Setup axios for session-based authentication
const setupAxiosInterceptors = (navigate) => {
  if (isInterceptorSetup) return;
  isInterceptorSetup = true;

  // Set default config for credentials
  axios.defaults.withCredentials = true;

  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      const currentPath = window.location.pathname;
      
      if (!isAuthEndpoint && error.response?.status === 401 && 
          currentPath !== '/login' && currentPath !== '/register') {
        
        clearAuth();
        if (navigate && window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
      return Promise.reject(error);
    }
  );
};

const checkTokenOnLoad = (navigate) => {
  const user = localStorage.getItem('user');
  return !!user;
};

const resetInterceptors = () => {
  isInterceptorSetup = false;
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();
};

export { setupAxiosInterceptors, checkTokenOnLoad, resetInterceptors };