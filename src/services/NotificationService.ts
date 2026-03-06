/**
 * Notification Service - Local Notifications
 * 
 * Manages local notifications using Notifee
 * - Display local notifications
 * - Schedule notifications
 * - Create notification channels (Android)
 * - Handle notification actions
 * - Manage badges
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  EventType,
  Notification,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {Platform} from 'react-native';

class NotificationService {
  private initialized = false;
  private readonly DEFAULT_CHANNEL_ID = 'default';
  private readonly HIGH_PRIORITY_CHANNEL_ID = 'high_priority';

  /**
   * Initialize notification service
   * Creates notification channels for Android
   * @param requestPermissionsImmediately - Whether to request permissions immediately (default: false)
   */
  async initialize(requestPermissionsImmediately: boolean = false): Promise<void> {
    try {
      if (this.initialized) {
        console.log('[NotificationService] Already initialized');
        return;
      }

      console.log('[NotificationService] Initializing...');

      // Request permissions only if explicitly requested
      if (requestPermissionsImmediately) {
        await this.requestPermissions();
      } else {
        console.log('[NotificationService] Skipping permission request - will be requested later');
      }

      // Create notification channels (Android only)
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Set up event listeners
      this.setupListeners();

      this.initialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<AuthorizationStatus> {
    try {
      console.log('[NotificationService] Requesting permissions...');
      const settings = await notifee.requestPermission();

      console.log('[NotificationService] Permission status:', settings.authorizationStatus);

      return settings.authorizationStatus;
    } catch (error) {
      console.error('[NotificationService] Failed to request permissions:', error);
      throw error;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('[NotificationService] Failed to check permissions:', error);
      return false;
    }
  }

  /**
   * Create notification channels for Android
   */
  private async createChannels(): Promise<void> {
    try {
      // Default channel
      await notifee.createChannel({
        id: this.DEFAULT_CHANNEL_ID,
        name: 'Default Notifications',
        description: 'General notifications',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
        vibration: true,
      });

      // High priority channel
      await notifee.createChannel({
        id: this.HIGH_PRIORITY_CHANNEL_ID,
        name: 'Important Notifications',
        description: 'High priority notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      console.log('[NotificationService] Notification channels created');
    } catch (error) {
      console.error('[NotificationService] Failed to create channels:', error);
      throw error;
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupListeners(): void {
    // Handle foreground events
    notifee.onForegroundEvent(({type, detail}) => {
      console.log('[NotificationService] Foreground event:', type, detail);

      switch (type) {
        case EventType.DISMISSED:
          console.log('[NotificationService] User dismissed notification');
          break;
        case EventType.PRESS:
          console.log('[NotificationService] User pressed notification');
          // Handle navigation here
          break;
        case EventType.ACTION_PRESS:
          console.log('[NotificationService] User pressed action:', detail.pressAction?.id);
          // Handle action press here
          break;
      }
    });

    // Handle background events
    notifee.onBackgroundEvent(async ({type, detail}) => {
      console.log('[NotificationService] Background event:', type, detail);

      switch (type) {
        case EventType.PRESS:
          console.log('[NotificationService] Background: User pressed notification');
          // Handle navigation here
          break;
        case EventType.ACTION_PRESS:
          console.log('[NotificationService] Background: User pressed action:', detail.pressAction?.id);
          // Handle action press here
          break;
      }
    });
  }

  /**
   * Display a simple local notification
   */
  async displayNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: this.DEFAULT_CHANNEL_ID,
          smallIcon: 'ic_launcher', // Using app launcher icon
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      console.log('[NotificationService] Notification displayed:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to display notification:', error);
      throw error;
    }
  }

  /**
   * Display a notification with an image
   */
  async displayNotificationWithImage(
    title: string,
    body: string,
    imageUrl: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: this.DEFAULT_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          largeIcon: imageUrl,
          style: {
            type: AndroidStyle.BIGPICTURE,
            picture: imageUrl,
          },
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          attachments: [
            {
              url: imageUrl,
            },
          ],
          sound: 'default',
        },
      });

      console.log('[NotificationService] Image notification displayed:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to display image notification:', error);
      throw error;
    }
  }

  /**
   * Display a notification with actions
   */
  async displayNotificationWithActions(
    title: string,
    body: string,
    actions: Array<{id: string; title: string}>,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: this.DEFAULT_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          actions: actions.map(action => ({
            title: action.title,
            pressAction: {id: action.id},
          })),
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          categoryId: 'actions',
          sound: 'default',
        },
      });

      console.log('[NotificationService] Action notification displayed:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to display action notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    title: string,
    body: string,
    timestamp: number,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp,
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          title,
          body,
          data,
          android: {
            channelId: this.DEFAULT_CHANNEL_ID,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
          },
        },
        trigger
      );

      console.log('[NotificationService] Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to schedule notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a repeating daily notification
   */
  async scheduleDailyNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      // Calculate next occurrence
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime.getTime() < now.getTime()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      return await this.scheduleNotification(
        title,
        body,
        scheduledTime.getTime(),
        data
      );
    } catch (error) {
      console.error('[NotificationService] Failed to schedule daily notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('[NotificationService] Notification cancelled:', notificationId);
    } catch (error) {
      console.error('[NotificationService] Failed to cancel notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('[NotificationService] All notifications cancelled');
    } catch (error) {
      console.error('[NotificationService] Failed to cancel all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all displayed notifications
   */
  async getDisplayedNotifications(): Promise<Notification[]> {
    try {
      const notifications = await notifee.getDisplayedNotifications();
      console.log('[NotificationService] Displayed notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('[NotificationService] Failed to get displayed notifications:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled (trigger) notifications
   */
  async getTriggerNotifications(): Promise<any[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      console.log('[NotificationService] Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('[NotificationService] Failed to get scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Set app badge number (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await notifee.setBadgeCount(count);
        console.log('[NotificationService] Badge count set:', count);
      }
    } catch (error) {
      console.error('[NotificationService] Failed to set badge count:', error);
      throw error;
    }
  }

  /**
   * Get app badge number (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        const count = await notifee.getBadgeCount();
        return count;
      }
      return 0;
    } catch (error) {
      console.error('[NotificationService] Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Increment badge count (iOS only)
   */
  async incrementBadge(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const current = await this.getBadgeCount();
        await this.setBadgeCount(current + 1);
      }
    } catch (error) {
      console.error('[NotificationService] Failed to increment badge:', error);
    }
  }

  /**
   * Clear app badge (iOS only)
   */
  async clearBadge(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await this.setBadgeCount(0);
        console.log('[NotificationService] Badge cleared');
      }
    } catch (error) {
      console.error('[NotificationService] Failed to clear badge:', error);
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export types
export type {Notification, AuthorizationStatus};
