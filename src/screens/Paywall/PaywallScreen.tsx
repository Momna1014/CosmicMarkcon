// /**
//  * Paywall Screen - RevenueCat Embedded Paywall
//  * 
//  * Uses RevenueCatUI.Paywall component directly embedded in the screen.
//  * NO black background, NO modal - the paywall IS the screen.
//  * 
//  * Usage:
//  * navigation.navigate('Paywall', { source: 'settings' })
//  * navigation.navigate('Paywall', { source: 'onboarding_start_reading' })
//  */

// import React, {useCallback, useEffect, useState} from 'react';
// import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {useApp} from '../../contexts/AppContext';
// import RevenueCatUI from 'react-native-purchases-ui';

// // Analytics imports
// import { useScreenView } from '../../hooks/useFacebookAnalytics';
// import { trackSubscriptionView, trackSubscriptionStarted } from '../../utils/facebookEvents';
// import firebaseService from '../../services/firebase/FirebaseService';

// interface PaywallRouteParams {
//   source?: string;
//   offeringIdentifier?: string;
// }

// export const PaywallScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const {refreshSubscriptionStatus, setInitialPaywallCompleted} = useApp();
  
//   const params = (route.params as PaywallRouteParams) || {};
//   const source = params.source || 'unknown';
  
//   // Track if we've already navigated to prevent double navigation
//   const hasNavigatedRef = React.useRef(false);
  
//   // Track if paywall is ready
//   const [isReady, setIsReady] = useState(false);
  
//   // Set ready state after a brief delay to allow RevenueCat to initialize
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsReady(true);
//     }, 100);
//     return () => clearTimeout(timer);
//   }, []);

//   // ===== Analytics: Track screen view =====
//   useScreenView('PaywallScreen', {
//     screen_category: 'monetization',
//     source: source,
//   });

//   /**
//    * Log Firebase event helper
//    */
//   const logFirebaseEvent = useCallback((eventName: string, eventParams?: Record<string, any>) => {
//     console.log(`📊 [PaywallScreen] Firebase Event: ${eventName}`, eventParams);
//     firebaseService.logEvent(eventName, eventParams);
//   }, []);

//   // Log screen view to Firebase on mount
//   useEffect(() => {
//     console.log('📱 [PaywallScreen] Screen mounted - logging Firebase screen view');
//     firebaseService.logScreenView('PaywallScreen', 'PaywallScreen');
//     logFirebaseEvent('paywall_viewed', {
//       source: source,
//       timestamp: Date.now(),
//     });
//     // Track Facebook subscription view event
//     trackSubscriptionView('premium', 'Premium Subscription', 0, 'monthly');
//   }, [logFirebaseEvent, source]);

//   console.log('[PaywallScreen] 🎬 Rendering embedded paywall from:', source);

//   /**
//    * Navigate back after paywall interaction
//    * - If from within app (Me screen, settings, etc.): Go back to previous screen
//    * - Otherwise (from onboarding, initial launch, or unknown): Go to Home screen
//    */
//   const navigateBack = useCallback(() => {
//     // Prevent double navigation
//     if (hasNavigatedRef.current) {
//       console.log('[PaywallScreen] ⚠️ Navigation already triggered, skipping...');
//       return;
//     }
    
//     hasNavigatedRef.current = true;
    
//     // Check if this was explicitly opened from within the app (Profile screen, settings, etc.)
//     // Known in-app sources that should go back
//     const inAppSources = ['settings_upgrade', 'settings_button', 'profile_screen', 'drawer', 'home_cta'];
//     const isFromInApp = source && inAppSources.some(s => source.includes(s));
    
//     console.log('[PaywallScreen] 🔍 Source:', source, 'isFromInApp:', isFromInApp);
    
//     if (isFromInApp) {
//       // From within app (Profile screen, drawer, etc.)
//       // Check if we can go back, otherwise navigate to Profile tab
//       console.log('[PaywallScreen] ⬅️ From app - navigating back...');
      
//       if (navigation.canGoBack()) {
//         navigation.goBack();
//       } else {
//         // Fallback: Navigate to MainApp and ensure Profile tab is shown
//         console.log('[PaywallScreen] ⚠️ Cannot go back, navigating to MainApp (Profile tab)...');
//         navigation.reset({
//           index: 0,
//           routes: [
//             { 
//               name: 'MainApp' as never,
//               state: {
//                 routes: [{ name: 'Profile' }],
//                 index: 0,
//               },
//             }
//           ],
//         });
//       }
//     } else {
//       // From onboarding, initial launch, or unknown - always go to Home
//       console.log('[PaywallScreen] 🚀 From onboarding/initial - navigating to MainApp (Home tab)...');
//       navigation.reset({
//         index: 0,
//         routes: [
//           { 
//             name: 'MainApp' as never,
//             state: {
//               routes: [{ name: 'Home' }],
//               index: 0,
//             },
//           }
//         ],
//       });
//     }
//   }, [navigation, source]);

