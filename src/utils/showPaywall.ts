/**
 * showPaywall Utility
 * 
 * Comprehensive paywall utilities for triggering paywalls from anywhere in the app.
 * Supports multiple paywall types: soft, hard, and discount paywalls.
 * Uses PaywallModal (RevenueCat presentPaywall API) for all paywall presentations.
 * 
 * @example
 * // Basic usage
 * showPaywall('settings_button');
 * 
 * // With PaywallModal (recommended)
 * import { showPaywallModal } from '../components/PaywallModal/PaywallModal';
 * showPaywallModal({ source: 'onboarding', isHardPaywall: true });
 * 
 * // Feature gating
 * checkPremiumFeature(isPremium, 'audio_playback', playAudio, 'SurahDetail');
 */

import { createMMKV } from 'react-native-mmkv';
import { 
  PAYWALL_SOURCES, 
  PAYWALL_RULES, 
  SUBSCRIPTION_STORAGE_KEYS,
  PREMIUM_FEATURES,
  type PaywallSource,
  type PremiumFeature,
} from '../constants/subscription';
import { trackFeatureBlocked } from './paywallAnalytics';

// Initialize MMKV storage for paywall state
const storage = createMMKV({ id: 'paywall-storage' });

// ============================================================================
// DISMISSAL COUNT TRACKING
// ============================================================================

/**
 * Get the number of times the paywall has been dismissed
 */
export function getPaywallDismissalCount(): number {
  return storage.getNumber(SUBSCRIPTION_STORAGE_KEYS.DISMISSAL_COUNT) || 0;
}

/**
 * Increment the dismissal count
 */
export function incrementDismissalCount(): number {
  const currentCount = getPaywallDismissalCount();
  const newCount = currentCount + 1;
  storage.set(SUBSCRIPTION_STORAGE_KEYS.DISMISSAL_COUNT, newCount);
  console.log(`[Paywall] Dismissal count: ${currentCount} -> ${newCount}`);
  return newCount;
}

/**
 * Reset the dismissal count (call after successful purchase)
 */
export function resetDismissalCount(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.DISMISSAL_COUNT, 0);
  console.log('[Paywall] Dismissal count reset to 0');
}

/**
 * Check if user should see discount paywall based on dismissal count
 */
export function shouldShowDiscountPaywall(): boolean {
  const count = getPaywallDismissalCount();
  return count >= PAYWALL_RULES.DISMISSALS_BEFORE_DISCOUNT;
}

// ============================================================================
// ONBOARDING PAYWALL TRACKING
// ============================================================================

/**
 * Check if onboarding paywall has been shown
 */
export function hasSeenOnboardingPaywall(): boolean {
  return storage.getBoolean(SUBSCRIPTION_STORAGE_KEYS.ONBOARDING_PAYWALL_SEEN) || false;
}

/**
 * Mark onboarding paywall as seen
 */
export function markOnboardingPaywallSeen(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.ONBOARDING_PAYWALL_SEEN, true);
  console.log('[Paywall] Onboarding paywall marked as seen');
}

/**
 * Reset onboarding paywall flag (for testing)
 */
export function resetOnboardingPaywallFlag(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.ONBOARDING_PAYWALL_SEEN, false);
  console.log('[Paywall] Onboarding paywall flag reset');
}

// ============================================================================
// PENDING PAYWALL ON HOME (MMKV-based approach)
// ============================================================================

/**
 * Set flag to show paywall when user lands on QuranHome
 * Called after onboarding completion
 */
export function setPendingPaywallOnHome(shouldShow: boolean): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.SHOW_PAYWALL_ON_HOME, shouldShow);
  console.log(`[Paywall] Pending paywall on home set to: ${shouldShow}`);
}

/**
 * Check if paywall should be shown on QuranHome
 */
export function shouldShowPaywallOnHome(): boolean {
  return storage.getBoolean(SUBSCRIPTION_STORAGE_KEYS.SHOW_PAYWALL_ON_HOME) || false;
}

/**
 * Clear pending paywall flag (call after showing paywall)
 */
export function clearPendingPaywallOnHome(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.SHOW_PAYWALL_ON_HOME, false);
  console.log('[Paywall] Pending paywall on home cleared');
}

// ============================================================================
// SESSION-BASED PAYWALL TRACKING (Show once per app session)
// ============================================================================

// Module-level session ID that changes on each app start
const currentSessionId = Date.now().toString();

/**
 * Check if paywall should be shown this session
 * Returns false if paywall was already shown this app session
 * Session resets when app is completely closed and reopened
 */
