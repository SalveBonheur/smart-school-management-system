import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBus,
  FaIdCard,
  FaRoute,
  FaCalendarCheck,
  FaCreditCard,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
} from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/DataTable';
import { dashboardAPI, studentAPI, driverAPI } from '../../services/api';
import { CardLoader } from '../../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    drivers: 0,
    buses: 0,
    routes: 0,
    attendance: 0,
    payments: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await dashboardAPI.getAdminStats();
      if (statsRes.data?.success) {
        setStats(statsRes.data.data || {});
      }

      // Fetch recent students
      const studentsRes = await studentAPI.getAll({ limit: 5 });
      if (studentsRes.data?.success) {
        setRecentStudents(studentsRes.data.data || []);
      }

      // Fetch pending drivers
      const driversRes = await driverAPI.getPending();
      if (driversRes.data?.success) {
        setPendingDrivers(driversRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: FaUsers, color: 'blue', trend: 'up', trendValue: '+12%' },
    { title: 'Total Drivers', value: stats.drivers, icon: FaIdCard, color: 'green', trend: 'up', trendValue: '+5%' },
    { title: 'Active Buses', value: stats.buses, icon: FaBus, color: 'yellow', trend: 'down', trendValue: '-2%' },
    { title: 'Routes', value: stats.routes, icon: FaRoute, color: 'purple' },
    { title: 'Today\'s Attendance', value: `${stats.attendance || 0}%`, icon: FaCalendarCheck, color: 'indigo', trend: 'up', trendValue: '+8%' },
    { title: 'Monthly Revenue', value: `$${stats.payments || 0}`, icon: FaCreditCard, color: 'green', trend: 'up', trendValue: '+15%' },
  ];

  const studentColumns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'full_name', 
      label: 'Name',
      render: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`
    },
    { key: 'grade', label: 'Grade' },
    { key: 'bus_id', label: 'Bus' },
  ];

  const driverColumns = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100 text-lg">Welcome back! Here's what's happening with your transport system.</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="w-4 h-4" />
              <span>System operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardLoader key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
              trendValue={card.trendValue}
            />
          ))}
        </div>
      )}

      {/* Alerts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Students */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
                  <p className="text-sm text-gray-500">Latest student registrations</p>
                </div>
              </div>
              <a href="/admin/students" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View All →
              </a>
            </div>
            <DataTable
              columns={studentColumns}
              data={recentStudents}
              loading={loading}
              emptyMessage="No students found"
            />
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-white rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Approve Drivers</p>
                    <p className="text-sm text-gray-500">{pendingDrivers.length} pending</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-white rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaRoute className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Routes</p>
                    <p className="text-sm text-gray-500">Optimize bus routes</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-white rounded-xl p-4 text-left hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaCalendarCheck className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Attendance</p>
                    <p className="text-sm text-gray-500">Today's reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                <p className="text-sm text-gray-500">Important notifications</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Driver Approvals</p>
                  <p className="text-xs text-gray-600">{pendingDrivers.length} drivers waiting for approval</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <FaChartLine className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Report Ready</p>
                  <p className="text-xs text-gray-600">Transport analytics for {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Driver Approvals */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FaIdCard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Driver Approvals</h3>
              <p className="text-sm text-gray-500">Drivers awaiting approval</p>
            </div>
          </div>
          <a href="/admin/drivers" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All →
          </a>
        </div>
        <DataTable
          columns={driverColumns}
          data={pendingDrivers}
          loading={loading}
          emptyMessage="No pending approvals"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
