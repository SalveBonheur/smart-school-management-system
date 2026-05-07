import React, { useState } from 'react';
import { FaDownload, FaFileCsv, FaFilePdf, FaChartBar } from 'react-icons/fa';
import DashboardCard from '../../components/DashboardCard';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    {
      title: 'Attendance Report',
      description: 'Detailed attendance records for all students',
      icon: FaChartBar,
      color: 'blue',
      formats: ['csv', 'pdf'],
    },
    {
      title: 'Payment Report',
      description: 'Payment history and outstanding balances',
      icon: FaChartBar,
      color: 'green',
      formats: ['csv', 'pdf'],
    },
    {
      title: 'Driver Performance',
      description: 'Driver attendance and route completion stats',
      icon: FaChartBar,
      color: 'purple',
      formats: ['csv', 'pdf'],
    },
    {
      title: 'Bus Utilization',
      description: 'Bus occupancy and route efficiency analysis',
      icon: FaChartBar,
      color: 'yellow',
      formats: ['csv', 'pdf'],
    },
  ];

  const handleExport = (type, format) => {
    window.open(`http://localhost:3006/api/reports/export/${type}?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and download system reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">Report Period</h3>
        <div className="flex gap-4 items-center">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="dashboard-card">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-${report.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{report.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{report.description}</p>
                  
                  <div className="flex gap-2 mt-4">
                    {report.formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(report.title.toLowerCase().replace(' ', '-'), format)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        {format === 'csv' ? <FaFileCsv className="w-4 h-4" /> : <FaFilePdf className="w-4 h-4" />}
                        Export {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Reports" value="24" icon={FaChartBar} color="blue" />
        <DashboardCard title="Generated This Month" value="8" icon={FaDownload} color="green" />
        <DashboardCard title="Scheduled Reports" value="3" icon={FaChartBar} color="purple" />
        <DashboardCard title="Last Generated" value="Today" icon={FaChartBar} color="yellow" />
      </div>
    </div>
  );
};

export default ReportsPage;
