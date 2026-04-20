/**
 * Onboarding Screen 12
 * Fullscreen welcome video that auto-advances to next screen on completion
 */

import React, {useEffect, useCallback} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import Video from 'react-native-video';
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';

interface OnboardingScreen12Props {
  onContinue?: () => void;
}

const welcomeVideo = require('../../assets/Videos/chat_ai.mp4');

export const OnboardingScreen12: React.FC<OnboardingScreen12Props> = ({
  onContinue,
}) => {
  useScreenView('OnboardingScreen12', {
    screen_category: 'onboarding',
    step: 12,
    total_steps: 12,
  });

  useEffect(() => {
    firebaseService.logScreenView('OnboardingScreen12', 'OnboardingScreen12');
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
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default OnboardingScreen12;
