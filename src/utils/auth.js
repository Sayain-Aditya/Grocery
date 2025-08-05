// Authentication utility functions
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};


export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) return null;
    if (!isTokenValid(token)) {
      clearAuth();
      return null;
    }
    
    return JSON.parse(user);
  } catch (error) {
    clearAuth();
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return token && user && isTokenValid(token);
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user && user.role === 'admin';
};