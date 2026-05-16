import React, { useState, useEffect } from 'react';
import { FaBus, FaUsers, FaRoute, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';
import { dashboardAPI, driverAPI, busStatusAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DriverBusControl from '../../components/busStatus/DriverBusControl';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    routes: 0,
    attendance: 0,
    schedule: null,
  });
  const [profile, setProfile] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, profileRes, busRes] = await Promise.all([
        dashboardAPI.getDriverStats(),
        driverAPI.getProfile(),
        busStatusAPI.getByDriver(user?.id).catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data || {});
      }

      if (profileRes.data?.success) {
        setProfile(profileRes.data.data);
      }

      if (busRes.data?.success && busRes.data.data.length > 0) {
        setAssignedBus(busRes.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (busId, data) => {
    try {
      setUpdatingStatus(true);
      const res = await busStatusAPI.updateStatus(busId, data);
      if (res.data?.success) {
        // Refresh bus data
        const busRes = await busStatusAPI.getByDriver(user?.id);
        if (busRes.data?.success && busRes.data.data.length > 0) {
          setAssignedBus(busRes.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error updating bus status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
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
        {/* Bus Status Control */}
        <DriverBusControl 
          bus={assignedBus}
          onStatusUpdate={handleStatusUpdate}
          loading={updatingStatus}
        />

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="/driver/attendance" className="p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                <FaBus className="w-8 h-8 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">Mark Attendance</p>
                <p className="text-sm text-gray-500">Record student pickup/drop</p>
              </a>
              <a href="/driver/schedule" className="p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <FaClock className="w-8 h-8 text-gray-700 mb-2" />
                <p className="font-medium text-gray-900">View Schedule</p>
                <p className="text-sm text-gray-500">Check your trips</p>
              </a>
              <a href="/driver/profile" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <FaUsers className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">My Profile</p>
                <p className="text-sm text-gray-500">View your information</p>
              </a>
              <button className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors text-left">
                <FaMapMarkerAlt className="w-8 h-8 text-orange-600 mb-2" />
                <p className="font-medium text-gray-900">Live Location</p>
                <p className="text-sm text-gray-500">Share your location</p>
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FaBus className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Morning Pickup</p>
                  <p className="text-sm text-gray-500">7:00 AM - Route A</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Completed</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FaBus className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Afternoon Drop-off</p>
                  <p className="text-sm text-gray-500">3:30 PM - Route A</p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
