import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (user?.student_id || user?.children?.[0]?.id) {
        const studentId = user?.student_id || user?.children?.[0]?.id;
        const response = await attendanceAPI.getByStudent(studentId, { date: selectedDate });
        if (response.data?.success) {
          setAttendance(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    {
      key: 'boarding',
      label: 'Morning Pickup',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.boarding_status === 'present' ? (
            <>
              <FaCheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Present</span>
            </>
          ) : row.boarding_status === 'absent' ? (
            <>
              <FaTimesCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-medium">Absent</span>
            </>
          ) : (
            <span className="text-gray-400">Pending</span>
          )}
        </div>
      ),
    },
    {
      key: 'dropoff',
      label: 'Afternoon Drop-off',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.dropoff_status === 'present' ? (
            <>
              <FaCheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Present</span>
            </>
          ) : row.dropoff_status === 'absent' ? (
            <>
              <FaTimesCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-medium">Absent</span>
            </>
          ) : (
            <span className="text-gray-400">Pending</span>
          )}
        </div>
      ),
    },
    { key: 'recorded_by', label: 'Marked By' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">View your child's attendance records</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-soft">
        <label className="font-medium text-gray-700">Filter by Date:</label>
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
        emptyMessage="No attendance records found"
      />
    </div>
  );
};

export default ParentAttendance;
