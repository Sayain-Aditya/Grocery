import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/auth';

const UserOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders/my");
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch your orders");
    } finally {
      setLoading(false);
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
        return { 
          bg: "bg-gradient-to-r from-yellow-400 to-orange-400", 
          text: "text-white", 
          icon: "⏳" 
        };
      case "confirmed":
        return { 
          bg: "bg-gradient-to-r from-purple-400 to-purple-500", 
          text: "text-white", 
          icon: "✔️" 
        };
      case "preparing":
        return { 
          bg: "bg-gradient-to-r from-orange-400 to-orange-500", 
          text: "text-white", 
          icon: "👨‍🍳" 
        };
      case "shipped":
        return { 
          bg: "bg-gradient-to-r from-blue-400 to-blue-500", 
          text: "text-white", 
          icon: "🚚" 
        };
      case "out_for_delivery":
        return { 
          bg: "bg-gradient-to-r from-indigo-400 to-indigo-500", 
          text: "text-white", 
          icon: "🏃‍♂️" 
        };
      case "delivered":
        return { 
          bg: "bg-gradient-to-r from-green-400 to-green-500", 
          text: "text-white", 
          icon: "✅" 
        };
      case "cancelled":
        return { 
          bg: "bg-gradient-to-r from-red-400 to-red-500", 
          text: "text-white", 
          icon: "❌" 
        };
      default:
        return { 
          bg: "bg-gradient-to-r from-gray-400 to-gray-500", 
          text: "text-white", 
          icon: "📦" 
        };
    }
  };

  const getDeliveryTimeline = (status, createdAt) => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'confirmed', label: 'Order Confirmed', icon: '✔️' },
      { key: 'preparing', label: 'Preparing Order', icon: '👨‍🍳' },
      { key: 'shipped', label: 'Order Shipped', icon: '🚚' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🏃‍♂️' },
      { key: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const currentStatusIndex = statuses.findIndex(s => s.key === status?.toLowerCase());
    
    return statuses.map((statusItem, index) => ({
      ...statusItem,
      completed: index <= currentStatusIndex,
      active: index === currentStatusIndex,
      time: index === 0 ? new Date(createdAt).toLocaleString('en-IN') : null
    }));
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTracking(true);
  };

  const handleShowInvoice = (order) => {
    navigate(`/invoice/${order._id}`, { state: { order } });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status?.toLowerCase() === filter;
  });

  const getFilterCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter(order => order.status?.toLowerCase() === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📦 My Orders
            </h1>
            <p className="text-gray-600 text-lg">Track and manage your order history</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders by status, items, or order ID..."
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
            {["all", "pending", "confirmed", "preparing", "shipped", "out_for_delivery", "delivered", "cancelled"].map((status) => {
              const count = getFilterCount(status);
              const isActive = filter === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "📄 All" : `${getStatusConfig(status).icon} ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  {count > 0 && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      isActive ? "bg-white/20" : "bg-blue-100 text-blue-800"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Orders Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading your orders...</div>
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
            <p className="text-gray-500">
              {filter === "all" ? "You haven't placed any orders yet." : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg`}>
                        <span>{statusConfig.icon}</span>
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🛒</span> Items ({order.items.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
                            <span className="text-gray-700 text-sm">
                              {item.product?.name || "Product"}
                            </span>
                            <span className="text-gray-600 text-sm font-semibold">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">💰 Total Amount:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-1 text-sm"
                      >
                        <span>📍</span>
                        <span>Track</span>
                      </button>
                      <button
                        onClick={() => handleShowInvoice(order)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-1 text-sm"
                      >
                        <span>📎</span>
                        <span>Invoice</span>
                      </button>
                      <button
                        onClick={() => navigate('/products')}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <span>🔁</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Tracking</h3>
                <button
                  onClick={() => setShowTracking(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Order #{selectedOrder._id.slice(-8)}</p>
                <p className="text-lg font-semibold text-gray-800">₹{selectedOrder.total.toFixed(2)}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {getDeliveryTimeline(selectedOrder.status, selectedOrder.createdAt).map((step, index) => (
                  <div key={step.key} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step.completed 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : step.active 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed || step.active ? step.icon : '○'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        step.completed || step.active ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.time && (
                        <p className="text-xs text-gray-500">{step.time}</p>
                      )}
                      {step.active && (
                        <p className="text-xs text-blue-600 font-semibold">Current Status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowTracking(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;
