import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, clearAuth } from './utils/auth';
import { setupAxiosInterceptors, checkTokenOnLoad } from './utils/tokenManager';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginPage';
import Dashboard from './dash/Dashboard';
import AdminDashboard from './dash/AdminDashboard';
import Register from './pages/Register';
import Addproduct from './Products/AddProducts';
import Lists from './users/ProductList'; 
import Edit from './Products/EditProduct'; 
import Cart  from './pages/cart';
import Profile from './users/profile';
import OrderPage from './pages/order';
import CheckoutPage from './pages/CheckoutPage';
import AdminOrderList from './dash/AdminOrderList';
import UserOrderHistory from './users/UserOrderHistory';
import InvoicePage from './users/InvoicePage';


const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Setup axios interceptors for token management
    setupAxiosInterceptors(navigate);
    // Check token validity on app load
    checkTokenOnLoad(navigate);
  }, [navigate]);

  return (
    <Routes>
        <Route path="/register" element={<Register />} />
        {/* Home page as root */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />


        {/* Protected admin route */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/AddProducts" element={<Addproduct />} />
        <Route path="/ProductList" element={<Lists />} />
        <Route path="/products" element={<Lists />} />
        <Route path="/EditProduct/:id" element={<Edit />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/order" element={<RequireAuth><OrderPage /></RequireAuth>} />
        <Route path="/admin/orders" element={<RequireAdmin><AdminOrderList /></RequireAdmin>} />
        <Route path="/my-orders" element={<RequireAuth><UserOrderHistory /></RequireAuth>} />
        <Route path="/invoice/:id" element={<RequireAuth><InvoicePage /></RequireAuth>} />

        
        {/* Redirect any unknown paths to login */}


    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};


// Protected route components
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      return <Navigate to="/home" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default App