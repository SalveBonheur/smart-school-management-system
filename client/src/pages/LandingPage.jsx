import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBus,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaMobileAlt,
  FaUsers,
  FaCreditCard,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa';

const LandingPage = () => {
  const features = [
    {
      icon: FaMapMarkedAlt,
      title: 'Real-Time Tracking',
      description: 'Track school buses in real-time with GPS technology and know exactly where your child is.',
    },
    {
      icon: FaShieldAlt,
      title: 'Safe & Secure',
      description: 'Advanced security features including QR code attendance and instant notifications.',
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Accessible',
      description: 'Access the platform from any device. iOS and Android apps available.',
    },
    {
      icon: FaUsers,
      title: 'Multi-User Support',
      description: 'Separate dashboards for administrators, drivers, and parents.',
    },
    {
      icon: FaCreditCard,
      title: 'Easy Payments',
      description: 'Manage transportation fees and payments with integrated payment tracking.',
    },
    {
      icon: FaBus,
      title: 'Fleet Management',
      description: 'Complete bus fleet management with maintenance tracking and route optimization.',
    },
  ];

  const stats = [
    { value: '50+', label: 'Schools Served' },
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Buses Managed' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Smart School Transport</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">How It Works</a>
              <a href="#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</a>
              <Link to="/login" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                New: QR Attendance System
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart School
                <span className="text-primary-600"> Transport</span>
                <br />Management System
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                A comprehensive solution for managing school transportation. Track buses, 
                manage attendance, and ensure student safety with our advanced platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="btn-primary text-center text-lg px-8 py-3 flex items-center justify-center gap-2">
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link to="/about" className="btn-secondary text-center text-lg px-8 py-3">
                  Learn More
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span>Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-500 rounded-3xl transform rotate-3 opacity-20 blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FaBus className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bus Tracker</p>
                      <p className="text-sm text-gray-500">Real-time location</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">B1</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bus #101</p>
                        <p className="text-xs text-gray-500">Route A - 12 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">On Time</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">B2</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bus #102</p>
                        <p className="text-xs text-gray-500">Route B - 8 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-600 font-medium">Delayed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">B3</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bus #103</p>
                        <p className="text-xs text-gray-500">Route C - 15 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">On Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your school transportation efficiently and safely.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="dashboard-card hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your School Transport?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of schools already using Smart School Transport System.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <Link to="/about" className="btn-secondary text-lg px-8 py-3">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaBus className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Smart School Transport</span>
              </div>
              <p className="text-sm text-gray-400">
                Modern transportation management for schools. Safe, efficient, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register/driver" className="hover:text-white transition-colors">Driver Registration</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Smart School Transport System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
