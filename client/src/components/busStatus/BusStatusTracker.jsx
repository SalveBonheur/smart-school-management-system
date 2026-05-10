import React, { useState, useEffect, useCallback } from 'react';
import { FaSync, FaBus, FaExclamationCircle } from 'react-icons/fa';
import BusStatusCard from './BusStatusCard';

const BusStatusTracker = ({ 
  buses, 
  loading, 
  onRefresh, 
  autoRefresh = true, 
  refreshInterval = 30000,
  filter = 'all'
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoRefresh);

  // Auto refresh
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      onRefresh?.();
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, onRefresh]);

  // Filter buses
  const filteredBuses = buses.filter(bus => {
    if (filter === 'all') return true;
    if (filter === 'active') return bus.status === 'active' || bus.status === 'on_route';
    if (filter === 'delayed') return bus.status === 'delayed';
    if (filter === 'parked') return bus.status === 'parked' || bus.status === 'maintenance';
    return true;
  });

  // Status counts
  const statusCounts = {
    all: buses.length,
    active: buses.filter(b => b.status === 'active' || b.status === 'on_route').length,
    delayed: buses.filter(b => b.status === 'delayed').length,
    parked: buses.filter(b => b.status === 'parked' || b.status === 'maintenance').length
  };

  if (loading && buses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaBus className="text-primary-600" />
            Live Bus Tracker
          </h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['all', 'active', 'delayed', 'parked'].map((f) => (
              <button
                key={f}
                onClick={() => filter !== f && onRefresh?.()}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
                  {statusCounts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              onRefresh?.();
              setLastUpdated(new Date());
            }}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh now"
          >
            <FaSync className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Delayed Alert Banner */}
      {buses.some(b => b.status === 'delayed') && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <FaExclamationCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">
              {buses.filter(b => b.status === 'delayed').length} Bus(es) Delayed
            </p>
            <p className="text-sm text-red-600">
              Some buses are experiencing delays. Parents have been notified.
            </p>
          </div>
        </div>
      )}

      {/* Bus Grid */}
      {filteredBuses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <FaBus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No buses found</p>
          <p className="text-sm text-gray-400">{filter === 'all' ? 'No buses in the system' : `No ${filter} buses`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuses.map((bus) => (
            <BusStatusCard 
              key={bus.bus_id} 
              bus={bus} 
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BusStatusTracker;
