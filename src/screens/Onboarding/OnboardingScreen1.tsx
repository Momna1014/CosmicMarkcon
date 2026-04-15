/**
 * Onboarding Screen 1
 * Empty intro screen with continue button
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../theme';
import {hapticLight} from '../../utils/haptics';
import {
  trackOnboarding1View,
  trackOnboardingStarted,
} from '../../utils/onboardingAnalytics';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

interface OnboardingScreen1Props {
  onContinue?: () => void;
}

export type AlignmentOption = 'in-my-flow' | 'figuring-it-out' | 'totally-lost' | null;

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onContinue,
}) => {
  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen1', {
    screen_category: 'onboarding',
    step: 1,
    total_steps: 11,
  });

  useEffect(() => {
    trackOnboardingStarted();
    trackOnboarding1View();
    firebaseService.logScreenView('OnboardingScreen1', 'OnboardingScreen1');
  }, []);

  const handleContinue = () => {
    hapticLight();
    onContinue?.();
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
          {/* Empty space */}
          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
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
    paddingHorizontal: horizontalScale(24),
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: verticalScale(20),
  },
  continueButton: {
    backgroundColor: Colors.white,
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(18),
    color: Colors.black,
  },
});

export default OnboardingScreen1;
