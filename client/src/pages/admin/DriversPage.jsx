import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import { driverAPI } from '../../services/api';
import { Alert } from '../../components/Alert';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
        driverAPI.getAll(),
        driverAPI.getPending(),
      ]);
      
      if (allRes.data?.success) {
        setDrivers(allRes.data.data || []);
      }
      if (pendingRes.data?.success) {
        setPendingDrivers(pendingRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setAlert({ type: 'error', message: 'Failed to load drivers' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await driverAPI.approve(id);
      setAlert({ type: 'success', message: 'Driver approved successfully' });
      fetchDrivers();
    } catch (error) {
      console.error('Error approving driver:', error);
      setAlert({ type: 'error', message: 'Failed to approve driver' });
    }
  };

  const handleReject = async (id) => {
    try {
      await driverAPI.reject(id, 'Rejected by admin');
      setAlert({ type: 'success', message: 'Driver rejected' });
      fetchDrivers();
    } catch (error) {
      console.error('Error rejecting driver:', error);
      setAlert({ type: 'error', message: 'Failed to reject driver' });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (value, row) => row.full_name || row.fullName
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'license_number', label: 'License' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        const colors = {
          active: 'bg-green-100 text-green-700',
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-blue-100 text-blue-700',
          rejected: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || colors.pending}`}>
            {value}
          </span>
        );
      }
    },
  ];

  const pendingColumns = [
    ...columns.slice(0, -1),
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(row.id)}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
            title="Approve"
          >
            <FaCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleReject(row.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            title="Reject"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  const displayData = activeTab === 'pending' ? pendingDrivers : drivers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Drivers</h1>
        <p className="page-subtitle">Manage driver registrations and approvals</p>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Drivers ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval ({pendingDrivers.length})
        </button>
      </div>

      <DataTable
        columns={activeTab === 'pending' ? pendingColumns : columns}
        data={displayData}
        loading={loading}
        emptyMessage={activeTab === 'pending' ? 'No pending approvals' : 'No drivers found'}
      />
    </div>
  );
};

export default DriversPage;
