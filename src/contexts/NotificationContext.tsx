/**
 * NotificationContext
 * 
 * Global state management for notifications:
 * - Tracks permission status (granted/denied/not-determined)
 * - Manages notification enabled state (user can toggle on/off)
 * - Handles permission requests
 * - Manages daily scheduled notifications
 * - Syncs state with AsyncStorage for persistence
 * 
 * @module NotificationContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { notificationService } from '../services/NotificationService';
import { pushNotificationService } from '../services/PushNotificationService';

// AsyncStorage keys
const NOTIFICATION_ENABLED_KEY = '@notification_enabled';
const NOTIFICATION_PERMISSION_KEY = '@notification_permission_status';
const NOTIFICATION_FIRST_PROMPT_KEY = '@notification_first_prompt_shown';
const DAILY_NOTIFICATION_ID_KEY = '@daily_notification_id';

// Permission status types
type PermissionStatus = 'granted' | 'denied' | 'not-determined';

// Context type
interface NotificationContextType {
  // Permission state
  permissionStatus: PermissionStatus;
  
  // Enable/disable state (user controlled)
  notificationsEnabled: boolean;
  
  // Loading states
  isLoading: boolean;
  isRequestingPermission: boolean;
  
  // First time prompt
  hasShownFirstPrompt: boolean;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => Promise<boolean>;
  checkPermissionStatus: () => Promise<PermissionStatus>;
  markFirstPromptShown: () => Promise<void>;
  openNotificationSettings: () => void;
  
  // Scheduled notifications
  scheduleDailyNotification: () => Promise<void>;
  cancelDailyNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // State
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('not-determined');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [hasShownFirstPrompt, setHasShownFirstPrompt] = useState<boolean>(false);

  /**
   * Check system permission status
   */
  const checkSystemPermissionStatus = useCallback(async (): Promise<PermissionStatus> => {
    try {
      console.log('[NotificationContext] 🔍 Checking system permission status...');
      
      // Check FCM permission
      const fcmStatus = await messaging().hasPermission();
      console.log('[NotificationContext] 📱 FCM permission status:', fcmStatus);
      
      // Also check Notifee permission
      const notifeeSettings = await notifee.getNotificationSettings();
      console.log('[NotificationContext] 📱 Notifee permission status:', notifeeSettings.authorizationStatus);

      // Map to our simplified status
      if (
        fcmStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        fcmStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        notifeeSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED
      ) {
        return 'granted';
      } else if (
        fcmStatus === messaging.AuthorizationStatus.DENIED ||
        notifeeSettings.authorizationStatus === AuthorizationStatus.DENIED
      ) {
        return 'denied';
      }
      
      return 'not-determined';
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to check permission status:', error);
      return 'not-determined';
    }
  }, []);

  /**
   * Initialize notification services
   * 
   * NOTE: Firebase deprecation warnings about "namespaced API" are expected.
   * They don't affect functionality - just future migration notices.
   */
  const initializeNotificationServices = useCallback(async (): Promise<void> => {
    try {
      console.log('[NotificationContext] 🚀 Initializing notification services...');
      
      // Initialize local notifications
      await notificationService.initialize(false);
      console.log('[NotificationContext] ✅ Local notifications initialized');
      
      // On iOS, try to register for remote messages
      // This may fail if Push Notification entitlement is not configured in Xcode
      // Local notifications will still work without this
      if (Platform.OS === 'ios') {
        try {
          console.log('[NotificationContext] 📱 iOS: Attempting to register for remote messages...');
          await messaging().registerDeviceForRemoteMessages();
          console.log('[NotificationContext] ✅ iOS: Registered for remote messages');
        } catch (iosError: any) {
          // This error is expected if Push Notification entitlement is not configured
          // Local notifications will still work
          console.warn('[NotificationContext] ⚠️ iOS: Could not register for remote messages.');
          console.warn('[NotificationContext] ⚠️ This is OK - local notifications will still work.');
          console.warn('[NotificationContext] ⚠️ For push notifications, enable Push Notifications capability in Xcode.');
        }
      }
      
      // Initialize push notifications (will handle its own errors)
      try {
        await pushNotificationService.initialize();
        console.log('[NotificationContext] ✅ Push notifications initialized');
        
        // Get FCM token
        const token = await pushNotificationService.getFCMToken();
        console.log('[NotificationContext] 🔑 FCM Token obtained:', token ? 'Yes' : 'No');
      } catch (pushError) {
        console.warn('[NotificationContext] ⚠️ Push notifications not available:', pushError);
        console.warn('[NotificationContext] ⚠️ Local notifications will still work.');
      }
      
      console.log('[NotificationContext] ✅ Notification services initialization complete');
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to initialize notification services:', error);
    }
  }, []);

  /**
   * Schedule daily notification at 8:00 PM
   */
  const scheduleDailyNotification = useCallback(async (): Promise<void> => {
    try {
      console.log('[NotificationContext] ⏰ Scheduling daily 8:00 PM notification...');

      // Cancel existing scheduled notification first
      const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
      if (existingId) {
        await notificationService.cancelNotification(existingId);
        console.log('[NotificationContext] 🗑️ Cancelled existing daily notification:', existingId);
      }

      // Schedule new daily notification at 8:00 PM (20:00)
      const notificationId = await notificationService.scheduleDailyNotification(
        '📚 Time to Read!',
        'Your favorite manga is waiting for you. Take a break and enjoy some reading!',
        20, // Hour: 8 PM
        0,  // Minute: 00
        { type: 'daily_reminder' }
      );

      // Save notification ID
      await AsyncStorage.setItem(DAILY_NOTIFICATION_ID_KEY, notificationId);
      console.log('[NotificationContext] ✅ Daily notification scheduled:', notificationId);
      console.log('[NotificationContext] ⏰ Will trigger at 8:00 PM daily');
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to schedule daily notification:', error);
    }
  }, []);

  /**
   * Cancel daily notification
   */
  const cancelDailyNotification = useCallback(async (): Promise<void> => {
    try {
      console.log('[NotificationContext] 🗑️ Cancelling daily notification...');

      const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
      if (existingId) {
        await notificationService.cancelNotification(existingId);
        await AsyncStorage.removeItem(DAILY_NOTIFICATION_ID_KEY);
        console.log('[NotificationContext] ✅ Daily notification cancelled');
      } else {
        console.log('[NotificationContext] ℹ️ No daily notification to cancel');
      }
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to cancel daily notification:', error);
    }
  }, []);

  /**
   * Open system notification settings
   */
  const openNotificationSettings = useCallback((): void => {
    console.log('[NotificationContext] 🔧 Opening notification settings...');
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  /**
   * Request notification permission
   * Returns true if granted, false otherwise
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[NotificationContext] 🔔 Requesting notification permission...');
      setIsRequestingPermission(true);

      // Request FCM permission
      const fcmStatus = await messaging().requestPermission();
      console.log('[NotificationContext] 📱 FCM permission result:', fcmStatus);

      // Also request Notifee permission
      const notifeeStatus = await notifee.requestPermission();
      console.log('[NotificationContext] 📱 Notifee permission result:', notifeeStatus.authorizationStatus);

      // Check if granted
      const isGranted =
        fcmStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        fcmStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        notifeeStatus.authorizationStatus === AuthorizationStatus.AUTHORIZED;

      // Update state
      const newStatus: PermissionStatus = isGranted ? 'granted' : 'denied';
      setPermissionStatus(newStatus);
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, newStatus);
      console.log('[NotificationContext] 📋 Permission status updated:', newStatus);

      if (isGranted) {
        // Enable notifications
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(true));
        console.log('[NotificationContext] ✅ Notifications enabled after permission grant');

        // Initialize services
        await initializeNotificationServices();

        // Auto-subscribe to 'all_users' topic so user can receive broadcast notifications
        try {
          console.log('[NotificationContext] 📬 Auto-subscribing to all_users topic...');
          await messaging().subscribeToTopic('all_users');
          console.log('[NotificationContext] ✅ Subscribed to all_users topic');
        } catch (topicError) {
          console.warn('[NotificationContext] ⚠️ Failed to subscribe to all_users:', topicError);
        }
        
        // Schedule daily notification
        await scheduleDailyNotification();
      } else {
        // Permission denied
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));
        console.log('[NotificationContext] ❌ Notifications disabled (permission denied)');
      }

      setIsRequestingPermission(false);
      return isGranted;
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to request permission:', error);
      setIsRequestingPermission(false);
      return false;
    }
  }, [initializeNotificationServices, scheduleDailyNotification]);

  /**
   * Toggle notifications on/off
   * Returns true if successful, false otherwise
   */
  const toggleNotifications = useCallback(async (enabled: boolean): Promise<boolean> => {
    try {
      console.log('[NotificationContext] 🔄 Toggling notifications:', enabled);

      if (enabled) {
        // User wants to enable notifications
        // First check current permission status
        const currentStatus = await checkSystemPermissionStatus();
        console.log('[NotificationContext] 📋 Current permission status:', currentStatus);

        if (currentStatus === 'denied') {
          // Permission was previously denied, need to open settings
          console.log('[NotificationContext] ⚠️ Permission denied, need to open settings');
          Alert.alert(
            'Notifications Disabled',
            'To enable notifications, please go to Settings and allow notifications for MangaVerse.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openNotificationSettings() },
            ]
          );
          return false;
        } else if (currentStatus === 'not-determined') {
          // Request permission for first time
          console.log('[NotificationContext] 📋 Requesting permission for first time...');
          const granted = await requestPermission();
          return granted;
        } else {
          // Permission already granted, just enable
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(true));
          console.log('[NotificationContext] ✅ Notifications enabled');

          // Initialize services and schedule notification
          await initializeNotificationServices();
          await scheduleDailyNotification();
          return true;
        }
      } else {
        // User wants to disable notifications
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));
        console.log('[NotificationContext] ❌ Notifications disabled by user');

        // Cancel scheduled notifications
        await cancelDailyNotification();
        return true;
      }
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to toggle notifications:', error);
      return false;
    }
  }, [
    checkSystemPermissionStatus,
    requestPermission,
    openNotificationSettings,
    initializeNotificationServices,
    scheduleDailyNotification,
    cancelDailyNotification,
  ]);

  /**
   * Check permission status (public method)
   */
  const checkPermissionStatus = useCallback(async (): Promise<PermissionStatus> => {
    const status = await checkSystemPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, [checkSystemPermissionStatus]);

  /**
   * Mark first prompt as shown
   */
  const markFirstPromptShown = useCallback(async (): Promise<void> => {
    try {
      console.log('[NotificationContext] 📋 Marking first prompt as shown');
      setHasShownFirstPrompt(true);
      await AsyncStorage.setItem(NOTIFICATION_FIRST_PROMPT_KEY, JSON.stringify(true));
    } catch (error) {
      console.error('[NotificationContext] ❌ Failed to mark first prompt shown:', error);
    }
  }, []);

  /**
   * Initialize notification state on mount
   */
  useEffect(() => {
    const initializeNotificationState = async (): Promise<void> => {
      try {
        console.log('[NotificationContext] 📋 Loading notification state from storage...');
        
        // Load persisted state
        const [enabledValue, promptShown] = await Promise.all([
          AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY),
          AsyncStorage.getItem(NOTIFICATION_FIRST_PROMPT_KEY),
        ]);

        // Set first prompt state
        if (promptShown !== null) {
          setHasShownFirstPrompt(JSON.parse(promptShown));
          console.log('[NotificationContext] 📋 First prompt shown:', JSON.parse(promptShown));
        }

        // Check actual permission status from the system
        const currentStatus = await checkSystemPermissionStatus();
        setPermissionStatus(currentStatus);
        console.log('[NotificationContext] 📋 System permission status:', currentStatus);

        // Determine if notifications should be enabled
        if (currentStatus === 'granted') {
          // If permission is granted, check stored preference
          const isEnabled = enabledValue !== null ? JSON.parse(enabledValue) : true;
          setNotificationsEnabled(isEnabled);
          console.log('[NotificationContext] 📋 Notifications enabled:', isEnabled);

          // Initialize services if enabled
          if (isEnabled) {
            await initializeNotificationServices();
            await scheduleDailyNotification();
          }
        } else {
          // If permission not granted, notifications are disabled
          setNotificationsEnabled(false);
          console.log('[NotificationContext] 📋 Notifications disabled (no permission)');
        }

        setIsLoading(false);
        console.log('[NotificationContext] ✅ Notification context initialized');
      } catch (error) {
        console.error('[NotificationContext] ❌ Failed to initialize notification state:', error);
        setIsLoading(false);
      }
    };

    console.log('[NotificationContext] 🔔 Initializing notification context...');
    initializeNotificationState();
  }, [checkSystemPermissionStatus, initializeNotificationServices, scheduleDailyNotification]);

  const value: NotificationContextType = {
    permissionStatus,
    notificationsEnabled,
    isLoading,
    isRequestingPermission,
    hasShownFirstPrompt,
    requestPermission,
    toggleNotifications,
    checkPermissionStatus,
    markFirstPromptShown,
    openNotificationSettings,
    scheduleDailyNotification,
    cancelDailyNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
