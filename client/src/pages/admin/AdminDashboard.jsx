import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBus,
  FaIdCard,
  FaRoute,
  FaCalendarCheck,
  FaCreditCard,
  FaClock,
  FaCheckCircle,
  FaMoneyBill,
  FaExclamationTriangle,
  FaUserCheck,
  FaChartPie,
  FaDownload
} from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/DataTable';
import { dashboardAPI, studentAPI, driverAPI, busStatusAPI } from '../../services/api';
import { CardLoader } from '../../components/Loader';

// Analytics Components
import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import SmartInsights from '../../components/analytics/SmartInsights';
import ReportFilters from '../../components/analytics/ReportFilters';
import IncomeChart from '../../components/analytics/charts/IncomeChart';
import AttendanceChart from '../../components/analytics/charts/AttendanceChart';
import BusOccupancyChart from '../../components/analytics/charts/BusOccupancyChart';
import RoutePerformanceChart from '../../components/analytics/charts/RoutePerformanceChart';
import PaymentStatsChart from '../../components/analytics/charts/PaymentStatsChart';

// Bus Status Components
import BusStatusTracker from '../../components/busStatus/BusStatusTracker';

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
  const [busStatuses, setBusStatuses] = useState([]);
  const [busFilter, setBusFilter] = useState('all');
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

      // Fetch bus statuses
      const busStatusRes = await busStatusAPI.getAll();
      if (busStatusRes.data?.success) {
        setBusStatuses(busStatusRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBusStatus = async () => {
    try {
      const res = await busStatusAPI.getAll();
      if (res.data?.success) {
        setBusStatuses(res.data.data || []);
      }
    } catch (error) {
      console.error('Error refreshing bus status:', error);
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

  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
    // Implement filter logic here
  };

  // Handle export
  const handleExport = (format, filters) => {
    console.log(`Exporting as ${format} with filters:`, filters);
    // Implement export logic here
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl p-8 text-white relative overflow-hidden border border-gray-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-700/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-700/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-gray-300 text-lg">Real-time insights into your school transport system.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <FaClock className="w-4 h-4" />
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <FaCheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-sm">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Filters */}
      <ReportFilters onFilterChange={handleFilterChange} onExport={handleExport} loading={loading} />

      {/* Smart Analytics Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CardLoader key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Students"
            value={stats.students || 265}
            icon={FaUsers}
            color="blue"
            trend="up"
            trendValue="+12%"
          />
          <AnalyticsCard
            title="Active Buses"
            value={stats.buses || 8}
            icon={FaBus}
            color="green"
            trend="up"
            trendValue="+5%"
          />
          <AnalyticsCard
            title="Attendance Rate"
            value={`${stats.attendance || 94}%`}
            icon={FaCalendarCheck}
            color="purple"
            trend="up"
            trendValue="+3%"
          />
          <AnalyticsCard
            title="Monthly Income"
            value={`$${stats.payments || 72000}`}
            icon={FaCreditCard}
            color="green"
            trend="up"
            trendValue="+18%"
          />
          <AnalyticsCard
            title="Pending Balances"
            value="$12,450"
            icon={FaMoneyBill}
            color="red"
            trend="down"
            trendValue="-8%"
          />
          <AnalyticsCard
            title="Active Drivers"
            value={stats.drivers || 12}
            icon={FaIdCard}
            color="indigo"
            trend="up"
            trendValue="+2"
          />
          <AnalyticsCard
            title="Route Occupancy"
            value="87%"
            icon={FaRoute}
            color="orange"
            trend="up"
            trendValue="+5%"
          />
          <AnalyticsCard
            title="Approved Drivers"
            value="10"
            icon={FaUserCheck}
            color="blue"
            trend="up"
            trendValue="+1"
          />
        </div>
      )}

      {/* Bus Status Tracker */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <BusStatusTracker 
          buses={busStatuses}
          loading={loading}
          onRefresh={refreshBusStatus}
          autoRefresh={true}
          refreshInterval={30000}
          filter={busFilter}
        />
      </div>

      {/* Smart Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Charts Section */}
          <div className="space-y-6">
            {/* Income Chart */}
            <IncomeChart loading={loading} />
            
            {/* Attendance Chart */}
            <AttendanceChart loading={loading} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Smart Insights Panel */}
          <SmartInsights loading={loading} />
          
          {/* Payment Stats */}
          <PaymentStatsChart loading={loading} />
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <BusOccupancyChart loading={loading} />
        <RoutePerformanceChart loading={loading} />
      </div>

      {/* Data Tables Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

        {/* Pending Driver Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaIdCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
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
    </div>
  );
};

export default AdminDashboard;
