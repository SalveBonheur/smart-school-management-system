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
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your transport system.</p>
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
            <a href="/admin/students" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </a>
          </div>
          <DataTable
            columns={studentColumns}
            data={recentStudents}
            loading={loading}
            emptyMessage="No students found"
          />
        </div>

        {/* Pending Driver Approvals */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Driver Approvals</h3>
            <a href="/admin/drivers" className="text-sm text-primary-600 hover:text-primary-700">
              View All
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
    </div>
  );
};

export default AdminDashboard;
