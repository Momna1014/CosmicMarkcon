import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

// Hooks
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { useStyles } from './styles';
import { useApp } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationContext';

// Utils
import { showPaywall } from '../../utils/showPaywall';

// Analytics
import firebaseService from '../../services/firebase/FirebaseService';

// Theme
import { moderateScale } from '../../theme';

// Icons
import CrownIcon from '../../assets/icons/svgicons/MeSvgIcons/crown.svg';
import NotificationIcon from '../../assets/icons/svgicons/MeSvgIcons/termprivacy.svg';
// import DownloadIcon from '../../assets/icons/svgicons/MeSvgIcons/notification.svg';
// import MatureContentIcon from '../../assets/icons/svgicons/MeSvgIcons/download.svg';
import TermPrivacyIcon from '../../assets/icons/svgicons/MeSvgIcons/maturecontent.svg';
import ArrowRightIcon from '../../assets/icons/svgicons/MeSvgIcons/leftarrow.svg';

// Constants
const ICON_SIZE = moderateScale(24);
const PREMIUM_ICON_SIZE = moderateScale(38);
const SWITCH_COLORS = {
  trackFalse: '#3E3E3E',
  trackTrue: '#34C759',
  thumb: '#FFFFFF',
};
const PREMIUM_GRADIENT = {
  colors: ['#E60076', '#C27AFF'] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

// Types
interface Props {
  navigation: any;
  route?: {
    params?: {
      from?: string;
    };
  };
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLoading?: boolean;
  subtitle?: string;
}

interface SupportItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

// Sub-components
const SettingToggleItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  value,
  onValueChange,
  isLoading = false,
  subtitle,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingTitle, { fontSize: moderateScale(11), color: '#888', marginTop: 2 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={SWITCH_COLORS.trackTrue} />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: SWITCH_COLORS.trackFalse, true: SWITCH_COLORS.trackTrue }}
          thumbColor={SWITCH_COLORS.thumb}
        />
      )}
    </View>
  );
};

const SupportLinkItem: React.FC<SupportItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  const styles = useStyles();

  return (
    <TouchableOpacity
      style={styles.supportItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.supportContent}>
        <View style={styles.supportIcon}>{icon}</View>
        <View style={styles.supportText}>
          <Text style={styles.supportTitle}>{title}</Text>
          <Text style={styles.supportSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ArrowRightIcon width={ICON_SIZE} height={ICON_SIZE} />
    </TouchableOpacity>
  );
};

