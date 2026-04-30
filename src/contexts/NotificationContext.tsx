/**
 * useNotifications hook (Provider-less)
 *
 * Global notification state without React Context. State lives in a module-level
 * store and is consumed via `useSyncExternalStore`, so any component can call
 * `useNotifications()` without needing a NotificationProvider in the tree.
 *
 * Behavior preserved from the previous Context-based implementation:
 *  - Permission status tracking (granted / denied / not-determined)
 *  - Android 13+ POST_NOTIFICATIONS request
 *  - iOS / older Android FCM + Notifee permission request
 *  - Daily 8:00 PM scheduled notification
 *  - Welcome notification on grant
 *  - First-launch prompt flag persisted to AsyncStorage
 *
 * @module useNotifications
 */

import { useSyncExternalStore } from 'react';
import { Platform, Linking, Alert, PermissionsAndroid } from 'react-native';
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

interface NotificationState {
  permissionStatus: PermissionStatus;
  notificationsEnabled: boolean;
  isLoading: boolean;
  isRequestingPermission: boolean;
  hasShownFirstPrompt: boolean;
}

export interface UseNotificationsResult extends NotificationState {
  requestPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => Promise<boolean>;
  checkPermissionStatus: () => Promise<PermissionStatus>;
  markFirstPromptShown: () => Promise<void>;
  openNotificationSettings: () => void;
  scheduleDailyNotification: () => Promise<void>;
  cancelDailyNotification: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Module-level store
// ---------------------------------------------------------------------------

let state: NotificationState = {
  permissionStatus: 'not-determined',
  notificationsEnabled: false,
  isLoading: true,
  isRequestingPermission: false,
  hasShownFirstPrompt: false,
};

const listeners = new Set<() => void>();

const getSnapshot = (): NotificationState => state;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setState = (patch: Partial<NotificationState>): void => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

// ---------------------------------------------------------------------------
// Internal helpers (formerly Context methods)
// ---------------------------------------------------------------------------

const checkSystemPermissionStatus = async (): Promise<PermissionStatus> => {
  try {
    console.log('[Notifications] 🔍 Checking system permission status...');

    // Android 13+ (API 33+) - Check POST_NOTIFICATIONS permission directly
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('[Notifications] 📱 Android 13+ POST_NOTIFICATIONS check:', hasPermission);

      if (hasPermission) {
        return 'granted';
      }

      const storedStatus = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      if (storedStatus === 'denied') {
        return 'denied';
      }

      return 'not-determined';
    }

    // iOS and older Android - use FCM/Notifee
    const fcmStatus = await messaging().hasPermission();
    console.log('[Notifications] 📱 FCM permission status:', fcmStatus);

    const notifeeSettings = await notifee.getNotificationSettings();
    console.log('[Notifications] 📱 Notifee permission status:', notifeeSettings.authorizationStatus);

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
    console.error('[Notifications] ❌ Failed to check permission status:', error);
    return 'not-determined';
  }
};

const initializeNotificationServices = async (): Promise<void> => {
  try {
    console.log('[Notifications] 🚀 Initializing notification services...');

    await notificationService.initialize(false);
    console.log('[Notifications] ✅ Local notifications initialized');

    if (Platform.OS === 'ios') {
      try {
        console.log('[Notifications] 📱 iOS: Attempting to register for remote messages...');
        await messaging().registerDeviceForRemoteMessages();
        console.log('[Notifications] ✅ iOS: Registered for remote messages');
      } catch {
        console.warn('[Notifications] ⚠️ iOS: Could not register for remote messages.');
        console.warn('[Notifications] ⚠️ This is OK - local notifications will still work.');
        console.warn('[Notifications] ⚠️ For push notifications, enable Push Notifications capability in Xcode.');
      }
    }

    try {
      await pushNotificationService.initialize();
      console.log('[Notifications] ✅ Push notifications initialized');

      const token = await pushNotificationService.getFCMToken();
      console.log('[Notifications] 🔑 FCM Token obtained:', token ? 'Yes' : 'No');
    } catch (pushError) {
      console.warn('[Notifications] ⚠️ Push notifications not available:', pushError);
      console.warn('[Notifications] ⚠️ Local notifications will still work.');
    }

    console.log('[Notifications] ✅ Notification services initialization complete');
  } catch (error) {
    console.error('[Notifications] ❌ Failed to initialize notification services:', error);
  }
};

