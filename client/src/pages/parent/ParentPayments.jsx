import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaHistory, FaFileInvoice } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import DashboardCard from '../../components/DashboardCard';
import { paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (user?.student_id || user?.children?.[0]?.id) {
        const studentId = user?.student_id || user?.children?.[0]?.id;
        const [paymentsRes, balanceRes] = await Promise.all([
          paymentAPI.getByStudent(studentId),
          paymentAPI.getBalance(studentId),
        ]);
        
        if (paymentsRes.data?.success) {
          setPayments(paymentsRes.data.data || []);
        }
        if (balanceRes.data?.success) {
          setBalance(balanceRes.data.data?.balance || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Invoice #' },
    { key: 'payment_date', label: 'Date' },
    { key: 'payment_type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v) => `$${v}` },
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">View payment history and outstanding balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Current Balance"
          value={`$${balance}`}
          icon={FaCreditCard}
          color={balance > 0 ? 'red' : 'green'}
        />
        <DashboardCard
          title="Total Paid (YTD)"
          value={`$${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)}`}
          icon={FaHistory}
          color="blue"
        />
        <DashboardCard
          title="Pending Payments"
          value={payments.filter(p => p.status === 'pending').length}
          icon={FaFileInvoice}
          color="yellow"
        />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment records found"
      />
    </div>
  );
};

export default ParentPayments;
