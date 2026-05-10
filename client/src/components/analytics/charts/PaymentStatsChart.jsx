import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PaymentStatsChart = ({ data = [], loading = false }) => {
  const sampleData = [
    { name: 'Paid', value: 185, amount: 92500 },
    { name: 'Pending', value: 45, amount: 22500 },
    { name: 'Overdue', value: 15, amount: 7500 },
  ];

  const chartData = data.length > 0 ? data : sampleData;

  const COLORS = {
    'Paid': '#22C55E',
    'Pending': '#F59E0B',
    'Overdue': '#EF4444'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Students: {data.value}</p>
          <p className="text-sm text-gray-600">Amount: ${data.amount?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const totalStudents = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-80">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Payment Status</h3>
        <p className="text-sm text-gray-500">Fee collection overview</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.name] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">
                  {((item.value / totalStudents) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Collection Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {((chartData.find(d => d.name === 'Paid')?.value / totalStudents) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsChart;
