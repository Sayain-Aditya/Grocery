// Session-based authentication utilities
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user;
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