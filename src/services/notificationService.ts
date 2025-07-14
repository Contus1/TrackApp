// Notification Service for handling web push notifications
import { supabase } from './supabase';

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

class NotificationService {
  private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // This should be configured in your environment

  // Check if the browser supports push notifications
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Request permission for notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    return await Notification.requestPermission();
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission denied for notifications');
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      });

      // Save subscription to database
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  // Save push subscription to database
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const subscriptionJSON = subscription.toJSON();
    const subscriptionData = {
      user_id: user.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscriptionJSON.keys?.p256dh || '',
      auth: subscriptionJSON.keys?.auth || ''
    };

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData);

    if (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  // Send motivation notification to a friend
  async sendMotivationNotification(friendId: string, customMessage?: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if friend needs motivation
      const { data: needsMotivation, error: checkError } = await supabase
        .rpc('check_friend_needs_motivation', { friend_id: friendId });

      if (checkError) {
        // If function doesn't exist, throw user-friendly error
        if (checkError.message.includes('function public.check_friend_needs_motivation') || 
            checkError.message.includes('does not exist')) {
          throw new Error('Push notification system is not set up. Please contact support.');
        }
        console.error('Error checking if friend needs motivation:', checkError);
        throw checkError;
      }

      if (!needsMotivation) {
        throw new Error('Friend has been active recently and doesn\'t need motivation');
      }

      // Send notification
      const { error: sendError } = await supabase
        .rpc('send_motivation_notification', {
          friend_id: friendId,
          motivation_message: customMessage
        });

      if (sendError) {
        // If function doesn't exist, throw user-friendly error
        if (sendError.message.includes('function public.send_motivation_notification') || 
            sendError.message.includes('does not exist')) {
          throw new Error('Push notification system is not set up. Please contact support.');
        }
        console.error('Error sending motivation notification:', sendError);
        throw sendError;
      }
    } catch (error) {
      console.error('Error in sendMotivationNotification:', error);
      throw error;
    }

    // Show local notification as feedback
    this.showLocalNotification(
      'Motivation sent!',
      'Your friend will receive a push notification to get back to training 💪'
    );
  }

  // Show local notification
  private showLocalNotification(title: string, message: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });
    }
  }

  // Get user's notifications
  async getNotifications(): Promise<NotificationRecord[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.warn('User not authenticated for notifications');
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(display_name)
        `)
        .eq('recipient_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist or foreign key issues, return empty array
        if (error.message.includes('relation "public.notifications" does not exist') ||
            error.message.includes('foreign key constraint') ||
            error.message.includes('notifications_sender_id_fkey')) {
          console.warn('Notifications table not properly configured. Please run push-notification-setup.sql in Supabase.');
          return [];
        }
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      // Return empty array if database isn't set up yet
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        // If table doesn't exist, just log and return
        if (error.message.includes('relation "public.notifications" does not exist')) {
          console.warn('Notifications table not found. Please run push-notification-setup.sql in Supabase.');
          return;
        }
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      // Don't throw, just log
    }
  }

  // Check if friend needs motivation (client-side check)
  async checkFriendNeedsMotivation(friendId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_friend_needs_motivation', { friend_id: friendId });

      if (error) {
        // If function doesn't exist, return false
        if (error.message.includes('function public.check_friend_needs_motivation') || 
            error.message.includes('does not exist')) {
          console.warn('Notification functions not found. Please run push-notification-setup.sql in Supabase.');
          return false;
        }
        console.error('Error checking if friend needs motivation:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkFriendNeedsMotivation:', error);
      return false;
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return new Uint8Array(outputArray.buffer);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
