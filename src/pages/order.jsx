import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const OrderPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser?.address) {
    setAddress(storedUser.address); // prefill from saved address
  }
}, []);

  // Fetch cart items (reuse cart logic)
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const token = localStorage.getItem("token");
      const items = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.qty,
      }));
      await axios.post(
        "https://backend-g-gold.vercel.app/api/orders",
        { items, total, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear cart after successful order
      await axios.delete("https://backend-g-gold.vercel.app/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Order placed successfully!");
      setCartItems([]);
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Place Order</h2>
      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="mb-8 p-4 bg-gray-50 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="Full Name" className="p-2 border rounded" />
              <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="Phone" className="p-2 border rounded" />
              <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Street Address" className="p-2 border rounded" />
              <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className="p-2 border rounded" />
              <input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State" className="p-2 border rounded" />
              <input value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} placeholder="Zip Code" className="p-2 border rounded" />
            </div>
          </div>
          <div className="space-y-4 mb-6">
            {cartItems.map(({ _id, product, qty }) => (
              <div
                key={_id}
                className="flex items-center gap-4 border p-3 rounded"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">Qty: {qty}</div>
                </div>
                <div className="font-bold">
                  ₹{(product.price * qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-xl mb-4">
            Total: ₹{total.toFixed(2)}
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
};

export default OrderPage;
