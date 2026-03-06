/**
 * Push Notification Service - Firebase Cloud Messaging
 * 
 * Manages remote push notifications using Firebase Cloud Messaging
 * - Request FCM token
 * - Handle foreground/background messages
 * - Handle notification taps
 * - Integrate with Notifee for display
 */

import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {notificationService} from './NotificationService';
import notifee, {EventType} from '@notifee/react-native';

class PushNotificationService {
  private initialized = false;
  private fcmToken: string | null = null;

  /**
   * Initialize push notification service
   * NOTE: Does NOT request permissions automatically to avoid blocking app startup
   */
  async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        console.log('[PushNotificationService] Already initialized');
        return;
      }

      console.log('[PushNotificationService] Initializing...');

      // Check existing permissions without requesting
      const authStatus = await messaging().hasPermission();
      console.log('[PushNotificationService] Current permission status:', authStatus);

      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        // Register for remote messages on iOS (must be done before getting token)
        if (Platform.OS === 'ios') {
          await this.registerForRemoteNotifications();
        }

        // Get FCM token
        await this.getFCMToken();

        // Set up message handlers
        this.setupMessageHandlers();

        // Set up token refresh listener
        this.setupTokenRefreshListener();
      } else {
        console.log('[PushNotificationService] Permissions not granted yet - skipping token fetch');
        // Still set up message handlers for when permission is granted later
        this.setupMessageHandlers();
      }

      this.initialized = true;
      console.log('[PushNotificationService] Initialized successfully');
    } catch (error) {
      console.error('[PushNotificationService] Initialization failed:', error);
      // Don't throw - just log and continue to not block app startup
      console.warn('[PushNotificationService] Continuing despite error');
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<number> {
    try {
      const authStatus = await messaging().requestPermission();
      return authStatus;
    } catch (error) {
      console.error('[PushNotificationService] Failed to request permission:', error);
      throw error;
    }
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Check if token already exists
      if (this.fcmToken) {
        console.log('[PushNotificationService] Using cached FCM token');
        return this.fcmToken;
      }

      // On iOS, we must register for remote messages FIRST
      if (Platform.OS === 'ios') {
        console.log('[PushNotificationService] iOS: Registering for remote messages...');
        await messaging().registerDeviceForRemoteMessages();
        console.log('[PushNotificationService] iOS: Registered for remote messages');
        
        // Wait a bit for APNs registration to complete
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
        
        // Now get APNs token
        const apnsToken = await messaging().getAPNSToken();
        if (!apnsToken) {
          console.warn('[PushNotificationService] APNs token not available yet, waiting...');
          // Wait a bit more and try again
          await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
          const retryApnsToken = await messaging().getAPNSToken();
          if (!retryApnsToken) {
            console.warn('[PushNotificationService] APNs token still not available');
          } else {
            console.log('[PushNotificationService] APNs token obtained on retry');
          }
        } else {
          console.log('[PushNotificationService] APNs token obtained');
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      this.fcmToken = token;

      console.log('[PushNotificationService] FCM Token obtained:', token ? 'Yes' : 'No');
      console.log('[PushNotificationService] FCM Token:', token);

      // TODO: Send token to your server
      // await this.sendTokenToServer(token);

      return token;
    } catch (error) {
      console.error('[PushNotificationService] Failed to get FCM token:', error);
      // Don't throw - just return null to not block the flow
      return null;
    }
  }

  /**
   * Send token to your backend server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement your API call here
      console.log('[PushNotificationService] TODO: Send token to server:', token);
      
      // Example:
      // await fetch('https://your-api.com/device-tokens', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     token,
      //     platform: Platform.OS,
      //   }),
      // });
    } catch (error) {
      console.error('[PushNotificationService] Failed to send token to server:', error);
    }
  }

  /**
   * Set up token refresh listener
   */
  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async token => {
      console.log('[PushNotificationService] FCM token refreshed:', token);
      this.fcmToken = token;
      
      // Send new token to server
      await this.sendTokenToServer(token);
    });
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('[PushNotificationService] Foreground message received:', remoteMessage);
      
      // Display notification using Notifee
      await this.displayNotification(remoteMessage);
    });

    // NOTE: setBackgroundMessageHandler is registered in index.js (required by React Native Firebase)
    // It must be at the root level, not inside a component or class

    // Handle notification opened app (from quit state)
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log('[PushNotificationService] Notification opened app from quit state:', remoteMessage);
          // Handle navigation here
          await this.handleNotificationPress(remoteMessage);
        }
      });

    // Handle notification opened app (from background state)
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('[PushNotificationService] Notification opened app from background:', remoteMessage);
      // Handle navigation here
      await this.handleNotificationPress(remoteMessage);
    });
  }

  /**
   * Display notification using Notifee
   */
  private async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const {notification, data} = remoteMessage;

      if (!notification) {
        console.warn('[PushNotificationService] No notification payload');
        return;
      }

      // Get image URL if it exists and is valid
      const imageUrl = notification.android?.imageUrl || notification.ios?.imageUrl || (data?.imageUrl as string);
      const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http');

      console.log('[PushNotificationService] Displaying notification:', {
        title: notification.title,
        body: notification.body,
        hasValidImage,
        imageUrl: hasValidImage ? imageUrl : 'none',
      });

      // Display using Notifee for better control
      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        data: data,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          // Only set largeIcon if we have a valid URL
          ...(hasValidImage ? { largeIcon: imageUrl } : {}),
          pressAction: {
            id: 'default',
          },
          // Use big text style if body is long
          style: notification.body && notification.body.length > 50
            ? {
                type: 1, // BigText
                text: notification.body,
              }
            : undefined,
        },
        ios: {
          sound: 'default',
          // Only set attachments if we have a valid URL
          ...(hasValidImage ? { attachments: [{ url: imageUrl }] } : {}),
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      console.log('[PushNotificationService] Notification displayed via Notifee');
    } catch (error) {
      console.error('[PushNotificationService] Failed to display notification:', error);
    }
  }

  /**
   * Handle notification press
   */
  private async handleNotificationPress(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      console.log('[PushNotificationService] Handling notification press:', remoteMessage.data);

      // TODO: Implement navigation logic based on data
      // Example:
      // const { screen, params } = remoteMessage.data || {};
      // if (screen) {
      //   NavigationService.navigate(screen, params);
      // }
    } catch (error) {
      console.error('[PushNotificationService] Failed to handle notification press:', error);
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log('[PushNotificationService] Subscribed to topic:', topic);
    } catch (error) {
      console.error('[PushNotificationService] Failed to subscribe to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log('[PushNotificationService] Unsubscribed from topic:', topic);
    } catch (error) {
      console.error('[PushNotificationService] Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  /**
   * Delete FCM token
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.fcmToken = null;
      console.log('[PushNotificationService] FCM token deleted');
    } catch (error) {
      console.error('[PushNotificationService] Failed to delete token:', error);
      throw error;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async hasPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('[PushNotificationService] Failed to check permission:', error);
      return false;
    }
  }

  /**
   * Get current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Register device for remote notifications (iOS)
   */
  async registerForRemoteNotifications(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await messaging().registerDeviceForRemoteMessages();
        console.log('[PushNotificationService] Registered for remote notifications');
      } catch (error) {
        console.error('[PushNotificationService] Failed to register for remote notifications:', error);
      }
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export types
export type {FirebaseMessagingTypes};
