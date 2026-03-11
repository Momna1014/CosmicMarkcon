/**
 * OnboardingScreen6 - Cosmic Layers Analysis Screen
 *
 * Shows three unlock cards with cosmic layers
 * and a "Deepen my analysis" button
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
import UnlockAnalysisIcon from '../../assets/icons/onboarding_icons/unlock_analysis.svg';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding6View,
  trackOnboarding6DeepenAnalysisClicked,
} from '../../utils/onboardingAnalytics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Background image - same as other onboarding screens
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Card background images
const Card1Background = require('../../assets/icons/onboarding_icons/1st analysis.png');
const Card2Background = require('../../assets/icons/onboarding_icons/2nd_analysis.png');
const Card3Background = require('../../assets/icons/onboarding_icons/3rd_analysis.png');

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

interface OnboardingScreen6Props {
  onNext?: () => void;
}

export const OnboardingScreen6: React.FC<OnboardingScreen6Props> = ({
  onNext,
}) => {
  const {t} = useTranslation();

  // Progress bar animation - start from previous screen's value (45%)
  const progressWidth = useSharedValue(45);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Track screen view
    trackOnboarding6View();
    
    // Animate progress bar on mount - Screen 6 of 11 (55%)
    progressWidth.value = withDelay(
      300,
      withTiming(55, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = () => {
    hapticLight();
    // Track deepen analysis clicked
    trackOnboarding6DeepenAnalysisClicked();
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

  // Unlock cards data with background images
  const unlockCards = [
    {id: 1, delay: 500, bgImage: Card1Background},
    {id: 2, delay: 600, bgImage: Card2Background},
    {id: 3, delay: 700, bgImage: Card3Background},
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

            {/* Main Heading - at top like OnboardingScreen1 */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.mainHeading}>
              {t('onboarding.screen6.heading')}
            </Animated.Text>

            {/* Sub Heading - just below heading like OnboardingScreen1 */}
            <Animated.Text
              entering={FadeInDown.delay(350).duration(600).springify()}
              style={styles.subHeading}>
              {t('onboarding.screen6.subheading')}
            </Animated.Text>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Unlock Cards */}
            <View style={styles.cardsContainer}>
              {unlockCards.map((card) => (
                <Animated.View
                  key={card.id}
                  entering={FadeInUp.delay(card.delay).duration(500).springify()}
                  style={styles.unlockCardWrapper}>
                  <ImageBackground
                    source={card.bgImage}
                    style={styles.unlockCard}
                    imageStyle={styles.cardImageStyle}
                    resizeMode="cover">
                    {/* Centered Content */}
                    <View style={styles.cardContent}>
                      <UnlockAnalysisIcon width={52} height={52} />
                      <Text style={styles.unlockCardText}>{t('onboarding.screen6.buttonUnlock')}</Text>
                    </View>
                  </ImageBackground>
                </Animated.View>
              ))}
            </View>

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.bottomSection}>
              <AnimatedTouchable
                style={[styles.nextButton, buttonAnimatedStyle]}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>{t('onboarding.screen6.buttonDeepen')}</Text>
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
    width: '60%',
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
  subHeading: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    lineHeight: fontScale(16),
    color: Colors.subHeading,
  },
  spacer: {
    flex: 1,
  },
  cardsContainer: {
    width: '100%',
    gap: verticalScale(12),
    marginBottom: verticalScale(50),
  },
  unlockCardWrapper: {
    borderRadius: radiusScale(8),
    overflow: 'hidden',
  },
  unlockCard: {
    paddingVertical: verticalScale(10),
    // paddingHorizontal: horizontalScale(16),
  },
  cardImageStyle: {
    borderRadius: radiusScale(8),
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(3),
  },
  unlockCardText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.white,
    opacity: 0.9,
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

export default OnboardingScreen6;
