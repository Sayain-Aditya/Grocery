import React from "react";

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-base text-gray-600 mb-6">Welcome, Admin! You have access to all admin features.</p>
        <div className="flex flex-col gap-4 w-full items-center">
          <button
            onClick={handleLogout}
            className="w-full bg-white border border-gray-300 text-gray-700 p-2 rounded-md font-semibold shadow-sm hover:bg-gray-50 transition-colors text-base tracking-wide"
          >
            Logout
          </button>
          <button
            className="w-full bg-blue-600 text-white p-2 rounded-md font-semibold shadow-sm hover:bg-blue-700 transition-colors text-base tracking-wide"
            onClick={() => (window.location.href = "/AddProducts")}
          >
            Add Products
          </button>
          <button
            className="w-full bg-green-600 text-white p-2 rounded-md font-semibold shadow-sm hover:bg-green-700 transition-colors text-base tracking-wide"
            onClick={() => (window.location.href = "/ProductList")}
          >
            View Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
