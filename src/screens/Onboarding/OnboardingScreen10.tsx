/**
 * Onboarding Screen 10
 * Fullscreen welcome video that auto-advances to next screen on completion
 */

import React, {useEffect, useCallback} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import Video from 'react-native-video';
import {Colors} from '../../theme';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding10LoveMatchVideoView} from '../../utils/onboardingAnalytics';

interface OnboardingScreen10Props {
  onContinue?: () => void;
}

const welcomeVideo = require('../../assets/Videos/love_match.mp4');

export const OnboardingScreen10: React.FC<OnboardingScreen10Props> = ({
  onContinue,
}) => {
  useScreenView('OnboardingScreen10', {
    screen_category: 'onboarding',
    step: 10,
    total_steps: 12,
  });

  useEffect(() => {
    trackOnboarding10LoveMatchVideoView();
    firebaseService.logScreenView('onboarding_10_love_match_video', 'OnboardingScreen10');
  }, []);

  const handleVideoEnd = useCallback(() => {
    onContinue?.();
  }, [onContinue]);

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
    backgroundColor: Colors.new_background,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default OnboardingScreen10;
