/**
 * Onboarding Screen 1
 * Life alignment question screen with cosmic animations
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
import {hapticLight} from '../../utils/haptics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingScreen1Props {
  onContinue?: (alignment: AlignmentOption) => void;
}

export type AlignmentOption = 'in-my-flow' | 'figuring-it-out' | 'totally-lost' | null;

// Twinkling Star Component with sharp sparkle animation
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

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onContinue,
}) => {
  const [selectedOption, setSelectedOption] = useState<AlignmentOption>(null);

  // Progress bar animation
  const progressWidth = useSharedValue(0);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress bar on mount - Screen 1 of 11 (9%)
    progressWidth.value = withDelay(
      300,
      withTiming(9, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleContinue = () => {
    if (selectedOption) {
      hapticLight();
      buttonScale.value = withSequence(
        withTiming(1.02, {duration: 100}),
        withTiming(1, {duration: 100}),
      );
      // Small delay to let animation play before navigating
      setTimeout(() => {
        onContinue?.(selectedOption);
      }, 150);
    }
  };

  const handleOptionSelect = (optionId: AlignmentOption) => {
    setSelectedOption(optionId);
    // Subtle pulse animation on button when option selected
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  const options = [
    {id: 'in-my-flow' as AlignmentOption, label: 'In my flow'},
    {id: 'figuring-it-out' as AlignmentOption, label: 'Figuring it out'},
    {id: 'totally-lost' as AlignmentOption, label: 'Totally Lost'},
  ];

  // Twinkling stars configuration - more stars, various sizes and intensities
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
    
    // Lower region  
    // {size: 6, top: SCREEN_HEIGHT * 0.58, left: SCREEN_WIDTH * 0.05, delay: 200, intensity: 'high' as const},
    // {size: 5, top: SCREEN_HEIGHT * 0.62, left: SCREEN_WIDTH * 0.78, delay: 450, intensity: 'medium' as const},
    // {size: 8, top: SCREEN_HEIGHT * 0.55, left: SCREEN_WIDTH * 0.42, delay: 0, intensity: 'high' as const},
    // {size: 3, top: SCREEN_HEIGHT * 0.6, left: SCREEN_WIDTH * 0.95, delay: 750, intensity: 'low' as const},
    
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
              How aligned do you feel with your life right now?
            </Animated.Text>

            {/* Sub Heading */}
            <Animated.Text
              entering={FadeInDown.delay(350).duration(600).springify()}
              style={styles.subHeading}>
              Be honest - this helps us tune your cosmic reading.
            </Animated.Text>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Options */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <AnimatedTouchable
                  key={option.id}
                  entering={FadeInUp.delay(500 + index * 100)
                    .duration(500)
                    .springify()}
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option.id && styles.optionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </AnimatedTouchable>
              ))}
            </View>

            {/* Bottom Section */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(500)}
              style={styles.bottomSection}>
              {/* Continue Button */}
              <AnimatedTouchable
                style={[
                  styles.continueButton,
                  !selectedOption && styles.continueButtonDisabled,
                  buttonAnimatedStyle,
                ]}
                disabled={!selectedOption}
                onPress={handleContinue}
                activeOpacity={0.8}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </AnimatedTouchable>

              {/* Footer Text */}
              <Text style={styles.footerText}>
                Your answers will shape a{' '}
                <Text style={styles.footerTextHighlight}>
                  unique cosmic snapshot {''}
                </Text>
                   <Text style={styles.footerText}>
                   only for you.
                   </Text>
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
    // backgroundColor:'pink'
    
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
    elevation: 8, // Android glow
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
    width: '33%',
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
  optionsContainer: {
    gap: verticalScale(13),
    marginBottom: verticalScale(30),
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(22),
    paddingHorizontal: horizontalScale(15),
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    borderColor: Colors.white,
  },
  optionText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.subHeading,
  },
  optionTextSelected: {
    color: Colors.white,
  },
  bottomSection: {
    paddingBottom: verticalScale(10),
  },
  continueButton: {
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
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

export default OnboardingScreen1;
