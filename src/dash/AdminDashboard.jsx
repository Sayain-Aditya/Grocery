import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const statsRes = await axios.get("https://backend-g-sigma.vercel.app/api/users/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersRes = await axios.get("https://backend-g-sigma.vercel.app/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
        setOrders(ordersRes.data.slice(0, 5)); // recent 5 orders
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Users" value={stats.totalUsers} color="bg-purple-600" />
              <StatCard title="Total Orders" value={stats.totalOrders} color="bg-blue-600" />
              <StatCard title="Total Products" value={stats.totalProducts} color="bg-yellow-500" />
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} color="bg-green-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-4 rounded shadow border">
                <h2 className="text-lg font-semibold mb-2 text-center">Orders per Month</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-4 rounded shadow border">
                <h2 className="text-lg font-semibold mb-2 text-center">Revenue per Month</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.monthlyStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4">Order ID</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{o._id.slice(0, 6)}...</td>
                    <td className="py-2 px-4">{o.user?.name}</td>
                    <td className="py-2 px-4">₹{o.total}</td>
                    <td className="py-2 px-4">{o.status}</td>
                    <td className="py-2 px-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No recent orders.</p>
          )}
        </div>

        {/* Admin Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleLogout}
            className="bg-gray-200 px-4 py-2 rounded shadow hover:bg-gray-300"
          >
            Logout
          </button>
          <button
            onClick={() => (window.location.href = "/AddProducts")}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Add Products
          </button>
          <button
            onClick={() => (window.location.href = "/ProductList")}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            View Products
          </button>
          <button
            onClick={() => (window.location.href = "/admin/orders")}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`p-5 rounded-lg text-white shadow-md ${color}`}>
    <h4 className="text-sm uppercase">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
