/**
 * First Launch Helper
 * 
 * Utility to detect and manage first app launch state.
 * Used to determine whether to show User Centric consent screen.
 * 
 * @module firstLaunchHelper
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = '@app_first_launch_completed';

/**
 * Check if this is the first app launch
 * @returns {Promise<boolean>} true if first launch, false otherwise
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    return hasLaunched === null;
  } catch (error) {
    console.error('[FirstLaunch] Error checking first launch:', error);
    // If we can't determine, assume it's not first launch (safer)
    return false;
  }
};

/**
 * Mark first launch as completed
 * Call this after User Centric consent is handled
 */
export const markFirstLaunchCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
    console.log('[FirstLaunch] First launch marked as completed');
  } catch (error) {
    console.error('[FirstLaunch] Error marking first launch:', error);
  }
};

/**
 * Reset first launch state (useful for testing)
 * Only use in development/testing
 */
export const resetFirstLaunch = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
    console.log('[FirstLaunch] First launch state reset');
  } catch (error) {
    console.error('[FirstLaunch] Error resetting first launch:', error);
  }
};
