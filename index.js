/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

/**
 * 🔥 EARLY FCM SETUP - This runs before app component mounts
 * This ensures we're ready to receive push notifications ASAP
 */
const setupFCM = async () => {
  try {
    console.log('==========================================');
    console.log('[index.js] 🚀 EARLY FCM SETUP STARTING...');
    console.log('[index.js] 📱 Platform:', Platform.OS);
    console.log('==========================================');
    
    // iOS specific setup
    if (Platform.OS === 'ios') {
      console.log('[index.js] 🍎 iOS: Checking if registered for remote messages...');
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      console.log('[index.js] 🍎 iOS: Is registered:', isRegistered);
      
      if (!isRegistered) {
        console.log('[index.js] 🍎 iOS: Registering for remote messages...');
        try {
          await messaging().registerDeviceForRemoteMessages();
          console.log('[index.js] 🍎 iOS: ✅ Registered for remote messages');
        } catch (regError) {
          console.error('[index.js] 🍎 iOS: ❌ Failed to register:', regError);
          console.log('[index.js] 🍎 iOS: This usually means Push Notifications capability is not enabled in Xcode');
        }
      }
      
      // Check APNs token
      try {
        const apnsToken = await messaging().getAPNSToken();
        console.log('[index.js] 🍎 iOS: APNs token:', apnsToken ? 'OBTAINED' : 'NOT AVAILABLE');
        if (apnsToken) {
          console.log('[index.js] 🍎 iOS: APNs token (first 30):', apnsToken.substring(0, 30));
        }
      } catch (apnsError) {
        console.error('[index.js] 🍎 iOS: ❌ Failed to get APNs token:', apnsError);
      }
    }
    
    // Check permission status
    const authStatus = await messaging().hasPermission();
    console.log('[index.js] 📋 Permission status:', authStatus);
    console.log('[index.js] 📋 AUTHORIZED =', messaging.AuthorizationStatus.AUTHORIZED);
    console.log('[index.js] 📋 Is authorized:', authStatus === messaging.AuthorizationStatus.AUTHORIZED);
    
    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
        authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
      
      // Get FCM token
      console.log('[index.js] 🔑 Getting FCM token...');
      const token = await messaging().getToken();
      console.log('[index.js] 🔑 FCM Token:', token ? 'OBTAINED' : 'FAILED');
      if (token) {
        console.log('[index.js] 🔑 Token (first 50 chars):', token.substring(0, 50));
        console.log('[index.js] 🔑 Full token length:', token.length);
      }
      
      // Subscribe to all_users topic
      console.log('[index.js] 📬 Subscribing to all_users topic...');
      await messaging().subscribeToTopic('all_users');
      console.log('[index.js] ✅ SUBSCRIBED TO all_users TOPIC!');
      
    } else {
      console.log('[index.js] ⚠️ Permission not granted yet - will subscribe after permission');
    }
    
    console.log('[index.js] ✅ Early FCM setup complete');
  } catch (error) {
    console.error('[index.js] ❌ Early FCM setup error:', error);
  }
};

// Run setup immediately
setupFCM();

/**
 * CRITICAL: Background message handler MUST be registered here at the root level
 * This runs when the app is in the background or killed
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[index.js] 📬 Background message received:', JSON.stringify(remoteMessage, null, 2));

  // IMPORTANT: If the message has a "notification" payload, the system already
  // auto-displays it in the tray. Only display via Notifee for data-only messages
  // to avoid duplicate notifications.
  if (remoteMessage.notification) {
    console.log('[index.js] ℹ️ Notification payload present - system will auto-display, skipping Notifee');
    return;
  }

  // Data-only message — we must display it ourselves
  await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  const title = remoteMessage.data?.title || 'New Notification';
  const body = remoteMessage.data?.body || '';

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
  console.log('[index.js] ✅ Data-only background notification displayed');
});

/**
 * Foreground message handler is handled by PushNotificationService.setupMessageHandlers()
 * Do NOT add another onMessage handler here - it causes duplicate notifications
 */

/**
 * Handle notification events when app is in background/quit state
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[index.js] 📱 Background notifee event:', type, detail);
});

AppRegistry.registerComponent(appName, () => App);
