import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const statsRes = await axios.get("https://backend-g-gold.vercel.app/api/users/stats");
      const ordersRes = await axios.get("https://backend-g-gold.vercel.app/api/orders");
      setStats(statsRes.data);
      setOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🛠️ Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your grocery store operations</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ActionCard
            title="Manage Products"
            icon="📦"
            description="Add, edit, or remove products"
            onClick={() => navigate("/AddProducts")}
            gradient="from-blue-500 to-blue-600"
          />
          <ActionCard
            title="View Products"
            icon="📋"
            description="Browse all products"
            onClick={() => navigate("/ProductList")}
            gradient="from-green-500 to-green-600"
          />
          <ActionCard
            title="Order Management"
            icon="🚚"
            description="Track and update orders"
            onClick={() => navigate("/admin/orders")}
            gradient="from-purple-500 to-purple-600"
          />
          <ActionCard
            title="Analytics"
            icon="📊"
            description="View sales reports"
            onClick={() => {}}
            gradient="from-orange-500 to-orange-600"
          />
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Users" value={stats.totalUsers} icon="👥" gradient="from-purple-500 to-purple-600" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" gradient="from-blue-500 to-blue-600" />
              <StatCard title="Total Products" value={stats.totalProducts} icon="🛍️" gradient="from-yellow-500 to-yellow-600" />
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon="💰" gradient="from-green-500 to-green-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">📊</span> Orders per Month
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="orders" fill="url(#colorOrders)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">💹</span> Revenue per Month
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🕒</span> Recent Orders
          </h2>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Order ID</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Customer</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Amount</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 100}ms` }}>
                      <td className="py-4 px-6 font-mono text-sm text-gray-600">#{order._id.slice(-8)}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{order.user?.name}</td>
                      <td className="py-4 px-6 font-bold text-green-600">₹{order.total.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No recent orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-semibold opacity-90 uppercase tracking-wide">{title}</h4>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  </div>
);

const ActionCard = ({ title, icon, description, onClick, gradient }) => (
  <div 
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-2xl`}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm opacity-90">{description}</p>
  </div>
);

export default AdminDashboard;
