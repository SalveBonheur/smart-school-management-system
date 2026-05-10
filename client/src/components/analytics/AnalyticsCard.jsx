import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AnalyticsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  loading = false 
}) => {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trendUp: 'text-blue-600',
      trendDown: 'text-red-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trendUp: 'text-purple-600',
      trendDown: 'text-red-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trendUp: 'text-orange-600',
      trendDown: 'text-red-600',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
      border: 'border-red-200'
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      trendUp: 'text-indigo-600',
      trendDown: 'text-red-600',
      border: 'border-indigo-200'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
          <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border ${scheme.border} hover:shadow-md transition-all duration-300 group`}>
      {/* Background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${scheme.bg} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend === 'up' ? (
                <>
                  <FaArrowUp className={`w-4 h-4 ${scheme.trendUp}`} />
                  <span className={scheme.trendUp}>{trendValue}</span>
                </>
              ) : (
                <>
                  <FaArrowDown className={`w-4 h-4 ${scheme.trendDown}`} />
                  <span className={scheme.trendDown}>{trendValue}</span>
                </>
              )}
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 ${scheme.iconBg} rounded-2xl flex items-center justify-center ${scheme.iconColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>

      {/* Progress bar animation */}
      <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${scheme.iconBg.replace('bg-', 'bg-opacity-100 ').replace('-100', '-500')} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.random() * 30 + 70}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
