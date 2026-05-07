import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUsers,
  FaBus,
  FaRoute,
  FaCalendarCheck,
  FaCreditCard,
  FaChartBar,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaIdCard,
  FaMapMarkedAlt,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaHistory,
  FaChild,
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/admin/students', icon: FaUsers, label: 'Students' },
    { to: '/admin/drivers', icon: FaIdCard, label: 'Drivers' },
    { to: '/admin/buses', icon: FaBus, label: 'Buses' },
    { to: '/admin/routes', icon: FaRoute, label: 'Routes' },
    { to: '/admin/attendance', icon: FaCalendarCheck, label: 'Attendance' },
    { to: '/admin/payments', icon: FaCreditCard, label: 'Payments' },
    { to: '/admin/reports', icon: FaChartBar, label: 'Reports' },
  ];

  const driverLinks = [
    { to: '/driver/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/driver/attendance', icon: FaClipboardCheck, label: 'Attendance' },
    { to: '/driver/schedule', icon: FaCalendarCheck, label: 'Schedule' },
    { to: '/driver/profile', icon: FaUser, label: 'Profile' },
  ];

  const parentLinks = [
    { to: '/parent/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/parent/children', icon: FaChild, label: 'My Children' },
    { to: '/parent/attendance', icon: FaCalendarCheck, label: 'Attendance' },
    { to: '/parent/payments', icon: FaMoneyBillWave, label: 'Payments' },
    { to: '/parent/history', icon: FaHistory, label: 'History' },
  ];

  const getLinks = () => {
    if (hasRole(['admin', 'super_admin'])) return adminLinks;
    if (hasRole('driver')) return driverLinks;
    if (hasRole('parent')) return parentLinks;
    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-sidebar-bg text-white min-h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <FaBus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Smart School</h1>
            <p className="text-xs text-gray-400">Transport System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <FaUser className="w-5 h-5 text-gray-300" />
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm truncate">{user?.fullName || user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize truncate">{user?.role || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700 space-y-1">
        <NavLink to="/settings" className="sidebar-link">
          <FaCog className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
