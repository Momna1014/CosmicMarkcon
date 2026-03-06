/**
 * Drawer Navigation Utilities
 * 
 * Helper functions for managing drawer navigation behavior
 */

import NavigationConfig from '../navigation/NavigationConfig';

/**
 * Check if drawer should be disabled on a specific screen
 * 
 * @param screenName - Name of the screen to check
 * @returns true if drawer should be disabled on this screen
 */
export function isDrawerDisabledOnScreen(screenName: string): boolean {
  if (!NavigationConfig.enableDrawer) {
    return true; // Drawer is globally disabled
  }
  
  return NavigationConfig.disableDrawerScreens.includes(screenName);
}

/**
 * Check if drawer swipe gesture should be enabled on a specific screen
 * 
 * @param screenName - Name of the screen to check
 * @returns true if swipe gesture should be enabled
 */
export function isSwipeEnabledOnScreen(screenName: string): boolean {
  if (!NavigationConfig.enableDrawer) {
    return false;
  }
  
  if (NavigationConfig.disableDrawerScreens.includes(screenName)) {
    return false;
  }
  
  return NavigationConfig.drawer.swipeEnabled;
}

/**
 * Get drawer lock mode for a specific screen
 * 
 * @param screenName - Name of the screen to check
 * @returns 'locked-closed' | 'unlocked'
 */
export function getDrawerLockMode(screenName: string): 'locked-closed' | 'unlocked' {
  if (isDrawerDisabledOnScreen(screenName)) {
    return 'locked-closed';
  }
  
  return 'unlocked';
}

/**
 * Check if drawer is enabled globally
 */
export function isDrawerEnabled(): boolean {
  return NavigationConfig.enableDrawer;
}

export default {
  isDrawerDisabledOnScreen,
  isSwipeEnabledOnScreen,
  getDrawerLockMode,
  isDrawerEnabled,
};
