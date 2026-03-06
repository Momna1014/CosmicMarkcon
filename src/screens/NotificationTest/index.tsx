/**
 * NotificationTest Screen
 * 
 * Test screen for verifying notification functionality
 * - Test local notifications (immediate)
 * - Test scheduled notifications
 * - Test push notification token
 * - View notification status
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import { notificationService } from '../../services/NotificationService';
import { pushNotificationService } from '../../services/PushNotificationService';

// Context
import { useNotifications } from '../../contexts/NotificationContext';

// Theme
import { moderateScale } from '../../theme';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

// Icons
import ArrowLeftIcon from '../../assets/icons/svgicons/MeSvgIcons/leftarrow.svg';

interface Props {
  navigation: any;
}

// Sample manga topics for testing
const SAMPLE_TOPICS = [
  { id: 'all_users', name: 'All Users', description: 'Receive all notifications' },
  { id: 'manga_one_piece', name: 'One Piece', description: 'One Piece updates' },
  { id: 'manga_naruto', name: 'Naruto', description: 'Naruto updates' },
  { id: 'manga_demon_slayer', name: 'Demon Slayer', description: 'Demon Slayer updates' },
  { id: 'new_releases', name: 'New Releases', description: 'New manga releases' },
];

const NotificationTestScreen: React.FC<Props> = ({ navigation }) => {
  const {
    permissionStatus,
    notificationsEnabled,
    hasShownFirstPrompt,
    requestPermission,
    scheduleDailyNotification,
    cancelDailyNotification,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string>('');
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  // ===== Analytics: Track screen view =====
  useScreenView('NotificationTestScreen', {
    screen_category: 'settings',
    feature: 'notification_test',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [NotificationTestScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [NotificationTestScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('NotificationTestScreen', 'NotificationTestScreen');
    logFirebaseEvent('notification_test_screen_viewed', {
      platform: Platform.OS,
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent]);

  // Go back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Test immediate local notification
  const testLocalNotification = useCallback(async () => {
    setIsLoading('local');
    setLastResult('');
    
    // Log analytics event
    logFirebaseEvent('notification_test_local_started', {
      test_type: 'local',
      timestamp: Date.now(),
    });
    
    try {
      console.log('[NotificationTest] 🔔 Testing local notification...');
      
      const notificationId = await notificationService.displayNotification(
        '🎉 Test Notification',
        'This is a test local notification from MangaVerse!',
        { type: 'test', timestamp: Date.now() }
      );
      
      console.log('[NotificationTest] ✅ Local notification sent:', notificationId);
      logFirebaseEvent('notification_test_local_success', {
        notification_id: notificationId,
      });
      setLastResult(`✅ Local notification sent!\nID: ${notificationId}`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Local notification failed:', error);
      logFirebaseEvent('notification_test_local_error', {
        error: error.message,
      });
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [logFirebaseEvent]);

  // Test notification with image
  const testNotificationWithImage = useCallback(async () => {
    setIsLoading('image');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🖼️ Testing notification with image...');
      
      const notificationId = await notificationService.displayNotificationWithImage(
        '📚 New Manga Chapter!',
        'A new chapter of your favorite manga is available!',
        'https://picsum.photos/400/200', // Random test image
        { type: 'test_image', timestamp: Date.now() }
      );
      
      console.log('[NotificationTest] ✅ Image notification sent:', notificationId);
      setLastResult(`✅ Image notification sent!\nID: ${notificationId}`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Image notification failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Test scheduled notification (5 seconds from now)
  const testScheduledNotification = useCallback(async () => {
    setIsLoading('scheduled');
    setLastResult('');
    
    // Log analytics event
    logFirebaseEvent('notification_test_scheduled_started', {
      test_type: 'scheduled',
      delay_seconds: 5,
      timestamp: Date.now(),
    });
    
    try {
      console.log('[NotificationTest] ⏰ Testing scheduled notification (5 seconds)...');
      
      const scheduledTime = Date.now() + 5000; // 5 seconds from now
      const notificationId = await notificationService.scheduleNotification(
        '⏰ Scheduled Test',
        'This notification was scheduled 5 seconds ago!',
        scheduledTime,
        { type: 'test_scheduled', timestamp: Date.now() }
      );
      
      console.log('[NotificationTest] ✅ Notification scheduled:', notificationId);
      logFirebaseEvent('notification_test_scheduled_success', {
        notification_id: notificationId,
      });
      setLastResult(`✅ Notification scheduled!\nWill appear in 5 seconds\nID: ${notificationId}`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Scheduled notification failed:', error);
      logFirebaseEvent('notification_test_scheduled_error', {
        error: error.message,
      });
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [logFirebaseEvent]);

  // Test daily 8PM notification
  const testDailyNotification = useCallback(async () => {
    setIsLoading('daily');
    setLastResult('');
    
    // Log analytics event
    logFirebaseEvent('notification_test_daily_started', {
      test_type: 'daily',
      scheduled_time: '8PM',
      timestamp: Date.now(),
    });
    
    try {
      console.log('[NotificationTest] 📅 Scheduling daily 8PM notification...');
      
      await scheduleDailyNotification();
      
      console.log('[NotificationTest] ✅ Daily notification scheduled');
      logFirebaseEvent('notification_test_daily_success', {
        scheduled_time: '8PM',
      });
      setLastResult(`✅ Daily notification scheduled!\nWill trigger at 8:00 PM`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Daily notification failed:', error);
      logFirebaseEvent('notification_test_daily_error', {
        error: error.message,
      });
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [scheduleDailyNotification, logFirebaseEvent]);

  // Cancel daily notification
  const testCancelDaily = useCallback(async () => {
    setIsLoading('cancel');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🗑️ Cancelling daily notification...');
      
      await cancelDailyNotification();
      
      console.log('[NotificationTest] ✅ Daily notification cancelled');
      setLastResult(`✅ Daily notification cancelled!`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Cancel failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [cancelDailyNotification]);

  // Get FCM token
  const testGetFCMToken = useCallback(async () => {
    setIsLoading('fcm');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🔑 Getting FCM token...');
      
      const token = await pushNotificationService.getFCMToken();
      
      if (token) {
        console.log('[NotificationTest] ✅ FCM Token:', token);
        setLastResult(`✅ FCM Token obtained!\n\n${token.substring(0, 50)}...`);
        
        // Show full token in alert for copying
        Alert.alert(
          'FCM Token',
          token,
          [{ text: 'OK' }]
        );
      } else {
        setLastResult(`⚠️ No FCM token available`);
      }
    } catch (error: any) {
      console.error('[NotificationTest] ❌ FCM token failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Full debug check
  const runFullDebug = useCallback(async () => {
    setIsLoading('debug');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🔍 Running full debug check...');
      
      const results: string[] = [];
      results.push('🔍 PUSH NOTIFICATION DEBUG REPORT\n');
      results.push(`📱 Platform: ${Platform.OS}`);
      results.push(`🔔 Permission Status: ${permissionStatus}`);
      results.push(`✅ Notifications Enabled: ${notificationsEnabled}`);
      
      // Check FCM token
      const fcmToken = await pushNotificationService.getFCMToken();
      if (fcmToken) {
        results.push(`🔑 FCM Token: ✅ Available`);
        results.push(`   Token (first 30): ${fcmToken.substring(0, 30)}...`);
      } else {
        results.push(`🔑 FCM Token: ❌ NOT AVAILABLE`);
        results.push(`   ⚠️ This is why you're not getting notifications!`);
      }
      
      // Check if push service is initialized
      const isInitialized = pushNotificationService.isInitialized();
      results.push(`🚀 Push Service Initialized: ${isInitialized ? '✅ Yes' : '❌ No'}`);
      
      // Check permission
      const hasPermission = await pushNotificationService.hasPermission();
      results.push(`📋 Has Permission: ${hasPermission ? '✅ Yes' : '❌ No'}`);
      
      // Subscribed topics
      results.push(`\n📬 Subscribed Topics: ${subscribedTopics.length}`);
      if (subscribedTopics.length > 0) {
        subscribedTopics.forEach(t => results.push(`   - ${t}`));
      } else {
        results.push(`   ⚠️ Not subscribed to any topics!`);
        results.push(`   Tap "Subscribe to All" to fix this.`);
      }
      
      // Recommendations
      results.push('\n📋 RECOMMENDATIONS:');
      if (!hasPermission) {
        results.push('1. ❌ Grant notification permission first!');
      } else if (!fcmToken) {
        results.push('1. ❌ FCM token missing - check Firebase setup');
      } else if (subscribedTopics.length === 0) {
        results.push('1. ⚠️ Subscribe to topics, then send to that topic');
      } else {
        results.push('1. ✅ All looks good!');
        results.push('2. In Firebase Console, use "Topic" target');
        results.push(`3. Use topic: ${subscribedTopics[0]}`);
      }
      
      const report = results.join('\n');
      console.log('[NotificationTest] Debug report:\n', report);
      setLastResult(report);
      
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Debug failed:', error);
      setLastResult(`❌ Debug failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [permissionStatus, notificationsEnabled, subscribedTopics]);

  // Request permission
  const testRequestPermission = useCallback(async () => {
    setIsLoading('permission');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🔔 Requesting permission...');
      
      const granted = await requestPermission();
      
      console.log('[NotificationTest] Permission result:', granted);
      setLastResult(granted ? '✅ Permission granted!' : '❌ Permission denied');
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Permission request failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, [requestPermission]);

  // View all scheduled notifications
  const viewScheduledNotifications = useCallback(async () => {
    setIsLoading('view');
    setLastResult('');
    try {
      console.log('[NotificationTest] 📋 Getting scheduled notifications...');
      
      const scheduled = await notificationService.getTriggerNotifications();
      
      console.log('[NotificationTest] Scheduled notifications:', scheduled);
      
      if (scheduled.length === 0) {
        setLastResult('📋 No scheduled notifications');
      } else {
        const list = scheduled.map((n: any, i: number) => 
          `${i + 1}. ${n.notification?.title || 'No title'}`
        ).join('\n');
        setLastResult(`📋 Scheduled notifications:\n\n${list}`);
      }
    } catch (error: any) {
      console.error('[NotificationTest] ❌ View failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    setIsLoading('cancelAll');
    setLastResult('');
    try {
      console.log('[NotificationTest] 🗑️ Cancelling all notifications...');
      
      await notificationService.cancelAllNotifications();
      
      console.log('[NotificationTest] ✅ All notifications cancelled');
      setLastResult('✅ All notifications cancelled!');
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Cancel all failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Subscribe to a topic
  const subscribeToTopic = useCallback(async (topicId: string, topicName: string) => {
    setIsLoading(`sub_${topicId}`);
    setLastResult('');
    try {
      console.log(`[NotificationTest] 📬 Subscribing to topic: ${topicId}...`);
      
      await pushNotificationService.subscribeToTopic(topicId);
      
      setSubscribedTopics(prev => [...prev, topicId]);
      console.log(`[NotificationTest] ✅ Subscribed to ${topicName}`);
      setLastResult(`✅ Subscribed to "${topicName}"!\n\nYou will now receive notifications sent to this topic.\n\nTopic ID: ${topicId}`);
    } catch (error: any) {
      console.error(`[NotificationTest] ❌ Subscribe failed:`, error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Unsubscribe from a topic
  const unsubscribeFromTopic = useCallback(async (topicId: string, topicName: string) => {
    setIsLoading(`unsub_${topicId}`);
    setLastResult('');
    try {
      console.log(`[NotificationTest] 📭 Unsubscribing from topic: ${topicId}...`);
      
      await pushNotificationService.unsubscribeFromTopic(topicId);
      
      setSubscribedTopics(prev => prev.filter(t => t !== topicId));
      console.log(`[NotificationTest] ✅ Unsubscribed from ${topicName}`);
      setLastResult(`✅ Unsubscribed from "${topicName}"!\n\nYou will no longer receive notifications for this topic.`);
    } catch (error: any) {
      console.error(`[NotificationTest] ❌ Unsubscribe failed:`, error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Subscribe to all topics
  const subscribeToAllTopics = useCallback(async () => {
    setIsLoading('subAll');
    setLastResult('');
    try {
      console.log('[NotificationTest] 📬 Subscribing to all topics...');
      
      for (const topic of SAMPLE_TOPICS) {
        await pushNotificationService.subscribeToTopic(topic.id);
      }
      
      setSubscribedTopics(SAMPLE_TOPICS.map(t => t.id));
      console.log('[NotificationTest] ✅ Subscribed to all topics');
      setLastResult(`✅ Subscribed to all ${SAMPLE_TOPICS.length} topics!`);
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Subscribe all failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  // Unsubscribe from all topics
  const unsubscribeFromAllTopics = useCallback(async () => {
    setIsLoading('unsubAll');
    setLastResult('');
    try {
      console.log('[NotificationTest] 📭 Unsubscribing from all topics...');
      
      for (const topic of SAMPLE_TOPICS) {
        await pushNotificationService.unsubscribeFromTopic(topic.id);
      }
      
      setSubscribedTopics([]);
      console.log('[NotificationTest] ✅ Unsubscribed from all topics');
      setLastResult('✅ Unsubscribed from all topics!');
    } catch (error: any) {
      console.error('[NotificationTest] ❌ Unsubscribe all failed:', error);
      setLastResult(`❌ Failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  }, []);

  const renderButton = (
    title: string,
    onPress: () => void,
    loadingKey: string,
    color: string = '#007AFF'
  ) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      disabled={isLoading !== null}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>
        {isLoading === loadingKey ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeftIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Test</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Status</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>
              Permission: <Text style={styles.statusValue}>{permissionStatus}</Text>
            </Text>
            <Text style={styles.statusText}>
              Enabled: <Text style={styles.statusValue}>{notificationsEnabled ? 'Yes' : 'No'}</Text>
            </Text>
            <Text style={styles.statusText}>
              First Prompt Shown: <Text style={styles.statusValue}>{hasShownFirstPrompt ? 'Yes' : 'No'}</Text>
            </Text>
            <Text style={styles.statusText}>
              Platform: <Text style={styles.statusValue}>{Platform.OS}</Text>
            </Text>
          </View>
        </View>

        {/* Local Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Local Notifications</Text>
          {renderButton('Test Immediate Notification', testLocalNotification, 'local', '#34C759')}
          {renderButton('Test Notification with Image', testNotificationWithImage, 'image', '#5856D6')}
          {renderButton('Test Scheduled (5 sec)', testScheduledNotification, 'scheduled', '#FF9500')}
        </View>

        {/* Daily Notification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Daily 8PM Notification</Text>
          {renderButton('Schedule Daily Notification', testDailyNotification, 'daily', '#007AFF')}
          {renderButton('Cancel Daily Notification', testCancelDaily, 'cancel', '#FF3B30')}
        </View>

        {/* Push Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Push Notifications</Text>
          {renderButton('🔍 Run Full Debug Check', runFullDebug, 'debug', '#FF2D55')}
          {renderButton('Get FCM Token', testGetFCMToken, 'fcm', '#AF52DE')}
          {renderButton('Request Permission', testRequestPermission, 'permission', '#007AFF')}
        </View>

        {/* Topic Subscriptions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📬 Topic Subscriptions</Text>
          <Text style={styles.sectionDescription}>
            Subscribe to topics to receive push notifications from Firebase Console.
            Topics let you send notifications to groups of users.
          </Text>
          
          {/* Quick Actions */}
          <View style={styles.topicQuickActions}>
            {renderButton('Subscribe to All', subscribeToAllTopics, 'subAll', '#34C759')}
            {renderButton('Unsubscribe from All', unsubscribeFromAllTopics, 'unsubAll', '#FF3B30')}
          </View>
          
          {/* Individual Topics */}
          <View style={styles.topicsContainer}>
            {SAMPLE_TOPICS.map((topic) => {
              const isSubscribed = subscribedTopics.includes(topic.id);
              return (
                <View key={topic.id} style={styles.topicItem}>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <Text style={styles.topicDescription}>{topic.description}</Text>
                    <Text style={styles.topicId}>Topic ID: {topic.id}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.topicButton,
                      { backgroundColor: isSubscribed ? '#FF3B30' : '#34C759' }
                    ]}
                    onPress={() => 
                      isSubscribed 
                        ? unsubscribeFromTopic(topic.id, topic.name)
                        : subscribeToTopic(topic.id, topic.name)
                    }
                    disabled={isLoading !== null}
                  >
                    <Text style={styles.topicButtonText}>
                      {isLoading === `sub_${topic.id}` || isLoading === `unsub_${topic.id}`
                        ? '...'
                        : isSubscribed ? 'Unsub' : 'Sub'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Management</Text>
          {renderButton('View Scheduled Notifications', viewScheduledNotifications, 'view', '#5AC8FA')}
          {renderButton('Cancel All Notifications', cancelAllNotifications, 'cancelAll', '#FF3B30')}
        </View>

        {/* Result Section */}
        {lastResult !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Last Result</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{lastResult}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: moderateScale(40),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: moderateScale(16),
  },
  section: {
    marginBottom: moderateScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: moderateScale(12),
  },
  statusCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
  },
  statusText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    marginBottom: moderateScale(8),
  },
  statusValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  button: {
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(10),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
  },
  resultText: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    lineHeight: moderateScale(20),
  },
  bottomSpacer: {
    height: moderateScale(50),
  },
  sectionDescription: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    marginBottom: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  topicQuickActions: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom: moderateScale(16),
  },
  topicsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  topicInfo: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  topicName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topicDescription: {
    fontSize: moderateScale(12),
    color: '#8E8E93',
    marginTop: moderateScale(2),
  },
  topicId: {
    fontSize: moderateScale(10),
    color: '#5C5C5C',
    marginTop: moderateScale(4),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  topicButton: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    minWidth: moderateScale(60),
    alignItems: 'center',
  },
  topicButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NotificationTestScreen;
