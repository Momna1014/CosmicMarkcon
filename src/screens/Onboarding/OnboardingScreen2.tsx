/**
 * Onboarding Screen 2
 * Name input screen with cosmic animations
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
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
import {AlignmentOption} from './OnboardingScreen1';
import ArrowIcon from '../../assets/icons/onboarding_icons/arrow.svg';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding2View,
  trackOnboarding2NameStarted,
  trackOnboarding2NameSubmitted,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const BackgroundImageSource = require('../../assets/icons/onboarding_icons/background_image.png');

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingScreen2Props {
  onNext?: (name: string) => void;
  alignment?: AlignmentOption;
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

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({
  onNext,
  alignment: _alignment,
}) => {
  const {t} = useTranslation();
  const [name, setName] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen2', {
    screen_category: 'onboarding',
    step: 2,
    total_steps: 11,
  });

  // Progress bar animation - start from previous screen's value (9%)
  const progressWidth = useSharedValue(9);

  // Button scale animation
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Track screen view
    trackOnboarding2View();
    
    // Firebase screen view logging
    firebaseService.logScreenView('OnboardingScreen2', 'OnboardingScreen2');
    firebaseService.logEvent('onboarding_2_screen_viewed', {
      step: 2,
      screen_name: 'name_input',
      timestamp: Date.now(),
    });
    
    // Animate progress bar on mount - Screen 2 of 11 (18%)
    progressWidth.value = withDelay(
      300,
      withTiming(18, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = () => {
    if (name.trim()) {
      hapticLight();
      // Track name submission
      trackOnboarding2NameSubmitted(name.trim().length);
      // Subtle pulse animation on button
      buttonScale.value = withSequence(
        withTiming(1.02, {duration: 100}),
        withTiming(1, {duration: 100}),
      );
      // Small delay to let animation play before navigating
      setTimeout(() => {
        onNext?.(name.trim());
      }, 150);
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    // Track when user starts typing (first character)
    if (!hasStartedTyping && text.length > 0) {
      setHasStartedTyping(true);
      trackOnboarding2NameStarted();
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Twinkling stars configuration - same as OnboardingScreen1
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
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
                  {t('onboarding.screen2.heading')}
                </Animated.Text>

                {/* Sub Heading */}
                <Animated.Text
                  entering={FadeInDown.delay(350).duration(600).springify()}
                  style={styles.subHeading}>
                  {t('onboarding.screen2.subheading')}
                </Animated.Text>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Input Section */}
                <Animated.View
                  entering={FadeInUp.delay(500).duration(500).springify()}
                  style={styles.inputSection}>
                  {/* Vibration Text */}
                  <View style={styles.vibrationContainer}>
                    <Text style={styles.vibrationEmoji}>✨</Text>
                    <Text style={styles.vibrationText}>
                      {t('onboarding.screen2.vibration', {name: name || ''})}
                    </Text>
                  </View>

                  {/* Name Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('onboarding.screen2.placeholder')}
                      placeholderTextColor={Colors.subHeading}
                      value={name}
                      onChangeText={handleNameChange}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>
                </Animated.View>

                {/* Bottom Section */}
                <Animated.View
                  entering={FadeInUp.delay(700).duration(500)}
                  style={styles.bottomSection}>
                  {/* Next Button */}
                  <AnimatedTouchable
                    style={[
                      styles.nextButton,
                      !name.trim() && styles.nextButtonDisabled,
                      buttonAnimatedStyle,
                    ]}
                    disabled={!name.trim()}
                    onPress={handleNext}
                    activeOpacity={0.8}>
                    <View style={styles.nextButtonContent}>
                      <Text style={styles.nextButtonText}>{t('onboarding.screen2.button')}</Text>
                      <ArrowIcon
                        width={horizontalScale(24)}
                        height={verticalScale(24)}
                      />
                    </View>
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
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  keyboardAvoidingView: {
    flex: 1,
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
    width: '66%',
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
  inputSection: {
    marginBottom: verticalScale(30),
  },
  vibrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(13),
  },
  vibrationEmoji: {
    fontSize: fontScale(16),
    marginRight: horizontalScale(8),
  },
  vibrationText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    color: Colors.subHeading,
  },
  vibrationName: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    color: Colors.white,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(22),
    paddingHorizontal: horizontalScale(15),
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  textInput: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.white,
    padding: 0,
    margin: 0,
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
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
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

export default OnboardingScreen2;
