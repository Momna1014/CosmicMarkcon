/**
 * Paywall Screen - RevenueCat Embedded Paywall
 * 
 * Uses RevenueCatUI.Paywall component directly embedded in the screen.
 * NO black background, NO modal - the paywall IS the screen.
 * 
 * Usage:
 * navigation.navigate('Paywall', { source: 'settings' })
 * navigation.navigate('Paywall', { source: 'onboarding_start_reading' })
 */

import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useApp} from '../../contexts/AppContext';
import RevenueCatUI from 'react-native-purchases-ui';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackSubscriptionView, trackSubscriptionStarted } from '../../utils/facebookEvents';
import firebaseService from '../../services/firebase/FirebaseService';

interface PaywallRouteParams {
  source?: string;
  offeringIdentifier?: string;
}

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {refreshSubscriptionStatus, setInitialPaywallCompleted} = useApp();
  
  const params = (route.params as PaywallRouteParams) || {};
  const source = params.source || 'unknown';
  
  // Track if we've already navigated to prevent double navigation
  const hasNavigatedRef = React.useRef(false);
  
  // Track if paywall is ready
  const [isReady, setIsReady] = useState(false);
  
  // Set ready state after a brief delay to allow RevenueCat to initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ===== Analytics: Track screen view =====
  useScreenView('PaywallScreen', {
    screen_category: 'monetization',
    source: source,
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, eventParams?: Record<string, any>) => {
    console.log(`📊 [PaywallScreen] Firebase Event: ${eventName}`, eventParams);
    firebaseService.logEvent(eventName, eventParams);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [PaywallScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('PaywallScreen', 'PaywallScreen');
    logFirebaseEvent('paywall_viewed', {
      source: source,
      timestamp: Date.now(),
    });
    // Track Facebook subscription view event
    trackSubscriptionView('premium', 'Premium Subscription', 0, 'monthly');
  }, [logFirebaseEvent, source]);

  console.log('[PaywallScreen] 🎬 Rendering embedded paywall from:', source);

  /**
   * Navigate back after paywall interaction
   * - If from within app (Me screen, settings, etc.): Go back to previous screen
   * - Otherwise (from onboarding, initial launch, or unknown): Go to Home screen
   */
  const navigateBack = useCallback(() => {
    // Prevent double navigation
    if (hasNavigatedRef.current) {
      console.log('[PaywallScreen] ⚠️ Navigation already triggered, skipping...');
      return;
    }
    
    hasNavigatedRef.current = true;
    
    // Check if this was explicitly opened from within the app (Profile screen, settings, etc.)
    // Known in-app sources that should go back
    const inAppSources = ['settings_upgrade', 'settings_button', 'profile_screen', 'drawer', 'home_cta'];
    const isFromInApp = source && inAppSources.some(s => source.includes(s));
    
    console.log('[PaywallScreen] 🔍 Source:', source, 'isFromInApp:', isFromInApp);
    
    if (isFromInApp) {
      // From within app (Profile screen, drawer, etc.)
      // Check if we can go back, otherwise navigate to Profile tab
      console.log('[PaywallScreen] ⬅️ From app - navigating back...');
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback: Navigate to MainApp and ensure Profile tab is shown
        console.log('[PaywallScreen] ⚠️ Cannot go back, navigating to MainApp (Profile tab)...');
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'MainApp' as never,
              state: {
                routes: [{ name: 'Profile' }],
                index: 0,
              },
            }
          ],
        });
      }
    } else {
      // From onboarding, initial launch, or unknown - always go to Home
      console.log('[PaywallScreen] 🚀 From onboarding/initial - navigating to MainApp (Home tab)...');
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'MainApp' as never,
            state: {
              routes: [{ name: 'Home' }],
              index: 0,
            },
          }
        ],
      });
    }
  }, [navigation, source]);

  /**
   * Handle paywall dismiss (user closed without purchasing)
   * NOTE: We do NOT mark initialPaywallCompleted here - this allows the paywall
   * to show again on next app launch if user hasn't purchased
   */
  const handleDismiss = useCallback(async () => {
    console.log('[PaywallScreen] 👋 User dismissed paywall (not marking as completed)');
    logFirebaseEvent('paywall_dismissed', {
      source: source,
      timestamp: Date.now(),
    });
    navigateBack();
  }, [navigateBack, logFirebaseEvent, source]);

  /**
   * Handle restore started
   */
  const handleRestoreStarted = useCallback(() => {
    console.log('[PaywallScreen] 🔄 Restore started...');
    logFirebaseEvent('paywall_restore_started', {
      source: source,
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent, source]);

  /**
   * Handle restore completed
   */
  const handleRestoreCompleted = useCallback(async (customerInfo: any) => {
    console.log('[PaywallScreen] ✅ Restore completed:', customerInfo?.activeSubscriptions);
    logFirebaseEvent('paywall_restore_completed', {
      source: source,
      subscriptions: customerInfo?.activeSubscriptions?.join(',') || 'none',
      timestamp: Date.now(),
    });
    
    // Log restore_success event
    logFirebaseEvent('restore_success', {
      source: source,
      product_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
      screen: 'PaywallScreen',
      timestamp: Date.now(),
    });
    
    // Track Facebook subscription started (restored)
    trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');
    await refreshSubscriptionStatus();
    await setInitialPaywallCompleted(true);
    navigateBack();
  }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, logFirebaseEvent, source]);

  /**
   * Handle restore error
   */
  const handleRestoreError = useCallback((error: any) => {
    console.log('[PaywallScreen] ❌ Restore error:', error?.message);
    logFirebaseEvent('paywall_restore_error', {
      source: source,
      error: error?.message || 'unknown_error',
      timestamp: Date.now(),
    });
    // Don't navigate away - let user try again or dismiss
  }, [logFirebaseEvent, source]);

  /**
   * Handle purchase completed
   */
  const handlePurchaseCompleted = useCallback(async (customerInfo: any) => {
    console.log('[PaywallScreen] 🎉 Purchase completed!', customerInfo?.activeSubscriptions);
    
    // Log multiple event names for comprehensive tracking
    logFirebaseEvent('paywall_purchase_completed', {
      source: source,
      subscriptions: customerInfo?.activeSubscriptions?.join(',') || 'none',
      timestamp: Date.now(),
    });
    
    // Explicit purchase_success event
    logFirebaseEvent('purchase_success', {
      source: source,
      product_type: 'subscription',
      product_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
      screen: 'PaywallScreen',
      timestamp: Date.now(),
    });
    
    // Standard Firebase purchase event
    logFirebaseEvent('purchase', {
      source: source,
      item_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
      item_name: 'Premium Subscription',
      success: true,
    });
    
    // Track Facebook subscription started event - this is important for revenue tracking
    trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');
    await refreshSubscriptionStatus();
    await setInitialPaywallCompleted(true);
    navigateBack();
  }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, logFirebaseEvent, source]);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: any) => {
    console.log('[PaywallScreen] ❌ Purchase error:', error?.message);
    logFirebaseEvent('paywall_purchase_error', {
      source: source,
      error: error?.message || 'unknown_error',
      timestamp: Date.now(),
    });
    // Don't navigate away - let user try again or dismiss
  }, [logFirebaseEvent, source]);

  /**
   * Handle purchase cancelled
   */
  const handlePurchaseCancelled = useCallback(() => {
    console.log('[PaywallScreen] ⏸️ Purchase cancelled by user');
    logFirebaseEvent('paywall_purchase_cancelled', {
      source: source,
      timestamp: Date.now(),
    });
    // Don't navigate away - user can try again or dismiss
  }, [logFirebaseEvent, source]);

  // Render the paywall directly - NO background, the paywall IS the screen
  // Show loading state briefly to ensure RevenueCat is ready
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }
  
  return (
    <RevenueCatUI.Paywall
      style={styles.paywall}
      onDismiss={handleDismiss}
      onRestoreStarted={handleRestoreStarted}
      onRestoreCompleted={handleRestoreCompleted}
      onRestoreError={handleRestoreError}
      onPurchaseCompleted={handlePurchaseCompleted}
      onPurchaseError={handlePurchaseError}
      onPurchaseCancelled={handlePurchaseCancelled}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywall: {
    flex: 1,
  },
});

export default PaywallScreen;
