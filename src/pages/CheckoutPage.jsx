import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/auth';
import { MapPin, CreditCard, ClipboardList, ShoppingCart, ShoppingBag, Save, Rocket, Loader2, Banknote } from "lucide-react";

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
      if (parsedUser.address) setAddress(parsedUser.address);
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
      await axios.post("https://backend-g-gold.vercel.app/api/orders", { items, total, address, paymentMethod });
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
      await axios.put("https://backend-g-gold.vercel.app/api/users/update", { address });
      const updatedUser = { ...user, address };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Address updated!");
    } catch {
      toast.error("Failed to update address");
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ToastContainer />
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ToastContainer />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-4 flex justify-center">
            <ShoppingCart className="w-20 h-20 text-gray-300" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to proceed with checkout</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="bg-green-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
          >
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/cart")}
            className="text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            ← Back to Cart
          </motion.button>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Checkout
          </h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address & Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-500" /> Delivery Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Full Name *" value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white" required />
                <input type="tel" placeholder="Phone Number *" value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white" required />
                <input type="text" placeholder="Street Address *" value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white md:col-span-2" required />
                <input type="text" placeholder="City *" value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white" required />
                <input type="text" placeholder="State" value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white" />
                <input type="text" placeholder="ZIP Code" value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={updateAddress}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Address to Profile
              </motion.button>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-green-500" /> Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 accent-green-500"
                  />
                  <div className="flex items-center gap-3">
                    <Banknote className="w-7 h-7 text-green-600" />
                    <div>
                      <div className="font-bold text-gray-800">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order arrives at your doorstep</div>
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-green-500" /> Order Summary
              </h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
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
                  <span className="text-green-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" /> Place Order — ₹{total.toFixed(2)}
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/cart")}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                ← Back to Cart
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
