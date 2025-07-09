import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import DatabaseSetupGuide from './DatabaseSetupGuide';

interface NotificationRecord {
  id: string;
  sender_id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  sender?: {
    display_name: string;
  };
}

interface NotificationListProps {
  onNotificationRead?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onNotificationRead }) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      onNotificationRead?.(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // If it's a database setup error, show setup guide
    if (error.includes('relation "public.notifications" does not exist') || 
        error.includes('Failed to load notifications')) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <DatabaseSetupGuide />
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={loadNotifications}
            className="mt-3 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <div className="text-gray-600 text-sm">No notifications yet</div>
          <div className="text-gray-500 text-xs mt-2">
            Your friends will be able to send you motivational messages when you need them!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-2xl p-4 border ${
              notification.read ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
            } transition-all duration-200`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                notification.type === 'motivation' 
                  ? 'bg-gradient-to-br from-orange-400 to-red-600' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-600'
              }`}>
                {notification.type === 'motivation' ? '💪' : '🔔'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    from {notification.sender?.display_name || 'Friend'}
                  </span>
                  
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
