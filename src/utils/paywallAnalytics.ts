/**
 * Paywall Analytics Utility
 * 
 * Centralized analytics tracking for all paywall-related events.
 * Integrates with your analytics service (Firebase, Amplitude, etc.)
 * 
 * @usage
 * import { trackPaywallViewed, trackPurchaseCompleted } from './paywallAnalytics';
 * 
 * trackPaywallViewed({ source: 'onboarding', paywallType: 'hard' });
 * trackPurchaseCompleted({ source: 'settings', productId: 'yearly_premium' });
 */

import firebaseService from '../services/firebase/FirebaseService';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';
import { PAYWALL_SOURCES, PAYWALL_TYPES, PaywallSource, PaywallType } from '../constants/subscription';

const logFirebaseEvent = (eventName: string, params: Record<string, any>): void => {
  if (!firebaseService.isAnalyticsEnabled()) {
    return;
  }
  firebaseService.logEvent(eventName, params);
};

const logFacebookEvent = (action: () => void): void => {
  if (!facebookAnalytics.canLog()) {
    return;
  }
  action();
};

// ============================================================================
// EVENT NAMES
// ============================================================================

/**
 * All paywall-related analytics event names
 */
export const PAYWALL_EVENTS = {
  // Paywall Lifecycle
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  PAYWALL_CLOSED: 'paywall_closed',
  
  // Purchase Events
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  PURCHASE_FAILED: 'purchase_failed',
  
  // Restore Events
  RESTORE_STARTED: 'restore_started',
  RESTORE_COMPLETED: 'restore_completed',
  RESTORE_FAILED: 'restore_failed',
  
  // Feature Gating
  PREMIUM_FEATURE_BLOCKED: 'premium_feature_blocked',
  PREMIUM_FEATURE_ACCESSED: 'premium_feature_accessed',
  
  // User Journey
  HARD_PAYWALL_SHOWN: 'hard_paywall_shown',
  DISCOUNT_PAYWALL_SHOWN: 'discount_paywall_shown',
  SUBSCRIPTION_STATUS_CHANGED: 'subscription_status_changed',

  // Trial Events
  TRIAL_STARTED: 'trial_started',
  TRIAL_ENDED: 'trial_ended',
} as const;

// ============================================================================
// TRACKING FUNCTIONS
// ============================================================================

interface PaywallViewedParams {
  source: string;
  paywallType?: PaywallType;
  offeringId?: string;
}

/**
 * Track when paywall is viewed/shown
 * Logs to both Firebase AND Facebook for SKAdNetwork compatibility
 */
export function trackPaywallViewed(params: PaywallViewedParams): void {
  const eventParams = {
    source: params.source,
    paywall_type: params.paywallType || PAYWALL_TYPES.SOFT,
    offering_id: params.offeringId || 'default',
    timestamp: Date.now(),
  };
  
  // Log to Firebase
  logFirebaseEvent(PAYWALL_EVENTS.PAYWALL_VIEWED, eventParams);
  
  // Log to Facebook (important for ad attribution)
  logFacebookEvent(() => {
    facebookAnalytics.logViewContent('paywall', params.offeringId || 'default', {
      source: params.source,
      paywall_type: params.paywallType || PAYWALL_TYPES.SOFT,
    });
  });
  
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PAYWALL_VIEWED, eventParams);
}

interface PaywallDismissedParams {
  source: string;
  paywallType?: string;
  dismissalCount?: number;
  timeSpentSeconds?: number;
}

/**
 * Track when paywall is dismissed without purchase
 * Logs to both Firebase AND Facebook
 */
export function trackPaywallDismissed(params: PaywallDismissedParams): void {
  const eventParams = {
    source: params.source,
    paywall_type: params.paywallType || 'soft',
    dismissal_count: params.dismissalCount || 1,
    time_spent_seconds: params.timeSpentSeconds,
    timestamp: Date.now(),
  };
  
  // Log to Firebase
  logFirebaseEvent(PAYWALL_EVENTS.PAYWALL_DISMISSED, eventParams);
  
  // Log to Facebook (custom event for tracking drop-offs)
  logFacebookEvent(() => {
    facebookAnalytics.logCustomEvent('paywall_dismissed', {
      source: params.source,
      dismissal_count: params.dismissalCount || 1,
    });
  });
  
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PAYWALL_DISMISSED, eventParams);
}

interface PurchaseStartedParams {
  source: string;
  productId: string;
  price?: string;
}

/**
 * Track when user starts purchase flow
 */
export function trackPurchaseStarted(params: PurchaseStartedParams): void {
  const eventParams = {
    source: params.source,
    product_id: params.productId,
    price: params.price,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.PURCHASE_STARTED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PURCHASE_STARTED, eventParams);
}

interface PurchaseCompletedParams {
  source: string;
  productId: string;
  price?: string;
  currency?: string;
  isTrialConversion?: boolean;
}

/**
 * Track successful purchase completion
 */
