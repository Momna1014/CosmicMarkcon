/**
 * OnboardingScreen9 - Personalized Daily Insights Preview
 *
 * Shows preview of personalized insights with character and floating cards
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BlurView} from '@react-native-community/blur';
import {useDispatch} from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
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
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {saveOnboardingData} from '../../redux/slices/onboardingSlice';
import {getZodiacSign} from '../../components/mock/zodiacMockData';
import type {AppDispatch} from '../../redux/store';
import {OnboardingButton} from '../../components/OnboardingButton';
import {OnboardingData} from './OnboardingContainer';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';

// Character and card images
const CharacterImage = require('../../assets/icons/new_onboarding/character.png');
const InnerGuidanceImage = require('../../assets/icons/new_onboarding/moneymoney.png');
const MoneyCareerImage = require('../../assets/icons/new_onboarding/money.png');
const LoveRomanceImage = require('../../assets/icons/new_onboarding/love&romance.png');

const HORIZONTAL_PADDING = horizontalScale(16);

interface OnboardingScreen9Props {
  onNext?: () => void;
  onGoBack?: () => void;
  onboardingData?: OnboardingData;
}

export const OnboardingScreen9: React.FC<OnboardingScreen9Props> = ({
  onNext,
  onGoBack,
  onboardingData,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  useScreenView('OnboardingScreen9', {
    screen_category: 'onboarding',
    step: 9,
    total_steps: 9,
  });

  const CURRENT_STEP = 9;
  const TOTAL_STEPS = 9;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  // Character bounce animation
  const bounceY = useSharedValue(0);

  useEffect(() => {
    firebaseService.logScreenView('OnboardingScreen9', 'OnboardingScreen9');

    const targetProgress = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressWidth.value = withDelay(
      300,
      withTiming(targetProgress, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );

    // Smooth continuous bounce animation - up and down
    bounceY.value = withRepeat(
      withTiming(12, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: bounceY.value}],
  }));

  const handleContinue = () => {
    hapticLight();
    
    // Save data to Redux when user clicks "Explore Insights"
    if (onboardingData) {
      console.log('\n🎯 [Screen 9] Saving onboarding data to Redux...');
      console.log('📦 Data to save:', onboardingData);
      
      // Prepare data for Redux (only essential fields)
      const zodiacSign = onboardingData.birthday 
        ? getZodiacSign(onboardingData.birthday).name 
        : null;
      
      dispatch(saveOnboardingData({
        gender: onboardingData.gender,
        name: onboardingData.name,
        birthday: onboardingData.birthday ? onboardingData.birthday.toISOString() : null,
        zodiacSign: zodiacSign || undefined,
        city: onboardingData.city,
        country: onboardingData.country,
      }));
      
      console.log('✅ [Screen 9] Data saved to Redux');
    }
    
    onNext?.();
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
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
          {/* Header: Back + Progress Bar + Step Counter */}
          <Animated.View
            entering={FadeIn.delay(350).duration(400)}
            style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <BackArrowIcon width={moderateScale(24)} height={moderateScale(24)} />
            </TouchableOpacity>

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
            entering={FadeInDown.delay(450).duration(500)}
            style={styles.mainHeading}>
            Your Personalized{'\n'}Daily Insights
          </Animated.Text>

          {/* Subheading */}
          <Animated.Text
            entering={FadeInDown.delay(600).duration(500)}
            style={styles.subHeading}>
            Explore tailored guidance. Discover love,{'\n'}career, and personal growth insights.
          </Animated.Text>

          {/* Character Image with Bounce Animation */}
          <View style={styles.characterContainer}>
            <View style={styles.characterImageWrapper}>
              {/* Character with bounce animation */}
              <Animated.View
                entering={FadeIn.delay(50).duration(300)}
                style={[styles.characterAnimated, characterAnimatedStyle]}>
                <Image
                  source={CharacterImage}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Fixed Floating Cards - Positioned on character but don't move */}
              {/* Inner Guidance Card - Top Left */}
              <View style={[styles.floatingCard, styles.card1, styles.cardRotation1]}>
                <Animated.View entering={ZoomIn.delay(1050).duration(400).springify()}>
                <View style={styles.glassCardContainer}>
                  {Platform.OS === 'ios' ? (
                    <BlurView
                      style={styles.glassBlur}
                      blurType="light"
                      blurAmount={20}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.15)"
                    />
                  ) : (
                    <View style={styles.glassBlurAndroid} />
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <Image
                        source={InnerGuidanceImage}
                        style={styles.cardIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardLabel}>Inner &{'\n'}Guidance</Text>
                    </View>
                    <View style={[styles.cardProgressBarContainer, styles.progressRotation1]}>
                      <View style={styles.cardProgressBarBackground}>
                        <View style={[styles.cardProgressBarFill, styles.cardProgress70, styles.cardProgressPink]} />
                      </View>
                    </View>
                  </View>
                </View>
                </Animated.View>
              </View>

              {/* Money & Career Card - Right */}
              <View style={[styles.floatingCard, styles.card2, styles.cardRotation2]}>
                <Animated.View entering={ZoomIn.delay(1200).duration(400).springify()}>
                <View style={styles.glassCardContainer}>
                  {Platform.OS === 'ios' ? (
                    <BlurView
                      style={styles.glassBlur}
                      blurType="light"
                      blurAmount={20}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.15)"
                    />
                  ) : (
                    <View style={styles.glassBlurAndroid} />
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <Image
                        source={MoneyCareerImage}
                        style={styles.cardIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardLabel}>Money &{'\n'}Career</Text>
                    </View>
                    <View style={[styles.cardProgressBarContainer, styles.progressRotation2]}>
                      <View style={styles.cardProgressBarBackground}>
                        <View style={[styles.cardProgressBarFill, styles.cardProgress50, styles.cardProgressBlue]} />
                      </View>
                    </View>
                  </View>
                </View>
                </Animated.View>
              </View>

              {/* Love & Romance Card - Bottom Left */}
              <View style={[styles.floatingCard, styles.card3, styles.cardRotation3]}>
                <Animated.View entering={ZoomIn.delay(1350).duration(400).springify()}>
                <View style={styles.glassCardContainer}>
                  {Platform.OS === 'ios' ? (
                    <BlurView
                      style={styles.glassBlur}
                      blurType="light"
                      blurAmount={20}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.15)"
                    />
                  ) : (
                    <View style={styles.glassBlurAndroid} />
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <Image
                        source={LoveRomanceImage}
                        style={styles.cardIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardLabel}>Love &{'\n'}Romance</Text>
                    </View>
                    <View style={[styles.cardProgressBarContainer, styles.progressRotation3]}>
                      <View style={styles.cardProgressBarBackground}>
                        <View style={[styles.cardProgressBarFill, styles.cardProgress60, styles.cardProgressPink]} />
                      </View>
                    </View>
                  </View>
                </View>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Spacer to push button to bottom */}
          <View style={styles.spacer} />

          {/* Explore Insights Button */}
          <Animated.View
            entering={FadeInUp.delay(850).duration(500)}
            style={styles.bottomSection}>
            <OnboardingButton
              text="Explore Insights"
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
    backgroundColor: Colors.newOnboardingBg,
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
    marginBottom: verticalScale(16),
  },
  backButton: {
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
    fontWeight: '700',
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
  // Character Container
  characterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterImageWrapper: {
    position: 'relative',
    width: horizontalScale(280),
    height: verticalScale(400),
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterAnimated: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  // Floating Cards - Glassmorphism
  floatingCard: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  card1: {
    top: verticalScale(40),
    left: -horizontalScale(30),
  },
  card2: {
    top: verticalScale(160),
    right: -horizontalScale(40),
  },
  card3: {
    bottom: verticalScale(-10),
    left: -horizontalScale(20),
  },
  cardRotation1: {
    transform: [{rotate: '15deg'}],
  },
  cardRotation2: {
    transform: [{rotate: '-5deg'}],
  },
  cardRotation3: {
    transform: [{rotate: '-5deg'}],
  },
  // Glass Card Container
  glassCardContainer: {
    borderRadius: radiusScale(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgb(255, 255, 255)',
    minWidth: horizontalScale(110),
  },
  glassBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassBlurAndroid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(243, 243, 243, 0.5)',
  },
  cardContent: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cardIcon: {
    width: moderateScale(35),
    height: moderateScale(35),
    marginRight: horizontalScale(8),
  },
  cardLabel: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '600',
    fontSize: fontScale(12),
    color: Colors.white,
    lineHeight: fontScale(12),
  },
  cardProgressBarContainer: {
    width: horizontalScale(100),
    // backgroundColor:'red',
    height: verticalScale(10),
  },
  progressRotation1: {
    // transform: [{rotate: '-3deg'}],
  },
  progressRotation2: {
    // transform: [{rotate: '-5deg'}],
  },
  progressRotation3: {
    // transform: [{rotate: '-5deg'}],
  },
  cardProgressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(48, 48, 48, 0.3)',
    borderRadius: radiusScale(10),
    overflow: 'hidden',
  },
  cardProgressBarFill: {
    height: '100%',
    borderRadius: radiusScale(10),
  },
  cardProgress70: {
    width: '70%',
  },
  cardProgress50: {
    width: '50%',
  },
  cardProgress60: {
    width: '60%',
  },
  cardProgressPink: {
    backgroundColor: '#FF968E',
  },
  cardProgressBlue: {
    backgroundColor: '#9DB4FF',
  },
  // Spacer
  spacer: {
    flex: 0,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen9;
