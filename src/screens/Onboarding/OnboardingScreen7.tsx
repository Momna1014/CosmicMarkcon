/**
 * OnboardingScreen7 - Eastern Astrology Screen
 *
 * Shows Eastern/Chinese zodiac animal sign based on birth year
 * Combined with Western zodiac for a unique cosmic pattern
 */

import React, {useEffect, useMemo} from 'react';
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
} from '../../theme';
import {
  getZodiacSign,
  getEasternZodiacSign,
  getCombinationPercentage,
} from '../../components/mock/zodiacMockData';
import {OnboardingData} from './OnboardingContainer';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding7View,
  trackOnboarding7Continue,
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

interface OnboardingScreen7Props {
  onNext?: () => void;
  onboardingData: OnboardingData;
}

export const OnboardingScreen7: React.FC<OnboardingScreen7Props> = ({
  onNext,
  onboardingData,
}) => {
  const {t} = useTranslation();

  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen7', {
    screen_category: 'onboarding',
    step: 7,
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
    if (!westernZodiac || !easternZodiac) return 4;
    return getCombinationPercentage(westernZodiac.name, easternZodiac.name);
  }, [westernZodiac, easternZodiac]);

  // Log all onboarding data to console
  useEffect(() => {
    console.log('=== ONBOARDING DATA SUMMARY ===');
    console.log('All User Selections:', {
      alignment: onboardingData.alignment,
      name: onboardingData.name,
      birthday: onboardingData.birthday?.toISOString(),
      birthYear: onboardingData.birthday?.getFullYear(),
      birthMonth: onboardingData.birthday ? onboardingData.birthday.getMonth() + 1 : null,
      birthDay: onboardingData.birthday?.getDate(),
      westernZodiac: westernZodiac?.name,
      westernElement: westernZodiac?.element,
      easternZodiac: easternZodiac?.name,
      easternTrait: easternZodiac?.trait,
      combinationPercentage: `${combinationPercentage}%`,
    });
    console.log('=================================');
  }, [onboardingData, westernZodiac, easternZodiac, combinationPercentage]);

  // Progress bar animation - start from previous screen's value (55%)
  const progressWidth = useSharedValue(55);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Track screen view with zodiac data
    if (westernZodiac && easternZodiac) {
      trackOnboarding7View(
        westernZodiac.name,
        easternZodiac.name,
        combinationPercentage
      );
    }
    
    // Firebase screen view logging
    firebaseService.logScreenView('OnboardingScreen7', 'OnboardingScreen7');
    firebaseService.logEvent('onboarding_7_screen_viewed', {
      step: 7,
      screen_name: 'eastern_astrology',
      western_sign: westernZodiac?.name || 'unknown',
      eastern_sign: easternZodiac?.name || 'unknown',
      combination_percentage: combinationPercentage,
      timestamp: Date.now(),
    });
    
    // Animate progress bar on mount - Screen 7 of 11 (64%)
    progressWidth.value = withDelay(
      300,
      withTiming(64, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = () => {
    hapticLight();
    // Track continue with zodiac data
    if (westernZodiac && easternZodiac) {
      trackOnboarding7Continue(westernZodiac.name, easternZodiac.name);
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

            {/* Main Heading */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.mainHeading}>
              {t('onboarding.screen7.heading')}
            </Animated.Text>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Eastern Zodiac Card */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(600).springify()}
              style={styles.easternCard}>
              <View style={styles.easternCardContent}>
                <View style={styles.easternTextContainer}>
                  <Text style={styles.easternAnimalName}>
                    {t(`zodiac.eastern.${(easternZodiac?.name || 'Dragon').toLowerCase()}.name`)}
                  </Text>
                  <Text style={styles.easternCardTrait}>
                    {t('onboarding.screen7.knownFor', {trait: t(`zodiac.eastern.${(easternZodiac?.name || 'Dragon').toLowerCase()}.trait`)})}
                  </Text>
                </View>
                <View style={styles.symbolCircle}>
                  <Text style={styles.easternAnimalSymbol}>
                    {easternZodiac?.symbol || '🐉'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Combination Card */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(600).springify()}
              style={styles.combinationCard}>
              <Text style={styles.combinationText}>
                {t('onboarding.screen7.combinationPrefix', {
                  western: t(`zodiac.western.${(westernZodiac?.name || 'Gemini').toLowerCase()}`),
                  eastern: t(`zodiac.eastern.${(easternZodiac?.name || 'Dragon').toLowerCase()}.name`)
                })}
              </Text>
              <View style={styles.rarityContainer}>
                <Text style={styles.sparkleEmoji}>✨</Text>
                <Text style={styles.rarityText}>
                  {t('onboarding.screen7.rarityText', {percentage: combinationPercentage})}
                </Text>
              </View>
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(600).duration(500)}
              style={styles.bottomSection}>
              <AnimatedTouchable
                style={[styles.nextButton, buttonAnimatedStyle]}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>{t('onboarding.screen7.button')}</Text>
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
  },
  progressBarBackground: {
    height: verticalScale(8),
    backgroundColor: Colors.progressBarBackground,
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  progressBarFilled: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.progressBarFilled,
    borderRadius: radiusScale(2),
  },
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(36),
    lineHeight: fontScale(43),
    color: Colors.white,
    marginBottom: verticalScale(18),
  },
  spacer: {
    flex: 1,
  },
  easternCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radiusScale(24),
    paddingVertical: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
    borderWidth:1,
    borderColor:Colors.white
  },
  easternCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  easternTextContainer: {
    flex: 1,
  },
  easternAnimalName: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '700',
    fontSize: fontScale(28),
    color: Colors.white,
    marginBottom: verticalScale(6),
  },
  symbolCircle: {
    width: horizontalScale(60),
    height: horizontalScale(60),
    borderRadius: horizontalScale(30),
    backgroundColor: '#b8aa3e7a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(12),
    
  },
  easternAnimalSymbol: {
    fontSize: fontScale(45),
  },
  easternCardTrait: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '600',
    fontSize: fontScale(14),
    color: '#C2D1F3',
  },
  combinationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radiusScale(24),
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(30),
     borderColor:Colors.white,
     borderWidth:1,
  },
  combinationText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    color: Colors.white,
    marginBottom: verticalScale(12),
  },
  highlightText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '800',
    color: '#C2D1F3',
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: horizontalScale(5),
  },
  sparkleEmoji: {
    fontSize: fontScale(18),
  },
  rarityText: {
    flex: 1,
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    lineHeight: fontScale(18),
    color: '#eac805', // Gold/yellow color
  },
  rarityHighlight: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
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

export default OnboardingScreen7;
