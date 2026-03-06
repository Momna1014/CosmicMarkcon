/**
 * App Tracking Transparency (ATT) Service
 * 
 * Handles requesting tracking permissions on iOS and Android
 * iOS: Uses ATT framework (iOS 14.5+)
 * Android: Uses AD_ID permission (Android 12+)
 */

import { Platform } from 'react-native';
import {
  requestTrackingPermission,
  getTrackingStatus,
  TrackingStatus,
} from 'react-native-tracking-transparency';
import NavigationConfig from '../navigation/NavigationConfig';

// Import attribution helper to setup RevenueCat attribution after ATT
let attributionHelper: any = null;
const getAttributionHelper = async () => {
  if (!attributionHelper) {
    attributionHelper = await import('../utils/attributionHelper');
  }
  return attributionHelper;
};

/**
 * Get ATT Configuration from NavigationConfig
 */
export const ATTConfig = NavigationConfig.tracking;

/**
 * Request tracking permission
 * Shows the ATT prompt on iOS 14.5+
 * On Android, permission is automatically granted if declared in manifest
 */
export async function requestTrackingPermissions(): Promise<TrackingStatus> {
  try {
    console.log('[ATT] requestTrackingPermissions called');
    
    if (!ATTConfig.enabled) {
      console.log('[ATT] Tracking is disabled in config');
      return 'unavailable';
    }

    // Only request on iOS 14.5+
    if (Platform.OS === 'ios') {
      console.log('[ATT] Running on iOS, requesting permission...');
      const status = await requestTrackingPermission();
      console.log('[ATT] iOS Tracking permission status:', status);
      
      // If authorized, setup RevenueCat attribution
      if (status === 'authorized') {
        console.log('[ATT] Permission granted, setting up RevenueCat attribution...');
        const helper = await getAttributionHelper();
        await helper.setupAttributionAfterATT();
      }
      
      return status;
    }

    // On Android, the permission is automatically handled
    // if com.google.android.gms.permission.AD_ID is in manifest
    console.log('[ATT] Running on Android - AD_ID permission declared in manifest');
    
    // Setup attribution on Android too
    const helper = await getAttributionHelper();
    await helper.setupAttributionAfterATT();
    
    return 'authorized';
  } catch (error) {
    console.error('[ATT] Error requesting tracking permission:', error);
    return 'unavailable';
  }
}

/**
 * Get current tracking status
 */
export async function getTrackingPermissionStatus(): Promise<TrackingStatus> {
  try {
    const status = await getTrackingStatus();
    console.log('[ATT] Current tracking status:', status);
    return status;
  } catch (error) {
    console.error('[ATT] Error getting tracking status:', error);
    return 'unavailable';
  }
}

/**
 * Check if tracking is authorized
 */
export async function isTrackingAuthorized(): Promise<boolean> {
  const status = await getTrackingPermissionStatus();
  return status === 'authorized';
}

/**
 * Initialize ATT (call on app launch)
 * Optionally auto-request permission after delay
 * Non-blocking - won't throw errors
 */
export async function initializeATT(): Promise<void> {
  try {
    if (!ATTConfig.enabled) {
      console.log('[ATT] Tracking is disabled');
      return;
    }

    // Get initial status
    const initialStatus = await getTrackingPermissionStatus();
    console.log('[ATT] Initial status:', initialStatus);

    // If already authorized, setup attribution immediately
    if (initialStatus === 'authorized') {
      console.log('[ATT] Already authorized, setting up attribution...');
      const helper = await getAttributionHelper();
      await helper.setupAttributionAfterATT();
    }

    // Auto-request if configured
    if (ATTConfig.autoRequest && initialStatus === 'not-determined') {
      console.log('[ATT] Auto-requesting permission after delay...');
      
      // Wait for delay
      await new Promise<void>(resolve => setTimeout(resolve, ATTConfig.delayMs));
      
      // Request permission (this will also setup attribution if granted)
      await requestTrackingPermissions();
    } else {
      console.log('[ATT] Skipping auto-request (status:', initialStatus, ')');
    }
  } catch (error) {
    console.error('[ATT] Error initializing ATT:', error);
    // Don't throw - just log the error
  }
}

/**
 * Tracking status types:
 * - 'authorized': User has granted permission
 * - 'denied': User has denied permission
 * - 'restricted': Tracking is restricted (parental controls, etc.)
 * - 'not-determined': User hasn't been asked yet
 * - 'unavailable': ATT framework not available (< iOS 14)
 */
export type { TrackingStatus };

export default {
  config: ATTConfig,
  initialize: initializeATT,
  request: requestTrackingPermissions,
  getStatus: getTrackingPermissionStatus,
  isAuthorized: isTrackingAuthorized,
};
