import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/Alert';
import Loader from '../../components/Loader';
import {
  FaBus,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaRoute,
  FaUsers,
  FaShieldAlt,
  FaChartLine,
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { unifiedLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await unifiedLogin(formData);
      
      if (result.success) {
        // Redirect based on role automatically
        const role = result.user.role;
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'driver':
            navigate('/driver/dashboard');
            break;
          case 'parent':
            navigate('/parent/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Illustration and Info */}
          <div className="hidden md:block text-white">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaBus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Smart School</h1>
                  <p className="text-blue-200">Transport Management</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-6">Safe & Efficient School Transportation</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Experience the future of school transportation with our comprehensive management system. 
                Track buses, monitor attendance, manage payments, and ensure student safety all in one platform.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-sm text-blue-200">Monitor buses live</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart Attendance</h3>
                    <p className="text-sm text-blue-200">QR-based check-in system</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FaRoute className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Route Optimization</h3>
                    <p className="text-sm text-blue-200">Efficient bus routes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <FaChartLine className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analytics Dashboard</h3>
                    <p className="text-sm text-blue-200">Comprehensive insights</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">500+</div>
                  <div className="text-xs text-blue-200">Schools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">50K+</div>
                  <div className="text-xs text-blue-200">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">99.9%</div>
                  <div className="text-xs text-blue-200">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBus className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-xl text-white">Smart School</h1>
                  <p className="text-sm text-blue-200">Transport System</p>
                </div>
              </Link>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaGraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-blue-200">Sign in to access your dashboard</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6">
                  <Alert type="error" message={error} />
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      ) : (
                        <FaEye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-400 focus:ring-offset-0" 
                    />
                    <span className="ml-2 text-blue-200">Remember me</span>
                  </label>
                  <a href="#" className="text-blue-300 hover:text-white font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader size="small" className="text-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center text-sm text-blue-200">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-300 hover:text-white font-medium transition-colors"
                >
                  Register here
                </Link>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <Link 
                  to="/" 
                  className="text-sm text-blue-300 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
