/**
 * Paywall Utilities
 * 
 * Uses RevenueCat's presentPaywall() imperative API for showing paywalls.
 * No component needed - just call showPaywallModal() from anywhere.
 * 
 * @example
 * // Show dismissible paywall
 * showPaywallModal({ source: 'settings' });
 * 
 * // Show hard paywall (shows discount on dismiss)
 * showPaywallModal({ source: 'onboarding', isHardPaywall: true });
 */

import React from 'react';
import { Alert } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { navigate } from '../../navigation/NavigationService';
import { revenueCatService } from '../../services/RevenueCatService';
// @feature:admob:start
import { adMobService } from '../../services/AdMob/AdMobService';
// @feature:admob:end
import { TypedStorage } from '../../redux/storage';
import {
  trackPaywallViewed,
  trackPaywallDismissed,
  trackPurchaseStarted,
  trackPurchaseCompleted,
  trackPurchaseCancelled,
  trackPurchaseFailed,
  trackRestoreCompleted,
  trackTrialStartedFirebase,
} from '../../utils/paywallAnalytics';
import {
  incrementDismissalCount,
  resetDismissalCount,
  getPaywallDismissalCount,
} from '../../utils/showPaywall';
import { PAYWALL_SOURCES } from '../../constants/subscription';
import { trackSubscriptionStarted, trackTrialStarted } from '../../utils/facebookEvents';

// ============================================================================
// TYPES
// ============================================================================

export interface PaywallModalOptions {
  /** Source for analytics tracking */
  source?: string;
  /** If true, paywall cannot be dismissed - shows discount paywall on dismiss */
  isHardPaywall?: boolean;
  /** If true, this is a discount paywall - navigates to Home on dismiss */
  isDiscountPaywall?: boolean;
  /** Offering identifier to display (optional) */
  offeringIdentifier?: string;
  /** Callback when purchase is completed successfully */
  onPurchaseCompleted?: () => void;
  /** Callback when paywall is dismissed */
  onDismissed?: () => void;
}

// Track if paywall is currently showing to prevent double-showing
let _isPaywallShowing = false;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Show the paywall using RevenueCat's presentPaywall() API
 * 
 * @example
 * // Dismissible paywall
 * showPaywallModal({ source: 'settings_button' });
 * 
 * // Hard paywall (shows discount on dismiss)
 * showPaywallModal({ source: 'onboarding', isHardPaywall: true });
 * 
 * // Discount paywall with specific offering
 * showPaywallModal({ source: 'discount', offeringIdentifier: 'discount', isDiscountPaywall: true });
 */
export type PaywallOutcome = 'purchased' | 'cancelled' | 'error' | 'not_presented';

