import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
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

import OrderPage from './pages/order'; // Import OrderPage component
import CheckoutPage from './pages/CheckoutPage';
import AdminOrderList from './dash/AdminOrderList';
import UserOrderHistory from './users/UserOrderHistory';
import InvoicePage from './users/InvoicePage';

const App = () => {
  return (
    <BrowserRouter>
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
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin/orders" element={<RequireAdmin><AdminOrderList /></RequireAdmin>} />
        <Route path="/my-orders" element={<UserOrderHistory />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        
        {/* Redirect any unknown paths to login */}


      </Routes>
    </BrowserRouter>
  );
}


// HOC for admin route protection
function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    return <Navigate to="/AdminDashboard" replace />;
  }
  return children;
}

export default App