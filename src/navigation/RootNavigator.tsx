/**
 * RootNavigator
 *
 * Main navigation container that wraps the entire app
 * Integrates: StackNavigator, DeepLinking, NavigationService
 *
 * InitializationFlow keeps the splash visible until consent + ATT are resolved.
 */

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Import modular navigation
import StackNavigator from './StackNavigator';
import { linking } from './deepLinking';
import { navigationRef } from './NavigationService';

// Import context
import { AppProvider, useApp } from '../contexts/AppContext';

// Import AdMob service for app open ad
// @feature:admob:start [disabled]
// import { adMobService } from '../services/AdMob/AdMobService';
// @feature:admob:end

/**
 * Root Navigator Component
 *
 * Signals navigation readiness to the orchestrator.
 * Shows App Open ad once on cold start after splash hides.
 */
function RootNavigatorContent() {
  const { isPremium, onboardingCompleted } = useApp();
  const hasTriggeredAppOpenAd = useRef(false);

  // Show App Open ad first, then PaywallScreen handles showing paywall after it completes
  useEffect(() => {
    if (hasTriggeredAppOpenAd.current) return;
    hasTriggeredAppOpenAd.current = true;
    if (!onboardingCompleted) {
      // @feature:admob:start [disabled]
      // adMobService.skipAppOpenAd();
      // @feature:admob:end
      return;
    }
    if (isPremium) return;
    // @feature:admob:start [disabled]
    // adMobService.showAppOpenAd();
    // @feature:admob:end
  }, [isPremium, onboardingCompleted]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking as any}
    >
      <StackNavigator />
    </NavigationContainer>
  );
}

/**
 * Root Navigator with Context Provider
 *
 * Wraps navigation with AppProvider for global state
 * Note: PaywallModal uses presentPaywall() API - no component needed
 */
export default function RootNavigator() {
  return (
    <AppProvider>
      <RootNavigatorContent />
    </AppProvider>
  );
}
