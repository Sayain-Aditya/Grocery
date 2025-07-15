import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import Dashboard from './dash/Dashboard';
import AdminDashboard from './dash/AdminDashboard';
import Register from './pages/Register';
import Addproduct from './Products/AddProducts';
import Lists from './users/ProductList'; 
import Edit from './Products/EditProduct'; 
import Cart  from './pages/cart';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />

        {/* Protected admin route */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/AddProducts" element={<Addproduct />} />
        <Route path="/ProductList" element={<Lists />} />
        <Route path="/EditProduct/:id" element={<Edit />} />
        <Route path="/cart" element={<Cart />} />
        
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