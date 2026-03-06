/**
 * RevenueCat Attribution Integration
 * Sends device identifiers and attribution data to RevenueCat
 * This enables proper tracking in RevenueCat dashboard
 */

import Purchases from 'react-native-purchases';
import appsFlyer from 'react-native-appsflyer';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Set all attribution network IDs in RevenueCat
 * This should be called after ATT permission is granted
 */
export const setRevenueCatAttribution = async (): Promise<void> => {
  try {
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

    // Set AppsFlyer ID
    await setAppsFlyerAttribution();

    // Set Facebook Anonymous ID (if available)
    await setFacebookAttribution();

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

/**
 * Set AppsFlyer ID in RevenueCat
 * Uses the same pattern as Noorly project
 */
const setAppsFlyerAttribution = async (): Promise<void> => {
  try {
    // Get AppsFlyer UID using Promise wrapper (matches Noorly implementation)
    const getAppsFlyerUIDPromise = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        appsFlyer.getAppsFlyerUID((error, uid) => {
          if (error) {
            reject(error);
          } else {
            resolve(uid || '');
          }
        });
      });
    };

    const appsFlyerUID = await getAppsFlyerUIDPromise();

    if (appsFlyerUID) {
      // Set as attribute (matches Noorly: uses $appsflyerId with dollar sign)
      await Purchases.setAttributes({
        $appsflyerId: appsFlyerUID,
      });
      console.log(
        `✅ [RevenueCat Attribution] AppsFlyer ID set: ${appsFlyerUID}`
      );
    } else {
      console.log(
        '⚠️ [RevenueCat Attribution] AppsFlyer UID not available yet'
      );
    }

    // Listen for conversion data
    appsFlyer.onInstallConversionData((data) => {
      console.log(
        '📊 [RevenueCat Attribution] AppsFlyer conversion data:',
        data
      );

      // Set attribution data as attributes
      if (data && data.data) {
        const conversionData = data.data;
        Purchases.setAttributes({
          $mediaSource: conversionData.media_source || 'organic',
          $campaign: conversionData.campaign || '',
          $adGroup: conversionData.adgroup || '',
          $ad: conversionData.ad_id || '',
        }).catch((error) => {
          console.error(
            '❌ [RevenueCat Attribution] Error setting AppsFlyer attributes:',
            error
          );
        });
      }
    });
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting AppsFlyer ID:',
      error
    );
  }
};

/**
 * Set Facebook Anonymous ID in RevenueCat
 * Uses the same pattern as Noorly project
 */
const setFacebookAttribution = async (): Promise<void> => {
  try {
    // Get Facebook Anonymous ID (matches Noorly implementation)
    const { AppEventsLogger } = await import('react-native-fbsdk-next');
    const anonymousId = await AppEventsLogger.getAnonymousID();

    if (anonymousId) {
      // Set Facebook Anonymous ID in RevenueCat (matches Noorly)
      await Purchases.setFBAnonymousID(anonymousId);
      console.log(
        `✅ [RevenueCat Attribution] Facebook Anonymous ID set: ${anonymousId}`
      );
    } else {
      console.log(
        '⚠️ [RevenueCat Attribution] Facebook Anonymous ID not available'
      );
    }
  } catch (error) {
    console.error(
      '❌ [RevenueCat Attribution] Error setting Facebook attribution:',
      error
    );
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