export function shouldShowPaywallThisSession(): boolean {
  const storedSessionId = storage.getString(SUBSCRIPTION_STORAGE_KEYS.APP_SESSION_ID);
  const paywallShown = storage.getBoolean(SUBSCRIPTION_STORAGE_KEYS.PAYWALL_SHOWN_THIS_SESSION) || false;
  
  // If session ID changed (app was restarted), paywall hasn't been shown yet
  if (storedSessionId !== currentSessionId) {
    console.log('[Paywall] New app session detected, paywall not shown yet');
    return false; // Paywall NOT shown yet this session (should show)
  }
  
  // Same session, check if paywall was already shown
  console.log(`[Paywall] Same session, paywall shown: ${paywallShown}`);
  return paywallShown; // Returns true if already shown (should NOT show again)
}

/**
 * Mark paywall as shown for this app session
 * Call this when paywall is displayed to user
 */
export function markPaywallShownThisSession(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.APP_SESSION_ID, currentSessionId);
  storage.set(SUBSCRIPTION_STORAGE_KEYS.PAYWALL_SHOWN_THIS_SESSION, true);
  console.log(`[Paywall] Marked paywall as shown for session: ${currentSessionId}`);
}

/**
 * Reset session paywall flag (for testing purposes)
 */
export function resetSessionPaywallFlag(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.PAYWALL_SHOWN_THIS_SESSION, false);
  console.log('[Paywall] Session paywall flag reset');
}

// ============================================================================
// POST-ONBOARDING PERMISSIONS COMPLETION TRACKING
// ============================================================================

/**
 * Mark that post-onboarding permissions (ATT/notifications) are complete
 * Call this after notification permissions are requested
 */
export function setPermissionsComplete(isComplete: boolean): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.PERMISSIONS_COMPLETE, isComplete);
  console.log(`[Paywall] Permissions complete set to: ${isComplete}`);
}

/**
 * Check if post-onboarding permissions are complete
 */
export function arePermissionsComplete(): boolean {
  return storage.getBoolean(SUBSCRIPTION_STORAGE_KEYS.PERMISSIONS_COMPLETE) || false;
}

/**
 * Clear permissions complete flag (call when starting new onboarding flow)
 */
export function clearPermissionsComplete(): void {
  storage.set(SUBSCRIPTION_STORAGE_KEYS.PERMISSIONS_COMPLETE, false);
  console.log('[Paywall] Permissions complete flag cleared');
}

// ============================================================================
// PAYWALL SHOW FUNCTIONS
// ============================================================================

// Import showPaywallModal dynamically to avoid circular dependency
let _showPaywallModal: any = null;

function getShowPaywallModal() {
  if (!_showPaywallModal) {
    try {
      const module = require('../components/PaywallModal/PaywallModal');
      _showPaywallModal = module.showPaywallModal;
    } catch (e) {
      console.warn('[Paywall] PaywallModal not available');
    }
  }
  return _showPaywallModal;
}

/**
 * Show the paywall using PaywallModal (RevenueCat presentPaywall API)
 * 
 * @param source - Where the paywall was triggered from (for analytics)
 * @param _navigation - Deprecated: no longer used (kept for backward compatibility)
 */
export function showPaywall(source?: string, _navigation?: any): void {
  const showModal = getShowPaywallModal();
  
  if (showModal) {
    showModal({
      source: source || PAYWALL_SOURCES.UNKNOWN,
      isHardPaywall: false,
      isDiscountPaywall: false,
    });
    console.log(`[Paywall] Soft paywall triggered from: ${source || 'unknown'}`);
  } else {
    console.error('[Paywall] PaywallModal not available - cannot show paywall');
  }
}

/**
 * Show hard paywall (uncloseable - shows discount on dismiss)
 * 
 * @param source - Where the paywall was triggered from (for analytics)
 */
export function showHardPaywall(source?: string): void {
  const showModal = getShowPaywallModal();
  
  if (showModal) {
    showModal({
      source: source || PAYWALL_SOURCES.UNKNOWN,
      isHardPaywall: true,
      isDiscountPaywall: false,
    });
    console.log(`[Paywall] Hard paywall triggered from: ${source || 'unknown'}`);
  } else {
    console.warn('[Paywall] PaywallModal not available for hard paywall');
    showPaywall(source);
  }
}

/**
 * Show discount paywall
 * 
 * @param source - Where the paywall was triggered from (for analytics)
 */