// Main Component
const MeScreen: React.FC<Props> = ({ navigation: _navigation, route }) => {
  const styles = useStyles();
  const { isPremium } = useApp();
  
  // Notification Context
  const {
    notificationsEnabled,
    permissionStatus,
    isLoading: isNotificationLoading,
    isRequestingPermission,
    toggleNotifications,
  } = useNotifications();

  // ===== Analytics: Track screen view =====
  useScreenView('MeScreen', {
    screen_category: 'settings',
    previous_screen: route?.params?.from || 'unknown',
    is_premium: isPremium ? 'true' : 'false',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [MeScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [MeScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('MeScreen', 'MeScreen');
    logFirebaseEvent('me_screen_viewed', {
      is_premium: isPremium,
      notifications_enabled: notificationsEnabled,
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent, isPremium, notificationsEnabled]);

  // Navigate to Notification Test Screen
  const handleTestNotifications = useCallback(() => {
    console.log('[MeScreen] 🧪 Opening Notification Test Screen');
    logFirebaseEvent('me_test_notifications_pressed', {
      screen: 'MeScreen',
    });
    _navigation.navigate('NotificationTest');
  }, [_navigation, logFirebaseEvent]);

  // State (for other settings) - COMMENTED OUT for now
  // const [autoDownload, setAutoDownload] = useState(true);
  // const [showMatureContent, setShowMatureContent] = useState(true);

  // Analytics (moved to top of component)

  // Handlers
  const handleUpgradeToPremium = useCallback(() => {
    if (isPremium) {
      // User is already premium, do nothing
      console.log('[MeScreen] User is already premium');
      return;
    }
    console.log('[MeScreen] 👑 Upgrade to Premium pressed - showing paywall');
    logFirebaseEvent('me_upgrade_premium_pressed', {
      is_premium: false,
      screen: 'MeScreen',
    });
    showPaywall('settings_upgrade', _navigation);
  }, [isPremium, _navigation, logFirebaseEvent]);

  const handlePrivacyPolicy = useCallback(() => {
    console.log('[MeScreen] 📜 Privacy Policy pressed');
    logFirebaseEvent('me_privacy_policy_pressed', {
      screen: 'MeScreen',
    });
    Linking.openURL('https://manga.myappsstudio.com/public/policy');
  }, [logFirebaseEvent]);

  const handleTermsConditions = useCallback(() => {
    console.log('[MeScreen] 📄 Terms & Conditions pressed');
    logFirebaseEvent('me_terms_conditions_pressed', {
      screen: 'MeScreen',
    });
    Linking.openURL('https://manga.myappsstudio.com/public/terms');
  }, [logFirebaseEvent]);

  // COMMENTED OUT - Terms & Privacy handler
  // const handleTermsAndPrivacy = useCallback(() => {
  //   console.log('Terms & Privacy pressed');
  //   // _navigation.navigate('TermsPrivacy');
  // }, []);

  // COMMENTED OUT - Logout handler
  // const handleLogout = useCallback(() => {
  //   console.log('Log out pressed');
  //   // Show confirmation dialog and logout
  // }, []);

  // Render sections

  // COMMENTED OUT - Premium Card
  const renderPremiumCard = () => {
    // If user is premium, show "Already Premium" card (not pressable)
    if (isPremium) {
      return (
        <View
          style={Platform.OS === 'android' ? styles.premiumCardContainerAndroid : undefined}
        >
          <LinearGradient
            colors={['#34C759', '#30B350']} // Green gradient for premium users
            start={PREMIUM_GRADIENT.start}
            end={PREMIUM_GRADIENT.end}
            style={styles.premiumCard}
          >
            <View style={styles.premiumCardContainer}>
              <View style={styles.premiumContent}>
                <View style={styles.premiumIconContainer}>
                  <CrownIcon width={PREMIUM_ICON_SIZE} height={PREMIUM_ICON_SIZE} />
                </View>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>Premium Active ✓</Text>
                  <Text style={styles.premiumSubtitle}>
                    You have full access to all features
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    }

    // User is NOT premium - show upgrade card (pressable)
    return (
      <TouchableOpacity
        style={Platform.OS === 'android' ? styles.premiumCardContainerAndroid : undefined}
        onPress={handleUpgradeToPremium}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[...PREMIUM_GRADIENT.colors]}
          start={PREMIUM_GRADIENT.start}
          end={PREMIUM_GRADIENT.end}
          style={styles.premiumCard}
        >
          <TouchableOpacity
            style={styles.premiumCardContainer}
            onPress={handleUpgradeToPremium}
            activeOpacity={0.8}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumIconContainer}>
                <CrownIcon width={PREMIUM_ICON_SIZE} height={PREMIUM_ICON_SIZE} />
              </View>
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumSubtitle}>
                  Unlimited reading & exclusive content
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Handler for notification toggle
  const handleNotificationToggle = useCallback(async (enabled: boolean) => {
    console.log('[MeScreen] 🔔 Notification toggle changed:', enabled);
    console.log('[MeScreen] 📋 Current permission status:', permissionStatus);
    
    // Log analytics event
    logFirebaseEvent('me_notification_toggle', {
      enabled: enabled,
      previous_status: notificationsEnabled,
      permission_status: permissionStatus,
      screen: 'MeScreen',
    });
    
    const success = await toggleNotifications(enabled);
    
    if (success) {
      console.log('[MeScreen] ✅ Notification toggle successful');
      logFirebaseEvent('me_notification_toggle_success', {
        enabled: enabled,
        screen: 'MeScreen',
      });
    } else {
      console.log('[MeScreen] ❌ Notification toggle failed or cancelled');
      logFirebaseEvent('me_notification_toggle_failed', {
        enabled: enabled,
        screen: 'MeScreen',
      });
    }
  }, [toggleNotifications, permissionStatus, logFirebaseEvent, notificationsEnabled]);

  // Get notification subtitle based on status
  const getNotificationSubtitle = useCallback((): string | undefined => {
    if (isNotificationLoading) {
      return 'Loading...';
    }
    if (permissionStatus === 'denied') {
      return 'Tap to open settings';
    }
    if (notificationsEnabled) {
      return 'Daily reminder at 8:00 PM';
    }
    return undefined;
  }, [isNotificationLoading, permissionStatus, notificationsEnabled]);

  const renderAppSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Settings</Text>
      <View style={styles.settingsContainer}>
        <SettingToggleItem
          icon={<NotificationIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Notifications"
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
          isLoading={isRequestingPermission}
          subtitle={getNotificationSubtitle()}
        />
        {/* COMMENTED OUT - Auto Download */}
        {/* <SettingToggleItem
          icon={<DownloadIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Auto Download"
          value={autoDownload}
          onValueChange={setAutoDownload}
        />
        */}
        {/* COMMENTED OUT - Show Mature Content
        <SettingToggleItem
          icon={<MatureContentIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Show Mature Content"
          value={showMatureContent}
          onValueChange={setShowMatureContent}
        />
        */}
      </View>
    </View>
  );

  // Developer/Test section (for testing notifications)
  const renderDevSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Developer</Text>
      <View style={styles.supportContainer}>
        <SupportLinkItem
          icon={<NotificationIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Test Notifications"
          subtitle="Test local & push notifications"
          onPress={handleTestNotifications}
        />
      </View>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.supportContainer}>
        <SupportLinkItem
          icon={<TermPrivacyIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={handlePrivacyPolicy}
        />
       
        {/* COMMENTED OUT - Terms & Privacy
        <SupportLinkItem
          icon={<TermPrivacyIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Terms & Privacy"
          subtitle="Legal information"
          onPress={handleTermsAndPrivacy}
        />
        */}
      </View>

            <View style={styles.supportContainer}>

        <SupportLinkItem
          icon={<TermPrivacyIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Terms & Conditions"
          subtitle="Usage terms and license"
          onPress={handleTermsConditions}
        />
        {/* COMMENTED OUT - Terms & Privacy
        <SupportLinkItem
          icon={<TermPrivacyIcon width={ICON_SIZE} height={ICON_SIZE} />}
          title="Terms & Privacy"
          subtitle="Legal information"
          onPress={handleTermsAndPrivacy}
        />
        */}
      </View>
    </View>
  );

  // COMMENTED OUT - Logout Button
  // const renderLogoutButton = () => (
  //   <TouchableOpacity
  //     style={styles.logoutButton}
  //     onPress={handleLogout}
  //     activeOpacity={0.8}
  //   >
  //     <Text style={styles.logoutText}>Log out</Text>
  //   </TouchableOpacity>
  // );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>
        {/* COMMENTED OUT - Premium Card */}
        {renderPremiumCard()}
        {renderAppSettings()}
        {/* {renderDevSection()} */}
        {renderSupportSection()}
      </ScrollView>
      {/* COMMENTED OUT - Logout Button */}
      {/* {renderLogoutButton()} */}
    </SafeAreaView>
  );
};

export default MeScreen;