const scheduleDailyNotification = async (): Promise<void> => {
  try {
    console.log('[Notifications] ⏰ Scheduling daily 8:00 PM notification...');

    const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
    if (existingId) {
      await notificationService.cancelNotification(existingId);
      console.log('[Notifications] 🗑️ Cancelled existing daily notification:', existingId);
    }

    const notificationId = await notificationService.scheduleDailyNotification(
      '✨ Your Evening Horoscope Awaits',
      'The stars have aligned with a message for you. Check your insights before the day ends!',
      20,
      0,
      { type: 'daily_reminder' },
    );

    await AsyncStorage.setItem(DAILY_NOTIFICATION_ID_KEY, notificationId);
    console.log('[Notifications] ✅ Daily notification scheduled:', notificationId);
    console.log('[Notifications] ⏰ Will trigger at 8:00 PM daily');
  } catch (error) {
    console.error('[Notifications] ❌ Failed to schedule daily notification:', error);
  }
};

const cancelDailyNotification = async (): Promise<void> => {
  try {
    console.log('[Notifications] 🗑️ Cancelling daily notification...');

    const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
    if (existingId) {
      await notificationService.cancelNotification(existingId);
      await AsyncStorage.removeItem(DAILY_NOTIFICATION_ID_KEY);
      console.log('[Notifications] ✅ Daily notification cancelled');
    } else {
      console.log('[Notifications] ℹ️ No daily notification to cancel');
    }
  } catch (error) {
    console.error('[Notifications] ❌ Failed to cancel daily notification:', error);
  }
};

const openNotificationSettings = (): void => {
  console.log('[Notifications] 🔧 Opening notification settings...');
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

const showWelcomeNotification = async (): Promise<void> => {
  try {
    console.log('[Notifications] 🎉 Showing welcome notification...');
    await notificationService.displayNotification(
      '✨ Welcome to the Cosmiq!',
      "You'll now receive daily horoscope insights and guidance at 8 PM.",
      { type: 'welcome' },
    );
    console.log('[Notifications] ✅ Welcome notification displayed');
  } catch (error) {
    console.error('[Notifications] ❌ Failed to show welcome notification:', error);
  }
};

const requestPermission = async (): Promise<boolean> => {
  try {
    console.log('[Notifications] 🔔 Requesting notification permission...');
    setState({ isRequestingPermission: true });

    let isGranted = false;

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      console.log('[Notifications] 📱 Android 13+: Requesting POST_NOTIFICATIONS permission...');
      const androidPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message:
            'Cosmiq needs notification permission to send you daily horoscope insights and updates.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('[Notifications] 📱 Android permission result:', androidPermission);
      isGranted = androidPermission === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const fcmStatus = await messaging().requestPermission();
      console.log('[Notifications] 📱 FCM permission result:', fcmStatus);

      const notifeeStatus = await notifee.requestPermission();
      console.log('[Notifications] 📱 Notifee permission result:', notifeeStatus.authorizationStatus);

      isGranted =
        fcmStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        fcmStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        notifeeStatus.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }

    const newStatus: PermissionStatus = isGranted ? 'granted' : 'denied';
    setState({ permissionStatus: newStatus });
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, newStatus);
    console.log('[Notifications] 📋 Permission status updated:', newStatus);

    if (isGranted) {
      setState({ notificationsEnabled: true });
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(true));
      console.log('[Notifications] ✅ Notifications enabled after permission grant');

      await initializeNotificationServices();

      try {
        console.log('[Notifications] 📬 Auto-subscribing to all_users topic...');
        await messaging().subscribeToTopic('all_users');
        console.log('[Notifications] ✅ Subscribed to all_users topic');
      } catch (topicError) {
        console.warn('[Notifications] ⚠️ Failed to subscribe to all_users:', topicError);
      }

      await scheduleDailyNotification();
      await showWelcomeNotification();
    } else {
      setState({ notificationsEnabled: false });
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));
      console.log('[Notifications] ❌ Notifications disabled (permission denied)');
    }

    setState({ isRequestingPermission: false });
    return isGranted;
  } catch (error) {
    console.error('[Notifications] ❌ Failed to request permission:', error);
    setState({ isRequestingPermission: false });
    return false;
  }
};

