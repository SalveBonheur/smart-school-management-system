import React, { useState, useEffect } from 'react';
import { FaBus, FaUsers, FaRoute, FaClock } from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';
import { dashboardAPI, driverAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    routes: 0,
    attendance: 0,
    schedule: null,
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, profileRes] = await Promise.all([
        dashboardAPI.getDriverStats(),
        driverAPI.getProfile(),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data || {});
      }

      if (profileRes.data?.success) {
        setProfile(profileRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'My Students', value: stats.students, icon: FaUsers, color: 'blue' },
    { title: 'Assigned Route', value: stats.routes || 'None', icon: FaRoute, color: 'green' },
    { title: 'Today\'s Attendance', value: `${stats.attendance || 0}%`, icon: FaBus, color: 'purple' },
    { title: 'Next Trip', value: stats.schedule || 'Not scheduled', icon: FaClock, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName || user?.full_name || 'Driver'}!</h1>
        <p className="text-primary-100 mt-1">Have a safe and productive day on the road.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FaBus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Morning Pickup</p>
                <p className="text-sm text-gray-500">7:00 AM - Route A</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaBus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Afternoon Drop-off</p>
                <p className="text-sm text-gray-500">3:30 PM - Route A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/driver/attendance" className="p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
              <FaBus className="w-8 h-8 text-primary-600 mb-2" />
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-500">Record student pickup/drop</p>
            </a>
            <a href="/driver/profile" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <FaUsers className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">My Profile</p>
              <p className="text-sm text-gray-500">View your information</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
