import React, { useState } from 'react';
import { 
  FaBus, 
  FaPlay, 
  FaStop, 
  FaExclamationTriangle, 
  FaWrench, 
  FaParking,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle
} from 'react-icons/fa';
import StatusBadge from './StatusBadge';

const DriverBusControl = ({ bus, onStatusUpdate, loading }) => {
  const [selectedStatus, setSelectedStatus] = useState(bus?.status || 'parked');
  const [location, setLocation] = useState(bus?.location || '');
  const [estimatedArrival, setEstimatedArrival] = useState(bus?.estimated_arrival || '');
  const [delayMinutes, setDelayMinutes] = useState(bus?.delay_minutes || 0);
  const [reason, setReason] = useState(bus?.reason || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Active', icon: FaBus, color: 'bg-green-500', desc: 'Bus is ready for service' },
    { value: 'on_route', label: 'On Route', icon: FaPlay, color: 'bg-blue-500', desc: 'Currently transporting students' },
    { value: 'delayed', label: 'Delayed', icon: FaExclamationTriangle, color: 'bg-red-500', desc: 'Experiencing delays' },
    { value: 'arrived', label: 'Arrived', icon: FaCheckCircle, color: 'bg-purple-500', desc: 'Reached destination' },
    { value: 'maintenance', label: 'Maintenance', icon: FaWrench, color: 'bg-yellow-500', desc: 'Under maintenance' },
    { value: 'parked', label: 'Parked', icon: FaParking, color: 'bg-gray-500', desc: 'Parked at depot' }
  ];

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    if (status !== 'delayed') {
      setDelayMinutes(0);
      setReason('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {
      status: selectedStatus,
      location,
      estimated_arrival: estimatedArrival,
      delay_minutes: selectedStatus === 'delayed' ? parseInt(delayMinutes) : 0,
      reason: selectedStatus === 'delayed' ? reason : ''
    };

    await onStatusUpdate?.(bus.bus_id, updateData);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  };

  if (!bus) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <FaBus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No bus assigned</p>
        <p className="text-sm text-gray-400">Contact admin to get assigned to a bus</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FaBus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Bus {bus.bus_number}</h3>
              <p className="text-sm text-gray-500">{bus.route_name || 'No route assigned'}</p>
            </div>
          </div>
          <StatusBadge status={bus.status} size="lg" pulse={bus.status === 'on_route'} />
        </div>
      </div>

      {/* Status Selection */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Status Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusSelect(option.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? `border-primary-500 bg-primary-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-8 h-8 ${option.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-10">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline w-4 h-4 mr-1" />
            Current Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Near City Center"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* ETA Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaClock className="inline w-4 h-4 mr-1" />
            Estimated Arrival
          </label>
          <input
            type="time"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Delay Fields (only show if delayed) */}
        {selectedStatus === 'delayed' && (
          <div className="p-4 bg-red-50 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                <FaExclamationTriangle className="inline w-4 h-4 mr-1" />
                Delay (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter delay in minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">
                Reason for Delay
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Traffic congestion"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              <FaCheckCircle className="w-5 h-5" />
              Update Status
            </>
          )}
        </button>

        {/* Success Message */}
        {showConfirm && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Status updated successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default DriverBusControl;
