/**
 * Consent-Dependent Initializer
 *
 * Phase 3: Initializes SDKs that require user consent.
 * Only runs after consent has been collected in Phase 2.
 *
 * SDKs included:
 * - ATT (App Tracking Transparency - iOS only)
 * - Facebook SDK
 * - Firebase Analytics
 * - AppsFlyer
 * - AppLovin MAX
 *
 * @module ConsentDependentInitializer
 */

import { Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';

import { facebookAnalytics } from '../FacebookAnalyticsService';
import { appsFlyerService } from '../AppsFlyerService';
import { appLovinService } from '../AppLovinService';
import { requestTrackingPermissions, getTrackingPermissionStatus } from '../TrackingService';
import firebaseService from '../firebase/FirebaseService';
import env from '../../config/env';

import {
  InitPhase,
  SDKInitStatus,
  SDKInitResult,
  ConsentInitResult,
  ConsentDependentConfig,
  ATTStatus,
} from './types';

const LOG_PREFIX = '[ConsentDependent]';

/**
 * Request ATT (App Tracking Transparency) permission
 * iOS only - on Android returns 'authorized' automatically
 */
async function requestATT(debug: boolean): Promise<{ result: SDKInitResult; status: ATTStatus }> {
  const startTime = Date.now();

  if (Platform.OS !== 'ios') {
    if (debug) console.log(`${LOG_PREFIX} ATT skipped - not iOS`);
    return {
      result: {
        sdkId: 'att',
        status: SDKInitStatus.SKIPPED,
        duration: Date.now() - startTime,
      },
      status: 'authorized', // Android automatically authorized
    };
  }

  try {
    const status = await requestTrackingPermissions();
    if (debug) console.log(`${LOG_PREFIX} ATT status: ${status}`);

    return {
      result: {
        sdkId: 'att',
        status: SDKInitStatus.INITIALIZED,
        duration: Date.now() - startTime,
      },
      status: status as ATTStatus,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ ATT request failed:`, error);
    return {
      result: {
        sdkId: 'att',
        status: SDKInitStatus.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
      },
      status: 'unavailable',
    };
  }
}

/**
 * Initialize Facebook SDK
 */
async function initializeFacebook(
  accepted: boolean,
  debug: boolean,
): Promise<SDKInitResult> {
  const startTime = Date.now();

  if (!accepted) {
    if (debug) console.log(`${LOG_PREFIX} Facebook disabled - consent not accepted`);
    return {
      sdkId: 'facebook',
      status: SDKInitStatus.DISABLED,
      duration: Date.now() - startTime,
    };
  }

  try {
    await facebookAnalytics.initialize();

    if (debug) console.log(`${LOG_PREFIX} ✅ Facebook initialized`);
    return {
      sdkId: 'facebook',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Facebook initialization failed:`, error);
    return {
      sdkId: 'facebook',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Configure Firebase Analytics
 */
async function configureFirebaseAnalytics(
  accepted: boolean,
  debug: boolean,
): Promise<SDKInitResult> {
  const startTime = Date.now();

  try {
    await analytics().setAnalyticsCollectionEnabled(accepted);

    if (debug) {
      console.log(
        `${LOG_PREFIX} Firebase Analytics ${accepted ? '✅ enabled' : '⛔ disabled'}`,
      );
    }

    // Log app_open event when consent is accepted
    if (accepted) {
      console.log(`${LOG_PREFIX} 📊 Logging Firebase app_open event`);
      await firebaseService.logAppOpen();
    }

    return {
      sdkId: 'firebaseAnalytics',
      status: accepted ? SDKInitStatus.INITIALIZED : SDKInitStatus.DISABLED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Firebase Analytics configuration failed:`, error);
    return {
      sdkId: 'firebaseAnalytics',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize AppsFlyer
 */
async function initializeAppsFlyer(
  accepted: boolean,
  debug: boolean,
): Promise<SDKInitResult> {
  const startTime = Date.now();

  try {
    // Check if already initialized
    if (appsFlyerService.getIsInitialized?.()) {
      // Update opt-out status
      appsFlyerService.setOptOut?.(!accepted);
      if (debug) console.log(`${LOG_PREFIX} AppsFlyer opt-out updated: ${!accepted}`);
      return {
        sdkId: 'appsFlyer',
        status: SDKInitStatus.INITIALIZED,
        duration: Date.now() - startTime,
      };
    }

    // Check for required config
    if (!env.APPSFLYER_DEV_KEY || env.APPSFLYER_DEV_KEY.includes('YOUR_')) {
      if (debug) console.log(`${LOG_PREFIX} AppsFlyer skipped - no dev key`);
      return {
        sdkId: 'appsFlyer',
        status: SDKInitStatus.SKIPPED,
        duration: Date.now() - startTime,
      };
    }

    // Log AppsFlyer configuration
    console.log(`${LOG_PREFIX} 🔑 AppsFlyer Configuration:`);
    console.log(`${LOG_PREFIX}   - Dev Key: ${env.APPSFLYER_DEV_KEY}`);
    console.log(`${LOG_PREFIX}   - App ID (iOS): ${env.APPSFLYER_APP_ID}`);
    console.log(`${LOG_PREFIX}   - Platform: ${Platform.OS}`);
    console.log(`${LOG_PREFIX}   - Debug Mode: ${__DEV__}`);

    // Initialize
    await appsFlyerService.initialize({
      devKey: env.APPSFLYER_DEV_KEY,
      appId: env.APPSFLYER_APP_ID,
      isDebug: __DEV__,
      onInstallConversionDataListener: true,
      onDeepLinkListener: true,
    });

    // Set privacy based on consent
    if (!accepted) {
      appsFlyerService.setOptOut?.(true);
    } else {
      appsFlyerService.logAppOpen?.();
    }

    if (debug) console.log(`${LOG_PREFIX} ✅ AppsFlyer initialized`);
    return {
      sdkId: 'appsFlyer',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ AppsFlyer initialization failed:`, error);
    return {
      sdkId: 'appsFlyer',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize AppLovin MAX
 */
async function initializeAppLovin(
  accepted: boolean,
  attStatus: ATTStatus,
  debug: boolean,
): Promise<SDKInitResult> {
  const startTime = Date.now();

  try {
    const hasFullConsent = accepted && (Platform.OS !== 'ios' || attStatus === 'authorized');

    // Check for required config
    if (!env.APPLOVIN_SDK_KEY || env.APPLOVIN_SDK_KEY === 'YOUR_SDK_KEY_HERE') {
      if (debug) console.log(`${LOG_PREFIX} AppLovin skipped - no SDK key`);
      return {
        sdkId: 'appLovin',
        status: SDKInitStatus.SKIPPED,
        duration: Date.now() - startTime,
      };
    }

    await appLovinService.initialize({
      sdkKey: env.APPLOVIN_SDK_KEY,
      testMode: __DEV__,
      verboseLogging: debug,
      hasUserConsent: hasFullConsent,
      doNotSell: !accepted,
    });

    // Preload ads
    appLovinService.preloadAds?.();

    if (debug) console.log(`${LOG_PREFIX} ✅ AppLovin initialized (consent: ${hasFullConsent})`);
    return {
      sdkId: 'appLovin',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ AppLovin initialization failed:`, error);
    return {
      sdkId: 'appLovin',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize all consent-dependent SDKs
 * This is Phase 3 of the SDK initialization flow
 * 
 * PERFORMANCE OPTIMIZED:
 * - ATT requested first (required for other SDKs)
 * - All other SDKs initialize in parallel using Promise.all()
 * - Non-blocking - runs in background
 */
export async function initializeConsentDependentSDKs(
  config: ConsentDependentConfig,
): Promise<ConsentInitResult> {
  const startTime = Date.now();
  const debug = config.debugLogging ?? __DEV__;

  const accepted =
    config.consentDecision === 'accepted' ||
    config.consentDecision === 'region-not-required';

  if (debug) {
    console.log(`${LOG_PREFIX} 🚀 Starting Phase 3: Consent-Dependent SDKs (parallel)`);
    console.log(`${LOG_PREFIX} Consent accepted: ${accepted}`);
  }

  let attStatus: ATTStatus = 'unavailable';
  const sdkResults: SDKInitResult[] = [];

  try {
    // Step 1: Request ATT FIRST (iOS only, required before other tracking SDKs)
    if (accepted && !config.skipATT) {
      const attResult = await requestATT(debug);
      attStatus = attResult.status;
      sdkResults.push(attResult.result);
    } else {
      // Skip ATT
      attStatus = Platform.OS === 'ios' ? 'denied' : 'authorized';
      sdkResults.push({
        sdkId: 'att',
        status: SDKInitStatus.SKIPPED,
      });
    }

    // Step 2: ⚡ Initialize ALL OTHER SDKs in PARALLEL
    // Promise.all() runs all at once for maximum speed
    const parallelResults = await Promise.all([
      initializeFacebook(accepted, debug),
      configureFirebaseAnalytics(accepted, debug),
      initializeAppsFlyer(accepted, debug),
      initializeAppLovin(accepted, attStatus, debug),
    ]);

    sdkResults.push(...parallelResults);

    const trackingEnabled =
      accepted && (Platform.OS !== 'ios' || attStatus === 'authorized');

    if (debug) {
      const successCount = sdkResults.filter(
        r =>
          r.status === SDKInitStatus.INITIALIZED ||
          r.status === SDKInitStatus.SKIPPED ||
          r.status === SDKInitStatus.DISABLED,
      ).length;
      const duration = Date.now() - startTime;
      console.log(
        `${LOG_PREFIX} ✅ Phase 3 complete: ${successCount}/${sdkResults.length} SDKs (${duration}ms)`,
      );
      console.log(`${LOG_PREFIX} Tracking enabled: ${trackingEnabled}`);
    }

    return {
      phase: InitPhase.CONSENT_DEPENDENT,
      success: true,
      sdkResults,
      attStatus,
      trackingEnabled,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Phase 3 failed:`, error);
    return {
      phase: InitPhase.CONSENT_DEPENDENT,
      success: false,
      sdkResults,
      attStatus,
      trackingEnabled: false,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Disable all tracking SDKs
 * Call this when user revokes consent
 */
export async function disableAllTracking(debug = __DEV__): Promise<void> {
  if (debug) console.log(`${LOG_PREFIX} ⛔ Disabling all tracking...`);

  try {
    // Disable Firebase Analytics
    await analytics().setAnalyticsCollectionEnabled(false);

    // Opt out of AppsFlyer
    appsFlyerService.setOptOut?.(true);

    // Disable Facebook tracking
    facebookAnalytics.setEnabled?.(false);

    if (debug) console.log(`${LOG_PREFIX} ✅ All tracking disabled`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error disabling tracking:`, error);
  }
}

/**
 * Get current ATT status without requesting
 */
export async function getATTStatus(): Promise<ATTStatus> {
  if (Platform.OS !== 'ios') {
    return 'authorized';
  }

  try {
    const status = await getTrackingPermissionStatus();
    return status as ATTStatus;
  } catch (error) {
    return 'unavailable';
  }
}
