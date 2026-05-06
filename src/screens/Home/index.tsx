import React, {useCallback, useMemo, useEffect, useState, useRef} from 'react';
import {View, StatusBar, ScrollView, RefreshControl, InteractionManager} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {selectOnboardingState} from '../../redux/slices/onboardingSlice';
import {styles} from './styles';
import {RootStackParamList, MainTabParamList} from '../../navigation/deepLinking';

// Analytics
import {trackHomeTabView, trackBtChildView} from '../../utils/mainScreenAnalytics';
import {markNextFocusFromHome} from '../../utils/tabNavigationSource';

// Cosmic data hook
import {useCosmicData} from '../../hooks/useCosmicData';

// Notifications
import {useNotifications} from '../../contexts/NotificationContext';

// Rating
import {useRating} from '../../contexts/RatingContext';
import RatingModal from '../../components/RatingModal';

// Cosmic Loader
import CosmicLoader from '../../components/CosmicLoader';

// Cosmic Alert
import CosmicAlert from '../../components/CosmicAlert';

// Home Components
import {
  HeaderSection,
  DailyEnergyCard,
  TransitsSection,
  FeatureCardsSection,
  CosmicGuidesSection,
  TRANSITS_DATA,
  COSMIC_GUIDES_DATA,
} from '../../components/home_components';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector(selectOnboardingState);

  // Fetch dynamic cosmic data from ChatGPT
  const {data: cosmicData, loading: cosmicLoading, refreshing, isQuotaError, refresh} = useCosmicData();
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);

  // Show quota alert when API limit is hit
  useEffect(() => {
    if (isQuotaError) {
      setShowQuotaAlert(true);
    }
  }, [isQuotaError]);

  // Notifications - request permission on first landing
  const {permissionStatus, hasShownFirstPrompt, requestPermission, markFirstPromptShown, isLoading: isNotificationLoading} = useNotifications();

  useEffect(() => {
    if (cosmicLoading || isNotificationLoading) {
      return;
    }
    if (!hasShownFirstPrompt && permissionStatus === 'not-determined') {
      const task = InteractionManager.runAfterInteractions(() => {
        setTimeout(async () => {
          await markFirstPromptShown();
          await requestPermission();
        }, 2000);
      });
      return () => task.cancel();
    }
  }, [cosmicLoading, isNotificationLoading, hasShownFirstPrompt, permissionStatus, requestPermission, markFirstPromptShown]);

  // Rating - show modal after content loads
  const {
    isRatingModalVisible,
    isLoading: isRatingLoading,
    showRatingModal,
    hideRatingModal,
    submitRating,
    checkShouldShowRating,
    incrementSessionCount,
  } = useRating();

  // Track if rating check has been done (only once per app session)
  const hasCheckedRating = useRef(false);

  // Increment session count on mount
  useEffect(() => {
    if (!isRatingLoading) {
      incrementSessionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRatingLoading]);

  // Show rating modal after data loads + notification flow completes
  // Only checks ONCE per app session (not on every data refresh)
  useEffect(() => {
    // Skip if already checked in this session
    if (hasCheckedRating.current) {
      return;
    }

    // Wait for all loading states to complete
    if (cosmicLoading || isRatingLoading || isNotificationLoading) {
      return;
    }

    // Don't show rating until notification permission flow is fully resolved
    if (permissionStatus === 'not-determined') {
      return;
    }

    // Mark as checked to prevent re-triggering
    hasCheckedRating.current = true;

    const checkRating = async () => {
      const shouldShow = await checkShouldShowRating();
      if (shouldShow) {
        const task = InteractionManager.runAfterInteractions(() => {
          setTimeout(() => {
            showRatingModal();
          }, 4000);
        });
        return () => task.cancel();
      }
    };
    checkRating();
  }, [cosmicLoading, isRatingLoading, isNotificationLoading, hasShownFirstPrompt, permissionStatus, checkShouldShowRating, showRatingModal]);

  // Memoized user name - prevents recalculation on every render
  // Returns empty string if no name (to show only "Welcome" without name)
  const userName = useMemo(() => {
    return onboardingData?.name?.toUpperCase() || '';
  }, [onboardingData?.name]);

  // Memoized zodiac sign - prevents recalculation on every render
  const zodiacSign = useMemo(() => {
    return onboardingData?.zodiacSign?.toUpperCase() || 'ARIES';
  }, [onboardingData?.zodiacSign]);

  // Analytics - Bottom tab view
  useFocusEffect(
    useCallback(() => {
      trackHomeTabView();
    }, [])
  );

  // Memoized callback handlers - prevents child component re-renders
  const handleReadHoroscope = useCallback(() => {
    trackBtChildView('home', 'horoscope');
    markNextFocusFromHome();
    navigation.navigate('Horoscope');
  }, [navigation]);

  const handleSynastryPress = useCallback(() => {
    trackBtChildView('home', 'love');
    markNextFocusFromHome();
    navigation.navigate('Love');
  }, [navigation]);

  const handleChiromancyPress = useCallback(() => {
    trackBtChildView('home', 'chiromancy');
    markNextFocusFromHome();
    navigation.navigate('Chiromancy');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleCosmicGuidePress = useCallback((guideId: string) => {
    navigation.navigate('CosmicGuideDetail', {guideId});
  }, [navigation]);

  // Show inline loader while initial data loads
  if (cosmicLoading) {
    return (
      <View style={styles.backgroundFallback}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CosmicLoader visible={true} inline />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.backgroundFallback}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="rgba(255,255,255,0.6)"
              colors={['#7B68EE']}
            />
          }>
          {/* Header Section (Welcome + Title) */}
          <HeaderSection userName={userName} onProfilePress={handleProfilePress} />

            {/* Daily Energy Card */}
            <DailyEnergyCard
              zodiacSign={zodiacSign}
              dailyMessage={cosmicData?.dailyEnergy?.message || 'The cosmos aligns in your favor. Trust your intuition.'}
              onReadHoroscope={handleReadHoroscope}
            />

            {/* Today's Transits Section */}
            <TransitsSection transits={TRANSITS_DATA} dynamicTransits={cosmicData?.transits} />

            {/* Feature Cards (Synastry & Chiromancy) */}
            <FeatureCardsSection
              onSynastryPress={handleSynastryPress}
              onChiromancyPress={handleChiromancyPress}
            />

            {/* Cosmic Guides Section */}
            <CosmicGuidesSection 
              guides={COSMIC_GUIDES_DATA} 
              onGuidePress={handleCosmicGuidePress}
            />
          </ScrollView>
        </SafeAreaView>

      {/* Rating Modal */}
      <RatingModal
        visible={isRatingModalVisible}
        onClose={hideRatingModal}
        onSubmitRating={submitRating}
      />

      {/* Quota Error Alert */}
      <CosmicAlert
        visible={showQuotaAlert}
        title="Cosmiq Signals Busy"
        message="The stars are overloaded right now. You're seeing cached readings — fresh insights will return shortly."
        buttonText="Got It"
        onDismiss={() => setShowQuotaAlert(false)}
      />
    </View>
  );
};

export default HomeScreen;
