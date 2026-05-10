import React from 'react';
import { 
  FaExclamationTriangle, 
  FaBus, 
  FaUsers, 
  FaMoneyBill, 
  FaRoute,
  FaWrench,
  FaChartLine,
  FaLightbulb
} from 'react-icons/fa';

const SmartInsights = ({ insights = [], loading = false }) => {
  // Default insights if none provided
  const defaultInsights = [
    {
      type: 'warning',
      icon: FaRoute,
      title: 'Route A Overcrowded',
      message: 'Route A currently has 48 students but bus capacity is only 45. Consider adding an extra bus.',
      priority: 'high'
    },
    {
      type: 'alert',
      icon: FaMoneyBill,
      title: 'Unpaid Fees',
      message: '15 parents have outstanding balances totaling $3,250. Payment reminders sent.',
      priority: 'high'
    },
    {
      type: 'maintenance',
      icon: FaWrench,
      title: 'Bus 3 Maintenance Overdue',
      message: 'Bus #3 (Kigali-003) is 5 days overdue for scheduled maintenance.',
      priority: 'medium'
    },
    {
      type: 'info',
      icon: FaChartLine,
      title: 'Attendance Improved',
      message: 'Student attendance increased by 8% this week compared to last week.',
      priority: 'low'
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'medium':
        return {
          border: 'border-l-orange-500',
          bg: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'low':
        return {
          border: 'border-l-green-500',
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      default:
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return FaExclamationTriangle;
      case 'alert':
        return FaExclamationTriangle;
      case 'maintenance':
        return FaWrench;
      case 'info':
        return FaLightbulb;
      default:
        return FaChartLine;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <FaLightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Smart Insights</h3>
            <p className="text-sm text-gray-500">AI-powered operational insights</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {displayInsights.map((insight, index) => {
          const styles = getPriorityStyles(insight.priority);
          const TypeIcon = getTypeIcon(insight.type);
          const InsightIcon = insight.icon || TypeIcon;

          return (
            <div 
              key={index}
              className={`relative p-4 rounded-xl border-l-4 ${styles.border} ${styles.bg} hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <InsightIcon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>

              {/* Hover action */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs text-gray-400 hover:text-gray-600">
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Insights are generated automatically based on system data
        </p>
      </div>
    </div>
  );
};

export default SmartInsights;
