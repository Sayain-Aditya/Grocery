import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, ShoppingBag, ChefHat, Clock, CheckCircle2 } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get");
      setCartItems(res.data);
      if (res.data.length > 0) fetchRecipeSuggestions();
    } catch { toast.error("Failed to load cart"); }
    finally { setLoading(false); }
  };

  const fetchRecipeSuggestions = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/recipes");
      setRecipeSuggestions(res.data.suggestions || []);
    } catch { console.error("Failed to load recipes"); }
  };

  const handleQtyChange = async (itemId, qty) => {
    try {
      await axios.put(`https://backend-g-gold.vercel.app/api/cart/update/${itemId}`, { qty });
      toast.success("Cart updated!");
      fetchCart();
    } catch { toast.error("Failed to update"); }
  };

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`https://backend-g-gold.vercel.app/api/cart/remove/${itemId}`);
      toast.success("Item removed!");
      fetchCart();
    } catch { toast.error("Failed to remove item"); }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete("https://backend-g-gold.vercel.app/api/cart/clear");
      toast.success("Cart cleared!");
      fetchCart();
    } catch { toast.error("Failed to clear cart"); }
  };

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

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
            onClick={() => navigate("/home")}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Back
          </motion.button>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" /> Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
              {cartItems.length} items
            </span>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6 flex justify-center"
            >
              <ShoppingCart className="w-20 h-20 text-gray-300" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8">Add some fresh items to get started!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/products")}
              className="bg-green-500 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
            >
              <ShoppingBag className="w-5 h-5" /> Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map(({ _id, product, qty }) => (
                  <motion.div
                    key={_id}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative overflow-hidden rounded-xl shrink-0">
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-28 h-28 object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Fresh
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <span className="text-xl font-extrabold text-green-600">₹{product.price}</span>
                      </div>

                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleQtyChange(_id, Math.max(1, qty - 1))}
                            disabled={qty <= 1}
                            className="px-4 py-2 hover:bg-green-500 hover:text-white transition-colors font-bold text-lg disabled:opacity-40"
                          >
                            −
                          </motion.button>
                          <span className="px-5 py-2 font-bold text-lg bg-white border-x border-gray-200 min-w-[3rem] text-center">
                            {qty}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleQtyChange(_id, qty + 1)}
                            className="px-4 py-2 hover:bg-green-500 hover:text-white transition-colors font-bold text-lg"
                          >
                            +
                          </motion.button>
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          Subtotal: ₹{(product.price * qty).toFixed(2)}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemove(_id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                  <div className="border-t pt-3 flex justify-between text-lg font-extrabold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
                  >
                    Proceed to Checkout →
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/products")}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Continue Shopping
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClearCart}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Cart
                  </motion.button>
                  {recipeSuggestions.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowRecipes(!showRecipes)}
                      className="w-full bg-orange-50 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" /> {showRecipes ? "Hide" : "Show"} Recipe Ideas
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Recipe Suggestions */}
        <AnimatePresence>
          {showRecipes && recipeSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6 overflow-hidden"
            >
              <h3 className="text-xl font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" /> Recipe Suggestions
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {recipeSuggestions.length} recipes
                </span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipeSuggestions.map((recipe, i) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-orange-50 rounded-xl p-5 border border-orange-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800">{recipe.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        recipe.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                        recipe.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" :
                        "bg-red-100 text-red-600"
                      }`}>{recipe.difficulty}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {recipe.cookTime}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.matchingIngredients.map((ing, idx) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {ing}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{recipe.instructions}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;
