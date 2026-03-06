/**
 * Onboarding Screen 3
 * Get started / final screen
 */

import React, { useEffect, useCallback } from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackOnboardingStep } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';

export const OnboardingScreen3: React.FC = () => {
  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen3', {
    screen_category: 'onboarding',
    step: '3',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [OnboardingScreen3] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [OnboardingScreen3] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('OnboardingScreen3', 'OnboardingScreen3');
    logFirebaseEvent('onboarding_screen_viewed', {
      step: 3,
      screen: 'OnboardingScreen3',
      timestamp: Date.now(),
    });
    // Track Facebook onboarding step
    trackOnboardingStep(3, 'get_started');
  }, [logFirebaseEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.description}>
          Everything is ready. Start exploring and make the most of your experience.
        </Text>
        
        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💡 Pro Tip</Text>
          <Text style={styles.highlightText}>
            Upgrade to Premium to unlock all features and get the most out of the app!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  highlightBox: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD60A',
    width: '100%',
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
});

export default OnboardingScreen3;
