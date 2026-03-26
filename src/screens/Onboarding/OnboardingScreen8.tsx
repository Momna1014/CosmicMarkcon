/**
 * OnboardingScreen8 - Energy Pattern Screen
 *
 * Shows the unique cosmic pattern with rotating circles
 * Dynamic text based on Western + Eastern zodiac combination
 */

import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
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
import {
  getZodiacSign,
  getEasternZodiacSign,
  getCombinationPercentage,
} from '../../components/mock/zodiacMockData';

// Highlight words for each element
const ELEMENT_HIGHLIGHT_WORDS: {[key: string]: string[]} = {
  fire: ['alignment', 'fire', 'intensity', 'bravery', 'radiance'],
  earth: ['grounding', 'roots', 'endurance', 'determination', 'mastery'],
  air: ['innovation', 'freedom', 'insight', 'perspective', 'connection'],
  water: ['depth', 'wisdom', 'perception', 'understanding', 'transcendence'],
};
import {OnboardingData} from './OnboardingContainer';

// SVG Icons
import RoundCircles from '../../assets/icons/onboarding_icons/round_circles.svg';
import GreenDot from '../../assets/icons/onboarding_icons/green_dot.svg';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding8View,
  trackOnboarding8Continue,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

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

interface OnboardingScreen8Props {
  onNext?: () => void;
  onboardingData: OnboardingData;
}

export const OnboardingScreen8: React.FC<OnboardingScreen8Props> = ({
  onNext,
  onboardingData,
}) => {
  const {t} = useTranslation();

  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen8', {
    screen_category: 'onboarding',
    step: 8,
    total_steps: 11,
  });

  // Get Western zodiac sign based on date and month
  const westernZodiac = useMemo(() => {
    if (!onboardingData.birthday) return null;
    return getZodiacSign(onboardingData.birthday);
  }, [onboardingData.birthday]);

  // Get Eastern zodiac sign based on year
  const easternZodiac = useMemo(() => {
    if (!onboardingData.birthday) return null;
    const year = onboardingData.birthday.getFullYear();
    return getEasternZodiacSign(year);
  }, [onboardingData.birthday]);

  // Get combination percentage
  const combinationPercentage = useMemo(() => {
    if (!westernZodiac || !easternZodiac) return 18;
    return getCombinationPercentage(westernZodiac.name, easternZodiac.name);
  }, [westernZodiac, easternZodiac]);

  // Get combination energy text with translations
  const energyText = useMemo(() => {
    const element = (westernZodiac?.element || 'Fire').toLowerCase();
    const easternName = easternZodiac?.name || 'Dragon';
    const textIndex = (easternName.length % 5) + 1; // 1-5 index for text1-text5
    const highlightWords = ELEMENT_HIGHLIGHT_WORDS[element] || ELEMENT_HIGHLIGHT_WORDS.fire;
    const highlightKey = highlightWords[textIndex - 1];
    
    return {
      mainText: t(`zodiac.energy.${element}.text${textIndex}`),
      highlightWord: t(`zodiac.energy.${element}.${highlightKey}`),
    };
  }, [westernZodiac, easternZodiac, t]);

  // Progress bar animation - start from previous screen's value (64%)
  const progressWidth = useSharedValue(64);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  // Rotating circles animation
  const circleRotation = useSharedValue(0);

  // Green dot scale animation (zoom in/out)
  const greenDotScale = useSharedValue(1);

  useEffect(() => {
    // Track screen view with element
    if (westernZodiac) {
      trackOnboarding8View(westernZodiac.element);
    }
    
    // Firebase screen view logging
    firebaseService.logScreenView('OnboardingScreen8', 'OnboardingScreen8');
    firebaseService.logEvent('onboarding_8_screen_viewed', {
      step: 8,
      screen_name: 'energy_pattern',
      element: westernZodiac?.element || 'unknown',
      timestamp: Date.now(),
    });
    
    // Animate progress bar on mount - Screen 8 of 11 (73%)
    progressWidth.value = withDelay(
      300,
      withTiming(73, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );

    // Continuous rotation for circles
    circleRotation.value = withRepeat(
      withTiming(360, {duration: 20000, easing: Easing.linear}),
      -1,
      false,
    );

    // Zoom in/out animation for green dot
    greenDotScale.value = withRepeat(
      withSequence(
        withTiming(1.3, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${circleRotation.value}deg`}],
  }));

  const greenDotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: greenDotScale.value}],
  }));

  const handleNext = () => {
    hapticLight();
    // Track continue with element
    if (westernZodiac) {
      trackOnboarding8Continue(westernZodiac.element);
    }
    // Button pulse animation
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
    setTimeout(() => {
      onNext?.();
    }, 150);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Twinkling stars configuration - same as other onboarding screens
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
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
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

            {/* Center Section with Circles Background and Text */}
            <View style={styles.centerSection}>
              {/* Rotating Circles as Background */}
              <Animated.View style={[styles.circlesBackground, circleAnimatedStyle]}>
                <RoundCircles width={280} height={280} />
              </Animated.View>

              {/* Text Content Overlayed on Circles */}
              <View style={styles.textOverlay}>
                <Animated.Text
                  entering={FadeInDown.delay(400).duration(600).springify()}
                  style={styles.mainHeading}>
                  {energyText.mainText}
                </Animated.Text>

                <Animated.Text
                  entering={FadeInDown.delay(550).duration(600).springify()}
                  style={styles.subHeading}>
                  {t('onboarding.screen8.energySource', {alignment: energyText.highlightWord})}
                </Animated.Text>

                {/* Pattern Badge */}
                <Animated.View
                  entering={FadeInUp.delay(700).duration(500)}
                  style={styles.patternBadge}>
                  <Animated.View style={[styles.greenDotContainer, greenDotAnimatedStyle]}>
                    <GreenDot width={moderateScale(20)} height={moderateScale(20)} />
                  </Animated.View>
                  <Text style={styles.patternText}>
                    {t('onboarding.screen8.rarityText', {percentage: combinationPercentage})}
                  </Text>
                </Animated.View>
              </View>
            </View>

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.bottomSection}>
              <AnimatedTouchable
                style={[styles.nextButton, buttonAnimatedStyle]}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>{t('onboarding.screen8.button')}</Text>
              </AnimatedTouchable>
            </Animated.View>
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
    paddingTop: verticalScale(10),
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlesBackground: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOverlay: {
    alignItems: 'center',
    // paddingHorizontal: horizontalScale(20),
  },
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(32),
    lineHeight: fontScale(40),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    // backgroundColor:'red'
  },
  subHeading: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: '#C2D1F3',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  highlightText: {
    color: Colors.white,
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radiusScale(30),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    gap: horizontalScale(3),
    borderWidth:1,
    borderColor:Colors.white
  },
  greenDotContainer: {
    width: moderateScale(20),
    height: moderateScale(20),
    // backgroundColor:'red'
  },
  patternText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '600',
    fontSize: fontScale(13),
    color: '#C2D1F3',
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

export default OnboardingScreen8;
