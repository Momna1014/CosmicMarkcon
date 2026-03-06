/**
 * showPaywall Utility
 * 
 * Trigger the paywall screen from anywhere in the app
 * Works with NavigationService or passed navigation object
 */

import * as NavigationService from '../navigation/NavigationService';

/**
 * Show the paywall screen
 * 
 * @param source - Where the paywall was triggered from (for analytics)
 * @param navigation - Optional navigation object (if available in component)
 * 
 * Usage:
 * - From any component: showPaywall('settings_button')
 * - With navigation prop: showPaywall('home_cta', navigation)
 */
export function showPaywall(source?: string, navigation?: any) {
  const params = source ? {source} : undefined;

  if (navigation && navigation.navigate) {
    // Use passed navigation object if available
    navigation.navigate('Paywall', params);
  } else {
    // Use global navigation service
    NavigationService.navigate('Paywall', params);
  }

  // console.log(`Paywall triggered from: ${source || 'unknown'}`);
}

/**
 * Check if user should see paywall
 * Can be expanded with more sophisticated logic
 */
export function shouldShowPaywall(isPremium: boolean, feature?: string): boolean {
  // Basic logic: show paywall if not premium
  if (!isPremium) {
    return true;
  }

  // Future: Add feature-specific checks
  // if (feature === 'advanced_analytics' && !isPremium) return true;

  return false;
}

/**
 * Show paywall conditionally based on premium status
 * 
 * @param isPremium - Current premium status
 * @param source - Where the paywall was triggered from
 * @param onPremium - Callback to execute if user is premium
 * @param navigation - Optional navigation object
 */
export function showPaywallIfNeeded(
  isPremium: boolean,
  source: string,
  onPremium?: () => void,
  navigation?: any,
) {
  if (shouldShowPaywall(isPremium)) {
    showPaywall(source, navigation);
    return true; // Paywall was shown
  } else {
    onPremium?.();
    return false; // User is premium, execute callback
  }
}

export default {
  showPaywall,
  shouldShowPaywall,
  showPaywallIfNeeded,
};
