import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStaustChnage = async (orderId, status) => {
    try{
        const token = localStorage.getItem("token");
        await axios.put(`https://backend-g-sigma.vercel.app/api/orders/update/${orderId}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(orders.map(order =>
            order._id === orderId ? { ...order, status } : order
        ));
        toast.success("Order status updated!");
        }catch(err){
            toast.error("Failed to update order status");
        }
    }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Items</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-2 border">{order._id}</td>
                  <td className="p-2 border">{order.user?.name || "-"} <br /><span className="text-xs text-gray-500">{order.user?.email}</span></td>
                  <td className="p-2 border">
                    <ul className="list-disc ml-4">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.product?.name || "Product"} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border">₹{order.total.toFixed(2)}</td>
                  <td className="p-2 border">
                    <select
                      value={order.status}
                      onChange={e => handleStaustChnage(order._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="complete">Complete</option>
                    </select>
                  </td>
                  <td className="p-2 border">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;
