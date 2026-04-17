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
    paddingTop: verticalScale(10),
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


// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Svg, {
//   Defs,
//   Path,
//   Stop,
//   LinearGradient,
//   Text as SvgText,
//   Circle,
// } from 'react-native-svg';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from 'react-native-reanimated';

// type ZodiacSign =
//   | 'aries'
//   | 'taurus'
//   | 'gemini'
//   | 'cancer'
//   | 'leo'
//   | 'virgo'
//   | 'libra'
//   | 'scorpio'
//   | 'sagittarius'
//   | 'capricorn'
//   | 'aquarius'
//   | 'pisces';

// type SignItem = {
//   key: ZodiacSign;
//   label: string;
//   glyph: string;
//   startMonth: number;
//   startDay: number;
//   endMonth: number;
//   endDay: number;
// };

// const SIGNS: SignItem[] = [
//   { key: 'aries', label: 'Aries', glyph: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
//   { key: 'taurus', label: 'Taurus', glyph: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
//   { key: 'gemini', label: 'Gemini', glyph: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
//   { key: 'cancer', label: 'Cancer', glyph: '♋', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
//   { key: 'leo', label: 'Leo', glyph: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
//   { key: 'virgo', label: 'Virgo', glyph: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
//   { key: 'libra', label: 'Libra', glyph: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
//   { key: 'scorpio', label: 'Scorpio', glyph: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
//   { key: 'sagittarius', label: 'Sagittarius', glyph: '♐', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
//   { key: 'capricorn', label: 'Capricorn', glyph: '♑', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
//   { key: 'aquarius', label: 'Aquarius', glyph: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
//   { key: 'pisces', label: 'Pisces', glyph: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
// ];

// const SIGN_INDEX: Record<ZodiacSign, number> = {
//   aries: 0,
//   taurus: 1,
//   gemini: 2,
//   cancer: 3,
//   leo: 4,
//   virgo: 5,
//   libra: 6,
//   scorpio: 7,
//   sagittarius: 8,
//   capricorn: 9,
//   aquarius: 10,
//   pisces: 11,
// };

// const WHEEL_SIZE = 320;
// const CENTER = WHEEL_SIZE / 2;
// const OUTER_RADIUS = 150;
// const INNER_RADIUS = 92;
// const GLYPH_RADIUS = 120;
// const SEGMENT_DEG = 30;
// const ART_OFFSET = 0;

// function degToRad(deg: number) {
//   return (deg * Math.PI) / 180;
// }

// function polarToCartesian(
//   cx: number,
//   cy: number,
//   r: number,
//   angleDeg: number,
// ) {
//   const rad = degToRad(angleDeg - 90);
//   return {
//     x: cx + r * Math.cos(rad),
//     y: cy + r * Math.sin(rad),
//   };
// }

// function createDonutSegmentPath(
//   cx: number,
//   cy: number,
//   outerR: number,
//   innerR: number,
//   startAngle: number,
//   endAngle: number,
// ) {
//   const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
//   const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
//   const startInner = polarToCartesian(cx, cy, innerR, startAngle);
//   const endInner = polarToCartesian(cx, cy, innerR, endAngle);
//   const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

//   return [
//     `M ${startOuter.x} ${startOuter.y}`,
//     `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
//     `L ${endInner.x} ${endInner.y}`,
//     `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
//     'Z',
//   ].join(' ');
// }

// function getZodiacSign(date: Date): ZodiacSign {
//   const month = date.getMonth() + 1;
//   const day = date.getDate();

//   if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
//   if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
//   if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
//   if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
//   if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
//   if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
//   if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
//   if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
//   if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
//   if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
//   if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
//   return 'pisces';
// }

// function getTargetRotation(sign: ZodiacSign) {
//   const index = SIGN_INDEX[sign];
//   const signCenterAngle = index * SEGMENT_DEG + SEGMENT_DEG / 2;
//   return -(signCenterAngle - ART_OFFSET);
// }

// function getSignMeta(sign: ZodiacSign) {
//   return SIGNS.find(s => s.key === sign)!;
// }

// function formatRange(sign: SignItem) {
//   const months = [
//     '',
//     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
//   ];

