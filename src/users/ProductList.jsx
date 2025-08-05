import React, { useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = () => {
  const [products, setProducts] = React.useState([]);
  const [admin, setAdmin] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [priceRange, setPriceRange] = React.useState("");
  const [inStock, setInStock] = React.useState(false);
  const [quantities, setQuantities] = React.useState({});
  const [cartCount, setCartCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalProducts, setTotalProducts] = React.useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://backend-g-sigma.vercel.app/api/cart/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartCount(
          res.data.cart?.reduce((sum, item) => sum + item.qty, 0) || 0
        );
      } catch (err) {
        console.error("Cart count load failed", err);
      }
    };

    fetchCartCount();
  }, []);
  useEffect(() => {
    fetchProducts();
    const user = JSON.parse(localStorage.getItem("user"));
    setAdmin(user?.role === "admin");
  }, [refresh, currentPage, search, category]);

  // Fetch products, using search endpoint if search is present
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res;
      if (search) {
        res = await axios.get(
          `https://backend-g-sigma.vercel.app/api/products/search?query=${encodeURIComponent(
            search
          )}`
        );
        setProducts(res.data.results);
        setTotalPages(1);
        setTotalProducts(res.data.results.length);
      } else {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 8,
          ...(category && category !== "All" && { category }),
        });
        res = await axios.get(`https://backend-g-sigma.vercel.app/api/products/get?${params}`);
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotalProducts(res.data.totalProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://backend-g-sigma.vercel.app/api/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Product deleted successfully!");
      setRefresh(!refresh);
    } catch (err) {
      toast.error("Error deleting product!");
      console.error("Error deleting product:", err);
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }

    const qty = quantities[productId] || 1;

    try {
      await axios.post(
        "https://backend-g-sigma.vercel.app/api/cart/add",
        { productId, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  // Client-side filtering for price and stock (server handles search and category)
  const filterProducts = products
    .filter((p) => {
      const price = Number(p.price);
      if (priceRange === "under-500") return price < 500;
      if (priceRange === "500-1000") return price >= 500 && price <= 1000;
      if (priceRange === "1000-2000") return price > 1000 && price <= 2000;
      return true;
    })
    .filter((p) => (inStock ? p.stock > 0 : true));

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const allCategories = ["All", ...new Set(products.map((p) => p.category))];

  // Search form submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <>
      <HomePageNavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <ToastContainer position="top-right" autoClose={2000} />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">🛍️ Product Catalog</h1>
            <p className="text-xl opacity-90">Discover amazing products at unbeatable prices</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Modern Filter Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">🔍</span> Find Your Perfect Product
            </h3>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                </div>
                
                <div className="relative">
                  <select
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? '🏷️ All Categories' : `📦 ${cat}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">📂</span>
                </div>
                
                <div className="relative">
                  <select
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white appearance-none"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="">💰 All Prices</option>
                    <option value="under-500">💵 Under ₹500</option>
                    <option value="500-1000">💴 ₹500 - ₹1000</option>
                    <option value="1000-2000">💶 ₹1000 - ₹2000</option>
                  </select>
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">💰</span>
                </div>
                
                <div className="flex items-center justify-center bg-gray-50 rounded-xl border-2 border-gray-200 p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                    />
                    <span className="text-gray-700 font-medium">📦 In Stock Only</span>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Search Products
              </button>
            </form>
          </div>

          {/* Results Summary */}
          {!loading && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  📊 Showing <span className="font-semibold text-blue-600">{filterProducts.length}</span> of <span className="font-semibold">{totalProducts}</span> products
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No products available</h3>
              <p className="text-gray-500">Check back later for new arrivals!</p>
            </div>
          ) : filterProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <div className="text-xl text-gray-600">Loading amazing products...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterProducts.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🖼️</div>
                          <span className="text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ⚠️ Low Stock
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ❌ Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        📂 {product.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{product.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        📦 Stock: <span className="font-semibold">{product.stock}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <label className="text-sm font-medium text-gray-700">🔢 Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantities[product._id] || 1}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [product._id]: Math.min(
                                Number(e.target.value),
                                product.stock
                              ),
                            })
                          }
                          className="w-16 border-2 border-gray-200 rounded-lg px-2 py-1 text-center font-semibold focus:border-blue-500 focus:outline-none"
                          disabled={product.stock === 0}
                        />
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {product.stock === 0 ? '❌ Out of Stock' : '🛍️ Add to Cart'}
                      </button>
                    </div>

                    {admin && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg font-medium shadow hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/EditProduct/${product._id}`)
                          }
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg font-medium shadow hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modern Pagination */}
          {!loading && totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-gray-600">
                  📊 Page <span className="font-semibold text-blue-600">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ⬅️ Previous
                  </button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-110"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next ➡️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Cart Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link
              to="/cart"
              className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-full shadow-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-110 transition-all duration-300 flex items-center space-x-2"
            >
              <span className="text-2xl">🛒</span>
              <span className="font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Extracted NavBar from HomePage
function HomePageNavBar() {
  const [user, setUser] = React.useState(null);
  const [cartCount, setCartCount] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    // Fetch cart count if needed
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-green-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          🛒 FreshMart
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && navigate(`/products?search=${searchTerm}`)}
              className="px-3 py-2 border rounded-l-lg w-64"
            />
            <button
              onClick={() => navigate(`/products?search=${searchTerm}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
            >
              🔍
            </button>
          </div>
          {user ? (
            <>
              <span className="text-gray-600">Hi, {user.name}!</span>
              <button onClick={() => navigate("/cart")} className="bg-green-600 text-white px-4 py-2 rounded relative">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
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
  );
}

export default ProductList;
