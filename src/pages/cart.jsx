import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/cart/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (err) {
      toast.error("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = async (itemId, qty) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/cart/update/${itemId}`,
        { qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cart updated!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to update");
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Cart cleared!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to clear cart");
      console.error(err);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>

      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map(({ _id, product, qty }) => (
            <div
              key={_id}
              className="flex items-center justify-between border p-4 rounded-lg shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">₹{product.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => handleQtyChange(_id, Math.max(1, qty - 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(_id, qty + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(_id)}
                  className="text-red-600 font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-6">
            Total: ₹{total.toFixed(2)}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => navigate("/checkout")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.delete("http://localhost:5000/api/cart/clear", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("Cart cleared!");
                  fetchCart();
                } catch (err) {
                  toast.error("Failed to clear cart");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
