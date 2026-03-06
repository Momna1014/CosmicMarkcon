/**
 * Onboarding Screen 2
 * Features overview
 */

import React, { useEffect, useCallback } from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackOnboardingStep } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';

export const OnboardingScreen2: React.FC = () => {
  // ===== Analytics: Track screen view =====
  useScreenView('OnboardingScreen2', {
    screen_category: 'onboarding',
    step: '2',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [OnboardingScreen2] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [OnboardingScreen2] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('OnboardingScreen2', 'OnboardingScreen2');
    logFirebaseEvent('onboarding_screen_viewed', {
      step: 2,
      screen: 'OnboardingScreen2',
      timestamp: Date.now(),
    });
    // Track Facebook onboarding step
    trackOnboardingStep(2, 'features_overview');
  }, [logFirebaseEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Powerful Features</Text>
        <Text style={styles.description}>
          Access amazing features designed to make your life easier and more productive.
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Lightning Fast</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Secure & Private</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>☁️</Text>
            <Text style={styles.featureText}>Cloud Sync</Text>
          </View>
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
  features: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  featureText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

export default OnboardingScreen2;
