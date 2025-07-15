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
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Notifications</h3>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400/20 border-t-orange-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // If it's a database setup error, show setup guide
    if (error.includes('relation "public.notifications" does not exist') || 
        error.includes('Failed to load notifications')) {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Notifications</h3>
          <DatabaseSetupGuide />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Notifications</h3>
        <div className="glass-morphism-light rounded-3xl p-6 text-center border border-red-400/20 backdrop-blur-xl">
          <div className="text-red-300 text-sm mb-4">{error}</div>
          <button
            onClick={loadNotifications}
            className="magnetic-button bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-2xl hover:from-red-400 hover:to-pink-500 transition-all duration-300 text-sm backdrop-blur-xl border border-white/10 shadow-2xl transform hover:scale-105 min-h-[48px]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Notifications</h3>
        <div className="glass-morphism-light rounded-3xl p-8 text-center border border-white/10 backdrop-blur-xl">
          <div className="text-6xl mb-6 animate-pulse">🔔</div>
          <div className="text-white/80 text-base font-medium mb-2">No notifications yet</div>
          <div className="text-white/60 text-sm leading-relaxed">
            Your friends will be able to send you motivational messages when you need them!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Notifications</h3>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`glass-morphism-light rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
              notification.read 
                ? 'border-white/10 backdrop-blur-xl' 
                : 'border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-600/10 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold shrink-0 ${
                notification.type === 'motivation' 
                  ? 'bg-gradient-to-br from-orange-400 to-red-600 shadow-lg' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg'
              }`}>
                <span className="text-xl">
                  {notification.type === 'motivation' ? '💪' : '🔔'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-semibold text-white truncate">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-white/60 ml-4 shrink-0">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                
                <p className="text-sm text-white/80 mb-4 leading-relaxed">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    from {notification.sender?.display_name || 'Friend'}
                  </span>
                  
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors min-h-[32px] px-3 rounded-lg hover:bg-orange-400/10"
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
