/**
 * Initialization Configuration
 *
 * Centralized configuration for the SDK initialization system.
 */

import { Platform } from 'react-native';
import env from '../../config/env';

/**
 * Timeout configuration (in milliseconds)
 */
export const TIMEOUTS = {
  // Consent timeouts
  consent: {
    presentationTimeout: 30000, // 30s max for consent UI to appear
    userDecisionTimeout: 120000, // 2min max for user to decide
    networkWaitTimeout: 5000, // 5s to wait for network
  },

  // SDK initialization timeouts
  sdk: {
    coreTimeout: 5000, // 5s for core SDKs (crash reporting)
    trackingTimeout: 10000, // 10s for tracking SDKs
    adsTimeout: 8000, // 8s for ads initialization
  },

  // ATT timeout
  att: {
    promptTimeout: 60000, // 1min for ATT decision
  },

  // Splash screen
  splash: {
    maxVisibleTime: 45000, // 45s absolute maximum splash time
    fadeOutDuration: 250, // Animation duration
  },
};

/**
 * Retry configuration
 */
export const RETRIES = {
  consent: {
    maxRetries: 3,
    retryDelayBase: 1000, // Exponential backoff base
  },
  sdk: {
    maxRetries: 2,
    retryDelayBase: 500,
  },
};

/**
 * SDK Keys (from environment)
 */
export const SDK_KEYS = {
  revenuecat: {
    ios: env.REVENUECAT_IOS_KEY,
    android: env.REVENUECAT_ANDROID_KEY,
    current: Platform.OS === 'ios' ? env.REVENUECAT_IOS_KEY : env.REVENUECAT_ANDROID_KEY,
  },
  applovin: {
    sdkKey: env.APPLOVIN_SDK_KEY,
  },
  appsflyer: {
    devKey: env.APPSFLYER_DEV_KEY,
    appId: env.APPSFLYER_APP_ID,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  usercentrics: {
    ruleSetId: env.USER_CENTRIC,
  },
};

/**
 * Feature flags
 */
export const FEATURES = {
  // Whether to skip consent in certain conditions
  skipConsentInDev: false,

  // Whether to skip ATT in development
  skipATTInDev: false,

  // Enable verbose logging
  verboseLogging: __DEV__,

  // Enable analytics in development
  analyticsInDev: false,
};

/**
 * Privacy configuration
 */
export const PRIVACY = {
  // Consent validity period (days)
  consentValidityDays: 365,

  // Whether crash reporting requires consent
  crashReportingRequiresConsent: false,

  // Default to non-personalized ads on error/timeout
  defaultToNonPersonalized: true,
};

/**
 * Get configuration for current environment
 */
export function getInitConfig() {
  return {
    timeouts: TIMEOUTS,
    retries: RETRIES,
    sdkKeys: SDK_KEYS,
    features: FEATURES,
    privacy: PRIVACY,
    platform: Platform.OS,
    isDev: __DEV__,
  };
}

export default getInitConfig;