export async function showPaywallModal(options: PaywallModalOptions = {}): Promise<PaywallOutcome> {
  // Prevent double-showing
  if (_isPaywallShowing) {
    console.log('[Paywall] ⚠️ Paywall already showing, ignoring request');
    return 'not_presented';
  }

  const {
    source = PAYWALL_SOURCES.UNKNOWN,
    isHardPaywall = false,
    isDiscountPaywall = false,
    offeringIdentifier,
    onPurchaseCompleted,
    onDismissed,
  } = options;

  // Check if RevenueCat is initialized
  const isInitialized = revenueCatService.getInitializationStatus();
  if (!isInitialized) {
    console.log('[Paywall] ⚠️ RevenueCat not initialized yet, waiting...');
    const becameReady = await revenueCatService.waitForInitialization(10000);

    if (!becameReady) {
      console.warn('[Paywall] ⚠️ RevenueCat still not initialized, attempting fallback init');
      try {
        await revenueCatService.initialize(undefined, { enableAttribution: false });
      } catch (fallbackError) {
        console.error('[Paywall] ❌ RevenueCat fallback init failed:', fallbackError);
      }
    }

    if (!revenueCatService.getInitializationStatus()) {
      console.error('[Paywall] ❌ RevenueCat not initialized after waiting, cannot show paywall');
      return 'error';
    }

    console.log('[Paywall] ✅ RevenueCat initialized, proceeding with paywall');
  }

  _isPaywallShowing = true;
  let outcome: PaywallOutcome = 'cancelled';
  // Track paywall view
  trackPaywallViewed({
    source,
    paywallType: isHardPaywall ? 'hard' : isDiscountPaywall ? 'discount' : 'soft',
  });

  console.log('[Paywall] 🎯 Presenting paywall', { source, isHardPaywall, isDiscountPaywall, offeringIdentifier });

  try {
    // Pre-validate: fetch offerings to ensure RevenueCat config is valid
    // This prevents Error 23 from leaving a stuck native paywall sheet
    let offering = undefined;
    try {
      const offerings = await Purchases.getOfferings();
      if (offeringIdentifier) {
        offering = offerings.all[offeringIdentifier];
        if (!offering) {
          console.warn(`[Paywall] ⚠️ Offering '${offeringIdentifier}' not found, using default`);
        }
      }
      if (!offerings.current && !offering) {
        console.error('[Paywall] ❌ No offerings available - skipping paywall');
        _isPaywallShowing = false;
        onDismissed?.();
        return 'not_presented';
      }
    } catch (err) {
      console.error('[Paywall] ❌ Failed to fetch offerings - skipping paywall:', err);
      _isPaywallShowing = false;
      onDismissed?.();
      return 'not_presented';
    }

    // Track purchase flow started
    const paywallType = isHardPaywall ? 'hard' : isDiscountPaywall ? 'discount' : 'soft';

    // Present paywall using RevenueCat's imperative API
    const result = await RevenueCatUI.presentPaywall({
      offering,
      displayCloseButton: true, // Always show close button - we handle logic after dismiss
    });

    console.log('[Paywall] 📋 Paywall result:', result);

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        // User purchased or restored
        console.log('[Paywall] ✅ Purchase/Restore completed');
        
        trackPurchaseStarted({ source, productId: 'unknown' });
        resetDismissalCount();
        
        // Track Facebook events for iOS 14+ SKAdNetwork compatibility
        if (result === PAYWALL_RESULT.PURCHASED) {
          try {
            // Get customer info to determine if trial or subscription
            const customerInfo = await Purchases.getCustomerInfo();
            const activeSubscription = customerInfo.activeSubscriptions?.[0] || 'unknown';
            const isMonthly = activeSubscription.toLowerCase().includes('monthly');
            
            // Check if this is a trial
            const entitlements = customerInfo.entitlements?.active || {};
            const premiumEntitlement = entitlements.premium || entitlements.Premium || Object.values(entitlements)[0];
            const isTrial = premiumEntitlement?.periodType === 'TRIAL';

            console.log('[Paywall] 🔍 Trial detection:', {
              activeSubscription,
              entitlementKeys: Object.keys(entitlements),
              periodType: premiumEntitlement?.periodType,
              isTrial,
              hasPremiumEntitlement: !!premiumEntitlement,
            });
            
            // Try to get actual price from the offering/product
            let price = isMonthly ? 9.99 : 49.99; // Fallback prices
            let currency = 'USD';
            let trialDays = 7; // Default fallback
            
            // Get price and product info from offering if available
            if (offering?.availablePackages?.length) {
              const purchasedPackage = offering.availablePackages.find(pkg => 
                pkg.product.identifier === activeSubscription
              ) || offering.availablePackages[0];
              
              if (purchasedPackage?.product) {
                price = purchasedPackage.product.price;
                currency = purchasedPackage.product.currencyCode || 'USD';
                
                // Get trial duration from introPrice if available (more accurate)
                const introPrice = purchasedPackage.product.introPrice;
                if (introPrice?.periodUnit && introPrice?.cycles) {
                  // periodUnit can be: DAY, WEEK, MONTH, YEAR
                  // cycles is the number of periods
                  const periodMultiplier: Record<string, number> = {
                    'DAY': 1,
                    'WEEK': 7,
                    'MONTH': 30,
                    'YEAR': 365,
                  };
                  trialDays = (periodMultiplier[introPrice.periodUnit] || 7) * introPrice.cycles;
                  console.log('[Paywall] Trial duration from introPrice:', { periodUnit: introPrice.periodUnit, cycles: introPrice.cycles, trialDays });
                }
              }
            }
            
            // Fallback: calculate trial duration from entitlement dates if introPrice not available
            if (isTrial && trialDays === 7 && premiumEntitlement?.expirationDate && premiumEntitlement?.originalPurchaseDate) {
              const expiration = new Date(premiumEntitlement.expirationDate);
              const purchase = new Date(premiumEntitlement.originalPurchaseDate);
              const diffMs = expiration.getTime() - purchase.getTime();
              const calculatedDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
              if (calculatedDays > 0 && calculatedDays <= 365) {
                trialDays = calculatedDays;
                console.log('[Paywall] Trial duration from entitlement dates:', trialDays);
              }
            }
            
            if (isTrial) {
              await trackTrialStarted(activeSubscription, trialDays, 0, currency);
              trackTrialStartedFirebase({ productId: activeSubscription, trialDays, source: source || 'unknown', currency });
              TypedStorage.setBoolean('@app_trial_status', true);
              TypedStorage.setNumber('@app_trial_days', trialDays);
              console.log('[Paywall] 📊 Trial Start events logged (Facebook + Firebase):', { trialDays, currency });
            } else {
              await trackSubscriptionStarted(
                activeSubscription,
                isMonthly ? 'Monthly' : 'Yearly',
                price,
                isMonthly ? 'monthly' : 'yearly',
                currency
              );
              console.log('[Paywall] 📊 Facebook Subscribe event logged:', { price, currency });
            }

            // Log purchase_completed with full params (after we have price/currency/trial info)
            trackPurchaseCompleted({
              source,
              productId: activeSubscription,
              price: String(price),
              currency,
              isTrialConversion: isTrial,
            });
          } catch (analyticsError) {
            console.warn('[Paywall] Facebook analytics tracking failed:', analyticsError);
          }
        }
        
        outcome = 'purchased';
        onPurchaseCompleted?.();
        
        if (result === PAYWALL_RESULT.RESTORED) {
          trackRestoreCompleted({ source, hasActiveSubscription: true });
          Alert.alert(
            '✅ Purchases Restored',
            'Your premium subscription has been restored!',
            [{ text: 'Continue' }]
          );
        } else {
          Alert.alert(
            '🎉 Welcome to Premium!',
            'Your subscription is now active. Enjoy all premium features!',
            [{ text: 'Start Using Premium' }]
          );
        }
        break;

      case PAYWALL_RESULT.CANCELLED:
        // User dismissed or cancelled
        console.log('[Paywall] 👋 Paywall dismissed/cancelled');
        
        incrementDismissalCount();
        const dismissalCount = getPaywallDismissalCount();
        
        trackPaywallDismissed({ source, paywallType, dismissalCount });
        trackPurchaseCancelled({ source });

        // Handle hard paywall -> show discount paywall
        if (isHardPaywall) {
          console.log('[Paywall] 🔒 Hard paywall dismissed - showing discount paywall');
          
          _isPaywallShowing = false; // Reset before showing next paywall
          
          // Show discount paywall after small delay
          setTimeout(() => {
            showPaywallModal({
              source: 'hard_paywall_dismissed',
              isDiscountPaywall: true,
              offeringIdentifier: 'discount', // Use discount offering if configured
              onPurchaseCompleted,
              onDismissed,
            });
          }, 300);
          return 'cancelled'; // Don't reset _isPaywallShowing yet
        }

        // Handle discount paywall dismiss -> navigate to Home
        if (isDiscountPaywall) {
          console.log('[Paywall] 🏷️ Discount paywall dismissed - navigating to Home');
          onDismissed?.();
          
          setTimeout(() => {
            navigate('QuranHome');
          }, 100);
          break;
        }

        // Regular soft paywall dismiss
        onDismissed?.();
        // Show interstitial ad after dismissing free paywall
        // Skip fire-and-forget for onboarding — PaywallScreen handles it with blocking ad
        if (source !== PAYWALL_SOURCES.APP_OPEN) {
          // @feature:admob:start
          adMobService.showInterstitialNow();
          // @feature:admob:end
        }
        break;

      case PAYWALL_RESULT.NOT_PRESENTED:
        // Paywall wasn't presented (user already has entitlement)
        console.log('[Paywall] ℹ️ Paywall not presented - user may already be premium');
        outcome = 'not_presented';
        onPurchaseCompleted?.();
        break;

      case PAYWALL_RESULT.ERROR:
        // An error occurred during purchase
        console.error('[Paywall] ❌ Purchase error occurred');
        outcome = 'error';
        trackPurchaseFailed({ source, errorCode: 'paywall_error' });
        Alert.alert(
          'Purchase Error',
          'Something went wrong during the purchase. Please try again.',
          [{ text: 'OK' }]
        );
        onDismissed?.();
        // @feature:admob:start
        adMobService.showInterstitialNow();
        // @feature:admob:end
        break;

      default:
        console.log('[Paywall] ❓ Unknown paywall result:', result);
        onDismissed?.();
        // @feature:admob:start
        adMobService.showInterstitialNow();
        // @feature:admob:end
        break;
    }
  } catch (error: any) {
    console.error('[Paywall] ❌ Error presenting paywall:', error);
    trackPurchaseFailed({ source, errorCode: error.code || 'unknown_error', errorMessage: error.message });
    
    // Handle specific error types
    if (error.code === 'PURCHASE_PENDING') {
      Alert.alert(
        'Purchase Pending',
        'Your purchase is awaiting approval. You\'ll get access once it\'s approved.',
        [{ text: 'OK', onPress: () => onDismissed?.() }]
      );
    } else if (error.code === 'STORE_PROBLEM') {
      Alert.alert(
        'Store Unavailable',
        'The App Store is temporarily unavailable. Please try again later.',
        [{ text: 'OK', onPress: () => onDismissed?.() }]
      );
    } else if (error.code === 'NETWORK_ERROR') {
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK', onPress: () => onDismissed?.() }]
      );
    } else {
      // Configuration errors (Error 23), unknown errors, etc.
      onDismissed?.();
    }
  } finally {
    _isPaywallShowing = false;
  }
  return outcome;
}

/**
 * Hide/dismiss the current paywall
 * Note: With presentPaywall(), the user dismisses via the close button
 */
export function hidePaywallModal(): void {
  // With presentPaywall(), we can't programmatically dismiss
  // This is here for API compatibility
  console.log('[Paywall] ℹ️ hidePaywallModal called - paywall dismisses via user action');
}

/**
 * Check if paywall is currently showing
 */
export function isPaywallShowing(): boolean {
  return _isPaywallShowing;
}

/**
 * Empty component for backward compatibility
 * With presentPaywall(), no component is needed
 */
export const PaywallModal: React.FC = () => null;

export default PaywallModal;
