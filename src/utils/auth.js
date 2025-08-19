// Authentication utility functions
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true; // If no expiration, consider valid
    
    const currentTime = Date.now() / 1000;
    // Allow 5 minutes buffer for Vercel deployment time differences
    return payload.exp > (currentTime - 300);
  } catch (error) {
    console.warn('Token validation error:', error);
    return false;
  }
};


export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      clearAuth();
      return null;
    }
    
    if (!isTokenValid(token)) {
      clearAuth();
      return null;
    }
    
    return JSON.parse(user);
  } catch (error) {
    console.error('Error getting stored user:', error);
    clearAuth();
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      clearAuth();
      return false;
    }
    
    if (!isTokenValid(token)) {
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Authentication check error:', error);
    clearAuth();
    return false;
  }
};

export const isAdmin = () => {
  try {
    const user = getStoredUser();
    return user && user.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};