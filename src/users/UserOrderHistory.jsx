import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(""); // Search bar state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError("Failed to fetch your orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Search orders by query
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://backend-g-sigma.vercel.app/api/orders/search?query=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data.results);
      setError("");
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper for status color
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "complete":
        return "bg-green-200 text-green-900";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigate = useNavigate();
  const handleShowInvoice = (order) => {
    navigate(`/invoice/${order._id}`, { state: { order } });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">My Orders</h2>
      <form
        onSubmit={handleSearch}
        className="mb-4 flex gap-2 justify-center"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders by status, name, city..."
          className="p-2 border rounded w-64"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg shadow p-4 bg-white flex flex-col gap-2"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Order ID:</span>
                <span className="text-xs text-gray-500">{order._id}</span>
              </div>
              <div>
                <span className="font-semibold">Items:</span>
                <ul className="list-disc ml-6 mt-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="text-gray-700">
                      {item.product?.name || "Product"} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() +
                    order.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Placed on:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm self-end"
                onClick={() => handleShowInvoice(order)}
              >
                Show Invoice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;
