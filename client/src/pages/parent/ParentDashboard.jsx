import React, { useState, useEffect } from 'react';
import { FaChild, FaBus, FaMapMarkerAlt, FaCreditCard, FaBell } from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    children: 0,
    busLocation: 'Unknown',
    balance: 0,
    notifications: 0,
  });
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getParentStats();
      if (response.data?.success) {
        setStats(response.data.data || {});
        setChildren(response.data.data?.children || []);
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'My Children', value: stats.children, icon: FaChild, color: 'blue' },
    { title: 'Bus Location', value: stats.busLocation || 'Not tracking', icon: FaMapMarkerAlt, color: 'green' },
    { title: 'Balance Due', value: `$${stats.balance || 0}`, icon: FaCreditCard, color: 'yellow' },
    { title: 'Notifications', value: stats.notifications || 0, icon: FaBell, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName || user?.full_name || 'Parent'}!</h1>
        <p className="text-primary-100 mt-1">Track your children's school transport safely.</p>
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

      {/* Children Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {children.length > 0 ? (
          children.map((child) => (
            <div key={child.id} className="dashboard-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaChild className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{child.name}</h3>
                  <p className="text-gray-500">{child.grade}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bus:</span>
                  <span className="font-medium">{child.bus_number || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route:</span>
                  <span className="font-medium">{child.route_name || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    child.on_bus ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {child.on_bus ? 'On Bus' : 'Not on Bus'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 dashboard-card text-center py-12">
            <FaChild className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No children registered. Contact your school administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
