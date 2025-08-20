import React from "react";
import { useEffect } from "react";
import { clearAuth } from '../utils/auth';

const Dashboard = () => {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      window.location.href = "/login";
    } else {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      {user && (
        <div className="p-6 rounded">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}</h2>
          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="mb-2">
            <strong>Role:</strong> {user.role}
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded shadow-md hover:bg-red-600"
          >
            Logout
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded shadow-md hover:bg-blue-600 ml-4"
            onClick={() => (window.location.href = "/ProductList")}
          >
            View Products
          </button>
          <button
            onClick={() => (window.location.href = "/profile")}
            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          >
            View Profile
          </button>
          
        </div>
      )}
    </div>
  );
};

export default Dashboard;
