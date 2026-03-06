/**
 * Onboarding Screen 1
 * Main onboarding screen with category carousel
 */

import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../../contexts/AppContext';
import {
  Colors,
  FontFamilies,
  verticalScale,
  horizontalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';
import {showPaywall} from '../../utils/showPaywall';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackOnboardingStep, trackOnboardingCompleted } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';

// Import SVG images for carousel
import ActionImage from '../../assets/icons/svgicons/onboardingIcons/action.svg';
import ThrillerImage from '../../assets/icons/svgicons/onboardingIcons/thriller.svg';
import ComedyImage from '../../assets/icons/svgicons/onboardingIcons/comedy.svg';
import HorrorImage from '../../assets/icons/svgicons/onboardingIcons/horror.svg';
import RomanceImage from '../../assets/icons/svgicons/onboardingIcons/romance.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Category data with images
const CATEGORIES = [
  {
    id: 'action',
    title: 'Action',
    description: 'Fast reads, high stakes',
    Image: ActionImage,
  },
  {
    id: 'thriller',
    title: 'Thriller',
    description: 'Twists around every corner',
    Image: ThrillerImage,
  },
  {
    id: 'comedy',
    title: 'Comedy',
    description: 'Laughs on every page',
    Image: ComedyImage,
  },
  {
    id: 'horror',
    title: 'Horror',
    description: 'Dark tales, endless chills',
    Image: HorrorImage,
  },
  {
    id: 'romance',
    title: 'Romance',
    description: 'Hearts meet, stories bloom',
    Image: RomanceImage,
  },
];

// Card dimensions
const CARD_WIDTH = moderateScale(278);
const CARD_HEIGHT = moderateScale(418);
const CARD_MARGIN = horizontalScale(8);
const SIDE_CARD_SCALE = 0.85;

// Auto-scroll configuration
const AUTO_SCROLL_INITIAL_DELAY = 1000; // Start auto-scroll after 1 second
const AUTO_SCROLL_INTERVAL = 1700; // Scroll every 1.5 seconds
const USER_INTERACTION_PAUSE = 2000; // Resume auto-scroll 2 seconds after user stops

// Infinite loop configuration
const LOOP_MULTIPLIER = 100; // Create 100 copies for "infinite" illusion
const EXTENDED_CATEGORIES = Array(LOOP_MULTIPLIER)
  .fill(CATEGORIES)
  .flat()
  .map((cat, index) => ({...cat, uniqueId: `${cat.id}_${index}`}));
const INITIAL_INDEX = Math.floor(EXTENDED_CATEGORIES.length / 2) - (Math.floor(EXTENDED_CATEGORIES.length / 2) % CATEGORIES.length);

