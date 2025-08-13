import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders/all");
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`https://backend-g-sigma.vercel.app/api/orders/${orderId}/status`, {
        status: newStatus
      });
      toast.success("Order status updated!");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
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
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🛠️ Order Management
            </h1>
            <p className="text-gray-600 text-lg">Manage and update order statuses</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
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

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading orders...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Order Info */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-lg font-bold text-green-600">₹{order.total.toFixed(2)}</p>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <p className="font-semibold text-gray-800">{order.user?.name}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                      <p className="text-sm text-gray-600">📱 {order.address?.phone}</p>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">Items ({order.items.length})</p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-600">
                            {item.product?.name} x{item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="space-y-3">
                      <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-2 rounded-full text-sm font-semibold flex items-center justify-center space-x-1`}>
                        <span>{statusConfig.icon}</span>
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}</span>
                      </div>
                      
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagement;