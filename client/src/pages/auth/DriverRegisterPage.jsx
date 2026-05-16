import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/Alert';
import Loader from '../../components/Loader';
import {
  FaBus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

const DriverRegisterPage = () => {
  const navigate = useNavigate();
  const { registerDriver } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await registerDriver({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        address: formData.address,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/driver/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* School Bus Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1557223562-6c77ef16210f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/90"></div>
        
        <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-600">
            <FaBus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Registration Successful!</h2>
          <p className="text-gray-300 mb-4">
            Your driver account has been created successfully. Taking you to your dashboard...
          </p>
          <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* School Bus Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1557223562-6c77ef16210f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/90"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center border border-gray-600">
              <FaBus className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-xl text-white">Smart School</h1>
              <p className="text-sm text-gray-300">Transport System</p>
            </div>
          </Link>
        </div>

        {/* Registration Card */}
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Driver Registration
          </h2>
          <p className="text-center text-gray-300 mb-6">
            Apply to become a school bus driver
          </p>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Driver's License Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="License number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent backdrop-blur-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-gray-600"
            >
              {loading ? (
                <>
                  <Loader size="small" className="text-white" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-400 hover:text-white font-medium">
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-white">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterPage;
