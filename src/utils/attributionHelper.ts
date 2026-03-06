/**
 * Attribution Setup Helper
 * 
 * This module provides integration between ATT permission and RevenueCat attribution
 * Call this after ATT permission is granted to ensure IDFA is properly tracked
 */

import { setRevenueCatAttribution } from '../services/RevenueCatAttribution';
import { revenueCatService } from '../services/RevenueCatService';
import { isTrackingAuthorized } from '../services/TrackingService';

/**
 * Setup attribution after ATT permission is granted
 * This ensures IDFA and other identifiers are properly sent to RevenueCat
 * 
 * Call this:
 * 1. After ATT permission dialog is accepted
 * 2. On app launch if ATT is already authorized
 * 3. Before/after making a purchase
 */
export const setupAttributionAfterATT = async (): Promise<void> => {
  try {
    console.log('[Attribution Helper] Checking ATT status...');

    // Check if tracking is authorized
    const isAuthorized = await isTrackingAuthorized();
    
    if (!isAuthorized) {
      console.log('[Attribution Helper] ATT not authorized, skipping attribution setup');
      return;
    }

    console.log('[Attribution Helper] ATT authorized, setting up attribution...');

    // Check if RevenueCat is initialized
    const isInitialized = revenueCatService.getInitializationStatus();
    
    if (!isInitialized) {
      console.log('[Attribution Helper] RevenueCat not initialized yet, will be set up on initialization');
      return;
    }

    // Setup attribution
    await revenueCatService.setupAttribution();

    console.log('[Attribution Helper] Attribution setup completed');
  } catch (error) {
    console.error('[Attribution Helper] Error setting up attribution:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Setup attribution when user information becomes available
 * This is useful for setting email, displayName, etc. in RevenueCat
 */
export const setupUserAttributionData = async (userData: {
  userId?: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}): Promise<void> => {
  try {
    console.log('[Attribution Helper] Setting user attributes...');

    const isInitialized = revenueCatService.getInitializationStatus();
    
    if (!isInitialized) {
      console.log('[Attribution Helper] RevenueCat not initialized, skipping user attributes');
      return;
    }

    await revenueCatService.setUserAttributes(userData);

    console.log('[Attribution Helper] User attributes set successfully');
  } catch (error) {
    console.error('[Attribution Helper] Error setting user attributes:', error);
    // Don't throw - this is not critical
  }
};

export default {
  setupAfterATT: setupAttributionAfterATT,
  setupUserData: setupUserAttributionData,
};
