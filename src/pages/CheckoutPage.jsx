import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/auth';

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
    setupAxiosInterceptors(navigate);
    
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Pre-fill address from user profile
      if (parsedUser.address) {
        setAddress(parsedUser.address);
      }
    }
    
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get");
      
      setCartItems(res.data || []);
      
      if (!res.data || res.data.length === 0) {
        toast.info("Your cart is empty");
        setTimeout(() => navigate("/products"), 2000);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      toast.error("Failed to load cart. Please try again.");
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
      const items = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.qty,
      }));

      await axios.post(
        "https://backend-g-gold.vercel.app/api/orders",
        { 
          items, 
          total, 
          address,
          paymentMethod 
        }
      );

      // Clear cart after successful order
      await axios.delete("https://backend-g-gold.vercel.app/api/cart/clear");

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
      await axios.put(
        "https://backend-g-gold.vercel.app/api/users/update",
        { address }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <ToastContainer />
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <ToastContainer />
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 text-lg mb-8">Add some items to proceed with checkout</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🛒 Checkout
            </h1>
            <p className="text-gray-600 text-lg">Complete your order and get fresh groceries delivered</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address & Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📍</span> Delivery Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white md:col-span-2"
                  required
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <button
                onClick={updateAddress}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>💾</span>
                <span>Save Address to Profile</span>
              </button>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">💳</span> Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-blue-600"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💵</span>
                    <div>
                      <div className="font-bold text-gray-800">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order arrives at your doorstep</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📋</span> Order Summary
              </h3>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl" style={{ animationDelay: `${index * 100}ms` }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                    </div>
                    <div className="font-bold text-green-600">₹{(item.product.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t-2 border-gray-100 pt-3">
                  <span>Total:</span>
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Place Order - ₹{total.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/cart")}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center space-x-2 mx-auto"
                >
                  <span>←</span>
                  <span>Back to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;