import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !userData) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Pre-fill address from user profile
    if (parsedUser.address) {
      setAddress(parsedUser.address);
    }
    
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/cart/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Cart data:', res.data);
      setCartItems(res.data || []);
      
      if (!res.data || res.data.length === 0) {
        toast.info("Your cart is empty");
        setTimeout(() => navigate("/products"), 2000);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      toast.error("Failed to load cart. Please try again.");
      
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setCartLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.fullName || !address.phone || !address.street || !address.city) {
      toast.error("Please fill in all required address fields");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const items = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.qty,
      }));

      await axios.post(
        "https://backend-g-sigma.vercel.app/api/orders",
        { 
          items, 
          total, 
          address,
          paymentMethod 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear cart after successful order
      await axios.delete("https://backend-g-sigma.vercel.app/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully!");
      setTimeout(() => navigate("/my-orders"), 2000);
    } catch (err) {
      toast.error("Failed to place order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://backend-g-sigma.vercel.app/api/users/update",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update localStorage
      const updatedUser = { ...user, address };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Address updated!");
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ToastContainer />
        <div className="text-center py-16">
          <div className="text-lg text-gray-600">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ToastContainer />
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Address Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              className="p-3 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              className="p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Street Address *"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="p-3 border rounded-lg md:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="City *"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="p-3 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={address.zip}
              onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              className="p-3 border rounded-lg"
            />
          </div>

          <button
            onClick={updateAddress}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-4"
          >
            Save Address to Profile
          </button>

          {/* Payment Method */}
          <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-semibold">Cash on Delivery</div>
                <div className="text-sm text-gray-600">Pay when your order arrives</div>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                </div>
                <div className="font-bold">₹{(item.product.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || cartItems.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Placing Order..." : `Place Order - ₹${total.toFixed(2)}`}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/cart")}
              className="text-blue-600 hover:underline"
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;