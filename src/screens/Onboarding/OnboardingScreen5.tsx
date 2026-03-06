/**
 * OnboardingScreen5 - Cosmic Map Reveal Screen
 *
 * Shows sun, moon, and rising sign information
 * with a "Discover my map" button
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  withDelay,
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
import SunIcon from '../../assets/icons/onboarding_icons/sun.svg';
import MoonIcon from '../../assets/icons/onboarding_icons/moon.svg';
import RisingIcon from '../../assets/icons/onboarding_icons/rising.svg';
import {showPaywall} from '../../utils/showPaywall';
import { useNavigation } from '@react-navigation/native';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Background image - same as other onboarding screens
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TwinklingStarProps {
  size: number;
  top: number;
  left: number;
  delay: number;
  intensity: 'low' | 'medium' | 'high';
}

const TwinklingStar: React.FC<TwinklingStarProps> = ({
  size,
  top,
  left,
  delay,
  intensity,
}) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  const opacityRange = {
    low: {min: 0.2, max: 0.5},
    medium: {min: 0.3, max: 0.7},
    high: {min: 0.4, max: 1.0},
  };

  const scaleRange = {
    low: {min: 0.8, max: 1.0},
    medium: {min: 0.7, max: 1.1},
    high: {min: 0.6, max: 1.2},
  };

  const durationRange = {
    low: 3000,
    medium: 2500,
    high: 2000,
  };

  useEffect(() => {
    const range = opacityRange[intensity];
    const scaleR = scaleRange[intensity];
    const duration = durationRange[intensity];

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(range.max, {duration, easing: Easing.inOut(Easing.ease)}),
          withTiming(range.min, {duration, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        true,
      ),
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(scaleR.max, {
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(scaleR.min, {
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          shadowColor: Colors.white,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.8,
          shadowRadius: size,
        },
        animatedStyle,
      ]}
    />
  );
};

interface OnboardingScreen5Props {
  onNext?: () => void;
}

export const OnboardingScreen5: React.FC<OnboardingScreen5Props> = ({
  onNext,
}) => {
  // Progress bar animation
  const progressWidth = useSharedValue(0);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress bar on mount - 50% for screen 5
    progressWidth.value = withDelay(
      300,
      withTiming(50, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
 const navigation = useNavigation();
  const handleNext = () => {
    // Button pulse animation
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
    setTimeout(() => {
      onNext?.();
    }, 150);

        showPaywall('onboarding_start_reading', navigation);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Twinkling stars configuration - same as OnboardingScreen4
  const stars = [
    {size: 6, top: SCREEN_HEIGHT * 0.08, left: SCREEN_WIDTH * 0.15, delay: 0, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.12, left: SCREEN_WIDTH * 0.75, delay: 300, intensity: 'medium' as const},
    {size: 8, top: SCREEN_HEIGHT * 0.05, left: SCREEN_WIDTH * 0.5, delay: 600, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.1, left: SCREEN_WIDTH * 0.9, delay: 150, intensity: 'low' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.15, left: SCREEN_WIDTH * 0.3, delay: 450, intensity: 'medium' as const},
    {size: 7, top: SCREEN_HEIGHT * 0.2, left: SCREEN_WIDTH * 0.85, delay: 200, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.22, left: SCREEN_WIDTH * 0.1, delay: 800, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.25, left: SCREEN_WIDTH * 0.6, delay: 100, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.18, left: SCREEN_WIDTH * 0.45, delay: 550, intensity: 'low' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.32, left: SCREEN_WIDTH * 0.08, delay: 700, intensity: 'medium' as const},
    {size: 8, top: SCREEN_HEIGHT * 0.35, left: SCREEN_WIDTH * 0.92, delay: 50, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.38, left: SCREEN_WIDTH * 0.25, delay: 400, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.33, left: SCREEN_WIDTH * 0.7, delay: 250, intensity: 'high' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.55, left: SCREEN_WIDTH * 0.12, delay: 350, intensity: 'medium' as const},
    {size: 7, top: SCREEN_HEIGHT * 0.58, left: SCREEN_WIDTH * 0.88, delay: 100, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.62, left: SCREEN_WIDTH * 0.55, delay: 650, intensity: 'low' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.65, left: SCREEN_WIDTH * 0.35, delay: 500, intensity: 'medium' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.75, left: SCREEN_WIDTH * 0.2, delay: 300, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.78, left: SCREEN_WIDTH * 0.65, delay: 100, intensity: 'high' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.82, left: SCREEN_WIDTH * 0.9, delay: 550, intensity: 'medium' as const},
    {size: 7, top: SCREEN_HEIGHT * 0.85, left: SCREEN_WIDTH * 0.4, delay: 200, intensity: 'high' as const},
  ];

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImageSource}
        style={styles.container}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          {/* Twinkling Stars Overlay */}
          {stars.map((star, index) => (
            <TwinklingStar
              key={index}
              size={star.size}
              top={star.top}
              left={star.left}
              delay={star.delay}
              intensity={star.intensity}
            />
          ))}

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Progress Bar */}
            <Animated.View
              entering={FadeIn.delay(100).duration(400)}
              style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFilled, progressAnimatedStyle]}
                />
              </View>
            </Animated.View>

            {/* Center Content */}
            <View style={styles.centerSection}>
              {/* Sun Icon */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(600).springify()}
                style={styles.sunIconContainer}>
                <SunIcon width={moderateScale(64)} height={moderateScale(64)} />
              </Animated.View>

              {/* Sub Heading */}
              <Animated.Text
                entering={FadeInDown.delay(300).duration(600).springify()}
                style={styles.subHeading}>
                Most horoscope only read{'\n'}your Sun.
              </Animated.Text>

              {/* Main Heading */}
              <Animated.Text
                entering={FadeInDown.delay(400).duration(600).springify()}
                style={styles.mainHeading}>
                But your reactions are shaped elsewhere.
              </Animated.Text>

              {/* Description */}
              <Animated.Text
                entering={FadeInDown.delay(500).duration(600).springify()}
                style={styles.description}>
                Not everyone is weird to pick up subtle{'\n'}shifts.
              </Animated.Text>

              {/* Icons Row */}
              <Animated.View
                entering={FadeInDown.delay(600).duration(600).springify()}
                style={styles.iconsRow}>
                {/* Moon / Hidden */}
                <View style={styles.iconItem}>
                  <MoonIcon width={40} height={40} />
                  <Text style={styles.iconLabel}>HIDDEN</Text>
                </View>

                {/* Rising */}
                <View style={styles.iconItem}>
                  <RisingIcon width={40} height={40} />
                  <Text style={styles.iconLabel}>RISING</Text>
                </View>
              </Animated.View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <AnimatedTouchable
                style={[styles.nextButton, buttonAnimatedStyle]}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>Discover my map</Text>
              </AnimatedTouchable>
            </View>
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
  star: {
    position: 'absolute',
    backgroundColor: Colors.white,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
  },
  progressBarContainer: {
    // marginBottom: verticalScale(32),
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    width: '50%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunIconContainer: {
    marginBottom: verticalScale(24),
  },
  subHeading: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '700',
    fontSize: fontScale(20),
    lineHeight: fontScale(22),
    color: Colors.subHeading,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(36),
    lineHeight: fontScale(45),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  description: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    color: Colors.subHeading,
    textAlign: 'center',
    marginBottom: verticalScale(32),
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: horizontalScale(48),
  },
  iconItem: {
    alignItems: 'center',
    gap: verticalScale(8),
  },
  iconLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(12),
    color: Colors.subHeading,
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: verticalScale(10),
  },
  nextButton: {
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  nextButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
});

export default OnboardingScreen5;
