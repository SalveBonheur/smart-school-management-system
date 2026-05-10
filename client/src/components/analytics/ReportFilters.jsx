import React, { useState } from 'react';
import { 
  FaFilter, 
  FaCalendar, 
  FaBus, 
  FaUser, 
  FaRoute,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv
} from 'react-icons/fa';

const ReportFilters = ({ onFilterChange, onExport, loading = false }) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    route: '',
    bus: '',
    driver: '',
    student: ''
  });

  const [showExport, setShowExport] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleExport = (format) => {
    onExport?.(format, filters);
    setShowExport(false);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      route: '',
      bus: '',
      driver: '',
      student: ''
    });
    onFilterChange?.({});
  };

  const routes = ['All Routes', 'Route A', 'Route B', 'Route C', 'Route D', 'Route E'];
  const buses = ['All Buses', 'Bus 1', 'Bus 2', 'Bus 3', 'Bus 4', 'Bus 5'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <FaFilter className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Report Filters</h3>
            <p className="text-sm text-gray-500">Customize your analytics view</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear All
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              Export
            </button>
            
            {showExport && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExport(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FaFilePdf className="w-5 h-5 text-red-500" />
                    <span className="text-sm">Export PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <FaFileExcel className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Export Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <FaFileCsv className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Export CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaCalendar className="w-4 h-4 text-gray-400" />
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="To"
            />
          </div>
        </div>

        {/* Route Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaRoute className="w-4 h-4 text-gray-400" />
            Route
          </label>
          <select
            value={filters.route}
            onChange={(e) => handleFilterChange('route', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {routes.map(route => (
              <option key={route} value={route === 'All Routes' ? '' : route}>{route}</option>
            ))}
          </select>
        </div>

        {/* Bus Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaBus className="w-4 h-4 text-gray-400" />
            Bus
          </label>
          <select
            value={filters.bus}
            onChange={(e) => handleFilterChange('bus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {buses.map(bus => (
              <option key={bus} value={bus === 'All Buses' ? '' : bus}>{bus}</option>
            ))}
          </select>
        </div>

        {/* Driver Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaUser className="w-4 h-4 text-gray-400" />
            Driver
          </label>
          <input
            type="text"
            value={filters.driver}
            onChange={(e) => handleFilterChange('driver', e.target.value)}
            placeholder="Search driver..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Student Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaUser className="w-4 h-4 text-gray-400" />
            Student
          </label>
          <input
            type="text"
            value={filters.student}
            onChange={(e) => handleFilterChange('student', e.target.value)}
            placeholder="Search student..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Active Filters */}
      {Object.values(filters).some(v => v) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span 
                  key={key}
                  className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full flex items-center gap-2"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
