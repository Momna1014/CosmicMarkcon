/**
 * SDK Types
 *
 * Type definitions for SDK adapters.
 */

/**
 * SDK initialization status
 */
export enum SDKStatus {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  INITIALIZING = 'INITIALIZING',
  INITIALIZED = 'INITIALIZED',
  FAILED = 'FAILED',
}

/**
 * Base SDK adapter interface
 */
export interface ISDKAdapter {
  readonly sdkId: string;
  initialize(config?: unknown): Promise<void>;
  getStatus(): SDKStatus;
  isInitialized(): boolean;
}

/**
 * Tracking SDK interface
 */
export interface ITrackingSDK extends ISDKAdapter {
  enable(): Promise<void>;
  disable(): Promise<void>;
}

/**
 * Ads SDK interface
 */
export interface IAdsSDK extends ISDKAdapter {
  setHasUserConsent(consent: boolean): Promise<void>;
  setDoNotSell(doNotSell: boolean): Promise<void>;
}

/**
 * Firebase configuration
 */
export interface FirebaseConfig {
  analyticsEnabled: boolean;
  crashlyticsEnabled: boolean;
  crashlyticsFullMode: boolean;
}

/**
 * AppsFlyer configuration
 */
export interface AppsFlyerConfig {
  devKey: string;
  appId: string;
  isDebug: boolean;
  onInstallConversionDataListener: boolean;
}

/**
 * Sentry configuration
 */
export interface SentryConfig {
  dsn: string;
  environment: string;
  enableUserTracking: boolean;
  tracesSampleRate: number;
}

/**
 * AppLovin configuration
 */
export interface AppLovinConfig {
  sdkKey: string;
  hasUserConsent: boolean;
  isAgeRestrictedUser: boolean;
  doNotSell: boolean;
  idfaEnabled: boolean;
}

/**
 * RevenueCat Phase 1 configuration (anonymous)
 */
export interface RevenueCatPhase1Config {
  apiKey: string;
}

/**
 * RevenueCat Phase 2 configuration (user-aware)
 */
export interface RevenueCatPhase2Config {
  appUserID?: string | null;
  collectDeviceIdentifiers: boolean;
  automaticAppleSearchAdsAttributionCollection: boolean;
}

/**
 * Remote Config configuration
 */
export interface RemoteConfigConfig {
  minimumFetchIntervalMillis: number;
  fetchTimeoutMillis: number;
}
