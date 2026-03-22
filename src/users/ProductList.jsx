import React, { useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import VoiceOrdering from "../components/VoiceOrdering";
import {
  ShoppingCart, Search, Package, User, Mic, Tag, Trash2, Pencil,
  SlidersHorizontal, CheckCircle2, Frown
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

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
  const [showVoiceOrdering, setShowVoiceOrdering] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState([]);
  const [addedId, setAddedId] = React.useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get");
        setCartCount(res.data?.reduce((sum, item) => sum + item.qty, 0) || 0);
      } catch {}
    };
    fetchCartCount();
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdmin(payload?.role === "admin");
      }
    } catch {
      setAdmin(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [refresh, currentPage, search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res;
      if (search) {
        res = await axios.get(
          `https://backend-g-gold.vercel.app/api/products/search?query=${encodeURIComponent(search)}`
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
        res = await axios.get(`https://backend-g-gold.vercel.app/api/products/get?${params}`);
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
      await axios.delete(`https://backend-g-gold.vercel.app/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted!");
      setRefresh(!refresh);
    } catch {
      toast.error("Error deleting product!");
    }
  };

  const handleAddToCart = async (productId, qty) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to add to cart"); return; }
    const quantity = qty || quantities[productId] || 1;
    try {
      await axios.post(
        "https://backend-g-gold.vercel.app/api/cart/add",
        { productId, qty: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
      setCartCount((c) => c + quantity);
      toast.success(`Added ${quantity > 1 ? `×${quantity}` : ''} to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

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

  const allCategories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <>
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

          <div className="hidden md:flex flex-1 max-w-md items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fresh products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              className="bg-transparent flex-1 focus:outline-none text-gray-700 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <NavBtn onClick={() => navigate("/cart")} color="green" badge={cartCount} icon={<ShoppingCart className="w-4 h-4" />}>
              Cart
            </NavBtn>
            <NavBtn onClick={() => navigate("/my-orders")} color="orange" icon={<Package className="w-4 h-4" />}>Orders</NavBtn>
            <NavBtn onClick={() => navigate("/profile")} color="blue" icon={<User className="w-4 h-4" />}>Profile</NavBtn>
          </div>
        </div>
      </motion.header>

      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={2000} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100"
          >
            <h3 className="text-2xl font-extrabold mb-5 text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-green-500" /> Discover Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">All Prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-1000">₹500 – ₹1000</option>
                <option value="1000-2000">₹1000 – ₹2000</option>
              </select>

              <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-white transition-all">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-green-500"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">In Stock Only</span>
              </label>
            </div>
          </motion.div>

          {/* Results count */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm px-5 py-3 mb-6 border border-gray-100 flex items-center justify-between"
            >
              <span className="text-gray-600 text-sm">
                Showing <span className="font-bold text-green-600">{filterProducts.length}</span> of{" "}
                <span className="font-bold">{totalProducts}</span> products
              </span>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
            </motion.div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
              />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filterProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <Frown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filterProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group"
                  >
                    <div className="relative overflow-hidden">
                      {product.image ? (
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-52 object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        <div className="w-full h-52 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <Package className="w-12 h-12 text-green-400" />
                        </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          🔥 Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Sold Out
                        </div>
                      )}
                      {product.stock > 5 && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Fresh
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Tag className="w-3 h-3" /> {product.category}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-2 mb-1 truncate">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-extrabold text-green-600">₹{product.price}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {product.stock} left
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-xs text-gray-500 font-medium">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantities[product._id] || 1}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [product._id]: Math.min(Number(e.target.value), product.stock),
                            })
                          }
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm font-semibold focus:ring-2 focus:ring-green-400 focus:outline-none"
                          disabled={product.stock === 0}
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                          addedId === product._id
                            ? "bg-green-100 text-green-700 border-2 border-green-400"
                            : "bg-green-500 text-white hover:bg-green-600 shadow"
                        }`}
                      >
                        {product.stock === 0
                          ? <><Frown className="w-4 h-4" /> Sold Out</>
                          : addedId === product._id
                          ? <><CheckCircle2 className="w-4 h-4" /> Added!</>
                          : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                      </motion.button>

                      {admin && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(product._id)}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/EditProduct/${product._id}`)}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100"
            >
              <span className="text-sm text-gray-500">
                Page <span className="font-bold text-green-600">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </motion.button>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = index + 1;
                  else if (currentPage <= 3) pageNum = index + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + index;
                  else pageNum = currentPage - 2 + index;
                  return (
                    <motion.button
                      key={pageNum}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => paginate(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-green-500 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
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
          <Link to="/cart" className="relative">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 12 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 text-white p-4 rounded-full shadow-2xl"
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.div>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
        </div>

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
                onAddToCart={handleAddToCart}
                onClose={() => setShowVoiceOrdering(false)}
                navigate={navigate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
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

export default ProductList;
