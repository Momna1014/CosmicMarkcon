/**
 * Onboarding Screen 11
 * Fullscreen welcome video that auto-advances to next screen on completion
 */

import React, {useEffect, useCallback} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import Video from 'react-native-video';
import {Colors} from '../../theme';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {trackOnboarding11AiVideoView} from '../../utils/onboardingAnalytics';

interface OnboardingScreen11Props {
  onContinue?: () => void;
}

const welcomeVideo = require('../../assets/Videos/chat_ai.mp4');

export const OnboardingScreen11: React.FC<OnboardingScreen11Props> = ({
  onContinue,
}) => {
  useScreenView('OnboardingScreen11', {
    screen_category: 'onboarding',
    step: 11,
    total_steps: 12,
  });

  useEffect(() => {
    trackOnboarding11AiVideoView();
    firebaseService.logScreenView('onboarding_11_ai_chat_video', 'OnboardingScreen11');
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

export default OnboardingScreen11;
