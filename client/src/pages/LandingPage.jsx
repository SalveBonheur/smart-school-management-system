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
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-zinc-800">
                <FaBus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Smart School Transport</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-200 hover:text-white font-medium transition-colors">Home</a>
              <a href="#how-it-works" className="text-gray-200 hover:text-white font-medium transition-colors">How It Works</a>
              <a href="#about" className="text-gray-200 hover:text-white font-medium transition-colors">About</a>
              <a href="#contact" className="text-gray-200 hover:text-white font-medium transition-colors">Contact</a>
              <Link to="/login" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-black pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full filter blur-3xl opacity-15"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full filter blur-3xl opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-zinc-800 text-white rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                New: QR Attendance System
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Smart School
                <span className="text-white"> Transport</span>
                <br />Management System
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of school transportation with our comprehensive platform.
                Track buses in real-time, manage attendance effortlessly, and ensure student safety
                with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="bg-white text-black font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2">
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link to="/about" className="bg-zinc-900 border border-zinc-800 text-white font-semibold py-3 px-8 rounded-xl hover:bg-zinc-800 transition-all duration-200">
                  Learn More
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-white" />
                  <span>Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-white" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-white" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-3 opacity-10 blur-2xl" />
              <div className="relative bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <FaBus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Live Bus Tracker</p>
                      <p className="text-sm text-gray-400">Real-time monitoring</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-gray-200 rounded-full text-xs font-medium border border-zinc-700">
                    System Active
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-200 border border-zinc-700">B1</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #101</p>
                        <p className="text-xs text-gray-400">Route A - 12 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 font-medium">On Time</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-200 border border-zinc-700">B2</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #102</p>
                        <p className="text-xs text-gray-400">Route B - 8 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-300 font-medium">5 min delay</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-200 border border-zinc-700">B3</div>
                      <div>
                        <p className="text-sm font-medium text-white">Bus #103</p>
                        <p className="text-xs text-gray-400">Route C - 15 students</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 font-medium">On Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A simple, secure workflow for managing school transport from registration through route tracking.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Step 1</p>
              <h3 className="text-xl font-semibold mb-3">Register & Assign Roles</h3>
              <p className="text-gray-400">Create accounts for admins, drivers, and parents and assign permissions instantly.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Step 2</p>
              <h3 className="text-xl font-semibold mb-3">Plan Routes</h3>
              <p className="text-gray-400">Map student pickup points and optimize bus routes with clear route assignments.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Step 3</p>
              <h3 className="text-xl font-semibold mb-3">Track in Real Time</h3>
              <p className="text-gray-400">Monitor bus location and arrival status continuously from the dashboard.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Step 4</p>
              <h3 className="text-xl font-semibold mb-3">Notify Parents</h3>
              <p className="text-gray-400">Keep families informed with instant updates on departures, arrivals, and delays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Schools Nationwide</h2>
            <p className="text-gray-400 text-lg">Join thousands of educational institutions using our platform.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">About Smart School Transport</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built to make school transport safer, simpler, and fully transparent for parents, drivers, and administrators.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Contact Our Team</h2>
              <p className="text-lg text-gray-400 mb-8">
                Have questions or want a demo? Reach out and we’ll respond fast.
              </p>
              <div className="space-y-6 text-gray-300">
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <p>info@smarttransport.com</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <p>1-800-SCHOOL-BUS</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Address</p>
                  <p>123 Education St, Learning City</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
              <p className="text-gray-400 mb-4">Send a quick message</p>
              <form className="space-y-4">
                <input type="text" placeholder="Your name" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-white" />
                <input type="email" placeholder="Your email" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-white" />
                <textarea rows={5} placeholder="What can we help you with?" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:border-white"></textarea>
                <button className="w-full bg-white text-black font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Hear from school administrators, parents, and drivers who use our platform daily.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 relative">
                <div className="absolute top-4 right-4 text-gray-500">
                  <FaQuoteLeft className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-amber-300 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-2xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-2xl opacity-20"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School Transport?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of schools already using Smart School Transport System to ensure safety and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-black font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-200 transition-all duration-200">
              Start Free Trial
            </Link>
            <Link to="/about" className="bg-zinc-900 border border-zinc-800 text-white font-semibold py-3 px-8 rounded-xl hover:bg-zinc-800 transition-all duration-200">
              Contact Sales
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-white" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-white" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-white" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                  <FaBus className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Smart School Transport</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Modern transportation management for schools. Safe, efficient, and reliable.
              </p>
              <div className="flex flex-col gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4" />
                  <span>info@smarttransport.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="w-4 h-4" />
                  <span>1-800-SCHOOL-BUS</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>123 Education St, Learning City</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 text-center md:text-left">
                © {new Date().getFullYear()} Smart School Transport System. All rights reserved.
              </p>
              <div className="text-sm text-gray-500">
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