export function showDiscountPaywall(source?: string): void {
  const showModal = getShowPaywallModal();
  
  if (showModal) {
    showModal({
      source: source || PAYWALL_SOURCES.DISCOUNT_OFFER,
      isHardPaywall: false,
      isDiscountPaywall: true,
    });
    console.log(`[Paywall] Discount paywall triggered from: ${source || 'unknown'}`);
  } else {
    console.warn('[Paywall] PaywallModal not available for discount paywall');
    showPaywall(source);
  }
}

/**
 * Show onboarding paywall (hard paywall after onboarding)
 * 
 * @param forceShow - If true, show even if already seen
 */
export function showOnboardingPaywall(forceShow: boolean = false): void {
  // Check if already shown (unless forced)
  if (!forceShow && hasSeenOnboardingPaywall()) {
    console.log('[Paywall] Onboarding paywall already shown, skipping');
    return;
  }

  const showModal = getShowPaywallModal();
  
  if (showModal) {
    // Mark as seen
    markOnboardingPaywallSeen();
    
    showModal({
      source: PAYWALL_SOURCES.ONBOARDING_COMPLETE,
      isHardPaywall: true,
      isDiscountPaywall: false,
      onPurchaseCompleted: () => {
        console.log('[Paywall] 🎉 User subscribed after onboarding!');
      },
      onDismissed: () => {
        console.log('[Paywall] User dismissed onboarding paywall');
      },
    });
    console.log('[Paywall] Onboarding paywall triggered');
  } else {
    console.warn('[Paywall] PaywallModal not available for onboarding paywall');
    showPaywall(PAYWALL_SOURCES.ONBOARDING_COMPLETE);
  }
}

/**
 * Check if user should see paywall for a specific feature
 */
export function shouldShowPaywall(isPremium: boolean, feature?: string): boolean {
  if (isPremium) {
    return false;
  }

  // All features require premium if not premium
  return true;
}

/**
 * Show paywall conditionally based on premium status
 * 
 * @param isPremium - Current premium status
 * @param source - Where the paywall was triggered from
 * @param onPremium - Callback to execute if user is premium
 * @param navigation - Optional navigation object
 * @returns true if paywall was shown, false if user is premium
 */
export function showPaywallIfNeeded(
  isPremium: boolean,
  source: string,
  onPremium?: () => void,
  navigation?: any,
): boolean {
  if (shouldShowPaywall(isPremium)) {
    showPaywall(source, navigation);
    return true;
  } else {
    onPremium?.();
    return false;
  }
}

// ============================================================================
// FEATURE GATING
// ============================================================================

/**
 * Check premium status and either execute action or show paywall
 * 
 * @param isPremium - User's premium status
 * @param feature - The premium feature being accessed
 * @param onAllowed - Callback when user has access
 * @param source - Source screen/component for analytics
 * @param showPaywallFn - Optional custom paywall show function
 * 
 * @example
 * checkPremiumFeature(
 *   isPremium,
 *   'audio_playback',
 *   () => playAudio(),
 *   'SurahDetail'
 * );
 */
export function checkPremiumFeature(
  isPremium: boolean,
  feature: PremiumFeature,
  onAllowed: () => void,
  source: string,
  showPaywallFn?: (source: string) => void,
): boolean {
  if (isPremium) {
    onAllowed();
    return true; // Feature accessed
  }

  // Track that feature was blocked
  trackFeatureBlocked({ feature, source });

  // Show paywall
  if (showPaywallFn) {
    showPaywallFn(source);
  } else {
    showPaywall(source);
  }

  return false; // Feature blocked
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Dismissal tracking
  getPaywallDismissalCount,
  incrementDismissalCount,
  resetDismissalCount,
  shouldShowDiscountPaywall,
  
  // Onboarding tracking
  hasSeenOnboardingPaywall,
  markOnboardingPaywallSeen,
  resetOnboardingPaywallFlag,
  
  // Pending paywall on home
  setPendingPaywallOnHome,
  shouldShowPaywallOnHome,
  clearPendingPaywallOnHome,
  
  // Session-based paywall tracking
  shouldShowPaywallThisSession,
  markPaywallShownThisSession,
  resetSessionPaywallFlag,
  
  // Permissions completion tracking
  setPermissionsComplete,
  arePermissionsComplete,
  clearPermissionsComplete,
  
  // Paywall functions
  showPaywall,
  showHardPaywall,
  showDiscountPaywall,
  showOnboardingPaywall,
  shouldShowPaywall,
  showPaywallIfNeeded,
  checkPremiumFeature,
};