const toggleNotifications = async (enabled: boolean): Promise<boolean> => {
  try {
    console.log('[Notifications] 🔄 Toggling notifications:', enabled);

    if (enabled) {
      const currentStatus = await checkSystemPermissionStatus();
      console.log('[Notifications] 📋 Current permission status:', currentStatus);

      if (currentStatus === 'denied') {
        console.log('[Notifications] ⚠️ Permission denied, need to open settings');
        Alert.alert(
          'Notifications Disabled',
          'To enable notifications, please go to Settings and allow notifications for Cosmiq.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openNotificationSettings() },
          ],
        );
        return false;
      } else if (currentStatus === 'not-determined') {
        console.log('[Notifications] 📋 Requesting permission for first time...');
        const granted = await requestPermission();
        return granted;
      } else {
        setState({ notificationsEnabled: true });
        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(true));
        console.log('[Notifications] ✅ Notifications enabled');

        await initializeNotificationServices();
        await scheduleDailyNotification();
        await showWelcomeNotification();
        return true;
      }
    } else {
      setState({ notificationsEnabled: false });
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));
      console.log('[Notifications] ❌ Notifications disabled by user');

      await cancelDailyNotification();
      return true;
    }
  } catch (error) {
    console.error('[Notifications] ❌ Failed to toggle notifications:', error);
    return false;
  }
};

const checkPermissionStatus = async (): Promise<PermissionStatus> => {
  const status = await checkSystemPermissionStatus();
  const previousStatus = state.permissionStatus;
  const wasEnabled = state.notificationsEnabled;
  setState({ permissionStatus: status });

  console.log('[Notifications] 🔄 checkPermissionStatus:', {
    previousStatus,
    status,
    notificationsEnabled: wasEnabled,
  });

  if (status === 'granted') {
    if (!wasEnabled && previousStatus !== 'granted') {
      console.log('[Notifications] 🎉 Permission granted from settings, enabling notifications');
      setState({ notificationsEnabled: true });
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(true));
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');

      await initializeNotificationServices();
      await scheduleDailyNotification();
      await showWelcomeNotification();
    }
  } else {
    if (wasEnabled) {
      console.log('[Notifications] 🔄 Permission not granted, disabling notifications');
      setState({ notificationsEnabled: false });
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(false));
    }
  }

  return status;
};

const markFirstPromptShown = async (): Promise<void> => {
  try {
    console.log('[Notifications] 📋 Marking first prompt as shown');
    setState({ hasShownFirstPrompt: true });
    await AsyncStorage.setItem(NOTIFICATION_FIRST_PROMPT_KEY, JSON.stringify(true));
  } catch (error) {
    console.error('[Notifications] ❌ Failed to mark first prompt shown:', error);
  }
};

// ---------------------------------------------------------------------------
// One-time async bootstrap
// ---------------------------------------------------------------------------

let initStarted = false;

const bootstrap = async (): Promise<void> => {
  if (initStarted) {
    return;
  }
  initStarted = true;

  try {
    console.log('[Notifications] 📋 Loading notification state from storage...');

    const [enabledValue, promptShown] = await Promise.all([
      AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY),
      AsyncStorage.getItem(NOTIFICATION_FIRST_PROMPT_KEY),
    ]);

    if (promptShown !== null) {
      setState({ hasShownFirstPrompt: JSON.parse(promptShown) });
      console.log('[Notifications] 📋 First prompt shown:', JSON.parse(promptShown));
    }

    const currentStatus = await checkSystemPermissionStatus();
    setState({ permissionStatus: currentStatus });
    console.log('[Notifications] 📋 System permission status:', currentStatus);

    if (currentStatus === 'granted') {
      const isEnabled = enabledValue !== null ? JSON.parse(enabledValue) : true;
      setState({ notificationsEnabled: isEnabled });
      console.log('[Notifications] 📋 Notifications enabled:', isEnabled);

      if (isEnabled) {
        await initializeNotificationServices();
        await scheduleDailyNotification();
      }
    } else {
      setState({ notificationsEnabled: false });
      console.log('[Notifications] 📋 Notifications disabled (no permission)');
    }

    setState({ isLoading: false });
    console.log('[Notifications] ✅ Notification state initialized');
  } catch (error) {
    console.error('[Notifications] ❌ Failed to initialize notification state:', error);
    setState({ isLoading: false });
  }
};

// Kick off bootstrap as soon as this module is imported.
bootstrap();

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

/**
 * Hook to access notification state and actions.
 * Does NOT require a Provider — backed by a module-level store.
 */
export const useNotifications = (): UseNotificationsResult => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...snapshot,
    requestPermission,
    toggleNotifications,
    checkPermissionStatus,
    markFirstPromptShown,
    openNotificationSettings,
    scheduleDailyNotification,
    cancelDailyNotification,
  };
};
