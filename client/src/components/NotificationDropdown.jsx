import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCheck, 
  FaTrash, 
  FaBus, 
  FaUser, 
  FaMoneyBill, 
  FaExclamationTriangle,
  FaBell,
  FaClock,
  FaCheckCircle,
  FaRoute,
  FaTools,
  FaEnvelope
} from 'react-icons/fa';

const NotificationDropdown = ({ 
  isOpen, 
  notifications, 
  loading, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete, 
  onClose,
  dropdownRef 
}) => {
  if (!isOpen) return null;

  // Get icon based on notification type
  const getNotificationIcon = (type, category) => {
    const iconClasses = "w-5 h-5";
    
    switch (type) {
      case 'attendance':
        return <FaCheckCircle className={`${iconClasses} text-green-500`} />;
      case 'payment':
        return <FaMoneyBill className={`${iconClasses} text-blue-500`} />;
      case 'driver':
      case 'route':
        return <FaBus className={`${iconClasses} text-orange-500`} />;
      case 'maintenance':
        return <FaTools className={`${iconClasses} text-yellow-500`} />;
      case 'delay':
        return <FaClock className={`${iconClasses} text-red-500`} />;
      case 'approval':
        return <FaUser className={`${iconClasses} text-purple-500`} />;
      case 'schedule':
        return <FaClock className={`${iconClasses} text-indigo-500`} />;
      case 'occupancy':
        return <FaExclamationTriangle className={`${iconClasses} text-orange-400`} />;
      default:
        return <FaBell className={`${iconClasses} text-gray-500`} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'low':
        return 'border-l-gray-400 bg-gray-50/50';
      default:
        return 'border-l-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50 animate-fade-in-down"
      style={{
        animation: 'fadeInDown 0.2s ease-out',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center gap-2">
          <FaBell className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <FaCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FaEnvelope className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">No notifications yet</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative group px-4 py-3 hover:bg-gray-50 transition-all duration-200 border-l-4 ${
                  !notification.is_read 
                    ? getPriorityColor(notification.priority)
                    : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Unread indicator dot */}
                {!notification.is_read && (
                  <div className="absolute top-4 right-12 w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <Link 
          to="/notifications" 
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <FaEnvelope className="w-4 h-4" />
          View All Notifications
        </Link>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
