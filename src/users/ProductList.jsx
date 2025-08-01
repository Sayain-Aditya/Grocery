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
      <div className="p-6 mx-auto">
        <ToastContainer position="top-right" autoClose={2000} />
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
          Product Catalog
        </h2>
        <form
          onSubmit={handleSearchSubmit}
          className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Search by name"
            className="p-2 border border-gray-300 rounded w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-2 border border-gray-300 rounded w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="p-2 border border-gray-300 rounded w-full"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">All Prices</option>
            <option value="under-500">Under ₹500</option>
            <option value="500-1000">₹500 - ₹1000</option>
            <option value="1000-2000">₹1000 - ₹2000</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            In Stock Only
          </label>
          <button
            type="submit"
            className="col-span-1 md:col-span-4 bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
          >
            Search
          </button>
        </form>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-16">
            No products available.
          </div>
        ) : filterProducts.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-16">
            No products match the selected filters.
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filterProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col justify-between border border-gray-200"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-lg border text-gray-400">
                    No Image
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  Category:{" "}
                  <span className="font-medium text-gray-700">
                    {product.category}
                  </span>
                </p>
                <p className="text-lg font-bold text-green-600 mb-1">
                  ₹{product.price}
                </p>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  In Stock:{" "}
                  <span className="font-semibold text-gray-700">
                    {product.stock}
                  </span>
                </p>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Qty:</label>
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
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-lg shadow hover:from-green-600 hover:to-green-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>

                {admin && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg shadow hover:from-red-600 hover:to-red-800 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/EditProduct/${product._id}`)
                      }
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="text-center mb-4 text-gray-600">
            Showing {filterProducts.length} of {totalProducts} products
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  Previous
                </button>
              ) : (
                <button className="px-3 py-2 border rounded opacity-50 cursor-not-allowed">
                  Previous
                </button>
              )}

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-2 border rounded ${
                    currentPage === index + 1
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              {currentPage < totalPages ? (
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  Next
                </button>
              ) : (
                <button className="px-3 py-2 border rounded opacity-50 cursor-not-allowed">
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-4 right-4">
          <Link
            to="/cart"
            className="relative bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
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