interface OnboardingScreen1Props {
  // Props can be added as needed
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = () => {
  const {setOnboardingCompleted} = useApp();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Refs for auto-scroll
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(INITIAL_INDEX);

  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen1', {
    screen_category: 'onboarding',
    step: '1',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [OnboardingScreen1] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [OnboardingScreen1] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('OnboardingScreen1', 'OnboardingScreen1');
    logFirebaseEvent('onboarding_screen_viewed', {
      step: 1,
      screen: 'OnboardingScreen1',
      timestamp: Date.now(),
    });
    // Track Facebook onboarding step
    trackOnboardingStep(1, 'categories_carousel');
  }, [logFirebaseEvent]);

  // Calculate the real category index (0-4) from extended index
  const realCategoryIndex = activeIndex % CATEGORIES.length;

  // Keep currentIndexRef in sync with activeIndex
  useEffect(() => {
    currentIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Auto-scroll function - simply increment to next item
  const scrollToNextItem = useCallback(() => {
    if (flatListRef.current) {
      const nextIndex = currentIndexRef.current + 1;
      // Safety check - reset to middle if we somehow get too far
      if (nextIndex >= EXTENDED_CATEGORIES.length - CATEGORIES.length) {
        flatListRef.current.scrollToIndex({
          index: INITIAL_INDEX,
          animated: false,
        });
        currentIndexRef.current = INITIAL_INDEX;
        setActiveIndex(INITIAL_INDEX);
        return;
      }
      flatListRef.current.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  }, []);

  // Start auto-scroll timer
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    autoScrollTimer.current = setInterval(scrollToNextItem, AUTO_SCROLL_INTERVAL);
  }, [scrollToNextItem]);

  // Stop auto-scroll timer
  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  // Handle user interaction start (touch/drag)
  const handleScrollBeginDrag = useCallback(() => {
    setIsUserInteracting(true);
    stopAutoScroll();
    
    // Clear any pending resume timer
    if (userInteractionTimer.current) {
      clearTimeout(userInteractionTimer.current);
    }
  }, [stopAutoScroll]);

  // Handle user interaction end
  const handleScrollEndDrag = useCallback(() => {
    // Resume auto-scroll after user stops interacting
    if (userInteractionTimer.current) {
      clearTimeout(userInteractionTimer.current);
    }
    
    userInteractionTimer.current = setTimeout(() => {
      setIsUserInteracting(false);
      startAutoScroll();
    }, USER_INTERACTION_PAUSE);
  }, [startAutoScroll]);

  // Handle momentum scroll end
  const handleMomentumScrollEnd = useCallback(() => {
    // Additional check to resume auto-scroll after momentum ends
    if (!isUserInteracting) return;
    
    if (userInteractionTimer.current) {
      clearTimeout(userInteractionTimer.current);
    }
    
    userInteractionTimer.current = setTimeout(() => {
      setIsUserInteracting(false);
      startAutoScroll();
    }, USER_INTERACTION_PAUSE);
  }, [isUserInteracting, startAutoScroll]);

  // Initialize auto-scroll on mount
  useEffect(() => {
    // Start auto-scroll after initial delay
    const initialTimer = setTimeout(() => {
      startAutoScroll();
    }, AUTO_SCROLL_INITIAL_DELAY);

    return () => {
      clearTimeout(initialTimer);
      stopAutoScroll();
      if (userInteractionTimer.current) {
        clearTimeout(userInteractionTimer.current);
      }
    };
  }, [startAutoScroll, stopAutoScroll]);

  const handleStartReading = async () => {
    // Log analytics event
    console.log('🟢 [OnboardingScreen1] Start Reading button pressed');
    logFirebaseEvent('onboarding_start_reading_pressed', {
      step: 1,
      selected_category: CATEGORIES[realCategoryIndex].title,
      screen: 'OnboardingScreen1',
    });
    // Track Facebook onboarding completed
    trackOnboardingCompleted(1);
    
    // Mark onboarding as completed first
    await setOnboardingCompleted(true);
    // Then navigate to paywall
    showPaywall('onboarding_start_reading', navigation);
  };

  const handleSkip = async () => {
    // Log analytics event
    console.log('⏭️ [OnboardingScreen1] Skip button pressed');
    logFirebaseEvent('onboarding_skipped', {
      step: 1,
      screen: 'OnboardingScreen1',
    });
    // Track Facebook onboarding completed
    trackOnboardingCompleted(1);
    
    // Mark onboarding as completed first
    await setOnboardingCompleted(true);
    // Then navigate to paywall
    showPaywall('onboarding_skip', navigation);
  };

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      const centerItem = viewableItems.find(
        (item: any) => item.isViewable && item.index !== undefined,
      );
      if (centerItem) {
        setActiveIndex(centerItem.index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = (_data: any, index: number) => ({
    length: CARD_WIDTH + CARD_MARGIN * 2,
    offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
    index,
  });

  const renderCarouselItem = ({item, index}: {item: typeof EXTENDED_CATEGORIES[0]; index: number}) => {
    const isActive = index === activeIndex;
    const ImageComponent = item.Image;

    return (
      <View
        style={[
          styles.carouselItem,
          {
            transform: [{scale: isActive ? 1 : SIDE_CARD_SCALE}],
            opacity: isActive ? 1 : 0.6,
          },
        ]}>
        <View style={styles.cardContainer}>
          <ImageComponent
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            style={styles.cardImage}
          />
        </View>
      </View>
    );
  };

  const currentCategory = CATEGORIES[realCategoryIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.container}>
          {/* App Title */}
          <Text style={styles.appTitle}>MangaVerse</Text>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={EXTENDED_CATEGORIES}
            renderItem={renderCarouselItem}
            initialScrollIndex={INITIAL_INDEX}
            keyExtractor={item => item.uniqueId}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={getItemLayout}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
          />
        </View>

        {/* Category Dots */}
        <View style={styles.dotsContainer}>
          {CATEGORIES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === realCategoryIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Category Info */}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{currentCategory.title}</Text>
          <Text style={styles.categoryDescription}>
            {currentCategory.description}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartReading}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#E60076', '#C27AFF']}
              start={{x: 0.4, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}
              >
              <Text style={styles.startButtonText}>Start reading</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - verticalScale(80),
    // backgroundColor:'red'
  },
  appTitle: {
    fontFamily: FontFamilies.montserratBoldItalic,
    fontSize: moderateScale(32),
    color: Colors.white,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  carouselContainer: {
    height: CARD_HEIGHT + verticalScale(20),
    justifyContent: 'center',
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
  },
  carouselItem: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },
  cardImage: {
    borderRadius: BorderRadius.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(0),
    marginHorizontal: horizontalScale(3),
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: moderateScale(14),
  },
  inactiveDot: {
    backgroundColor:'#2A2A2C',
  },
  categoryInfo: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
    paddingHorizontal: horizontalScale(20),
    // backgroundColor:'red'
  },
  categoryTitle: {
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    fontSize: moderateScale(32),
    color: Colors.text,
    marginBottom: verticalScale(8),
  },
  categoryDescription: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(18),
    color: Colors.inactive,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: horizontalScale(24),
    // marginTop: 'auto',
    marginBottom: verticalScale(20),
  },
  startButton: {
    marginBottom: verticalScale(12),
    
    
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  startButtonText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(18),
    color: Colors.white,
    padding:moderateScale(13)
  },
  skipButton: {
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: moderateScale(16),
    color: Colors.text,
  },
});

export default OnboardingScreen1;
