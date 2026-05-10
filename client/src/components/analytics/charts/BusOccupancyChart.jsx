import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const BusOccupancyChart = ({ data = [], loading = false }) => {
  const sampleData = [
    { name: 'Bus 1 (KGL-001)', value: 42, capacity: 50, percentage: 84 },
    { name: 'Bus 2 (KGL-002)', value: 38, capacity: 45, percentage: 84 },
    { name: 'Bus 3 (KGL-003)', value: 48, capacity: 50, percentage: 96 },
    { name: 'Bus 4 (KGL-004)', value: 35, capacity: 50, percentage: 70 },
    { name: 'Bus 5 (KGL-005)', value: 29, capacity: 45, percentage: 64 },
  ];

  const chartData = data.length > 0 ? data : sampleData;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Students: {data.value}</p>
          <p className="text-sm text-gray-600">Capacity: {data.capacity}</p>
          <p className="text-sm font-medium" style={{ color: data.percentage > 90 ? '#EF4444' : '#3B82F6' }}>
            {data.percentage}% Full
          </p>
        </div>
      );
    }
    return null;
  };

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
        <h3 className="text-lg font-bold text-gray-900">Bus Occupancy</h3>
        <p className="text-sm text-gray-500">Current student distribution by bus</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {chartData.filter(b => b.percentage >= 80 && b.percentage <= 90).length}
          </p>
          <p className="text-xs text-green-700">Optimal</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">
            {chartData.filter(b => b.percentage > 90).length}
          </p>
          <p className="text-xs text-red-700">Overcrowded</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.filter(b => b.percentage < 70).length}
          </p>
          <p className="text-xs text-blue-700">Underutilized</p>
        </div>
      </div>
    </div>
  );
};

export default BusOccupancyChart;
