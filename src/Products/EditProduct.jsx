import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const [form, setForm] = React.useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: "",
  });
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/get/${id}`);
        setForm({
          name: res.data.name || "",
          price: res.data.price || "",
          category: res.data.category || "",
          description: res.data.description || "",
          image: res.data.image || "",
          stock: res.data.stock || "",
        });
      } catch (err) {
        setMessage("Failed to fetch product details.");
      }
    };
    fetchProduct();
    // eslint-disable-next-line
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/products/update/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Product updated successfully!");
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      setMessage(
        err.response?.data.message || "Failed to update product. Please try again."
      );
    }
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      {message && (
        <p className="mb-4 text-base text-center font-semibold text-green-700 bg-green-100 border border-green-300 rounded p-2 w-11/12">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 w-full px-8 pb-10 pt-6 flex flex-col items-center"
      >
        <input
          name="name"
          type="text"
          placeholder="Product Name"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-blue-50"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-blue-50"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          name="category"
          type="text"
          placeholder="Category"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-blue-50"
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm min-h-[80px] bg-blue-50"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        ></textarea>
        <input
          name="image"
          type="text"
          placeholder="Image URL"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-blue-50"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock Quantity"
          className="w-full p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-blue-50"
          required
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-colors text-lg tracking-wide"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {EditProduct ? "Edit Product" : "Add Productt"}
          </span>
        </button>
        <button
          type="button"
          className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white p-3 rounded-xl mt-2 font-semibold shadow hover:from-gray-500 hover:to-gray-700 transition-colors text-lg tracking-wide"
          onClick={() => navigate("/admin")}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m10.5 0v10.125c0 1.243-1.007 2.25-2.25 2.25H7.5a2.25 2.25 0 01-2.25-2.25V9m13.5 0h-15"
              />
            </svg>
            Back to Admin Dashboard
          </span>
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
