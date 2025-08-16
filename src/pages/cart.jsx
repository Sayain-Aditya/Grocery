import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/auth';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("https://backend-g-gold.vercel.app/api/cart/get");
      setCartItems(res.data);
    } catch (err) {
      toast.error("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = async (itemId, qty) => {
    try {
      await axios.put(
        `https://backend-g-gold.vercel.app/api/cart/update/${itemId}`,
        { qty }
      );
      toast.success("Cart updated!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to update");
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`https://backend-g-gold.vercel.app/api/cart/remove/${itemId}`);
      toast.success("Item removed!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete("https://backend-g-gold.vercel.app/api/cart/clear");
      toast.success("Cart cleared!");
      fetchCart();
    } catch (err) {
      toast.error("Failed to clear cart");
      console.error(err);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🛒 Shopping Cart
            </h1>
            <p className="text-gray-600 text-lg">Review your items and proceed to checkout</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-xl text-gray-600">Loading your cart...</div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🛒</div>
            <h3 className="text-3xl font-bold text-gray-600 mb-4">Your cart is empty</h3>
            <p className="text-gray-500 text-lg mb-8">Add some delicious items to get started!</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ _id, product, qty }, index) => (
                <div
                  key={_id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* Product Image */}
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Fresh
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-3">{product.description}</p>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{product.price}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQtyChange(_id, Math.max(1, qty - 1))}
                            className="px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors font-bold text-lg"
                            disabled={qty <= 1}
                          >
                            −
                          </button>
                          <span className="px-6 py-2 font-bold text-lg bg-white border-x border-gray-200">{qty}</span>
                          <button
                            onClick={() => handleQtyChange(_id, qty + 1)}
                            className="px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(_id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center space-x-2"
                        >
                          <span>🗑️</span>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2">📋</span> Order Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cartItems.length})</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Proceed to Checkout</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🛍️</span>
                    <span>Continue Shopping</span>
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    className="w-full bg-red-100 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
