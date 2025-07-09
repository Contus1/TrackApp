import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

interface NotificationSetupProps {
  onSetupComplete?: (success: boolean) => void;
}

const NotificationSetup: React.FC<NotificationSetupProps> = ({ onSetupComplete }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = notificationService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      // Check if already subscribed
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleSetupNotifications = async () => {
    if (!isSupported) {
      alert('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    
    try {
      const subscription = await notificationService.subscribe();
      
      if (subscription) {
        setIsSubscribed(true);
        setPermission(Notification.permission);
        onSetupComplete?.(true);
      } else {
        onSetupComplete?.(false);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
      alert('Failed to set up push notifications: ' + (error instanceof Error ? error.message : 'Unknown error'));
      onSetupComplete?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
        <div className="text-yellow-600 text-sm">
          Push notifications are not supported in this browser
        </div>
      </div>
    );
  }

  if (permission === 'granted' && isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <div className="text-green-600 text-sm font-medium mb-2">
          🔔 Notifications enabled
        </div>
        <div className="text-green-600 text-xs">
          You'll receive push notifications when friends send you motivation
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">
          🔕 Notifications blocked
        </div>
        <div className="text-red-600 text-xs">
          Enable notifications in your browser settings to receive motivation from friends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
      <div className="text-blue-600 text-sm font-medium mb-3">
        🔔 Enable notifications
      </div>
      <div className="text-blue-600 text-xs mb-4">
        Get motivated by your friends when you need it most!
      </div>
      <button
        onClick={handleSetupNotifications}
        disabled={isLoading}
        className="bg-blue-500 text-white font-medium py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Setting up...
          </span>
        ) : (
          'Enable Notifications'
        )}
      </button>
    </div>
  );
};

export default NotificationSetup;
