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
      <div className="p-6 text-center border glass-morphism-light rounded-3xl border-amber-200/20 backdrop-blur-xl">
        <div className="text-sm font-medium text-amber-300">
          Push notifications are not supported in this browser
        </div>
      </div>
    );
  }

  if (permission === 'granted' && isSubscribed) {
    return (
      <div className="p-6 text-center border glass-morphism-light rounded-3xl border-emerald-400/20 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-3 text-base font-medium text-emerald-300">
          <span className="text-2xl animate-pulse">🔔</span>
          Notifications enabled
        </div>
        <div className="text-sm leading-relaxed text-emerald-400/80">
          You'll receive push notifications when friends send you motivation
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-6 text-center border glass-morphism-light rounded-3xl border-red-400/20 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-3 text-base font-medium text-red-300">
          <span className="text-2xl">🔕</span>
          Notifications blocked
        </div>
        <div className="text-sm leading-relaxed text-red-400/80">
          Enable notifications in your browser settings to receive motivation from friends
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center border glass-morphism-light rounded-3xl border-blue-400/20 backdrop-blur-xl">
      <div className="flex items-center justify-center gap-2 mb-4 text-base font-medium text-blue-300">
        <span className="text-2xl animate-bounce">🔔</span>
        Enable notifications
      </div>
      <button
        onClick={handleSetupNotifications}
        disabled={isLoading}
        className="magnetic-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-8 rounded-2xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 text-sm backdrop-blur-xl border border-white/10 shadow-2xl transform hover:scale-105 min-h-[48px]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 rounded-full animate-spin border-white/20 border-t-white"></div>
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
