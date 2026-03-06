/**
 * Critical Services Initializer
 *
 * Phase 1: Initializes critical services that don't require user consent.
 * These SDKs are initialized in parallel for speed.
 *
 * SDKs included:
 * - Sentry (Error Tracking)
 * - Firebase Crashlytics (Crash Reporting)
 * - RevenueCat (In-App Purchases)
 * - Firebase Remote Config (Feature Flags)
 *
 * @module CriticalServicesInitializer
 */

import { Platform } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import remoteConfig from '@react-native-firebase/remote-config';

import { sentryService } from '../SentryService';
import { revenueCatService } from '../RevenueCatService';
import env from '../../config/env';

import {
  InitPhase,
  SDKInitStatus,
  SDKInitResult,
  PhaseInitResult,
  CriticalServicesConfig,
} from './types';

const LOG_PREFIX = '[CriticalServices]';

/**
 * Initialize Sentry for error tracking
 * Sentry typically initializes at module load, so we verify it's available
 */
async function initializeSentry(debug: boolean): Promise<SDKInitResult> {
  const startTime = Date.now();
  try {
    // Check if DSN is valid (not placeholder)
    if (!env.SENTRY_DSN || 
        env.SENTRY_DSN.includes('YOUR_') || 
        env.SENTRY_DSN === 'https://examplePublicKey@o0.ingest.sentry.io/0') {
      if (debug) console.log(`${LOG_PREFIX} Sentry skipped - placeholder DSN`);
      return {
        sdkId: 'sentry',
        status: SDKInitStatus.SKIPPED,
        duration: Date.now() - startTime,
      };
    }

    // Initialize Sentry
    sentryService.initialize({
      dsn: env.SENTRY_DSN,
      url: env.SENTRY_URL,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
      environment: __DEV__ ? 'development' : 'production',
      debug,
      enableAutoSessionTracking: true,
      enableAutoPerformanceTracing: true,
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    });

    if (debug) console.log(`${LOG_PREFIX} ✅ Sentry initialized`);
    return {
      sdkId: 'sentry',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Sentry initialization failed:`, error);
    return {
      sdkId: 'sentry',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize Firebase Crashlytics for crash reporting
 */
async function initializeCrashlytics(debug: boolean): Promise<SDKInitResult> {
  const startTime = Date.now();
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);

    if (debug) console.log(`${LOG_PREFIX} ✅ Crashlytics initialized`);
    return {
      sdkId: 'crashlytics',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Crashlytics initialization failed:`, error);
    return {
      sdkId: 'crashlytics',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize RevenueCat for in-app purchases
 */
async function initializeRevenueCat(debug: boolean): Promise<SDKInitResult> {
  const startTime = Date.now();
  try {
    const apiKey = Platform.OS === 'ios'
      ? env.REVENUECAT_IOS_KEY
      : env.REVENUECAT_ANDROID_KEY;

    if (!apiKey || apiKey.includes('YOUR_')) {
      if (debug) console.log(`${LOG_PREFIX} RevenueCat skipped - no API key`);
      return {
        sdkId: 'revenueCat',
        status: SDKInitStatus.SKIPPED,
        duration: Date.now() - startTime,
      };
    }

    await revenueCatService.initialize();

    if (debug) console.log(`${LOG_PREFIX} ✅ RevenueCat initialized`);
    return {
      sdkId: 'revenueCat',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ RevenueCat initialization failed:`, error);
    return {
      sdkId: 'revenueCat',
      status: SDKInitStatus.FAILED,
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize Firebase Remote Config for feature flags
 * OPTIMIZED: Shorter fetch interval for faster initialization on slow devices
 */
async function initializeRemoteConfig(
  debug: boolean,
  defaults?: Record<string, boolean | string | number>,
): Promise<SDKInitResult> {
  const startTime = Date.now();
  try {
    // Set default values
    const defaultConfig = {
      feature_ads_enabled: true,
      feature_premium_enabled: true,
      maintenance_mode: false,
      ...defaults,
    };

    await remoteConfig().setDefaults(defaultConfig);

    // Set fetch settings - OPTIMIZED for speed
    await remoteConfig().setConfigSettings({
      // Shorter timeout for faster response on slow networks
      minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000, // 1 hour in production
    });

    // Fetch and activate config with timeout protection
    // Don't block app launch if remote config is slow
    const fetchPromise = remoteConfig().fetchAndActivate();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Remote Config timeout')), 8000)
    );

    try {
      await Promise.race([fetchPromise, timeoutPromise]);
      if (debug) console.log(`${LOG_PREFIX} ✅ Remote Config initialized`);
    } catch (timeoutError) {
      // If timeout, use defaults and continue
      if (debug) console.log(`${LOG_PREFIX} ⚠️ Remote Config timeout - using defaults`);
    }

    return {
      sdkId: 'remoteConfig',
      status: SDKInitStatus.INITIALIZED,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Remote Config initialization failed:`, error);
    // Don't fail the whole phase - defaults will be used
    return {
      sdkId: 'remoteConfig',
      status: SDKInitStatus.INITIALIZED, // Mark as initialized with defaults
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Initialize all critical services in parallel
 * This is Phase 1 of the SDK initialization flow
 * 
 * PERFORMANCE OPTIMIZED:
 * - All SDKs initialize in parallel using Promise.all()
 * - Non-blocking - doesn't hold up UI rendering
 * - Optimized for slow devices
 */
export async function initializeCriticalServices(
  config: CriticalServicesConfig = {},
): Promise<PhaseInitResult> {
  const startTime = Date.now();
  const debug = config.debugLogging ?? __DEV__;

  if (debug) console.log(`${LOG_PREFIX} 🚀 Starting Phase 1: Critical Services (parallel)`);

  try {
    // ⚡ ALL SDKs initialize in PARALLEL for maximum speed
    // Promise.all() runs all at once, not sequentially
    const results = await Promise.all([
      initializeSentry(debug),
      initializeCrashlytics(debug),
      initializeRevenueCat(debug),
      initializeRemoteConfig(debug, config.remoteConfigDefaults),
    ]);

    const successCount = results.filter(
      r => r.status === SDKInitStatus.INITIALIZED || r.status === SDKInitStatus.SKIPPED,
    ).length;

    const success = successCount === results.length;

    if (debug) {
      const duration = Date.now() - startTime;
      console.log(
        `${LOG_PREFIX} ✅ Phase 1 complete: ${successCount}/${results.length} services (${duration}ms)`,
      );
    }

    return {
      phase: InitPhase.CRITICAL,
      success,
      sdkResults: results,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Phase 1 failed:`, error);
    return {
      phase: InitPhase.CRITICAL,
      success: false,
      sdkResults: [],
      error: error instanceof Error ? error : new Error(String(error)),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Get a Remote Config value
 */
export function getRemoteConfigValue(key: string): string | boolean | number {
  try {
    const value = remoteConfig().getValue(key);
    
    // Try to parse as boolean first
    if (value.asString() === 'true') return true;
    if (value.asString() === 'false') return false;
    
    // Try to parse as number
    const numValue = value.asNumber();
    if (!isNaN(numValue)) return numValue;
    
    // Return as string
    return value.asString();
  } catch (error) {
    console.error(`${LOG_PREFIX} Error getting Remote Config value for ${key}:`, error);
    return '';
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(key: string, defaultValue = false): boolean {
  try {
    return remoteConfig().getBoolean(key);
  } catch (error) {
    return defaultValue;
  }
}
