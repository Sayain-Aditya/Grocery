import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { setupAxiosInterceptors } from "../utils/tokenManager";
import { clearAuth } from "../utils/auth";
import VoiceOrdering from "../components/VoiceOrdering";
import {
  ShoppingCart, Search, Package, User, Truck, Leaf, Clock, Lock,
  Flame, Star, MessageSquare, Mail, Apple, Milk, Popcorn, Carrot,
  ChevronRight, Rocket, Mic
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const [showVoiceOrdering, setShowVoiceOrdering] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      setUser(JSON.parse(userData));
      fetchRecentOrders();
      fetchCartCount();
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/products/get?limit=8");
      setProducts(res.data.products || []);
    } catch (err) { console.error(err); }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/orders/my");
      setRecentOrders(res.data.slice(0, 3));
    } catch (err) { console.error(err); }
  };

  const fetchCartCount = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get");
      setCartCount(res.data.length);
    } catch (err) { console.error(err); }
  };

  const addToCart = async (productId, qty) => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    const quantity = qty || 1;
    try {
      await axios.post("https://backend-g-gold.vercel.app/api/cart/add", { productId, qty: quantity });
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
      fetchCartCount();
    } catch (err) { console.error(err); }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) navigate(`/products?search=${searchTerm}`);
  };

  const categories = [
    { name: "Fruits", icon: <Apple className="w-10 h-10" />, bg: "from-red-400 to-orange-400" },
    { name: "Vegetables", icon: <Carrot className="w-10 h-10" />, bg: "from-green-400 to-emerald-500" },
    { name: "Dairy", icon: <Milk className="w-10 h-10" />, bg: "from-blue-400 to-cyan-400" },
    { name: "Snacks", icon: <Popcorn className="w-10 h-10" />, bg: "from-yellow-400 to-amber-400" },
  ];

  const deals = [
    { icon: <Carrot className="w-10 h-10" />, title: "Fresh Vegetables", desc: "20% OFF on all veggies", tag: "Save ₹200", bg: "from-green-500 to-emerald-600" },
    { icon: <Apple className="w-10 h-10" />, title: "Fresh Fruits", desc: "Buy 2 Get 1 Free", tag: "Best Value", bg: "from-orange-500 to-red-500" },
    { icon: <Milk className="w-10 h-10" />, title: "Dairy Products", desc: "15% OFF on dairy", tag: "Fresh & Pure", bg: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold text-green-600 cursor-pointer flex items-center gap-2 shrink-0"
            onClick={() => navigate("/")}
          >
            <ShoppingCart className="w-7 h-7" /> <span>FreshMart</span>
          </motion.h1>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fresh products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent flex-1 focus:outline-none text-gray-700 text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSearch}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Search
            </motion.button>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden lg:block text-sm text-gray-600 font-medium">Hi, {user.name}!</span>
                <NavBtn onClick={() => navigate("/cart")} color="green" badge={cartCount} icon={<ShoppingCart className="w-4 h-4" />}>Cart</NavBtn>
                <NavBtn onClick={() => navigate("/my-orders")} color="orange" icon={<Package className="w-4 h-4" />}>Orders</NavBtn>
                <NavBtn onClick={() => navigate("/profile")} color="blue" icon={<User className="w-4 h-4" />}>Profile</NavBtn>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="bg-green-500 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-600 transition-colors shadow"
              >
                Login →
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {["top-8 left-8", "top-24 right-16", "bottom-12 left-1/4", "bottom-20 right-1/3"].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute w-16 h-16 bg-white/10 rounded-full ${pos}`}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <motion.h2
              variants={fadeUp}
              className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight"
            >
              Fresh Groceries,<br />
              <span className="text-yellow-300 flex items-center justify-center gap-3">Delivered Fast <Rocket className="w-10 h-10 inline" /></span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Premium quality fruits, vegetables & daily essentials at your doorstep in under 2 hours.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/products")}
                className="bg-white text-green-700 px-8 py-3.5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/products")}
                className="border-2 border-white/70 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Browse Categories
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: <Truck className="w-6 h-6 text-green-600" />, label: "Free Delivery", sub: "On orders above ₹299" },
            { icon: <Leaf className="w-6 h-6 text-green-600" />, label: "100% Fresh", sub: "Farm to doorstep" },
            { icon: <Clock className="w-6 h-6 text-green-600" />, label: "2-Hour Delivery", sub: "Express service" },
            { icon: <Lock className="w-6 h-6 text-green-600" />, label: "Secure Payments", sub: "100% safe checkout" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{s.label}</div>
              <div className="text-xs text-gray-500">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Hot Deals */}
      <section className="py-14 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-2"><Flame className="w-7 h-7 text-orange-500" /> Today's Hot Deals</h3>
            <p className="text-gray-500">Limited time offers — grab them before they're gone!</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {deals.map((deal, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`bg-gradient-to-br ${deal.bg} text-white p-6 rounded-2xl shadow-lg cursor-pointer`}
                onClick={() => navigate("/products")}
              >
                <div className="text-4xl mb-3">{deal.icon}</div>
                <h4 className="text-xl font-bold mb-1">{deal.title}</h4>
                <p className="opacity-90 mb-3">{deal.desc}</p>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">{deal.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-gray-800 mb-2">Shop by Category</h3>
            <p className="text-gray-500">Explore our wide range of fresh products</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/products?category=${cat.name}`)}
                className={`bg-gradient-to-br ${cat.bg} text-white p-6 rounded-2xl text-center cursor-pointer shadow-md`}
              >
                <motion.div
                  className="flex justify-center mb-3"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {cat.icon}
                </motion.div>
                <h4 className="text-lg font-bold">{cat.name}</h4>
                <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">Explore <ChevronRight className="w-4 h-4" /></p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <AnimatePresence>
        {user && recentOrders.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-14 bg-blue-50"
          >
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-extrabold text-gray-800 mb-8 text-center">Your Recent Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recentOrders.map((order, i) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 rounded-2xl shadow-md border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500 font-medium">#{order._id.slice(-6)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{order.status}</span>
                    </div>
                    <p className="font-bold text-lg text-gray-800 mb-1">₹{order.total}</p>
                    <p className="text-sm text-gray-500 mb-4">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/my-orders")}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Order
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Featured Products */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-2"><Star className="w-7 h-7 text-yellow-400 fill-yellow-400" /> Featured Products</h3>
            <p className="text-gray-500">Handpicked fresh products just for you</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group"
              >
                <div className="relative overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Fresh
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h4>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-extrabold text-green-600">₹{product.price}</span>
                  </div>
                    <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addToCart(product._id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      addedId === product._id
                        ? "bg-green-100 text-green-700 border-2 border-green-400"
                        : "bg-green-500 text-white hover:bg-green-600 shadow"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addedId === product._id ? "Added!" : "Add to Cart"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/products")}
              className="bg-gray-800 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg"
            >
              View All Products →
            </motion.button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h3 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-extrabold text-center text-gray-800 mb-10 flex items-center justify-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-500" /> What Our Customers Say
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Fresh vegetables and super fast delivery! Love shopping here.", name: "Priya S." },
              { text: "Best prices in town and excellent customer service!", name: "Raj K." },
              { text: "Quality products delivered right to my doorstep. Highly recommended!", name: "Anita M." },
            ].map((t, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex text-yellow-400 text-xl mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400" />)}
              </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <p className="font-bold text-gray-800">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-3xl font-extrabold mb-3 flex items-center justify-center gap-2"><Mail className="w-7 h-7" /> Stay Updated!</h3>
            <p className="opacity-90 mb-6">Get the latest deals and offers in your inbox</p>
            <div className="flex rounded-full overflow-hidden shadow-xl">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 text-gray-800 focus:outline-none"
              />
              <button className="bg-gray-900 px-6 py-3 font-bold hover:bg-black transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Mic Button */}
      {user && (
        <div className="fixed bottom-8 right-8 z-50">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                const res = await axios.get('https://backend-g-gold.vercel.app/api/products/get?page=1&limit=10000');
                setAllProducts(res.data.products || []);
              } catch {
                setAllProducts(products);
              }
              setShowVoiceOrdering(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-full shadow-2xl"
          >
            <Mic className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Voice Ordering Modal */}
      <AnimatePresence>
        {showVoiceOrdering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <VoiceOrdering
              products={allProducts.length > 0 ? allProducts : products}
              onAddToCart={addToCart}
              onClose={() => setShowVoiceOrdering(false)}
              navigate={navigate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-extrabold mb-3 flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> FreshMart</h4>
            <p className="text-gray-400 text-sm">Your trusted partner for fresh groceries and daily essentials.</p>
          </div>
          <div>
            <h5 className="font-bold mb-3 text-gray-200">Quick Links</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => navigate("/products")} className="hover:text-white transition-colors">Products</button></li>
              <li><button onClick={() => navigate("/cart")} className="hover:text-white transition-colors">Cart</button></li>
              <li><button onClick={() => navigate("/my-orders")} className="hover:text-white transition-colors">Orders</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3 text-gray-200">Support</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Return Policy</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3 text-gray-200">Contact</h5>
            <p className="text-gray-400 text-sm">📞 +91 12345 67890</p>
            <p className="text-gray-400 text-sm">📧 support@freshmart.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2024 FreshMart. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

function NavBtn({ onClick, color, badge, icon, children }) {
  const colors = {
    green: "bg-green-500 hover:bg-green-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    blue: "bg-blue-500 hover:bg-blue-600",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative ${colors[color]} text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow flex items-center gap-1.5`}
    >
      {icon}{children}
      {badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

export default HomePage;
