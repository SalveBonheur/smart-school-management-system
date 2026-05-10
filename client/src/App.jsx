import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactsPage from './pages/ContactsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import DriverRegisterPage from './pages/auth/DriverRegisterPage';
import RegisterPage from './pages/auth/RegisterPage';

// Settings & Notifications
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import DriversPage from './pages/admin/DriversPage';
import BusesPage from './pages/admin/BusesPage';
import RoutesPage from './pages/admin/RoutesPage';
import AttendancePage from './pages/admin/AttendancePage';
import PaymentsPage from './pages/admin/PaymentsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAttendance from './pages/driver/DriverAttendance';
import DriverSchedule from './pages/driver/DriverSchedule';
import DriverProfile from './pages/driver/DriverProfile';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentPayments from './pages/parent/ParentPayments';

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactsPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/driver" element={<DriverRegisterPage />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <StudentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <DriversPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/buses"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <BusesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/routes"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <RoutesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <AttendancePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout>
              <ReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Driver Routes */}
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DashboardLayout>
              <DriverDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/attendance"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DashboardLayout>
              <DriverAttendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/schedule"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DashboardLayout>
              <DriverSchedule />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DashboardLayout>
              <DriverProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Parent Routes */}
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <DashboardLayout>
              <ParentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/attendance"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <DashboardLayout>
              <ParentAttendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/payments"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <DashboardLayout>
              <ParentPayments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings Route - Accessible to all authenticated users */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin', 'driver', 'parent']}>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Notifications Route - Accessible to all authenticated users */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin', 'driver', 'parent']}>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
      <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