//   /**
//    * Handle paywall dismiss (user closed without purchasing)
//    * NOTE: We do NOT mark initialPaywallCompleted here - this allows the paywall
//    * to show again on next app launch if user hasn't purchased
//    */
//   const handleDismiss = useCallback(async () => {
//     console.log('[PaywallScreen] 👋 User dismissed paywall (not marking as completed)');
//     logFirebaseEvent('paywall_dismissed', {
//       source: source,
//       timestamp: Date.now(),
//     });
//     navigateBack();
//   }, [navigateBack, logFirebaseEvent, source]);

//   /**
//    * Handle restore started
//    */
//   const handleRestoreStarted = useCallback(() => {
//     console.log('[PaywallScreen] 🔄 Restore started...');
//     logFirebaseEvent('paywall_restore_started', {
//       source: source,
//       timestamp: Date.now(),
//     });
//   }, [logFirebaseEvent, source]);

//   /**
//    * Handle restore completed
//    */
//   const handleRestoreCompleted = useCallback(async (customerInfo: any) => {
//     console.log('[PaywallScreen] ✅ Restore completed:', customerInfo?.activeSubscriptions);
//     logFirebaseEvent('paywall_restore_completed', {
//       source: source,
//       subscriptions: customerInfo?.activeSubscriptions?.join(',') || 'none',
//       timestamp: Date.now(),
//     });
    
//     // Log restore_success event
//     logFirebaseEvent('restore_success', {
//       source: source,
//       product_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
//       screen: 'PaywallScreen',
//       timestamp: Date.now(),
//     });
    
//     // Track Facebook subscription started (restored)
//     trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');
//     await refreshSubscriptionStatus();
//     await setInitialPaywallCompleted(true);
//     navigateBack();
//   }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, logFirebaseEvent, source]);

//   /**
//    * Handle restore error
//    */
//   const handleRestoreError = useCallback((error: any) => {
//     console.log('[PaywallScreen] ❌ Restore error:', error?.message);
//     logFirebaseEvent('paywall_restore_error', {
//       source: source,
//       error: error?.message || 'unknown_error',
//       timestamp: Date.now(),
//     });
//     // Don't navigate away - let user try again or dismiss
//   }, [logFirebaseEvent, source]);

//   /**
//    * Handle purchase completed
//    */
//   const handlePurchaseCompleted = useCallback(async (customerInfo: any) => {
//     console.log('[PaywallScreen] 🎉 Purchase completed!', customerInfo?.activeSubscriptions);
    
//     // Log multiple event names for comprehensive tracking
//     logFirebaseEvent('paywall_purchase_completed', {
//       source: source,
//       subscriptions: customerInfo?.activeSubscriptions?.join(',') || 'none',
//       timestamp: Date.now(),
//     });
    
//     // Explicit purchase_success event
//     logFirebaseEvent('purchase_success', {
//       source: source,
//       product_type: 'subscription',
//       product_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
//       screen: 'PaywallScreen',
//       timestamp: Date.now(),
//     });
    
//     // Standard Firebase purchase event
//     logFirebaseEvent('purchase', {
//       source: source,
//       item_id: customerInfo?.activeSubscriptions?.[0] || 'premium',
//       item_name: 'Premium Subscription',
//       success: true,
//     });
    
//     // Track Facebook subscription started event - this is important for revenue tracking
//     trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');
//     await refreshSubscriptionStatus();
//     await setInitialPaywallCompleted(true);
//     navigateBack();
//   }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, logFirebaseEvent, source]);

//   /**
//    * Handle purchase error
//    */
//   const handlePurchaseError = useCallback((error: any) => {
//     console.log('[PaywallScreen] ❌ Purchase error:', error?.message);
//     logFirebaseEvent('paywall_purchase_error', {
//       source: source,
//       error: error?.message || 'unknown_error',
//       timestamp: Date.now(),
//     });
//     // Don't navigate away - let user try again or dismiss
//   }, [logFirebaseEvent, source]);