export function trackPurchaseCompleted(params: PurchaseCompletedParams): void {
  const eventParams = {
    source: params.source,
    product_id: params.productId,
    price: params.price,
    currency: params.currency,
    is_trial_conversion: params.isTrialConversion || false,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.PURCHASE_COMPLETED, eventParams);
  
  // Also log as Firebase purchase event for revenue tracking
  if (params.price && params.currency) {
    logFirebaseEvent('purchase', {
      value: parseFloat(params.price) || 0,
      currency: params.currency,
      product_id: params.productId,
    });
  }
  
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PURCHASE_COMPLETED, eventParams);
}

interface PurchaseCancelledParams {
  source: string;
  productId?: string;
}

/**
 * Track when user cancels purchase
 */
export function trackPurchaseCancelled(params: PurchaseCancelledParams): void {
  const eventParams = {
    source: params.source,
    product_id: params.productId,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.PURCHASE_CANCELLED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PURCHASE_CANCELLED, eventParams);
}

interface PurchaseFailedParams {
  source: string;
  productId?: string;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Track purchase failure
 */
export function trackPurchaseFailed(params: PurchaseFailedParams): void {
  const eventParams = {
    source: params.source,
    product_id: params.productId,
    error_message: params.errorMessage,
    error_code: params.errorCode,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.PURCHASE_FAILED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PURCHASE_FAILED, eventParams);
}

interface RestoreStartedParams {
  source: string;
}

/**
 * Track when restore purchases starts
 */
export function trackRestoreStarted(params: RestoreStartedParams): void {
  const eventParams = {
    source: params.source,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.RESTORE_STARTED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.RESTORE_STARTED, eventParams);
}

interface RestoreCompletedParams {
  source: string;
  hasActiveSubscription: boolean;
  productIds?: string[];
}

/**
 * Track restore purchases completion
 */
export function trackRestoreCompleted(params: RestoreCompletedParams): void {
  const eventParams = {
    source: params.source,
    has_active_subscription: params.hasActiveSubscription,
    restored_products: params.productIds?.join(','),
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.RESTORE_COMPLETED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.RESTORE_COMPLETED, eventParams);
}

interface RestoreFailedParams {
  source: string;
  errorMessage?: string;
}

/**
 * Track restore purchases failure
 */
export function trackRestoreFailed(params: RestoreFailedParams): void {
  const eventParams = {
    source: params.source,
    error_message: params.errorMessage,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.RESTORE_FAILED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.RESTORE_FAILED, eventParams);
}

interface FeatureBlockedParams {
  feature: string;
  source: string;
}

/**
 * Track when a premium feature is blocked
 */
export function trackFeatureBlocked(params: FeatureBlockedParams): void {
  const eventParams = {
    feature: params.feature,
    source: params.source,
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.PREMIUM_FEATURE_BLOCKED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.PREMIUM_FEATURE_BLOCKED, eventParams);
}

interface SubscriptionStatusChangedParams {
  previousStatus: 'free' | 'premium' | 'expired';
  newStatus: 'free' | 'premium' | 'expired';
  source?: string;
}

/**
 * Track subscription status changes
 */
export function trackSubscriptionStatusChanged(params: SubscriptionStatusChangedParams): void {
  const eventParams = {
    previous_status: params.previousStatus,
    new_status: params.newStatus,
    source: params.source || 'system',
    timestamp: Date.now(),
  };
  
  logFirebaseEvent(PAYWALL_EVENTS.SUBSCRIPTION_STATUS_CHANGED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.SUBSCRIPTION_STATUS_CHANGED, eventParams);
}

// ============================================================================
// TRIAL EVENTS
// ============================================================================

interface TrialStartedParams {
  productId: string;
  trialDays: number;
  source: string;
  currency?: string;
}

interface TrialEndedParams {
  productId: string;
  reason: 'converted' | 'expired';
  trialDays?: number;
}

/**
 * Track when a user starts a free trial
 */
export function trackTrialStartedFirebase(params: TrialStartedParams): void {
  const eventParams = {
    product_id: params.productId,
    trial_days: params.trialDays,
    source: params.source,
    currency: params.currency || 'USD',
    timestamp: Date.now(),
  };

  logFirebaseEvent(PAYWALL_EVENTS.TRIAL_STARTED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.TRIAL_STARTED, eventParams);
}

/**
 * Track when a free trial ends (converted to paid or expired)
 */
export function trackTrialEnded(params: TrialEndedParams): void {
  const eventParams = {
    product_id: params.productId,
    reason: params.reason,
    trial_days: params.trialDays || 0,
    timestamp: Date.now(),
  };

  logFirebaseEvent(PAYWALL_EVENTS.TRIAL_ENDED, eventParams);
  console.log('[PaywallAnalytics] Tracked:', PAYWALL_EVENTS.TRIAL_ENDED, eventParams);
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  PAYWALL_EVENTS,
  trackPaywallViewed,
  trackPaywallDismissed,
  trackPurchaseStarted,
  trackPurchaseCompleted,
  trackPurchaseCancelled,
  trackPurchaseFailed,
  trackRestoreStarted,
  trackRestoreCompleted,
  trackRestoreFailed,
  trackFeatureBlocked,
  trackSubscriptionStatusChanged,
  trackTrialStartedFirebase,
  trackTrialEnded,
};