//   return `${sign.startDay} ${months[sign.startMonth]} - ${sign.endDay} ${months[sign.endMonth]}`;
// }

// function toDateString(date: Date) {
//   return date.toISOString().split('T')[0];
// }

// function fromDateString(dateString: string) {
//   const [year, month, day] = dateString.split('-').map(Number);
//   return new Date(year, month - 1, day);
// }

// function ZodiacWheelSvg() {
//   const segments = useMemo(() => {
//     return SIGNS.map((sign, index) => {
//       const start = index * SEGMENT_DEG;
//       const end = start + SEGMENT_DEG;
//       const middle = start + SEGMENT_DEG / 2;

//       const glyphPos = polarToCartesian(CENTER, CENTER, GLYPH_RADIUS, middle);

//       return {
//         sign,
//         start,
//         path: createDonutSegmentPath(
//           CENTER,
//           CENTER,
//           OUTER_RADIUS,
//           INNER_RADIUS,
//           start,
//           end,
//         ),
//         glyphX: glyphPos.x,
//         glyphY: glyphPos.y,
//       };
//     });
//   }, []);

//   return (
//     <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
//       <Defs>
//         <LinearGradient id="segmentGrad" x1="0" y1="0" x2="1" y2="1">
//           <Stop offset="0%" stopColor="#3A4152" />
//           <Stop offset="50%" stopColor="#202635" />
//           <Stop offset="100%" stopColor="#111522" />
//         </LinearGradient>
//         <LinearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
//           <Stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
//           <Stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
//         </LinearGradient>
//       </Defs>

//       <Circle
//         cx={CENTER}
//         cy={CENTER}
//         r={OUTER_RADIUS}
//         fill="none"
//         stroke="rgba(255,255,255,0.10)"
//         strokeWidth={2}
//       />

//       {segments.map((item, index) => (
//         <Path
//           key={item.sign.key}
//           d={item.path}
//           fill="url(#segmentGrad)"
//           opacity={index % 2 === 0 ? 0.95 : 0.82}
//           stroke="rgba(255,255,255,0.04)"
//           strokeWidth={1}
//         />
//       ))}

//       {segments.map(item => {
//         const outer = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, item.start);
//         const inner = polarToCartesian(CENTER, CENTER, INNER_RADIUS, item.start);

//         return (
//           <Path
//             key={`${item.sign.key}-divider`}
//             d={`M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`}
//             stroke="rgba(255,255,255,0.08)"
//             strokeWidth={1}
//           />
//         );
//       })}

//       {segments.map(item => (
//         <SvgText
//           key={`${item.sign.key}-glyph`}
//           x={item.glyphX}
//           y={item.glyphY}
//           fontSize={28}
//           fill="rgba(232,236,255,0.82)"
//           textAnchor="middle"
//           alignmentBaseline="middle"
//         >
//           {item.sign.glyph}
//         </SvgText>
//       ))}

//       <Path
//         d={createDonutSegmentPath(
//           CENTER,
//           CENTER,
//           OUTER_RADIUS + 2,
//           OUTER_RADIUS - 4,
//           0,
//           360,
//         )}
//         fill="url(#rimGrad)"
//         opacity={0.4}
//       />
//     </Svg>
//   );
// }

// export default function HoroscopeWheelWithCalendar() {
//   const [selectedDateString, setSelectedDateString] = useState('2026-04-25');

//   const selectedDate = useMemo(
//     () => fromDateString(selectedDateString),
//     [selectedDateString],
//   );

//   const selectedSign = useMemo(
//     () => getZodiacSign(selectedDate),
//     [selectedDate],
//   );

//   const signMeta = useMemo(
//     () => getSignMeta(selectedSign),
//     [selectedSign],
//   );

//   const rotation = useSharedValue(getTargetRotation(selectedSign));

//   useEffect(() => {
//     rotation.value = withTiming(getTargetRotation(selectedSign), {
//       duration: 650,
//     });
//   }, [selectedSign, rotation]);

