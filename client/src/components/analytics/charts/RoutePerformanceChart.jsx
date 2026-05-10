import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const RoutePerformanceChart = ({ data = [], loading = false }) => {
  const sampleData = [
    { route: 'Route A', efficiency: 85, punctuality: 90, occupancy: 88, safety: 95 },
    { route: 'Route B', efficiency: 78, punctuality: 82, occupancy: 75, safety: 92 },
    { route: 'Route C', efficiency: 92, punctuality: 88, occupancy: 95, safety: 90 },
    { route: 'Route D', efficiency: 70, punctuality: 75, occupancy: 68, safety: 88 },
    { route: 'Route E', efficiency: 88, punctuality: 92, occupancy: 82, safety: 94 },
  ];

  const chartData = data.length > 0 ? data : sampleData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.stroke }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
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
        <h3 className="text-lg font-bold text-gray-900">Route Performance</h3>
        <p className="text-sm text-gray-500">Efficiency metrics by route</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis 
              dataKey="route" 
              tick={{ fill: '#4B5563', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <Radar
              name="Efficiency"
              dataKey="efficiency"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="#3B82F6"
              fillOpacity={0.1}
            />
            <Radar
              name="Punctuality"
              dataKey="punctuality"
              stroke="#10B981"
              strokeWidth={2}
              fill="#10B981"
              fillOpacity={0.1}
            />
            <Radar
              name="Occupancy"
              dataKey="occupancy"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="#F59E0B"
              fillOpacity={0.1}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Efficiency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Punctuality</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Occupancy</span>
        </div>
      </div>
    </div>
  );
};

export default RoutePerformanceChart;
