import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaRoute, FaBus } from 'react-icons/fa';
import { driverAPI } from '../../services/api';
import Loader from '../../components/Loader';

const DriverSchedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await driverAPI.getSchedule();
      if (response.data?.success) {
        setSchedule(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">My Schedule</h1>
        <p className="text-primary-100 mt-1">View your daily route and timing</p>
      </div>

      {/* Schedule Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Trips */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600" />
            Today's Trips
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg border-l-4 border-primary-600">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Morning Pickup</p>
                <p className="text-sm text-gray-500">6:30 AM - 8:00 AM</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Afternoon Drop-off</p>
                <p className="text-sm text-gray-500">2:30 PM - 4:00 PM</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaRoute className="text-primary-600" />
            Route Information
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaBus className="text-primary-600" />
                <span className="font-medium text-gray-900">Route A - Northern Zone</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total Distance: 12.5 km</p>
                <p>Estimated Time: 45 minutes</p>
                <p>Stops: 8 locations</p>
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Weekly Schedule</p>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div key={day} className="p-2 bg-white rounded-lg shadow-sm">
                    <p className="font-medium text-primary-600">{day}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                ))}
                {['Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-2 bg-gray-100 rounded-lg">
                    <p className="font-medium text-gray-400">{day}</p>
                    <p className="text-xs text-gray-400">Off</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSchedule;
