/**
 * RevenueCat Attribution Integration
 * Sends device identifiers and attribution data to RevenueCat
 * This enables proper tracking in RevenueCat dashboard
 */

import Purchases from 'react-native-purchases';
// @feature:adjust:start
import { Adjust } from 'react-native-adjust';
// @feature:adjust:end
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Track if attribution has already been set to avoid duplicate calls
let attributionSetupComplete = false;
let fbAnonIdSet = false;
// @feature:adjust:start
let adjustIdSet = false;
// @feature:adjust:end

/**
 * Set all attribution network IDs in RevenueCat
 * This should be called after ATT permission is granted
 * Safe to call multiple times - will skip if already set
 */
export const setRevenueCatAttribution = async (): Promise<void> => {
  try {
    // Skip if already completed
    if (attributionSetupComplete) {
      console.log('⏭️ [RevenueCat Attribution] Attribution already set, skipping...');
      return;
    }

    console.log('🔍 [RevenueCat Attribution] Starting attribution setup...');

    // Check if RevenueCat is configured
    const isConfigured = await Purchases.isConfigured();
    if (!isConfigured) {
      console.log(
        '⚠️ [RevenueCat Attribution] RevenueCat not configured yet, skipping...'
      );
      return;
    }

    // Set device identifiers
    await setDeviceIdentifiers();

    // Set Adjust ID (only if not already set)
    // @feature:adjust:start
    await setAdjustAttribution();
    // @feature:adjust:end

    // Set Facebook Anonymous ID (only if not already set)
    await setFacebookAttribution();

    attributionSetupComplete = true;
    console.log('✅ [RevenueCat Attribution] Attribution setup completed');
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting attribution:',
      error
    );
  }
};

/**
 * Set device identifiers (IDFA, IDFV) in RevenueCat
 * These are collected automatically by RevenueCat SDK after ATT permission
 */
const setDeviceIdentifiers = async (): Promise<void> => {
  try {
    // RevenueCat automatically collects IDFA and IDFV after ATT permission is granted
    // We just need to ensure collectDeviceIdentifiers is enabled
    await Purchases.collectDeviceIdentifiers();
    console.log('✅ [RevenueCat Attribution] Device identifiers collected');
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error collecting device identifiers:',
      error
    );
  }
};

// ===========================================================================
// Adjust Attribution
// ===========================================================================
// @feature:adjust:start
/**
 * Set Adjust device ID in RevenueCat.
 * The adid may not be available immediately after Adjust.initSdk() — it requires
 * a round-trip to Adjust servers. This function tries once; the main bridge
 * happens in setupAdjust.ts via setAttributionCallback which fires when
 * attribution data (and adid) become available.
 */
const setAdjustAttribution = async (): Promise<void> => {
  if (adjustIdSet) {
    console.log('⏭️ [RevenueCat Attribution] Adjust ID already set, skipping...');
    return;
  }

  try {
    const adid = await new Promise<string | null>((resolve) => {
      Adjust.getAdid((id) => resolve(id));
    });

    if (adid) {
      await Purchases.setAdjustID(adid);
      adjustIdSet = true;
      console.log(`✅ [RevenueCat Attribution] Adjust ID set: ${adid}`);
    } else {
      console.log(
        '⚠️ [RevenueCat Attribution] Adjust ID not available yet (will be set via attribution callback)'
      );
    }
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting Adjust ID:',
      error
    );
  }
};
// @feature:adjust:end

/**
 * Set Facebook Anonymous ID in RevenueCat
 * Uses the same pattern as Noorly project
 * Safe to call multiple times - will skip if already set
 * 
 * IMPORTANT: Facebook Anonymous ID cannot be modified once set in RevenueCat.
 * This is a RevenueCat limitation - the $fbAnonId attribute is immutable.
 */
