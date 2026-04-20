/**
 * Onboarding Screen 6
 * Cosmic Profile Taking Shape screen
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {BlurView} from '@react-native-community/blur';
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
import {OnboardingButton} from '../../components/OnboardingButton';

// Icons
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';
import StartCosmicProfileIcon from '../../assets/icons/new_onboarding/start_cosmic_profile.svg';
import EndCosmicProfileIcon from '../../assets/icons/new_onboarding/end_cosmic_profile.svg';
import HeartIcon from '../../assets/icons/new_onboarding/heart.svg';
import MoonIcon from '../../assets/icons/new_onboarding/moon.svg';
import StarIcon from '../../assets/icons/new_onboarding/star.svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const HORIZONTAL_PADDING = horizontalScale(16);

// Background images
const GirlBackgroundImage = require('../../assets/icons/new_onboarding/girl_gender_backimage.png');
const BoyBackgroundImage = require('../../assets/icons/new_onboarding/boy_gender.png');
const NotToSayBackgroundImage = require('../../assets/icons/new_onboarding/not_say.png');

// Animated TouchableOpacity


interface OnboardingScreen6Props {
  onNext?: () => void;
  onGoBack?: () => void;
  gender?: string | null;
}

// Gradient Text Component
const GradientText: React.FC<{text: string; style?: any}> = ({text, style}) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[styles.gradientTextMask, style]}>{text}</Text>
      }>
      <LinearGradient
        colors={['#FFFFFF', '#FFAEAE']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        locations={[0.2037, 1]}>
        <Text style={[styles.gradientTextMask, style, {opacity: 0}]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

// Blur Tab Component with icon and label
const BlurTab: React.FC<{icon: React.ReactNode; label: string; delay: number}> = ({icon, label, delay}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(500).springify()}
      style={styles.blurTabWrapper}>
      <View style={styles.blurTab}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={35}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
        />
        <View style={styles.blurTabContent}>
          {icon}
          <Text style={styles.blurTabLabel}>{label}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const OnboardingScreen6: React.FC<OnboardingScreen6Props> = ({
  onNext,
  onGoBack,
  gender,
}) => {
  // Get appropriate background image based on gender selection
  const backgroundImage =
    gender === 'he_him'
      ? BoyBackgroundImage
      : gender === 'she_her'
      ? GirlBackgroundImage
      : NotToSayBackgroundImage; // Handles 'prefer_not_to_say' and null

  useScreenView('OnboardingScreen6', {
    screen_category: 'onboarding',
    step: 6,
    total_steps: 9,
  });

  useEffect(() => {
    firebaseService.logScreenView('OnboardingScreen6', 'OnboardingScreen6');
  }, []);

  const handleContinue = () => {
    onNext?.();
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          <View style={styles.content}>
            {/* Header: Back button only */}
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
            </Animated.View>

            {/* Push everything to bottom */}
            <View style={styles.topSpacer} />

            {/* Bottom Content Block */}
            <View style={styles.bottomContent}>
              {/* Cosmic Profile Section */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(600).springify()}
                style={styles.cosmicProfileSection}>
                <View style={styles.cosmicProfileRow}>
                  <StartCosmicProfileIcon
                    width={moderateScale(46)}
                    height={moderateScale(81)}
                  />
                  <View style={styles.cosmicProfileTextContainer}>
                    <Text style={styles.cosmicProfileText}>
                      Your cosmic profile{'\n'}is taking shape
                    </Text>
                  </View>
                  <EndCosmicProfileIcon
                    width={moderateScale(48)}
                    height={moderateScale(81)}
                  />
                </View>
              </Animated.View>

              {/* Main Text Section */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(600).springify()}
                style={styles.textSection}>
                <GradientText
                  text="You feel more than you usually show."
                  style={styles.mainText}
                />
                <Text style={styles.subText}>
                  Your intuitions picks up what others miss.
                </Text>
              </Animated.View>

              {/* Three Tabs */}
              <View style={styles.tabsContainer}>
                <BlurTab
                  icon={<HeartIcon width={moderateScale(18)} height={moderateScale(17)} />}
                  label="Emotional Depth"
                  delay={700}
                />
                <BlurTab
                  icon={<MoonIcon width={moderateScale(18)} height={moderateScale(18)} />}
                  label="Intuitive Energy"
                  delay={800}
                />
                <BlurTab
                  icon={<StarIcon width={moderateScale(18)} height={moderateScale(18)} />}
                  label="Love Sensitivity"
                  delay={900}
                />
              </View>

              {/* Unlock Profile Button */}
              <Animated.View
                entering={FadeInUp.delay(1000).duration(500)}
                style={styles.bottomSection}>
                <OnboardingButton
                  text="Unlock Profile"
                  onPress={handleContinue}
                />
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.newOnboardingBg,
  },
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
  },
  backButton: {
    padding: horizontalScale(4),
  },
  // Push content to bottom
  topSpacer: {
    flex: 1,
  },
  // Bottom content block
  bottomContent: {
    alignItems: 'center',
  },
  // Cosmic Profile Section
  cosmicProfileSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  cosmicProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cosmicProfileTextContainer: {
    marginHorizontal: horizontalScale(8),
  },
  cosmicProfileText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '400',
    fontSize: fontScale(28),
    // lineHeight: fontScale(20),
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Text Section
  textSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  gradientTextMask: {
    fontFamily: FontFamilies.sunlightDreams,
    fontWeight: '700',
    fontSize: fontScale(18),
    lineHeight: fontScale(34),
    textAlign: 'center',
  },
  mainText: {
    marginBottom: verticalScale(0),
  },
  subText: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(14),
    lineHeight: fontScale(22),
    color: Colors.white,
    textAlign: 'center',
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(24),
  },
  blurTabWrapper: {
    borderRadius: radiusScale(12),
    overflow: 'hidden',
    // inset box-shadow: 0px 4px 35px 0px #FFFFFF3D
    shadowColor: '#FFFFFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.24,
    shadowRadius: 35,
    elevation: 8,
  },
  blurTab: {
    height: verticalScale(40),
    borderRadius: radiusScale(12),
    overflow: 'hidden',
    backgroundColor: '#b8bed0f4',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  blurTabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(14),
    gap: horizontalScale(4),
  },
  blurTabLabel: {
    fontFamily: FontFamilies.interRegular,
    fontWeight: '400',
    fontSize: fontScale(10),
    color: Colors.white,
  },
  // Bottom
  bottomSection: {
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
    // backgroundColor:'red',
    // flex:1
    width:"100%"
  },

});

export default OnboardingScreen6;
