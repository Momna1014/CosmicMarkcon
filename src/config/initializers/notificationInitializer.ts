/**
 * Notification Services Initialization
 * 
 * Initializes both local and push notification services.
 * Handles permissions and notification display configuration.
 * 
 * @module notificationInitializer
 */

import { notificationService } from '../../services/NotificationService';
import { pushNotificationService } from '../../services/PushNotificationService';

/**
 * Initialize all notification services
 * 
 * @description
 * - Initializes local notifications (Notifee)
 * - Initializes push notifications (Firebase Cloud Messaging)
 * - Does NOT request permissions automatically
 * - Sets up notification handlers
 * 
 * Note: Notification permissions should be requested separately after
 * User Centric and ATT permissions are handled to avoid overwhelming the user
 * 
 * @param {number} delayMs - Delay in milliseconds before initialization (default: 2000ms)
 * @returns {Promise<void>}
 */
export const initializeNotifications = async (delayMs: number = 2000): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log('[Notifications] Starting services initialization...');
        
        // Initialize local notifications WITHOUT requesting permissions
        // Permissions will be requested later via requestNotificationPermissions()
        await notificationService.initialize(false); // false = don't request permissions
        console.log('[Notifications] Local notifications initialized');
        
        // Initialize push notifications
        await pushNotificationService.initialize();
        console.log('[Notifications] Push notifications initialized');
        
        console.log('[Notifications] All services initialized successfully');
        resolve();
      } catch (error) {
        console.error('[Notifications] Services initialization failed:', error);
        // Don't reject - just log the error and resolve to not block app startup
        console.warn('[Notifications] Continuing app startup despite notification error');
        resolve();
      }
    }, delayMs);
  });
};

/**
 * Request notification permissions
 * Call this AFTER User Centric and ATT permissions are handled
 * 
 * @returns {Promise<void>}
 */
export const requestNotificationPermissions = async (): Promise<void> => {
  try {
    console.log('[Notifications] Requesting notification permissions...');
    await notificationService.requestPermissions();
    console.log('[Notifications] Notification permissions requested');
  } catch (error) {
    console.error('[Notifications] Failed to request notification permissions:', error);
  }
};
