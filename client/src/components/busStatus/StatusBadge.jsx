import React from 'react';
import { FaBus, FaClock, FaExclamationTriangle, FaCheckCircle, FaTools, FaParking } from 'react-icons/fa';

const StatusBadge = ({ status, size = 'md', showIcon = true, pulse = false }) => {
  const statusConfig = {
    active: {
      label: 'Active',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: FaBus,
      dot: 'bg-green-500'
    },
    on_route: {
      label: 'On Route',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: FaBus,
      dot: 'bg-blue-500'
    },
    delayed: {
      label: 'Delayed',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: FaExclamationTriangle,
      dot: 'bg-red-500'
    },
    arrived: {
      label: 'Arrived',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: FaCheckCircle,
      dot: 'bg-purple-500'
    },
    maintenance: {
      label: 'Maintenance',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: FaTools,
      dot: 'bg-yellow-500'
    },
    parked: {
      label: 'Parked',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: FaParking,
      dot: 'bg-gray-500'
    }
  };

  const config = statusConfig[status] || statusConfig.parked;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className={`w-2 h-2 rounded-full ${config.dot} ${pulse ? 'animate-ping' : ''}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
