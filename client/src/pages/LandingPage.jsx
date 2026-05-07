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
  FaGraduationCap,
  FaRoute,
  FaChartLine,
  FaClock,
  FaStar,
  FaQuoteLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
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
    { value: '500+', label: 'Schools Served' },
    { value: '50K+', label: 'Active Students' },
    { value: '1000+', label: 'Buses Managed' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'School Principal',
      school: 'Lincoln High School',
      content: 'Smart School Transport has revolutionized how we manage our transportation. The real-time tracking gives parents peace of mind.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Transport Manager',
      school: 'Riverside Academy',
      content: 'The route optimization and attendance features have saved us countless hours. Our drivers love the mobile app.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Parent',
      school: 'Oakwood Elementary',
      content: 'I can track my daughter\'s bus in real-time and receive instant notifications. It\'s made our mornings so much less stressful.',
      rating: 5,
    },
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                New: QR Attendance System
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Smart School
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Transport</span>
                <br />Management System
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of school transportation with our comprehensive platform. 
                Track buses in real-time, manage attendance effortlessly, and ensure student safety 
                with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link to="/about" className="bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/20 transition-all duration-200">
                  Learn More
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl transform rotate-3 opacity-20 blur-2xl" />
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                      <FaBus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Live Bus Tracker</p>
                      <p className="text-sm text-blue-200">Real-time monitoring</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-400/30">
                    System Active
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-400/30">B1</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #101</p>
                        <p className="text-xs text-blue-300">Route A - 12 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-300 font-medium">On Time</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 border border-purple-400/30">B2</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #102</p>
                        <p className="text-xs text-blue-300">Route B - 8 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-300 font-medium">5 min delay</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-xs font-bold text-orange-300 border border-orange-400/30">B3</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #103</p>
                        <p className="text-xs text-blue-300">Route C - 15 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-300 font-medium">On Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by Schools Nationwide</h2>
            <p className="text-blue-100 text-lg">Join thousands of educational institutions using our platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-blue-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
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
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from school administrators, parents, and drivers who use our platform daily.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 relative">
                <div className="absolute top-4 right-4 text-blue-200">
                  <FaQuoteLeft className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-blue-600">{testimonial.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School Transport?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of schools already using Smart School Transport System to ensure safety and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
              Start Free Trial
            </Link>
            <Link to="/about" className="bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/20 transition-all duration-200">
              Contact Sales
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <FaBus className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Smart School Transport</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Modern transportation management for schools. Safe, efficient, and reliable.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4" />
                  <span>info@smarttransport.com</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-2">
                  <FaPhone className="w-4 h-4" />
                  <span>1-800-SCHOOL-BUS</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>123 Education St, Learning City</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-400 transition-colors">Register</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">GDPR Compliance</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 text-center md:text-left">
                © {new Date().getFullYear()} Smart School Transport System. All rights reserved.
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0 text-sm text-gray-500">
                <span>Made with ❤️ for schools worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
