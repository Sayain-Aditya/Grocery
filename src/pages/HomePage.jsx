import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      fetchRecentOrders();
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/products/get");
      setProducts(res.data.slice(0, 8)); // Show first 8 products
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://backend-g-sigma.vercel.app/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentOrders(res.data.slice(0, 3));
    } catch (err) {
      console.error("Failed to fetch recent orders");
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(
        "https://backend-g-sigma.vercel.app/api/cart/add",
        { productId, qty: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">🛒 FreshMart</h1>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-3 py-2 border rounded-l-lg w-64"
              />
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
              >
                🔍
              </button>
            </div>
            
            {user ? (
              <>
                <span className="text-gray-600">Hi, {user.name}!</span>
                <button onClick={() => navigate("/cart")} className="bg-green-600 text-white px-4 py-2 rounded">
                  Cart
                </button>
                <button onClick={() => navigate("/my-orders")} className="bg-orange-600 text-white px-4 py-2 rounded">
                  Orders
                </button>
                <button onClick={() => navigate("/profile")} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Profile
                </button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="bg-green-600 text-white px-4 py-2 rounded">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Fresh Groceries Delivered</h2>
          <p className="text-xl mb-8">Get fresh fruits, vegetables, and daily essentials at your doorstep</p>
          <button 
            onClick={() => navigate("/products")}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Daily Deals */}
      <section className="py-8 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-red-600 mb-4">🔥 Today's Special Deals</h3>
          <div className="flex justify-center gap-8 text-lg">
            <span className="bg-red-100 px-4 py-2 rounded">🥕 Vegetables 20% OFF</span>
            <span className="bg-red-100 px-4 py-2 rounded">🍎 Fresh Fruits Buy 2 Get 1</span>
            <span className="bg-red-100 px-4 py-2 rounded">🥛 Dairy Products 15% OFF</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.name} className={`${category.color} p-8 rounded-lg text-center cursor-pointer hover:shadow-lg transition-shadow`}>
                <div className="text-4xl mb-4">{category.icon}</div>
                <h4 className="text-lg font-semibold">{category.name}</h4>
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

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Featured Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                <h4 className="font-semibold mb-2">{product.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                  <button 
                    onClick={() => addToCart(product._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate("/products")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              View All Products
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