const setFacebookAttribution = async (): Promise<void> => {
  // Skip if already set - Facebook Anonymous ID cannot be modified once set
  if (fbAnonIdSet) {
    console.log('⏭️ [RevenueCat Attribution] Facebook Anonymous ID already set, skipping...');
    return;
  }

  try {
    // Get Facebook Anonymous ID (matches Noorly implementation)
    const { AppEventsLogger } = await import('react-native-fbsdk-next');
    const anonymousId = await AppEventsLogger.getAnonymousID();

    if (anonymousId) {
      // Set Facebook Anonymous ID in RevenueCat (matches Noorly)
      await Purchases.setFBAnonymousID(anonymousId);
      fbAnonIdSet = true; // Mark as set to prevent future calls
      console.log(
        `✅ [RevenueCat Attribution] Facebook Anonymous ID set: ${anonymousId}`
      );
    } else {
      console.log(
        '⚠️ [RevenueCat Attribution] Facebook Anonymous ID not available'
      );
    }
  } catch (error: any) {
    // If error is about ID already being set, mark as set to prevent retries
    if (error?.message?.includes('cannot be modified') || 
        error?.message?.includes('already set')) {
      fbAnonIdSet = true;
      console.log('⚠️ [RevenueCat Attribution] Facebook Anonymous ID already set on server');
    } else {
      console.error(
        '❌ [RevenueCat Attribution] Error setting Facebook attribution:',
        error
      );
    }
  }
};

/**
 * Set custom user attributes in RevenueCat
 * Useful for additional tracking and segmentation
 */
export const setRevenueCatUserAttributes = async (attributes: {
  userId?: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}): Promise<void> => {
  try {
    console.log('🔍 [RevenueCat Attribution] Setting user attributes...');

    const isConfigured = await Purchases.isConfigured();
    if (!isConfigured) {
      console.log(
        '⚠️ [RevenueCat Attribution] RevenueCat not configured, skipping attributes'
      );
      return;
    }

    // Set user attributes
    const attributesToSet: { [key: string]: string | null } = {};

    if (attributes.email) {
      await Purchases.setEmail(attributes.email);
      attributesToSet['$email'] = attributes.email;
    }

    if (attributes.displayName) {
      await Purchases.setDisplayName(attributes.displayName);
      attributesToSet['$displayName'] = attributes.displayName;
    }

    // Set custom attributes (use $ prefix for standard attributes)
    Object.keys(attributes).forEach((key) => {
      if (
        !['userId', 'email', 'displayName'].includes(key) &&
        attributes[key]
      ) {
        // Add $ prefix if not already present for standard attributes
        const attrKey = key.startsWith('$') ? key : `$${key}`;
        attributesToSet[attrKey] = String(attributes[key]);
      }
    });

    if (Object.keys(attributesToSet).length > 0) {
      await Purchases.setAttributes(attributesToSet);
    }

    console.log(
      '✅ [RevenueCat Attribution] User attributes set:',
      attributesToSet
    );
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting user attributes:',
      error
    );
  }
};

/**
 * Set device and app information in RevenueCat
 * This provides additional context in the RevenueCat dashboard
 */
export const setRevenueCatDeviceInfo = async (): Promise<void> => {
  try {
    console.log('🔍 [RevenueCat Attribution] Setting device info...');

    const isConfigured = await Purchases.isConfigured();
    if (!isConfigured) {
      console.log(
        '⚠️ [RevenueCat Attribution] RevenueCat not configured, skipping device info'
      );
      return;
    }

    // Custom attributes without $ prefix (not standard RevenueCat attributes)
    const deviceInfo = {
      deviceModel: await DeviceInfo.getDeviceId(),
      osVersion: await DeviceInfo.getSystemVersion(),
      appVersion: await DeviceInfo.getVersion(),
      buildNumber: await DeviceInfo.getBuildNumber(),
      carrier: Platform.OS === 'ios' ? await DeviceInfo.getCarrier() : 'N/A',
      deviceName: await DeviceInfo.getDeviceName(),
    };

    await Purchases.setAttributes(deviceInfo);
    console.log('✅ [RevenueCat Attribution] Device info set');
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting device info:',
      error
    );
  }
};
