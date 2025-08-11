import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors, checkTokenOnLoad } from '../utils/tokenManager';
import { isAuthenticated, clearAuth } from '../utils/auth';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup axios interceptors for token handling
    setupAxiosInterceptors(navigate);
    
    // Check token validity on component mount
    const isValidSession = checkTokenOnLoad(navigate);
    
    const userData = localStorage.getItem("user");
    if (userData && isValidSession) {
      setUser(JSON.parse(userData));
      fetchRecentOrders();
      fetchCartCount();
    }
    fetchProducts();
    
    // Set up periodic token validation
    const tokenCheckInterval = setInterval(() => {
      if (!isAuthenticated()) {
        clearAuth();
        setUser(null);
        setCartCount(0);
        setRecentOrders([]);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/products/get?limit=8");
      setProducts(res.data.products || []); // Handle the correct response structure
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchRecentOrders = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders/my");
      setRecentOrders(res.data.slice(0, 3));
    } catch (err) {
      if (err.message === 'Session expired. Please login again.') {
        setUser(null);
        setRecentOrders([]);
      }
      console.error("Failed to fetch recent orders:", err);
    }
  };

  const fetchCartCount = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/cart/get");
      setCartCount(res.data.length);
    } catch (err) {
      if (err.message === 'Session expired. Please login again.') {
        setUser(null);
        setCartCount(0);
      }
      console.error("Failed to fetch cart count:", err);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    try {
      await axios.post(
        "https://backend-g-sigma.vercel.app/api/cart/add",
        { productId, qty: 1 }
      );
      fetchCartCount(); // Update cart count
      alert("Added to cart!");
    } catch (err) {
      if (err.message === 'Session expired. Please login again.') {
        setUser(null);
        setCartCount(0);
      }
      console.error("Failed to add to cart:", err);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  const categories = [
    { name: "Fruits", icon: "🍎", color: "bg-red-100" },
    { name: "Vegetables", icon: "🥕", color: "bg-green-100" },
    { name: "Dairy", icon: "🥛", color: "bg-blue-100" },
    { name: "Snacks", icon: "🍿", color: "bg-yellow-100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate("/")}>
                🛒 FreshMart
              </h1>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-inner">
              <input
                type="text"
                placeholder="Search fresh products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent px-4 py-2 w-80 focus:outline-none text-gray-700 placeholder-gray-500"
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <span className="text-lg">🔍</span>
              </button>
            </div>
            
            {/* Modern Navigation */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="hidden lg:flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                    <span className="text-gray-700 font-medium">👋 Hi, {user.name}!</span>
                  </div>
                  <button 
                    onClick={() => navigate("/cart")} 
                    className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🛒</span>
                      <span className="hidden sm:inline">Cart</span>
                    </span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => navigate("/my-orders")} 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📦</span>
                      <span className="hidden sm:inline">Orders</span>
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate("/profile")} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <span className="flex items-center space-x-2">
                      <span>👤</span>
                      <span className="hidden sm:inline">Profile</span>
                    </span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate("/login")} 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                >
                  🚀 Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-300 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-green-300 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Fresh Groceries</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Delivered Fast 🚀
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Get premium quality fruits, vegetables, and daily essentials delivered to your doorstep in under 2 hours
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate("/products")}
                className="bg-white text-gray-800 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl flex items-center space-x-3"
              >
                <span>🛒</span>
                <span>Shop Now</span>
                <span>→</span>
              </button>
              <button 
                onClick={() => navigate("/products")}
                className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-800 transform hover:scale-110 transition-all duration-300 flex items-center space-x-3"
              >
                <span>🍽️</span>
                <span>Browse Categories</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Daily Deals */}
      <section className="py-16 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
              🔥 Today's Hot Deals
            </h3>
            <p className="text-gray-600 text-lg">Limited time offers - Grab them before they're gone!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-4xl mb-3">🥕</div>
              <h4 className="text-xl font-bold mb-2">Fresh Vegetables</h4>
              <p className="text-lg opacity-90 mb-3">20% OFF on all vegetables</p>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                Save up to ₹200
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-4xl mb-3">🍎</div>
              <h4 className="text-xl font-bold mb-2">Fresh Fruits</h4>
              <p className="text-lg opacity-90 mb-3">Buy 2 Get 1 Free</p>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                Best Value Deal
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-4xl mb-3">🥛</div>
              <h4 className="text-xl font-bold mb-2">Dairy Products</h4>
              <p className="text-lg opacity-90 mb-3">15% OFF on all dairy</p>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                Fresh & Pure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              🍽️ Shop by Category
            </h3>
            <p className="text-gray-600 text-xl">Explore our wide range of fresh products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div 
                key={category.name} 
                className={`group ${category.color} p-8 rounded-3xl text-center cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-white`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/products?category=${category.name}`)}
              >
                <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{category.name}</h4>
                <p className="text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Fresh & Quality
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/50 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                    Explore →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders - Only for logged in users */}
      {user && recentOrders.length > 0 && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Your Recent Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentOrders.map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Order #{order._id.slice(-6)}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-semibold mb-2">₹{order.total}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => navigate('/my-orders')}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Featured Products */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              ⭐ Featured Products
            </h3>
            <p className="text-gray-600 text-xl">Handpicked fresh products just for you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div 
                key={product._id} 
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Fresh
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      ₹{product.price}
                    </span>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Fresh
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(product._id)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/products")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl flex items-center space-x-3 mx-auto"
            >
              <span>🛍️</span>
              <span>View All Products</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"Fresh vegetables and super fast delivery! Love shopping here."</p>
              <p className="font-semibold">- Priya S.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"Best prices in town and excellent customer service!"</p>
              <p className="font-semibold">- Raj K.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">"Quality products delivered right to my doorstep. Highly recommended!"</p>
              <p className="font-semibold">- Anita M.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h4 className="text-xl font-semibold mb-2">Fast Delivery</h4>
              <p className="text-gray-600">Get your groceries delivered within 2 hours</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h4 className="text-xl font-semibold mb-2">Fresh Quality</h4>
              <p className="text-gray-600">Hand-picked fresh fruits and vegetables</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-semibold mb-2">Best Prices</h4>
              <p className="text-gray-600">Competitive prices with great deals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-semibold mb-2">Easy Ordering</h4>
              <p className="text-gray-600">Simple and intuitive shopping experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Updated!</h3>
          <p className="text-xl mb-8">Get the latest deals and offers delivered to your inbox</p>
          <div className="flex justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-800"
            />
            <button className="bg-blue-600 px-6 py-3 rounded-r-lg hover:bg-blue-700">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">🛒 FreshMart</h4>
              <p className="text-gray-400">Your trusted partner for fresh groceries and daily essentials.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/products')}>Products</button></li>
                <li><button onClick={() => navigate('/cart')}>Cart</button></li>
                <li><button onClick={() => navigate('/my-orders')}>Orders</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Return Policy</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <p className="text-gray-400">📞 +91 12345 67890</p>
              <p className="text-gray-400">📧 support@freshmart.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FreshMart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;