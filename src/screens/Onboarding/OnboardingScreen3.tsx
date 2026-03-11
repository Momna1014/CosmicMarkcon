/**
 * Onboarding Screen 3
 * Birthday input with zodiac card display
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';
import {DatePicker} from '../../components/DatePicker';
import {ZodiacCard} from '../../components/ZodiacCard';
import {hapticLight} from '../../utils/haptics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingScreen3Props {
  onNext?: (birthday: Date) => void;
  name?: string;
}

// Twinkling Star Component with smooth glow animation
const TwinklingStar: React.FC<{
  size: number;
  top: number;
  left: number;
  delay: number;
  intensity?: 'low' | 'medium' | 'high';
}> = ({size, top, left, delay, intensity = 'medium'}) => {
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

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({
  onNext,
  name: _name,
}) => {
  const [birthday, setBirthday] = useState<Date | null>(null);

  // Progress bar animation - start from previous screen's value (18%)
  const progressWidth = useSharedValue(18);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress bar on mount - Screen 3 of 11 (27%)
    progressWidth.value = withDelay(
      300,
      withTiming(27, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = () => {
    if (birthday) {
      hapticLight();
      // Subtle pulse animation on button
      buttonScale.value = withSequence(
        withTiming(1.02, {duration: 100}),
        withTiming(1, {duration: 100}),
      );
      // Small delay to let animation play before navigating
      setTimeout(() => {
        onNext?.(birthday);
      }, 150);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Calculate max date (December 31, 2016)
  const maxDate = new Date(2016, 11, 31); // Month is 0-indexed, so 11 = December

  // Calculate min date (oldest possible age ~120 years)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  // Twinkling stars configuration - same as other screens
  const stars = [
    // Top region - scattered bright stars
    {size: 6, top: SCREEN_HEIGHT * 0.08, left: SCREEN_WIDTH * 0.15, delay: 0, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.12, left: SCREEN_WIDTH * 0.75, delay: 300, intensity: 'medium' as const},
    {size: 8, top: SCREEN_HEIGHT * 0.05, left: SCREEN_WIDTH * 0.5, delay: 600, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.1, left: SCREEN_WIDTH * 0.9, delay: 150, intensity: 'low' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.15, left: SCREEN_WIDTH * 0.3, delay: 450, intensity: 'medium' as const},
    
    // Upper-middle region
    {size: 7, top: SCREEN_HEIGHT * 0.2, left: SCREEN_WIDTH * 0.85, delay: 200, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.22, left: SCREEN_WIDTH * 0.1, delay: 800, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.25, left: SCREEN_WIDTH * 0.6, delay: 100, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.18, left: SCREEN_WIDTH * 0.45, delay: 550, intensity: 'low' as const},
    
    // Middle region
    {size: 5, top: SCREEN_HEIGHT * 0.32, left: SCREEN_WIDTH * 0.08, delay: 700, intensity: 'medium' as const},
    {size: 8, top: SCREEN_HEIGHT * 0.35, left: SCREEN_WIDTH * 0.92, delay: 50, intensity: 'high' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.38, left: SCREEN_WIDTH * 0.25, delay: 400, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.33, left: SCREEN_WIDTH * 0.7, delay: 250, intensity: 'high' as const},
    
    // Lower-middle region
    {size: 5, top: SCREEN_HEIGHT * 0.45, left: SCREEN_WIDTH * 0.12, delay: 350, intensity: 'medium' as const},
    {size: 7, top: SCREEN_HEIGHT * 0.48, left: SCREEN_WIDTH * 0.88, delay: 100, intensity: 'high' as const},
    {size: 3, top: SCREEN_HEIGHT * 0.42, left: SCREEN_WIDTH * 0.55, delay: 650, intensity: 'low' as const},
    {size: 4, top: SCREEN_HEIGHT * 0.5, left: SCREEN_WIDTH * 0.35, delay: 500, intensity: 'medium' as const},
    
    // Bottom region
    {size: 4, top: SCREEN_HEIGHT * 0.7, left: SCREEN_WIDTH * 0.2, delay: 300, intensity: 'medium' as const},
    {size: 6, top: SCREEN_HEIGHT * 0.72, left: SCREEN_WIDTH * 0.65, delay: 100, intensity: 'high' as const},
    {size: 5, top: SCREEN_HEIGHT * 0.75, left: SCREEN_WIDTH * 0.9, delay: 550, intensity: 'medium' as const},
    {size: 7, top: SCREEN_HEIGHT * 0.68, left: SCREEN_WIDTH * 0.4, delay: 200, intensity: 'high' as const},
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
              When were you born?
            </Animated.Text>

            {/* Sub Heading */}
            <Animated.Text
              entering={FadeInDown.delay(350).duration(600).springify()}
              style={styles.subHeading}>
              Your birth date reveals your cosmic blueprint.
            </Animated.Text>

            {/* Center Section - Zodiac Card (when date selected) */}
            <View style={styles.centerSection}>
              {birthday && (
                <View style={styles.zodiacSection}>
                  <ZodiacCard birthday={birthday} />
                </View>
              )}
            </View>

            {/* Date Input Section */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(500).springify()}
              style={styles.inputSection}>
              <DatePicker
                value={birthday}
                onChange={setBirthday}
                minimumDate={minDate}
                maximumDate={maxDate}
              />
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(700).duration(500)}
              style={styles.bottomSection}>
              {/* Next Button */}
              <AnimatedTouchable
                style={[
                  styles.nextButton,
                  !birthday && styles.nextButtonDisabled,
                  buttonAnimatedStyle,
                ]}
                disabled={!birthday}
                onPress={handleNext}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                  {birthday ? 'Analyze my pattern' : 'Continue'}
                </Text>
              </AnimatedTouchable>

              {/* Footer Text */}
              <Text style={styles.footerText}>
                Your answers will shape a{' '}
                <Text style={styles.footerTextHighlight}>
                  unique cosmic snapshot{' '}
                </Text>
                <Text style={styles.footerText}>only for you.</Text>
              </Text>
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
    width: '100%',
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
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacSection: {
    width: '100%',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: verticalScale(20),
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
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
  footerText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(13),
    color: Colors.subHeading,
    textAlign: 'center',
    lineHeight: fontScale(18),
  },
  footerTextHighlight: {
    color: Colors.white,
  },
});

export default OnboardingScreen3;
