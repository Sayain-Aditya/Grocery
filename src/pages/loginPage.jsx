import React from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      setMessage("Email is required");
      return false;
    }
    if (!email.includes('@')) {
      setMessage("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setMessage("Password is required");
      return false;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const res = await axios.post("https://backend-g-sigma.vercel.app/api/users/login", {
        email: email.trim().toLowerCase(),
        password,
      }, {
        timeout: 15000 // 15 second timeout
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMessage("Login successful! Redirecting...");
        
        // Role-based redirect
        const role = res.data.user.role;
        setTimeout(() => {
          if (role === "admin") {
            navigate("/admin");
          } else {
            navigate("/home");
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setMessage("Request timeout. Please check your connection and try again.");
      } else if (err.response?.status === 503) {
        setMessage("Server is temporarily unavailable. Please try again in a moment.");
      } else {
        setMessage(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.includes('successful') 
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="mb-6 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? '👁️' : '👁️🗨️'}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
