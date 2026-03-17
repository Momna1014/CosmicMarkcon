/**
 * OnboardingScreen10 - Loading & Alignment Result Screen
 *
 * Shows loading animation with progress bar while "aligning planetary ephemeris"
 * Then reveals the alignment result with call-to-action
 * 
 * IMPORTANT: This screen saves all onboarding data to Redux when loading completes
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {OnboardingData} from './OnboardingContainer';
import {saveOnboardingData} from '../../redux/slices/onboardingSlice';
import {AppDispatch} from '../../redux/store';

// SVG Icons
import LeafIcon from '../../assets/icons/onboarding_icons/leaf.svg';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding10View,
  trackOnboarding10LoadingComplete,
  trackOnboarding10Continue,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Background image - same as other onboarding screens
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingScreen10Props {
  onComplete?: () => void;
  onboardingData: OnboardingData;
}

export const OnboardingScreen10: React.FC<OnboardingScreen10Props> = ({
  onComplete,
  onboardingData,
}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen10', {
    screen_category: 'onboarding',
    step: 10,
    total_steps: 11,
  });

  // State
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Animation values
  const progressWidth = useSharedValue(0);
  const topProgressWidth = useSharedValue(82); // Start from previous screen's value
  const buttonScale = useSharedValue(1);
  const leafRotation = useSharedValue(0);
  const leafScale = useSharedValue(1);

  // Update progress percentage for display
  const updateProgress = useCallback((value: number) => {
    setProgressPercent(Math.round(value));
  }, []);

  // Mark loading as complete and save data to Redux
  const onLoadingComplete = useCallback(() => {
    console.log('\n========================================');
    console.log('🔄 [Screen 10] Loading Complete!');
    console.log('========================================');
    console.log('📦 Received onboardingData:', JSON.stringify(onboardingData, null, 2));
    
    // Save all onboarding data to Redux
    // Convert Date to ISO string to avoid non-serializable warning
    console.log('\n💾 Saving onboarding data to Redux...');
    dispatch(saveOnboardingData({
      alignment: onboardingData.alignment,
      name: onboardingData.name,
      birthday: onboardingData.birthday ? onboardingData.birthday.toISOString() : null,
      birthTime: onboardingData.birthTime,
      city: onboardingData.city,
      country: onboardingData.country,
      zodiacSign: onboardingData.zodiacSign || undefined,
    }));
    
    setIsLoadingComplete(true);
    // Track loading complete
    trackOnboarding10LoadingComplete();
    // Animate top progress bar to 91% when result shows - Screen 10 of 11
    topProgressWidth.value = withTiming(91, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [topProgressWidth, dispatch, onboardingData]);

  useEffect(() => {
    // Log the data received from previous screens
    console.log('\n🟢 [Screen 10] MOUNTED - Received Onboarding Data:');
    console.log('   - Alignment:', onboardingData.alignment);
    console.log('   - Name:', onboardingData.name);
    console.log('   - Birthday:', onboardingData.birthday?.toISOString());
    console.log('   - Zodiac Sign:', onboardingData.zodiacSign);
    console.log('   - Birth Time:', onboardingData.birthTime);
    console.log('   - City:', onboardingData.city);
    console.log('   - Country:', onboardingData.country);
    
    // Track screen view (loading started)
    trackOnboarding10View();
    
    // Firebase screen view logging
    firebaseService.logScreenView('OnboardingScreen10', 'OnboardingScreen10');
    firebaseService.logEvent('onboarding_10_screen_viewed', {
      step: 10,
      screen_name: 'alignment_result',
      timestamp: Date.now(),
    });
    firebaseService.logEvent('onboarding_10_loading_started', {
      step: 10,
      timestamp: Date.now(),
    });
    
    // Animate leaf with subtle pulse
    leafScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );

    // Animate progress bar from 0 to 100%
    const duration = 3500; // 3.5 seconds for full progress
    const steps = 100;
    const interval = duration / steps;

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;

      if (currentStep <= steps) {
        // Update displayed percentage
        runOnJS(updateProgress)(progress);

        // Update progress bar width
        progressWidth.value = withTiming(progress, {
          duration: interval,
          easing: Easing.linear,
        });
      }

      if (currentStep >= steps) {
        clearInterval(progressInterval);
        // Delay before showing result screen
        setTimeout(() => {
          runOnJS(onLoadingComplete)();
        }, 500);
      }
    }, interval);

    return () => {
      clearInterval(progressInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const topProgressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${topProgressWidth.value}%`,
  }));

  const leafAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: leafScale.value}, {rotate: `${leafRotation.value}deg`}],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  const handleContinue = useCallback(() => {
    hapticLight();
    // Track continue button click
    trackOnboarding10Continue();
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );

    setTimeout(() => {
      onComplete?.();
    }, 150);
  }, [onComplete, buttonScale]);

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {/* Leaf Icon with animation */}
      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        style={[styles.leafContainer, leafAnimatedStyle]}>
        <LeafIcon width={moderateScale(150)} height={moderateScale(150)} />
      </Animated.View>

      {/* Loading Text */}
      <Animated.Text
        entering={FadeIn.delay(400).duration(500)}
        style={styles.loadingText}>
        {t('onboarding.screen10.loading')}
      </Animated.Text>

      {/* Progress Bar */}
      <Animated.View
        entering={FadeIn.delay(600).duration(500)}
        style={styles.progressContainer}>
        {/* AI Label */}
        <Text style={styles.aiLabel}>AI</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[styles.progressBarFilled, progressAnimatedStyle]}
            />
          </View>
        </View>

        {/* Percentage */}
        <Text style={styles.percentageText}>{progressPercent}%</Text>
      </Animated.View>
    </View>
  );

  // Render result state
  const renderResultState = () => (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={styles.resultContainer}>
      {/* Progress Bar at Top */}
      <Animated.View
        entering={FadeIn.delay(100).duration(400)}
        style={styles.topProgressBarContainer}>
        <View style={styles.topProgressBarBackground}>
          <Animated.View
            style={[styles.topProgressBarFilled, topProgressAnimatedStyle]}
          />
        </View>
      </Animated.View>

      {/* Center Content */}
      <View style={styles.resultCenterContent}>
        {/* Main Result Text */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600).springify()}
          style={styles.resultTextContainer}>
          <Text style={styles.resultMainText}>
            {t('onboarding.screen10.resultHeading')}
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(600).springify()}
          style={styles.resultSubtitle}>
          {t('onboarding.screen10.resultSubheading')}
        </Animated.Text>
      </View>

      {/* CTA Button */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={styles.bottomSection}>
        <AnimatedTouchable
          style={[styles.ctaButton, buttonAnimatedStyle]}
          onPress={handleContinue}
          activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>{t('onboarding.screen10.button')}</Text>
        </AnimatedTouchable>
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImageSource}
        style={styles.container}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {!isLoadingComplete ? renderLoadingState() : renderResultState()}
             {/* {renderLoadingState()} */}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.cosmicBackground,
  },
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafContainer: {
    // marginBottom: verticalScale(40),
  },
  loadingText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(32),
    color: '#C2D1F3',
    marginBottom: verticalScale(35),
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: horizontalScale(20),
  },
  aiLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(14),
    color: Colors.white,
    marginRight: horizontalScale(12),
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#6287FF',
    borderRadius: radiusScale(8),
  },
  percentageText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(14),
    color: Colors.white,
    marginLeft: horizontalScale(12),
    minWidth: horizontalScale(40),
    textAlign: 'right',
  },

  // Result State Styles
  resultContainer: {
    flex: 1,
  },
  topProgressBarContainer: {
    marginBottom: verticalScale(24),
  },
  topProgressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  topProgressBarFilled: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  resultCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:'red'
  },
  resultTextContainer: {
    marginBottom: verticalScale(16),
  },
  resultMainText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(33),
    lineHeight: fontScale(46),
    color: Colors.white,
    textAlign: 'center',
    // backgroundColor:'pink'
  },
  resultHighlight: {
    color: '#FFEF00',
  },
  resultSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: '#C2D1F3',
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: verticalScale(10),
  },
  ctaButton: {
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  ctaButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
});

export default OnboardingScreen10;
