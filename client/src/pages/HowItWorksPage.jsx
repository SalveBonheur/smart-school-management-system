import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBus,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaMobileAlt,
  FaUsers,
  FaCreditCard,
  FaArrowLeft,
  FaCheckCircle,
  FaQrcode,
  FaBell,
  FaRoute,
  FaClock,
  FaUserCheck,
  FaArrowRight
} from 'react-icons/fa';

const HowItWorksPage = () => {
  const steps = [
    {
      step: 1,
      icon: FaUsers,
      title: 'Registration',
      description: 'Parents, drivers, and administrators register with their respective roles. Schools set up their transportation system.',
      details: ['Create accounts', 'Verify identities', 'Set up school profile']
    },
    {
      step: 2,
      icon: FaRoute,
      title: 'Route Planning',
      description: 'Administrators create optimized bus routes and assign students to buses based on their locations.',
      details: ['Map student locations', 'Optimize routes', 'Assign buses and drivers']
    },
    {
      step: 3,
      icon: FaBus,
      title: 'Real-Time Tracking',
      description: 'Drivers use the mobile app to mark attendance with QR codes and update bus locations in real-time.',
      details: ['GPS tracking', 'QR code attendance', 'Live location updates']
    },
    {
      step: 4,
      icon: FaBell,
      title: 'Notifications',
      description: 'Parents receive instant notifications about bus arrival, departure, and any delays or issues.',
      details: ['Arrival alerts', 'Delay notifications', 'Emergency alerts']
    },
    {
      step: 5,
      icon: FaCreditCard,
      title: 'Payment Management',
      description: 'Parents can view fees, make payments, and track payment history through the platform.',
      details: ['View fee structure', 'Online payments', 'Payment history']
    }
  ];

  const features = [
    {
      icon: FaQrcode,
      title: 'QR Code Attendance',
      description: 'Secure and instant attendance marking using QR codes scanned by drivers.'
    },
    {
      icon: FaMapMarkedAlt,
      title: 'GPS Tracking',
      description: 'Real-time location tracking of all school buses with detailed route history.'
    },
    {
      icon: FaShieldAlt,
      title: 'Safety Features',
      description: 'Emergency alerts, speed monitoring, and instant communication capabilities.'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Apps',
      description: 'Dedicated apps for drivers and parents with offline capabilities.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Smart School Transport</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="/#home" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</a>
              <a href="/#how-it-works" className="text-primary-600 font-medium">How It Works</a>
              <a href="/#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</a>
              <a href="/#contact" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Contact</a>
              <Link to="/login" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How Smart School Transport
              <span className="text-primary-600"> Works</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform simplifies school transportation management with
              cutting-edge technology and user-friendly interfaces for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple 5-Step Process
            </h2>
            <p className="text-lg text-gray-600">
              Get started with Smart School Transport in just a few easy steps
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.step} className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 lg:mb-0">
                    <span className="text-2xl font-bold text-primary-600">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-4 mb-4 justify-center lg:justify-start">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600 justify-center lg:justify-start">
                        <FaCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features that make school transportation management effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of schools already using Smart School Transport
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              Start Free Trial
              <FaArrowRight />
            </Link>
            <Link to="/login" className="bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-800 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">Smart School Transport</span>
            </div>
            <div className="flex gap-6">
              <a href="/#home" className="hover:text-primary-400 transition-colors">Home</a>
              <a href="/#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a>
              <a href="/#about" className="hover:text-primary-400 transition-colors">About</a>
              <a href="/#contact" className="hover:text-primary-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;