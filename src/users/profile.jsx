import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/auth';

const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const userData = localStorage.getItem("user");
      
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        setName(user.name);
        setAddress(user.address || {
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zip: "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
      toast.error("Please login again.");
    }
  };

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "https://backend-g-gold.vercel.app/api/users/update",
        { name, password, address }
      );
      
      // Update localStorage with new user data
      const updatedUser = { ...user, name, address };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile updated!");
      setPassword(""); // reset password field
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out!");
  };

  const handleViewOrders = () => {
    navigate("/my-orders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              👤 My Profile
            </h1>
            <p className="text-gray-600 text-lg">Manage your account settings and personal information</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Account Type</div>
                <div className="font-bold text-blue-600 capitalize">{user.role}</div>
              </div>
              <div className="text-sm text-gray-500">
                Member since {user.createdAt && new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">✏️</span> Edit Profile
              </h3>

              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                      value={user.email || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                {/* Address Section */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📍</span> Delivery Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={address.fullName}
                      onChange={e => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Full Name"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    />
                    <input
                      value={address.phone}
                      onChange={e => setAddress({ ...address, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    />
                    <input
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      placeholder="Street Address"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white md:col-span-2"
                    />
                    <input
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    />
                    <input
                      value={address.state}
                      onChange={e => setAddress({ ...address, state: e.target.value })}
                      placeholder="State"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    />
                    <input
                      value={address.zip}
                      onChange={e => setAddress({ ...address, zip: e.target.value })}
                      placeholder="ZIP Code"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>💾</span>
                  <span>Update Profile</span>
                </button>
              </form>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <button
                  onClick={handleViewOrders}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>📦</span>
                  <span>Order History</span>
                </button>
                <button
                  onClick={()=> handleLogout()}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
