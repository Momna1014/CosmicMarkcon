/**
 * Onboarding Screen 1
 * Welcome screen with Lottie animation
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
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
import {trackOnboarding1View} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';

const WelcomeVideo = require('../../assets/Videos/welcome.mp4');

const HORIZONTAL_PADDING = horizontalScale(16);
const CURRENT_STEP = 1;
const TOTAL_STEPS = 12;

export type AlignmentOption = 'in-my-flow' | 'figuring-it-out' | 'totally-lost' | null;

interface OnboardingScreen1Props {
  onContinue?: () => void;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onContinue,
}) => {
  const progressWidth = useSharedValue((CURRENT_STEP - 1) / TOTAL_STEPS * 100);

  useEffect(() => {
    trackOnboarding1View();

    progressWidth.value = withDelay(
      300,
      withTiming((CURRENT_STEP / TOTAL_STEPS) * 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleContinue = () => {
    hapticLight();
    onContinue?.();
  };

  return (
    <View style={styles.container}>

        <View
            style={styles.lottieContainer}>
            <Video
              source={WelcomeVideo}
              style={styles.lottie}
              resizeMode="contain"
              repeat
              muted
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              bufferConfig={{
                minBufferMs: 1000,
                maxBufferMs: 5000,
                bufferForPlaybackMs: 500,
                bufferForPlaybackAfterRebufferMs: 1000,
              }}
            />
          </View>
     
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.content}>
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.header}>
            <View style={styles.backButton} />

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFilled, progressAnimatedStyle]}
                />
              </View>
            </View>

            <Text style={styles.stepCounter}>{CURRENT_STEP}/{TOTAL_STEPS}</Text>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.mainHeading}>
            {'Understand what’s\nmeant for you'}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(350).duration(600).springify()}
            style={styles.subHeading}>
            {'Get simple insights into your love life,\ncareer, and daily path'}
          </Animated.Text>

      

          <Animated.View
            entering={FadeIn.delay(500).duration(400)}
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
    backgroundColor: Colors.new_background,
    // backgroundColor:'red'
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
    width: moderateScale(24),
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
    fontWeight: '400',
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
  // Video
  lottieContainer: {
    // flex: 1,
    position:'absolute',
    top:0,
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center'


  },
  lottie: {
    // width: moderateScale(500),
    // height: moderateScale(500),
        width:'100%',
    height:'100%',
  },
  // Bottom
  bottomSection: {
    // paddingTop: verticalScale(10),
    paddingBottom: verticalScale(30),
    position:'absolute',
    bottom:0,
    // flex:1,
    // backgroundColor:'red',
    width:'100%',
    alignSelf:"center"
  },
});

export default OnboardingScreen1;
