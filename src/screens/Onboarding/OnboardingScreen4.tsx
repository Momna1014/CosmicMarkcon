/**
 * Onboarding Screen 4
 * "How do you identify yourself?" - Gender selection
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
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
import {trackOnboarding4GenderView} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
const HimImg = require('../../assets/icons/new_onboarding/him.png');
const HerImg = require('../../assets/icons/new_onboarding/her.png');
const NotToSayImg = require('../../assets/icons/new_onboarding/prefer_not_to_say.png');

const HORIZONTAL_PADDING = horizontalScale(16);
const ICON_SIZE = horizontalScale(120);

interface OnboardingScreen4Props {
  onNext?: (gender: string | null) => void;
  onGoBack?: () => void;
  gender?: string | null;
}

const GENDER_OPTIONS = [
  {id: 'he_him', label: 'He / Him', image: HimImg},
  {id: 'she_her', label: 'She / Her', image: HerImg},
  {id: 'prefer_not_to_say', label: 'prefer not to say', image: NotToSayImg},
];

// Gender Option Component
interface GenderOptionProps {
  option: {id: string; label: string; image?: ReturnType<typeof require>};
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}

const GenderOption: React.FC<GenderOptionProps> = ({
  option,
  isSelected,
  onPress,
  delay,
}) => {
  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400).springify()}
      style={styles.optionWrapper}>
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}>
        {option.image && (
          <Image
            source={option.image}
            style={{width: ICON_SIZE, height: ICON_SIZE}}
            resizeMode="contain"
          />
        )}
        <Text
          style={[
            styles.optionLabel,
            isSelected && styles.optionLabelSelected,
          ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({
  onNext,
  onGoBack,
  gender,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(gender || null);

  const CURRENT_STEP = 4;
  const TOTAL_STEPS = 12;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboarding4GenderView();

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

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(prev => (prev === optionId ? null : optionId));
  };

  const handleContinue = () => {
    // Pass selection to container (can be null if user doesn't select)
    // Default to null if no selection - gender is optional
    onNext?.(selectedOption);
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

          {/* Main Heading - Centered */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.mainHeading}>
            How do you identify{'\n'}yourself?
          </Animated.Text>

          {/* Sub Heading - Centered */}
          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            We'll customize your experience{'\n'}tailored to you.
          </Animated.Text>

          {/* Gender Options */}
          <View style={styles.optionsContainer}>
            {/* First row: He/Him and She/Her */}
            <View style={styles.optionsRow}>
              <GenderOption
                option={GENDER_OPTIONS[0]}
                isSelected={selectedOption === GENDER_OPTIONS[0].id}
                onPress={() => handleOptionSelect(GENDER_OPTIONS[0].id)}
                delay={400}
              />
              <GenderOption
                option={GENDER_OPTIONS[1]}
                isSelected={selectedOption === GENDER_OPTIONS[1].id}
                onPress={() => handleOptionSelect(GENDER_OPTIONS[1].id)}
                delay={450}
              />
            </View>
            {/* Second row: Prefer not to say */}
            <View style={styles.optionsRowCenter}>
              <GenderOption
                option={GENDER_OPTIONS[2]}
                isSelected={selectedOption === GENDER_OPTIONS[2].id}
                onPress={() => handleOptionSelect(GENDER_OPTIONS[2].id)}
                delay={500}
              />
            </View>
          </View>

          {/* Continue Button */}
          <Animated.View
            entering={FadeIn.delay(400).duration(400)}
            style={styles.bottomSection}>
            <OnboardingButton
              text="Continue"
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
    backgroundColor: Colors.new_background,
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
  // Typography - Centered
  mainHeading: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(32),
    lineHeight: fontScale(36),
    color: Colors.newOnboardingHeading,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subHeading: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
    marginBottom: verticalScale(68),
  },
  // Options
  optionsContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingVertical: verticalScale(20),
    // backgroundColor:'red'
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(20),
    // gap: horizontalScale(20),
    // backgroundColor:'red'
  },
  optionsRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionWrapper: {
    alignItems: 'center',
  },
  optionItem: {
    // width: horizontalScale(110),
    // height: horizontalScale(110),
    // backgroundColor: 'transparent',
    borderRadius: radiusScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: verticalScale(20),
    // paddingVertical:moderateScale(15),
    paddingHorizontal:moderateScale(20),
    paddingBottom:moderateScale(20)
  },
  optionItemSelected: {
    backgroundColor: '#090C15',
    borderWidth: 2,
    borderColor: '#262D3D',
  },
  optionLabel: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(16),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
    marginTop:verticalScale(15)
  },
  optionLabelSelected: {
    color: Colors.newOnboardingHeading,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen4;
