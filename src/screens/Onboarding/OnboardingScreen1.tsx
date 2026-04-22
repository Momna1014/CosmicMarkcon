/**
 * Onboarding Screen 1
 * Welcome screen with Lottie animation
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
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
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding1View,
  trackOnboardingStarted,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {OnboardingButton} from '../../components/OnboardingButton';

const WelcomeAnimation = require('../../assets/lottie/ai_chat_onboarding.json');

const HORIZONTAL_PADDING = horizontalScale(16);
const CURRENT_STEP = 1;
const TOTAL_STEPS = 12;

export type AlignmentOption = 'in-my-flow' | 'figuring-it-out' | 'totally-lost' | null;

interface OnboardingScreen1Props {
  onContinue?: () => void;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onContinue,
}) => {
  useScreenView('OnboardingScreen1', {
    screen_category: 'onboarding',
    step: 1,
    total_steps: 12,
  });

  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboardingStarted();
    trackOnboarding1View();
    firebaseService.logScreenView('onboarding_1_welcome', 'OnboardingScreen1');

    progressWidth.value = withDelay(
      300,
      withTiming((CURRENT_STEP / TOTAL_STEPS) * 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleContinue = () => {
    hapticLight();
    onContinue?.();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.content}>
          {/* Header: Back (hidden on first screen) + Progress Bar + Step Counter */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.header}>
            <View style={styles.backButton} />

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFilled, progressAnimatedStyle]}
                />
              </View>
            </View>

            <Text style={styles.stepCounter}>{CURRENT_STEP}/{TOTAL_STEPS}</Text>
          </Animated.View>

          {/* Main Heading */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.mainHeading}>
            {'Welcome to Your\nCosmic Journey'}
          </Animated.Text>

          {/* Subheading */}
          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            {'Explore astrology, palm reading and\nAI guidance — all in one place.'}
          </Animated.Text>

          {/* Lottie Animation - takes all center space */}
          <Animated.View
            entering={FadeIn.delay(450).duration(600)}
            style={styles.lottieContainer}>
            <LottieView
              source={WelcomeAnimation}
              autoPlay
              loop
              style={styles.lottie}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            entering={FadeIn.delay(500).duration(400)}
            style={styles.bottomSection}>
            <OnboardingButton
              text="Get Started"
              onPress={handleContinue}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    marginBottom: verticalScale(24),
  },
  backButton: {
    width: moderateScale(24),
    marginRight: horizontalScale(12),
  },
  progressBarContainer: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  progressBarBackground: {
    height: verticalScale(6),
    backgroundColor: 'rgba(184, 190, 208, 0.2)',
    borderRadius: radiusScale(6),
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: Colors.newOnboardingProgressFilled,
    borderRadius: radiusScale(6),
  },
  stepCounter: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(14),
    color: Colors.white,
  },
  // Typography
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(32),
    lineHeight: fontScale(36),
    color: Colors.newOnboardingHeading,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subHeading: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  // Lottie
  lottieContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen1;
