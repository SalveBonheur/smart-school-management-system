import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { paymentAPI } from '../../services/api';
import { Alert } from '../../components/Alert';
import Modal from '../../components/Modal';
import DashboardCard from '../../components/DashboardCard';
import { FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_type: 'monthly',
    status: 'pending',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAll();
      if (response.data?.success) {
        setPayments(response.data.data || []);
        // Calculate stats
        const data = response.data.data || [];
        setStats({
          total: data.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          paid: data.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          pending: data.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setAlert({ type: 'error', message: 'Failed to load payments' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create(formData);
      setAlert({ type: 'success', message: 'Payment recorded successfully' });
      setIsModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      setAlert({ type: 'error', message: 'Failed to record payment' });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await paymentAPI.update(id, { status });
      setAlert({ type: 'success', message: 'Payment status updated' });
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      setAlert({ type: 'error', message: 'Failed to update payment' });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'student',
      label: 'Student',
      render: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
    },
    { key: 'amount', label: 'Amount', render: (v) => `$${v}` },
    { key: 'payment_type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'paid' ? 'bg-green-100 text-green-700' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {value}
        </span>
      ),
    },
    { key: 'payment_date', label: 'Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Manage transportation fee payments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          Record Payment
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Revenue" value={`$${stats.total}`} icon={FaMoneyBillWave} color="green" />
        <DashboardCard title="Paid Amount" value={`$${stats.paid}`} icon={FaCheckCircle} color="blue" />
        <DashboardCard title="Pending Amount" value={`$${stats.pending}`} icon={FaClock} color="yellow" />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment records found"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Student ID</label>
            <input
              type="text"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Payment Type</label>
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              className="form-input"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Record Payment</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
