/**
 * Onboarding Screen 1
 * Fullscreen welcome video that auto-advances to Screen 2 on completion
 */

import React, {useEffect, useCallback} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import Video, {OnEndData} from 'react-native-video';
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

const welcomeVideo = require('../../assets/Videos/chat_ai.mp4');

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onContinue,
}) => {
  useScreenView('OnboardingScreen1', {
    screen_category: 'onboarding',
    step: 1,
    total_steps: 11,
  });

  useEffect(() => {
    trackOnboardingStarted();
    trackOnboarding1View();
    firebaseService.logScreenView('onboarding_1_welcome_video', 'OnboardingScreen1');
  }, []);

  const handleVideoEnd = useCallback(
    (_data: OnEndData) => {
      onContinue?.();
    },
    [onContinue],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Video
        source={welcomeVideo}
        style={styles.video}
        resizeMode="cover"
        onEnd={handleVideoEnd}
        repeat={false}
        muted={false}
        controls={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default OnboardingScreen1;
