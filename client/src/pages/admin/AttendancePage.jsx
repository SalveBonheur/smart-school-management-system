import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import { attendanceAPI } from '../../services/api';
import { Alert } from '../../components/Alert';
import DashboardCard from '../../components/DashboardCard';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getByDate(selectedDate);
      if (response.data?.success) {
        setAttendance(response.data.data || []);
      }
      
      const statsRes = await attendanceAPI.getTodayStats();
      if (statsRes.data?.success) {
        setStats(statsRes.data.data || { present: 0, absent: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAlert({ type: 'error', message: 'Failed to load attendance' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await attendanceAPI.markAttendance({
        student_id: studentId,
        date: selectedDate,
        status: status,
      });
      setAlert({ type: 'success', message: 'Attendance marked successfully' });
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAlert({ type: 'error', message: 'Failed to mark attendance' });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'student',
      label: 'Student',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium text-primary-600">
            {(row.first_name?.[0] || '') + (row.last_name?.[0] || '')}
          </div>
          <span className="font-medium">{row.first_name} {row.last_name}</span>
        </div>
      ),
    },
    { key: 'grade', label: 'Grade' },
    { key: 'bus_number', label: 'Bus' },
    {
      key: 'boarding_status',
      label: 'Boarding',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'present' ? 'bg-green-100 text-green-700' :
          value === 'absent' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {value || 'Pending'}
        </span>
      ),
    },
    {
      key: 'dropoff_status',
      label: 'Drop-off',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'present' ? 'bg-green-100 text-green-700' :
          value === 'absent' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {value || 'Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'present')}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
            title="Mark Present"
          >
            <FaCheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'absent')}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            title="Mark Absent"
          >
            <FaTimesCircle className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Manage daily student attendance records</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Present Today"
          value={stats.present}
          icon={FaCheckCircle}
          color="green"
        />
        <DashboardCard
          title="Absent Today"
          value={stats.absent}
          icon={FaTimesCircle}
          color="red"
        />
        <DashboardCard
          title="Total Students"
          value={stats.total}
          icon={FaCalendar}
          color="blue"
        />
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-soft">
        <label className="font-medium text-gray-700">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-input w-auto"
        />
      </div>

      <DataTable
        columns={columns}
        data={attendance}
        loading={loading}
        emptyMessage="No attendance records for this date"
      />
    </div>
  );
};

export default AttendancePage;
