import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaQrcode, FaCheck, FaTimes } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import { attendanceAPI } from '../../services/api';
import { Alert } from '../../components/Alert';

const DriverAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [qrInput, setQrInput] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getByDate(selectedDate);
      if (response.data?.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId, status, type = 'boarding') => {
    try {
      await attendanceAPI.markAttendance({
        student_id: studentId,
        date: selectedDate,
        [type === 'boarding' ? 'boarding_status' : 'dropoff_status']: status,
      });
      setAlert({ type: 'success', message: 'Attendance marked successfully' });
      fetchStudents();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAlert({ type: 'error', message: 'Failed to mark attendance' });
    }
  };

  const handleQRScan = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.qrScan({ qr_code: qrInput, date: selectedDate });
      setAlert({ type: 'success', message: 'QR Code scanned successfully' });
      setQrInput('');
      fetchStudents();
    } catch (error) {
      console.error('Error scanning QR:', error);
      setAlert({ type: 'error', message: 'Invalid QR Code' });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'student',
      label: 'Student',
      render: (value, row) => `${row.first_name} ${row.last_name}`,
    },
    { key: 'grade', label: 'Grade' },
    {
      key: 'boarding',
      label: 'Boarding',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'present', 'boarding')}
            className={`p-2 rounded-lg ${row.boarding_status === 'present' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-green-50'}`}
          >
            <FaCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'absent', 'boarding')}
            className={`p-2 rounded-lg ${row.boarding_status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:bg-red-50'}`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      key: 'dropoff',
      label: 'Drop-off',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'present', 'dropoff')}
            className={`p-2 rounded-lg ${row.dropoff_status === 'present' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-green-50'}`}
          >
            <FaCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMarkAttendance(row.student_id, 'absent', 'dropoff')}
            className={`p-2 rounded-lg ${row.dropoff_status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:bg-red-50'}`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mark Attendance</h1>
        <p className="page-subtitle">Record student boarding and drop-off</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* QR Scanner Input */}
      <div className="dashboard-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FaQrcode className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">QR Code Scanner</h3>
            <p className="text-sm text-gray-500">Scan student QR codes for quick attendance</p>
          </div>
        </div>
        <form onSubmit={handleQRScan} className="flex gap-2">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Enter QR code or scan..."
            className="form-input flex-1"
          />
          <button type="submit" className="btn-primary">Scan</button>
        </form>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-soft">
        <label className="font-medium text-gray-700">Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-input w-auto"
        />
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No students assigned to your route"
      />
    </div>
  );
};

export default DriverAttendance;