//   const wheelAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ rotate: `${rotation.value}deg` }],
//     };
//   });

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.screen}>
//         <Text style={styles.title}>Horoscope Wheel</Text>
//         <Text style={styles.subtitle}>
//           Tap a date below. The wheel rotates to that zodiac sign.
//         </Text>

//         <View style={styles.wheelViewport}>
//           <Animated.View style={[styles.wheelAbsolute, wheelAnimatedStyle]}>
//             <ZodiacWheelSvg />
//           </Animated.View>

//           <View pointerEvents="none" style={styles.pointerWrap}>
//             <View style={styles.pointerTriangle} />
//             <View style={styles.pointerGlow} />
//           </View>
//         </View>

//         <View style={styles.infoCard}>
//           <Text style={styles.signGlyph}>{signMeta.glyph}</Text>
//           <Text style={styles.signName}>{signMeta.label}</Text>
//           <Text style={styles.signRange}>{formatRange(signMeta)}</Text>
//           <Text style={styles.selectedDateText}>
//             Selected date: {selectedDateString}
//           </Text>
//         </View>

//         <View style={styles.calendarWrap}>
//           <Calendar
//             current={selectedDateString}
//             onDayPress={day => {
//               setSelectedDateString(day.dateString);
//             }}
//             markedDates={{
//               [selectedDateString]: {
//                 selected: true,
//                 selectedColor: '#FFFFFF',
//                 selectedTextColor: '#07101F',
//               },
//             }}
//             theme={{
//               backgroundColor: '#081121',
//               calendarBackground: '#081121',
//               textSectionTitleColor: 'rgba(220,228,255,0.7)',
//               selectedDayBackgroundColor: '#FFFFFF',
//               selectedDayTextColor: '#07101F',
//               todayTextColor: '#8FB6FF',
//               dayTextColor: '#F2F5FF',
//               textDisabledColor: 'rgba(255,255,255,0.22)',
//               monthTextColor: '#F2F5FF',
//               arrowColor: '#F2F5FF',
//             }}
//             style={styles.calendar}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#030A1A',
//   },
//   screen: {
//     flex: 1,
//     backgroundColor: '#030A1A',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 10,
//   },
//   title: {
//     color: '#F2F5FF',
//     fontSize: 24,
//     fontWeight: '700',
//     marginTop: 8,
//   },
//   subtitle: {
//     color: 'rgba(220,228,255,0.70)',
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 8,
//     maxWidth: 320,
//     lineHeight: 20,
//   },
//   wheelViewport: {
//     width: 340,
//     height: 210,
//     marginTop: 22,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//   },
//   wheelAbsolute: {
//     width: WHEEL_SIZE,
//     height: WHEEL_SIZE,
//     position: 'absolute',
//     top: 8,
//   },
//   pointerWrap: {
//     position: 'absolute',
//     top: 0,
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   pointerTriangle: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 18,
//     borderRightWidth: 18,
//     borderBottomWidth: 95,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderBottomColor: 'rgba(255,255,255,0.10)',
//   },
//   pointerGlow: {
//     position: 'absolute',
//     top: 0,
//     width: 72,
//     height: 120,
//     backgroundColor: 'rgba(255,255,255,0.03)',
//     borderBottomLeftRadius: 60,
//     borderBottomRightRadius: 60,
//   },
//   infoCard: {
//     width: '100%',
//     maxWidth: 340,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderColor: 'rgba(255,255,255,0.08)',
//     borderWidth: 1,
//     borderRadius: 18,
//     paddingVertical: 18,
//     paddingHorizontal: 16,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   signGlyph: {
//     color: '#F2F5FF',
//     fontSize: 30,
//     marginBottom: 6,
//   },
//   signName: {
//     color: '#F2F5FF',
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   signRange: {
//     color: 'rgba(220,228,255,0.75)',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   selectedDateText: {
//     color: 'rgba(220,228,255,0.92)',
//     fontSize: 14,
//     marginTop: 10,
//   },
//   calendarWrap: {
//     width: '100%',
//     marginTop: 14,
//     borderRadius: 18,
//     overflow: 'hidden',
//   },
//   calendar: {
//     borderRadius: 18,
//     paddingBottom: 8,
//   },
// });