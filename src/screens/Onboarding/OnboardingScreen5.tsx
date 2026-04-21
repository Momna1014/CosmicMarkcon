/**
 * Onboarding Screen 5
 * Name input screen with gender-based icon
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
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
  moderateScale,
} from '../../theme';
import {hapticLight} from '../../utils/haptics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding5NameInputView} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
const HimImg = require('../../assets/icons/new_onboarding/him.png');
const HerImg = require('../../assets/icons/new_onboarding/her.png');
const NotToSayImg = require('../../assets/icons/new_onboarding/not_to_say.png');

const HORIZONTAL_PADDING = horizontalScale(16);
const ICON_SIZE = horizontalScale(200);

interface OnboardingScreen5Props {
  onNext?: (name: string) => void;
  onGoBack?: () => void;
  gender?: string | null; // Passed from container
}

export const OnboardingScreen5: React.FC<OnboardingScreen5Props> = ({
  onNext,
  onGoBack,
  gender,
}) => {
  const [name, setNameState] = useState('');

  useScreenView('OnboardingScreen5', {
    screen_category: 'onboarding',
    step: 5,
    total_steps: 9,
  });

  const CURRENT_STEP = 4;
  const TOTAL_STEPS = 9;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboarding5NameInputView();
    firebaseService.logScreenView('onboarding_5_name_input', 'OnboardingScreen5');

    const targetProgress = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressWidth.value = withDelay(
      300,
      withTiming(targetProgress, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // Get the appropriate icon based on gender selection
  const getGenderIcon = () => {
    switch (gender) {
      case 'he_him':
        return HimImg;
      case 'she_her':
        return HerImg;
      case 'prefer_not_to_say':
      default:
        return NotToSayImg;
    }
  };

  const handleContinue = () => {
    const trimmedName = name.trim();
    // Pass name to container, don't save to Redux yet (name is optional)
    onNext?.(trimmedName);
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
  };

  return (
    <View style={styles.container}>
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

            <View style={styles.content}>
              {/* Header: Back + Progress Bar + Step Counter */}
              <Animated.View
                entering={FadeIn.delay(100).duration(400)}
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

              {/* Gender Icon - Centered */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(600).springify()}
                style={styles.iconContainer}>
                <Image
                  source={getGenderIcon()}
                  style={styles.genderIcon}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Input Section */}
              <Animated.View
                entering={FadeInUp.delay(400).duration(500).springify()}
                style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type your name here"
                    placeholderTextColor={Colors.newOnboardingSubheading}
                    value={name}
                    onChangeText={setNameState}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <Text style={styles.inputLabel}>
                  How would you like us to call you?
                </Text>
              </Animated.View>

              {/* Spacer to push button to bottom */}
              <View style={styles.spacer} />

              {/* Continue Button */}
              <Animated.View
                entering={FadeIn.delay(400).duration(400)}
                style={styles.bottomSection}>
                <OnboardingButton
                  text="This is my Name"
                  onPress={handleContinue}
                />
              </Animated.View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    marginBottom: verticalScale(24),
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
  // Icon
  iconContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(40),
  },
  genderIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  // Input Section
  inputSection: {
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#090C15',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(22),
    paddingHorizontal: horizontalScale(20),
    borderWidth: 1,
    borderColor: '#262D3D',
    marginBottom: verticalScale(20),
  },
  textInput: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.white,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  inputLabel: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
  },
  // Spacer
  spacer: {
    flex: 1,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen5;
