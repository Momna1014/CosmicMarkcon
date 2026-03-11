/**
 * OnboardingScreen4 - Cosmic Insight Screen
 *
 * Displays typewriter animation with zodiac-specific insight
 * and static subtext with haptic feedback during typing
 */

import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
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
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';
import {getZodiacSign} from '../../components/mock/zodiacMockData';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Background image - same as other onboarding screens
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Map zodiac signs to translation keys
const ZODIAC_KEYS: Record<string, string> = {
  'Capricorn': 'capricorn',
  'Aquarius': 'aquarius',
  'Pisces': 'pisces',
  'Aries': 'aries',
  'Taurus': 'taurus',
  'Gemini': 'gemini',
  'Cancer': 'cancer',
  'Leo': 'leo',
  'Virgo': 'virgo',
  'Libra': 'libra',
  'Scorpio': 'scorpio',
  'Sagittarius': 'sagittarius',
};

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

interface OnboardingScreen4Props {
  onNext?: () => void;
  birthday: Date;
}

export const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({
  onNext,
  birthday,
}) => {
  const {t} = useTranslation();

  // Get zodiac sign based on birthday
  const zodiac = useMemo(() => getZodiacSign(birthday), [birthday]);
  
  // Get random insight number (1-5) and translated insight text
  const insightNumber = useMemo(() => Math.floor(Math.random() * 5) + 1, []);
  const zodiacKey = ZODIAC_KEYS[zodiac] || 'aries';
  const insightText = t(`zodiac.insights.${zodiacKey}.insight${insightNumber}`);
  const subtextText = t('onboarding.screen4.subtext');

  // Typewriter state
  const [displayedMainText, setDisplayedMainText] = useState('');
  const [displayedSubText, setDisplayedSubText] = useState('');
  const [isMainTextComplete, setIsMainTextComplete] = useState(false);
  const [isSubTextComplete, setIsSubTextComplete] = useState(false);

  // Progress bar animation - start from previous screen's value (27%)
  const progressWidth = useSharedValue(27);

  // Cursor animation
  const cursorOpacity = useSharedValue(1);

  // Animate progress bar on mount - Screen 4 of 11 (36%)
  useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withTiming(36, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Cursor blink animation
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 500}),
        withTiming(1, {duration: 500}),
      ),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main text typewriter effect
  useEffect(() => {
    if (!insightText) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < insightText.length) {
        setDisplayedMainText(insightText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsMainTextComplete(true);
      }
    }, 50); // 50ms per character for smooth typing

    return () => clearInterval(typingInterval);
  }, [insightText]);

  // Subtext typewriter effect (starts after main text completes)
  useEffect(() => {
    if (!isMainTextComplete) return;

    // Small delay before starting subtext
    const startDelay = setTimeout(() => {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < subtextText.length) {
          setDisplayedSubText(subtextText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsSubTextComplete(true);
        }
      }, 40); // Slightly faster for subtext

      return () => clearInterval(typingInterval);
    }, 500); // 500ms delay after main text

    return () => clearTimeout(startDelay);
  }, [isMainTextComplete, subtextText]);

  // Auto-navigate after both texts complete
  useEffect(() => {
    if (isSubTextComplete && onNext) {
      const navigateTimeout = setTimeout(() => {
        onNext();
      }, 2000); // 2 seconds after completion

      return () => clearTimeout(navigateTimeout);
    }
  }, [isSubTextComplete, onNext]);

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Twinkling stars configuration
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

            {/* Centered Text Section */}
            <View style={styles.centerSection}>
              <View style={styles.textContainer}>
                {/* Main Insight Text with Typewriter Effect */}
                <Animated.View
                  entering={FadeIn.delay(200).duration(400)}
                  style={styles.mainTextContainer}>
                  <Text style={styles.mainText}>
                    {displayedMainText}
                    {!isMainTextComplete && (
                      <Animated.Text style={[styles.cursor, cursorAnimatedStyle]}>
                        |
                      </Animated.Text>
                    )}
                  </Text>
                </Animated.View>

                {/* Static Subtext with Typewriter Effect */}
                {isMainTextComplete && (
                  <Animated.View
                    entering={FadeIn.duration(300)}
                    style={styles.subTextContainer}>
                    <Text style={styles.subText}>
                      {displayedSubText}
                      {!isSubTextComplete && (
                        <Animated.Text style={[styles.cursor, styles.subCursor, cursorAnimatedStyle]}>
                          |
                        </Animated.Text>
                      )}
                    </Text>
                  </Animated.View>
                )}
              </View>
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
    marginBottom: verticalScale(32),
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    width: '25%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: horizontalScale(8),
  },
  mainTextContainer: {
    marginBottom: verticalScale(16),
  },
  mainText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(28),
    lineHeight: fontScale(36),
    color: Colors.white,
    textAlign: 'center',
  },
  cursor: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(28),
    color: Colors.white,
  },
  subTextContainer: {
    marginTop: verticalScale(8),
  },
  subText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(24),
    color: Colors.subHeading,
    textAlign: 'center',
  },
  subCursor: {
    fontSize: fontScale(16),
    color: Colors.subHeading,
  },
});

export default OnboardingScreen4;
