/**
 * Onboarding Screen 2
 * "What are you seeking right now?" - Single-column list with radio circles
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
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
import {
  trackOnboarding2View,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {OnboardingButton} from '../../components/OnboardingButton';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
const SpiritualGrowthImg = require('../../assets/icons/new_onboarding/spiritual_growth.png');
const TrueLoveImg = require('../../assets/icons/new_onboarding/true_love.png');
const GuidanceClarityImg = require('../../assets/icons/new_onboarding/guidance_clarity.png');
const FuturePathImg = require('../../assets/icons/new_onboarding/future_path.png');
const SelfDiscoveryImg = require('../../assets/icons/new_onboarding/self_discovery.png');
const UnderstandingPeopleImg = require('../../assets/icons/new_onboarding/understanding_people.png');

const ICON_SIZE = horizontalScale(44);
const CIRCLE_SIZE = horizontalScale(24);
const HORIZONTAL_PADDING = horizontalScale(16);

interface OnboardingScreen2Props {
  onNext?: (seeking: string[]) => void;
  onGoBack?: () => void;
}

const SEEKING_OPTIONS = [
  {id: 'spiritual_growth', label: 'Spiritual Growth', image: SpiritualGrowthImg},
  {id: 'finding_true_love', label: 'Finding True Love', image: TrueLoveImg},
  {id: 'guidance_clarity', label: 'Guidance & Clarity', image: GuidanceClarityImg},
  {id: 'my_future_path', label: 'My Future Path', image: FuturePathImg},
  {id: 'self_discovery', label: 'Self Discovery', image: SelfDiscoveryImg},
  {id: 'understanding_people', label: 'Understanding People', image: UnderstandingPeopleImg},
];

// Animated Option Row Component - Simple with haptic only
interface AnimatedOptionRowProps {
  option: {id: string; label: string; image: any};
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const AnimatedOptionRow: React.FC<AnimatedOptionRowProps> = ({
  option,
  isSelected,
  onPress,
  index,
}) => {
  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 60).duration(400).springify()}>
      <TouchableOpacity
        style={[
          styles.optionRow,
          isSelected && styles.optionRowSelected,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}>
        {/* Radio Circle */}
        <View
          style={[
            styles.radioCircle,
            isSelected && styles.radioCircleSelected,
          ]}>
          {isSelected && <View style={styles.radioCircleInner} />}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.optionLabel,
            isSelected && styles.optionLabelSelected,
          ]}>
          {option.label}
        </Text>

        {/* Icon on the right */}
        <Image
          source={option.image}
          style={styles.optionImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({
  onNext,
  onGoBack,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useScreenView('OnboardingScreen2', {
    screen_category: 'onboarding',
    step: 2,
    total_steps: 11,
  });

  const CURRENT_STEP = 1;
  const TOTAL_STEPS = 9;
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    trackOnboarding2View();
    firebaseService.logScreenView('onboarding_2_seeking_options', 'OnboardingScreen2');

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

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId],
    );
  };

  const handleContinue = () => {
    // Pass data to container, don't save to Redux yet
    onNext?.(selectedOptions);
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
            What are you{'\n'}seeking right now?
          </Animated.Text>

          {/* Sub Heading - Centered */}
          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            Choose what resonates. We'll shape{'\n'}your experience around it.
          </Animated.Text>

          {/* Options List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.optionsList}
            showsVerticalScrollIndicator={false}>
            {SEEKING_OPTIONS.map((option, index) => (
              <AnimatedOptionRow
                key={option.id}
                option={option}
                isSelected={selectedOptions.includes(option.id)}
                onPress={() => handleOptionToggle(option.id)}
                index={index}
              />
            ))}
          </ScrollView>

          {/* Continue Button */}
          <Animated.View
            entering={FadeIn.delay(500).duration(400)}
            style={styles.bottomSection}>
            <OnboardingButton
              text="Pick 1 or more to continue"
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
    fontWeight: '700',
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
    marginBottom: verticalScale(28),
  },
  // Options List
  scrollView: {
    flex: 1,
  },
  optionsList: {
    gap: verticalScale(10),
    paddingBottom: verticalScale(16),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radiusScale(19),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
  },
  optionRowSelected: {
    backgroundColor: '#090C15',
    borderWidth:2,
    borderColor:'#262D3D',
    borderRadius:radiusScale(19)
  },
  // Radio Circle
  radioCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#262D3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
  },
  radioCircleSelected: {
    borderColor: Colors.newOnboardingHeading,
    backgroundColor: Colors.newOnboardingHeading,
  },
  radioCircleInner: {
    width: CIRCLE_SIZE * 0.45,
    height: CIRCLE_SIZE * 0.45,
    borderRadius: (CIRCLE_SIZE * 0.45) / 2,
    // backgroundColor: Colors.newOnboardingBg,
  },
  // Label
  optionLabel: {
    flex: 1,
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '500',
    fontSize: fontScale(17),
    color: Colors.newOnboardingSubheading,
  },
  optionLabelSelected: {
    color: Colors.newOnboardingHeading,
  },
  optionImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen2;
