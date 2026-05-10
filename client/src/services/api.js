import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth-new/unified/login', credentials),
  driverLogin: (credentials) => api.post('/auth-new/drivers/login', credentials),
  driverRegister: (data) => api.post('/auth-new/drivers/register', data),
  parentLogin: (credentials) => api.post('/auth/parent/login', credentials),
  forgotPassword: (email) => api.post('/auth-new/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth-new/reset-password', data),
  getProfile: () => api.get('/auth-new/drivers/profile'),
};

// Student APIs
export const studentAPI = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (query) => api.get(`/students?search=${encodeURIComponent(query)}`),
};

// Driver APIs
export const driverAPI = {
  getAll: () => api.get('/drivers'),
  getById: (id) => api.get(`/drivers/${id}`),
  getPending: () => api.get('/auth-new/drivers/pending'),
  approve: (id) => api.put(`/auth-new/drivers/${id}/approve`),
  reject: (id, reason) => api.put(`/auth-new/drivers/${id}/reject`, { reason }),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  getProfile: () => api.get('/auth-new/drivers/profile'),
  getSchedule: () => api.get('/drivers/schedule'),
};

// Bus APIs
export const busAPI = {
  getAll: () => api.get('/buses'),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
  getMaintenance: (id) => api.get(`/buses/${id}/maintenance`),
};

// Route APIs
export const routeAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  getStops: (id) => api.get(`/routes/${id}/stops`),
};

// Attendance APIs
export const attendanceAPI = {
  getAll: (params = {}) => api.get('/attendance', { params }),
  getByStudent: (studentId, params = {}) => api.get(`/attendance/student/${studentId}`, { params }),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  markAttendance: (data) => api.post('/attendance', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  getSummary: (params = {}) => api.get('/attendance/summary', { params }),
  getTodayStats: () => api.get('/attendance/today/stats'),
  qrScan: (data) => api.post('/attendance/qr-scan', data),
};

// Payment APIs
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByStudent: (studentId) => api.get(`/payments/student/${studentId}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getBalance: (studentId) => api.get(`/payments/student/${studentId}/balance`),
};

// Dashboard APIs
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getDriverStats: () => api.get('/dashboard/driver/stats'),
  getParentStats: () => api.get('/dashboard/parent/stats'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/read/${id}`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Report APIs
export const reportAPI = {
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getPaymentReport: (params) => api.get('/reports/payments', { params }),
  exportAttendance: (format = 'csv') => api.get(`/reports/export/attendance?format=${format}`),
  exportPayments: (format = 'csv') => api.get(`/reports/export/payments?format=${format}`),
};

// Bus Status APIs
export const busStatusAPI = {
  getAll: () => api.get('/bus-status'),
  getByBusId: (busId) => api.get(`/bus-status/${busId}`),
  updateStatus: (busId, data) => api.post(`/bus-status/${busId}/update`, data),
  getByDriver: (driverId) => api.get(`/bus-status/driver/${driverId}`),
  getByStudent: (studentId) => api.get(`/bus-status/student/${studentId}`),
  getDelayedSummary: () => api.get('/bus-status/summary/delayed'),
};

export default api;
