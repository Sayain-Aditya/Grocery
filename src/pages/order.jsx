import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ShoppingCart, Package, Rocket, Loader2, PartyPopper } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

const OrderPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.address) setAddress(storedUser.address);
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.city) {
      toast.error("Please fill in all required fields");
      return;
    }
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
      await axios.delete("https://backend-g-gold.vercel.app/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaced(true);
      toast.success("Order placed successfully!");
      setTimeout(() => navigate("/my-orders"), 2000);
    } catch {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const fields = [
    { key: "fullName", label: "Full Name", placeholder: "John Doe", required: true },
    { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210", required: true },
    { key: "street", label: "Street Address", placeholder: "123 Main Street", required: true, full: true },
    { key: "city", label: "City", placeholder: "Mumbai", required: true },
    { key: "state", label: "State", placeholder: "Maharashtra" },
    { key: "zip", label: "ZIP Code", placeholder: "400001" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <PartyPopper className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500">Redirecting to your orders...</p>
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
            <Package className="w-6 h-6" /> Place Order
          </h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/products")}
              className="mt-4 bg-green-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
            >
              <ShoppingCart className="w-5 h-5" /> Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Address Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <h3 className="text-xl font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" /> Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field, i) => (
                    <motion.div
                      key={field.key}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className={field.full ? "md:col-span-2" : ""}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={address[field.key]}
                        onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all text-gray-800"
                        required={field.required}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Cart Items Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >
                <h3 className="text-xl font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Order Items
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {cartItems.map(({ _id, product, qty }, i) => (
                      <motion.div
                        key={_id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{product.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {qty}</p>
                        </div>
                        <span className="font-extrabold text-green-600">
                          ₹{(product.price * qty).toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24"
              >
                <h3 className="text-xl font-extrabold text-gray-800 mb-5">Order Summary</h3>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cartItems.length})</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment</span>
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-extrabold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
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
        )}
      </div>
    </div>
  );
};

export default OrderPage;
