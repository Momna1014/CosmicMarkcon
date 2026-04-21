/**
 * Onboarding Screen 3
 * "Where do you seek the most clarity?" - 3x3 grid selection
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
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding3ClarityView} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
const LoveImg = require('../../assets/icons/new_onboarding/true_love.png');
const CareerImg = require('../../assets/icons/new_onboarding/career.png');
const HealthImg = require('../../assets/icons/new_onboarding/health.png');
const InnerPeaceImg = require('../../assets/icons/new_onboarding/inner_peace.png');
const ConfidenceImg = require('../../assets/icons/new_onboarding/confidence.png');
const WealthImg = require('../../assets/icons/new_onboarding/wealth.png');
const RelationshipsImg = require('../../assets/icons/new_onboarding/relationship.png');
const DestinyImg = require('../../assets/icons/new_onboarding/destiny.png');
const GrowthImg = require('../../assets/icons/new_onboarding/growth.png');

const HORIZONTAL_PADDING = horizontalScale(16);
const ICON_SIZE = horizontalScale(65);

interface OnboardingScreen3Props {
  onNext?: (clarity: string[]) => void;
  onGoBack?: () => void;
}

const CLARITY_OPTIONS = [
  {id: 'love', label: 'Love', image: LoveImg},
  {id: 'career', label: 'Career', image: CareerImg},
  {id: 'health', label: 'Health', image: HealthImg},
  {id: 'inner_peace', label: 'Inner Peace', image: InnerPeaceImg},
  {id: 'confidence', label: 'Confidence', image: ConfidenceImg},
  {id: 'wealth', label: 'Wealth', image: WealthImg},
  {id: 'relationships', label: 'Relationships', image: RelationshipsImg},
  {id: 'destiny', label: 'Destiny', image: DestinyImg},
  {id: 'growth', label: 'Growth', image: GrowthImg},
];

// Grid Option Component
interface GridOptionProps {
  option: {id: string; label: string; image: any};
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const GridOption: React.FC<GridOptionProps> = ({
  option,
  isSelected,
  onPress,
  index,
}) => {
  const handlePress = () => {
    hapticLight();
    onPress();
  };

  // Calculate row and column for staggered animation
  const row = Math.floor(index / 3);
  const col = index % 3;
  const delay = 400 + (row * 100) + (col * 50);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400).springify()}
      style={styles.gridItemWrapper}>
      <TouchableOpacity
        style={[
          styles.gridItem,
          isSelected && styles.gridItemSelected,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Image
          source={option.image}
          style={styles.gridIcon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.gridLabel,
            isSelected && styles.gridLabelSelected,
          ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({
  onNext,
  onGoBack,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useScreenView('OnboardingScreen3', {
    screen_category: 'onboarding',
    step: 3,
    total_steps: 9,
  });

  const CURRENT_STEP = 2;
  const TOTAL_STEPS = 9;
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboarding3ClarityView();
    firebaseService.logScreenView('onboarding_3_clarity_grid', 'OnboardingScreen3');

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
            Where do you seek{'\n'}the most clarity?
          </Animated.Text>

          {/* Sub Heading - Centered */}
          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            Select themes that resonate, and we'll guide{'\n'}your journey. Update anytime.
          </Animated.Text>

          {/* 3x3 Grid */}
          <View style={styles.gridContainer}>
            {[0, 1, 2].map(rowIndex => (
              <View key={rowIndex} style={styles.gridRow}>
                {CLARITY_OPTIONS.slice(rowIndex * 3, rowIndex * 3 + 3).map(
                  (option, colIndex) => (
                    <GridOption
                      key={option.id}
                      option={option}
                      isSelected={selectedOptions.includes(option.id)}
                      onPress={() => handleOptionToggle(option.id)}
                      index={rowIndex * 3 + colIndex}
                    />
                  ),
                )}
              </View>
            ))}
          </View>

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
  // Grid
  gridContainer: {
    flex: 1,
    // justifyContent: 'center',
    // paddingVertical: verticalScale(20),
    // backgroundColor:'blue'
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: verticalScale(16),
    // alignItems:'flex-start'
  },
  gridItemWrapper: {
    flex: 1,
    // alignItems: 'flex-start',
    // paddingHorizontal: horizontalScale(4),
    // backgroundColor:'red',
    // justifyContent:'flex-start'
    paddingVertical:verticalScale(15),
    paddingHorizontal:horizontalScale(5)
  },
  gridItem: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'transparent',
    borderRadius: radiusScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: verticalScale(12),
  },
  gridItemSelected: {
    backgroundColor: '#090C15',
    borderWidth: 2,
    borderColor: '#262D3D',
  },
  gridIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: verticalScale(12),
  },
  gridLabel: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(15),
    color: Colors.newOnboardingSubheading,
    textAlign: 'center',
    // letterSpacing:1
  },
  gridLabelSelected: {
    color: Colors.newOnboardingHeading,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
});

export default OnboardingScreen3;