//   /**
//    * Handle purchase cancelled
//    */
//   const handlePurchaseCancelled = useCallback(() => {
//     console.log('[PaywallScreen] ⏸️ Purchase cancelled by user');
//     logFirebaseEvent('paywall_purchase_cancelled', {
//       source: source,
//       timestamp: Date.now(),
//     });
//     // Don't navigate away - user can try again or dismiss
//   }, [logFirebaseEvent, source]);

//   // Render the paywall directly - NO background, the paywall IS the screen
//   // Show loading state briefly to ensure RevenueCat is ready
//   if (!isReady) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#D4AF37" />
//       </View>
//     );
//   }
  
//   return (
//     <RevenueCatUI.Paywall
//       style={styles.paywall}
//       onDismiss={handleDismiss}
//       onRestoreStarted={handleRestoreStarted}
//       onRestoreCompleted={handleRestoreCompleted}
//       onRestoreError={handleRestoreError}
//       onPurchaseCompleted={handlePurchaseCompleted}
//       onPurchaseError={handlePurchaseError}
//       onPurchaseCancelled={handlePurchaseCancelled}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#0A1628',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   paywall: {
//     flex: 1,
//   },
// });

// export default PaywallScreen;



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

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, Platform, StatusBar, Alert, Text, ActivityIndicator, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../../contexts/AppContext';
import RevenueCatUI from 'react-native-purchases-ui';
import {revenueCatService} from '../../services/RevenueCatService';

// Analytics imports
import { trackSubscriptionStarted } from '../../utils/facebookEvents';
import { trackBtChildView, BottomTabSource } from '../../utils/mainScreenAnalytics';
import {
  trackPaywallViewed,
  trackPaywallViewedVia,
  trackPaywallDismissedVia,
  trackTrialBtnVia,
  trackPurchaseCompletedVia,
  trackPurchaseCancelledVia,
  trackPurchaseRestoredVia,
} from '../../utils/paywallEvents';

