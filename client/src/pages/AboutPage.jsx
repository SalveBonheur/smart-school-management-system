import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus, FaShieldAlt, FaClock, FaMobileAlt, FaUsers, FaArrowLeft } from 'react-icons/fa';

const AboutPage = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: 'Student Safety First',
      description: 'Our platform prioritizes student safety with real-time tracking, QR code attendance, and instant notifications to parents.',
    },
    {
      icon: FaClock,
      title: 'Efficient Operations',
      description: 'Optimize routes, reduce fuel costs, and improve on-time performance with intelligent fleet management.',
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Ready',
      description: 'Access all features from any device. Parents, drivers, and administrators stay connected on the go.',
    },
    {
      icon: FaUsers,
      title: 'Multi-Role Support',
      description: 'Dedicated dashboards for administrators, drivers, and parents with role-specific features and permissions.',
    },
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
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
              <FaArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About Smart School Transport
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We provide a comprehensive, modern solution for managing school transportation systems. 
            Our platform connects administrators, drivers, and parents in one seamless ecosystem 
            designed to ensure student safety and operational efficiency.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To revolutionize school transportation by providing innovative technology solutions 
                that prioritize student safety, improve communication between schools and parents, 
                and streamline operational efficiency for transport managers.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe every child deserves a safe journey to and from school, and every parent 
                deserves peace of mind knowing exactly where their child is during transit.
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Schools Served</span>
                  <span className="font-bold text-2xl text-primary-600">50+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Transported</span>
                  <span className="font-bold text-2xl text-primary-600">10,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Buses Managed</span>
                  <span className="font-bold text-2xl text-primary-600">500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Parent Satisfaction</span>
                  <span className="font-bold text-2xl text-primary-600">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-soft text-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions about our platform? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@smarttransport.com" className="btn-primary">
              Email Us
            </a>
            <a href="tel:+1234567890" className="btn-secondary">
              Call Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Smart School Transport System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
