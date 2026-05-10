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
  FaGraduationCap,
  FaUserGraduate,
  FaArrowLeft,
} from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerDriver, registerParent } = useAuth();
  const [activeTab, setActiveTab] = useState('driver');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Driver form data
  const [driverData, setDriverData] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  // Parent form data
  const [parentData, setParentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const tabs = [
    { 
      id: 'driver', 
      label: 'Register as Driver', 
      icon: FaBus,
      description: 'Apply to become a school bus driver'
    },
    { 
      id: 'parent', 
      label: 'Register as Parent', 
      icon: FaUserGraduate,
      description: 'Create an account to track your child'
    },
  ];

  const handleDriverChange = (e) => {
    setDriverData({ ...driverData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleParentChange = (e) => {
    setParentData({ ...parentData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    
    if (driverData.password !== driverData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await registerDriver({
        fullName: driverData.fullName,
        email: driverData.email,
        phone: driverData.phone,
        licenseNumber: driverData.licenseNumber,
        address: driverData.address,
        password: driverData.password,
      });

      if (result.success) {
        // Auto-login and redirect to driver dashboard immediately
        setSuccess(true);
        setTimeout(() => {
          navigate('/driver/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParentSubmit = async (e) => {
    e.preventDefault();
    
    if (parentData.password !== parentData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await registerParent({
        fullName: parentData.fullName,
        email: parentData.email,
        phone: parentData.phone,
        address: parentData.address,
        password: parentData.password,
      });

      if (result.success) {
        // For parents, auto-login and redirect to dashboard immediately
        setSuccess(true);
        setTimeout(() => {
          navigate('/parent/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaUser className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-blue-200 mb-6">
              {activeTab === 'driver' 
                ? 'Your driver account has been created successfully. Taking you to your dashboard...'
                : 'Your parent account has been created successfully. Taking you to your dashboard...'
              }
            </p>
            <p className="text-blue-300 text-sm">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Back to Login */}
        <div className="mb-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        {/* Registration Type Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-blue-200">Choose your registration type</p>
          </div>

          {/* Tabs */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 border-blue-400 shadow-lg'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-white/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        activeTab === tab.id ? 'text-white' : 'text-blue-300'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        activeTab === tab.id ? 'text-white' : 'text-blue-200'
                      }`}>
                        {tab.label}
                      </h3>
                      <p className="text-sm text-blue-300 mt-1">{tab.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Forms */}
          {activeTab === 'driver' && (
            <form onSubmit={handleDriverSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={driverData.fullName}
                      onChange={handleDriverChange}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

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
                      value={driverData.email}
                      onChange={handleDriverChange}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={driverData.phone}
                      onChange={handleDriverChange}
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    License Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaIdCard className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={driverData.licenseNumber}
                      onChange={handleDriverChange}
                      placeholder="Enter your license number"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-start pt-3 pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-blue-300" />
                  </div>
                  <textarea
                    name="address"
                    value={driverData.address}
                    onChange={handleDriverChange}
                    placeholder="Enter your address"
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                      value={driverData.password}
                      onChange={handleDriverChange}
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

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={driverData.confirmPassword}
                      onChange={handleDriverChange}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      ) : (
                        <FaEye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader size="small" className="text-white" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register as Driver</span>
                )}
              </button>
            </form>
          )}

          {activeTab === 'parent' && (
            <form onSubmit={handleParentSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={parentData.fullName}
                      onChange={handleParentChange}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

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
                      value={parentData.email}
                      onChange={handleParentChange}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={parentData.phone}
                      onChange={handleParentChange}
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Child's Grade (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaGraduationCap className="h-5 w-5 text-blue-300" />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                    >
                      <option value="" className="bg-gray-800">Select grade</option>
                      <option value="1" className="bg-gray-800">Grade 1</option>
                      <option value="2" className="bg-gray-800">Grade 2</option>
                      <option value="3" className="bg-gray-800">Grade 3</option>
                      <option value="4" className="bg-gray-800">Grade 4</option>
                      <option value="5" className="bg-gray-800">Grade 5</option>
                      <option value="6" className="bg-gray-800">Grade 6</option>
                      <option value="7" className="bg-gray-800">Grade 7</option>
                      <option value="8" className="bg-gray-800">Grade 8</option>
                      <option value="9" className="bg-gray-800">Grade 9</option>
                      <option value="10" className="bg-gray-800">Grade 10</option>
                      <option value="11" className="bg-gray-800">Grade 11</option>
                      <option value="12" className="bg-gray-800">Grade 12</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-start pt-3 pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-blue-300" />
                  </div>
                  <textarea
                    name="address"
                    value={parentData.address}
                    onChange={handleParentChange}
                    placeholder="Enter your address"
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                      value={parentData.password}
                      onChange={handleParentChange}
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

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={parentData.confirmPassword}
                      onChange={handleParentChange}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      ) : (
                        <FaEye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader size="small" className="text-white" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register as Parent</span>
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-blue-200">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-300 hover:text-white font-medium transition-colors"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