interface PaywallRouteParams {
  source?: string;
  offeringIdentifier?: string;
  bottomTabSource?: BottomTabSource;
}

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {refreshSubscriptionStatus, setInitialPaywallCompleted} = useApp();
  
  const params = (route.params as PaywallRouteParams) || {};
  const source = params.source || 'unknown';
  const bottomTabSource = params.bottomTabSource;

  // Analytics - Bottom tab child view (only when navigated from a bottom tab path).
  // App-launch / post-onboarding Paywall has no bottomTabSource and fires no event.
  useEffect(() => {
    if (bottomTabSource) {
      trackBtChildView(bottomTabSource, 'paywall');
    }
  }, [bottomTabSource]);
  
  // Track if we've already navigated to prevent double navigation
  const hasNavigatedRef = React.useRef(false);

  // Billing availability state
  // 'loading' = checking offerings, 'available' = paywall ready, 'unavailable' = can't load
  const [billingStatus, setBillingStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');

  // Check if this was opened from within the app (Profile screen, settings, etc.)
  // These sources need extra top padding on Android
  const inAppSources = ['settings_upgrade', 'settings_button', 'profile_screen', 'drawer', 'home_cta'];
  const isFromInApp = source && inAppSources.some(s => source.includes(s));
  
  // On Android, when coming from in-app screens, we need to account for status bar
  const needsAndroidTopPadding = Platform.OS === 'android' && isFromInApp;

  // Source-suffixed paywall analytics context. Resolves to 'onboarding' or
  // 'bt_home_ch_paywall' (or null when neither). All paywall events read from this.
  const paywallCtx = useMemo(
    () => ({source, bottomTabSource}),
    [source, bottomTabSource],
  );

  // Mount-time paywall view events.
  // - paywall_viewed: every entry EXCEPT first-time onboarding
  // - paywall_viewed_via_{src}: every entry where {src} is recognized
  useEffect(() => {
    trackPaywallViewed(paywallCtx);
    trackPaywallViewedVia(paywallCtx);
  }, [paywallCtx]);

  /**
   * Check if billing/offerings are available before rendering the paywall.
   * If Google Play account is missing or billing can't connect, we show a
   * fallback UI instead of the broken RevenueCat paywall.
   */
  const checkBillingAvailability = useCallback(async () => {
    try {
      setBillingStatus('loading');
      console.log('[PaywallScreen] 🔍 Checking billing availability...');

      // Wait for RevenueCat SDK to finish configuring (deferred init in startApp).
      // On a fresh install everything is already configured by the time the
      // user reaches this screen, but on a hot refresh the navigator can
      // restore Paywall before deferred SDKs finish — without this gate,
      // getOfferings() throws "There is no singleton instance".
      if (!revenueCatService.getInitializationStatus()) {
        console.log('[PaywallScreen] ⏳ RevenueCat not initialized yet, waiting...');
        const ready = await revenueCatService.waitForInitialization(10000);
        if (!ready) {
          console.warn('[PaywallScreen] ⚠️ RevenueCat still not initialized, attempting fallback init');
          try {
            await revenueCatService.initialize(undefined, { enableAttribution: false });
          } catch (fallbackError) {
            console.error('[PaywallScreen] ❌ RevenueCat fallback init failed:', fallbackError);
            setBillingStatus('unavailable');
            return;
          }
        }
      }

      const offerings = await revenueCatService.getOfferings();
      if (offerings?.current) {
        console.log('[PaywallScreen] ✅ Billing available, offerings loaded');
        setBillingStatus('available');
      } else {
        console.log('[PaywallScreen] ⚠️ No offerings available');
        setBillingStatus('unavailable');
      }
    } catch (error) {
      console.error('[PaywallScreen] ❌ Billing check failed:', error);
      setBillingStatus('unavailable');
    }
  }, []);

  // Pre-check billing availability before showing paywall
  useEffect(() => {
    checkBillingAvailability();
  }, [checkBillingAvailability]);

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
    
    console.log('[PaywallScreen] 🔍 Source:', source, 'isFromInApp:', isFromInApp);
    
    if (isFromInApp) {
      // From within app (Profile screen, drawer, etc.)
      // Profile is a root stack screen — goBack() returns to it directly
      console.log('[PaywallScreen] ⬅️ From app - navigating back, canGoBack:', navigation.canGoBack());

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Stack was reset (edge case) — navigate explicitly to the originating screen
        if (source === 'profile_screen') {
          console.log('[PaywallScreen] ⚠️ Cannot go back, navigating to Profile screen...');
          navigation.navigate('Profile' as never);
        } else {
          console.log('[PaywallScreen] ⚠️ Cannot go back, navigating to MainApp...');
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' as never }],
          });
        }
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
  }, [navigation, source, isFromInApp]);

  /**
   * Handle paywall dismiss (user tapped X / cross button)
   * Always allows entry into the app. Disable the cross button from
   * RevenueCat dashboard when ready to enforce the paywall.
   */
  const handleDismiss = useCallback(async () => {
    console.log('[PaywallScreen] 👋 User dismissed paywall via cross button');
    trackPaywallDismissedVia(paywallCtx);
    navigateBack();
  }, [navigateBack, paywallCtx]);

  /**
   * Handle purchase started (user tapped the trial / continue / subscribe button)
   */
  const handlePurchaseStarted = useCallback(() => {
    console.log('[PaywallScreen] ▶️ Purchase started (trial/continue button tapped)');
    trackTrialBtnVia(paywallCtx);
  }, [paywallCtx]);

  /**
   * Handle restore started
   */
  const handleRestoreStarted = useCallback(() => {
    console.log('[PaywallScreen] 🔄 Restore started...');
  }, []);

  /**
   * Handle restore completed
   */
  const handleRestoreCompleted = useCallback(async (_callbackCustomerInfo: any) => {
    console.log('[PaywallScreen] ✅ Restore callback fired, callback data:', _callbackCustomerInfo?.activeSubscriptions);

    // IMPORTANT: The customerInfo from RevenueCatUI's onRestoreCompleted callback
    // can be unreliable (activeSubscriptions may be undefined even when user has
    // an active subscription). Always fetch fresh data directly from RevenueCat servers.
    try {
      const freshCustomerInfo = await revenueCatService.getCustomerInfo();
      const isPremiumNow = revenueCatService.isPremium(freshCustomerInfo);

      console.log('[PaywallScreen] 🔍 Fresh customer info after restore:', {
        isPremium: isPremiumNow,
        activeSubscriptions: freshCustomerInfo.activeSubscriptions,
        activeEntitlements: Object.keys(freshCustomerInfo.entitlements.active),
      });

      if (!isPremiumNow) {
        console.log('[PaywallScreen] ⚠️ Restore completed but no active subscriptions found (server-verified)');
        Alert.alert(
          'No Subscriptions Found',
          'We couldn\'t find any active subscriptions to restore. If you believe this is an error, please try again or contact support.',
          [{text: 'OK'}],
        );
        return;
      }

      trackPurchaseRestoredVia(paywallCtx);
      trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');
      await refreshSubscriptionStatus();
      await setInitialPaywallCompleted(true);
      navigateBack();
    } catch (error) {
      console.error('[PaywallScreen] ❌ Failed to verify restore status:', error);
      // On error fetching fresh info, fall back to refreshing subscription status
      // which will trigger the customer info listener in AppContext
      await refreshSubscriptionStatus();
    }
  }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, paywallCtx]);

  /**
   * Handle restore error
   */
  const handleRestoreError = useCallback((error: any) => {
    console.log('[PaywallScreen] ❌ Restore error:', error?.message);
    // Mark billing error so dismiss handler blocks navigation
    hasNavigatedRef.current = false;
  }, []);

  /**
   * Handle purchase completed
   */
  const handlePurchaseCompleted = useCallback(async (customerInfo: any) => {
    console.log('[PaywallScreen] 🎉 Purchase completed!', customerInfo?.activeSubscriptions);

    trackPurchaseCompletedVia(paywallCtx);
    // Meta standard Subscribe event — required for SKAdNetwork / ad revenue tracking
    trackSubscriptionStarted('premium', 'Premium Subscription', 0, 'monthly');

    await refreshSubscriptionStatus();
    await setInitialPaywallCompleted(true);
    navigateBack();
  }, [refreshSubscriptionStatus, setInitialPaywallCompleted, navigateBack, paywallCtx]);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: any) => {
    const errorMessage = error?.message || 'unknown_error';
    console.log('[PaywallScreen] ❌ Purchase error:', errorMessage);
    // Mark that a billing error occurred
    hasNavigatedRef.current = false;
    // Don't navigate away - let user try again or dismiss
  }, []);

  /**
   * Handle purchase cancelled
   */
  const handlePurchaseCancelled = useCallback(() => {
    console.log('[PaywallScreen] ⏸️ Purchase cancelled by user');
    trackPurchaseCancelledVia(paywallCtx);
    // Don't navigate away - user can try again or dismiss
  }, [paywallCtx]);

  // Render based on billing availability
  // Loading state - checking if billing is available
  if (billingStatus === 'loading') {
    return (
      <View style={[styles.container, styles.fallbackContainer,
        needsAndroidTopPadding && { paddingTop: insets.top || StatusBar.currentHeight || 24 }
      ]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.fallbackText}>Loading...</Text>
      </View>
    );
  }

  // Billing unavailable - show fallback UI instead of broken RevenueCat paywall
  // if (billingStatus === 'unavailable') {
  //   return (
  //     <View style={[styles.container, styles.fallbackContainer,
  //       needsAndroidTopPadding && { paddingTop: insets.top || StatusBar.currentHeight || 24 }
  //     ]}>
  //       {/* Cross button - same behavior as paywall dismiss */}
  //       {/* <TouchableOpacity
  //         style={[styles.crossButton, { top: (insets.top || StatusBar.currentHeight || 44) + 10 }]}
  //         onPress={navigateBack}
  //         hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  //       >
  //         <Text style={styles.crossButtonText}>{'✕'}</Text>
  //       </TouchableOpacity> */}

  //       <View style={styles.fallbackContent}>
  //         <Text style={styles.fallbackIcon}>{'🛒'}</Text>
  //         <Text style={styles.fallbackTitle}>Store Unavailable</Text>
  //         <Text style={styles.fallbackMessage}>
  //           {Platform.OS === 'android'
  //             ? 'We couldn\'t connect to Google Play. Please make sure your Google Play account is signed in and try again.'
  //             : 'We couldn\'t connect to the App Store. Please make sure your App Store account is signed in and try again.'}
  //         </Text>
  //         <TouchableOpacity style={styles.retryButton} onPress={checkBillingAvailability}>
  //           <Text style={styles.retryButtonText}>Try Again</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // }

  // Billing available - render the actual RevenueCat paywall
  return (
    <View style={[
      styles.container,
      needsAndroidTopPadding && { paddingTop: insets.top || StatusBar.currentHeight || 24 }
    ]}>
      <RevenueCatUI.Paywall
        style={styles.paywall}
        onDismiss={handleDismiss}
        onPurchaseStarted={handlePurchaseStarted}
        onRestoreStarted={handleRestoreStarted}
        onRestoreCompleted={handleRestoreCompleted}
        onRestoreError={handleRestoreError}
        onPurchaseCompleted={handlePurchaseCompleted}
        onPurchaseError={handlePurchaseError}
        onPurchaseCancelled={handlePurchaseCancelled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050711', // Match paywall background
  },
  paywall: {
    flex: 1,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fallbackIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackMessage: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  fallbackText: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#5B4CFF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  crossButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaywallScreen;
