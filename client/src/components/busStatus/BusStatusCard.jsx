import React from 'react';
import { 
  FaBus, 
  FaUser, 
  FaClock, 
  FaMapMarkerAlt, 
  FaExclamationTriangle,
  FaRoute,
  FaPhone
} from 'react-icons/fa';
import StatusBadge from './StatusBadge';

const BusStatusCard = ({ bus, onClick, showDelay = true }) => {
  const isDelayed = bus.status === 'delayed' && bus.delay_minutes > 0;

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${
        isDelayed ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-primary-200'
      }`}
    >
      {/* Status Indicator Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
        bus.status === 'active' ? 'bg-green-500' :
        bus.status === 'on_route' ? 'bg-blue-500' :
        bus.status === 'delayed' ? 'bg-red-500' :
        bus.status === 'arrived' ? 'bg-purple-500' :
        bus.status === 'maintenance' ? 'bg-yellow-500' :
        'bg-gray-400'
      }`}></div>

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDelayed ? 'bg-red-100' : 'bg-primary-100'
            }`}>
              <FaBus className={`w-6 h-6 ${isDelayed ? 'text-red-600' : 'text-primary-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Bus {bus.bus_number}</h3>
              <p className="text-sm text-gray-500">{bus.route_name || 'No route assigned'}</p>
            </div>
          </div>
          <StatusBadge status={bus.status} size="md" pulse={isDelayed} />
        </div>

        {/* Delay Alert */}
        {isDelayed && showDelay && (
          <div className="mb-3 p-3 bg-red-100 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Delayed by {bus.delay_minutes} minutes
            </span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <FaUser className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">{bus.student_count || 0}</span> students
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">{bus.location || 'Unknown location'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaClock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              ETA: <span className="font-medium text-gray-900">{bus.estimated_arrival || 'N/A'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaPhone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">{bus.driver_phone || 'No phone'}</span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUser className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">{bus.driver_name || 'No driver'}</span>
            </div>
            <span className="text-xs text-gray-400">
              Updated {bus.last_updated ? new Date(bus.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Animated pulse for active buses */}
      {(bus.status === 'on_route' || bus.status === 'active') && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default BusStatusCard;
