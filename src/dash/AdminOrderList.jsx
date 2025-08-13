import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders");
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.put(
        `https://backend-g-sigma.vercel.app/api/orders/update/${orderId}/status`,
        { status }
      );
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success("Order status updated!");
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchOrders();
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(
        `https://backend-g-sigma.vercel.app/api/orders/search?query=${encodeURIComponent(search)}`
      );
      setOrders(res.data.results);
      setError("");
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" };
      case "confirmed":
        return { bg: "bg-purple-100", text: "text-purple-800", icon: "✔️" };
      case "preparing":
        return { bg: "bg-orange-100", text: "text-orange-800", icon: "👨🍳" };
      case "shipped":
        return { bg: "bg-blue-100", text: "text-blue-800", icon: "🚚" };
      case "out_for_delivery":
        return { bg: "bg-indigo-100", text: "text-indigo-800", icon: "🏃♂️" };
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-800", icon: "✅" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800", icon: "❌" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: "📦" };
    }
  };

  const statusOptions = [
    "pending", "confirmed", "preparing", "shipped", "out_for_delivery", "delivered", "cancelled"
  ];

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status?.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📋 All Orders
              </h1>
              <p className="text-gray-600 text-lg">Manage all customer orders</p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders by status, name, city..."
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Search
              </button>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["all", ...statusOptions].map((status) => {
              const count = status === "all" ? orders.length : orders.filter(o => o.status?.toLowerCase() === status).length;
              const isActive = filter === status;
              const config = getStatusConfig(status);
              
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "📄 All" : `${config.icon} ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isActive ? "bg-white/20" : "bg-blue-100 text-blue-800"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading orders...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Items</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">#{order._id.slice(-8)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{order.user?.name || "-"}</p>
                            <p className="text-sm text-gray-500">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm text-gray-700">
                                {item.product?.name || "Product"} x{item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">₹{order.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit`}>
                              <span>{statusConfig.icon}</span>
                              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}</span>
                            </div>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="w-full p-1 border border-gray-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;
