import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        navigate("/login");
        return;
      }
      
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
    } catch (err) {
      console.error("Failed to fetch user", err);
      toast.error("Please login again.");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://backend-g-sigma.vercel.app/api/users/update",
        { name, password, address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
        👤 Your Profile
      </h2>


      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Email (read-only)</label>
          <input
            type="email"
            className="w-full border p-2 rounded bg-gray-100"
            value={user.email || ""}
            readOnly
          />
        </div>

        <div>
          <label className="block font-medium">New Password (optional)</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep existing"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="Full Name" className="p-2 border rounded" />
          <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="Phone" className="p-2 border rounded" />
          <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Street" className="p-2 border rounded" />
          <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className="p-2 border rounded" />
          <input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State" className="p-2 border rounded" />
          <input value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} placeholder="Zip Code" className="p-2 border rounded" />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>


      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>

      <button
        onClick={handleViewOrders}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        View Order History
      </button>

      <div className="mt-6 text-sm text-gray-500 text-center">
        Role: <b>{user.role}</b> • Joined on:{" "}
        {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default Profile;
