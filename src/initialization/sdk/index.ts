/**
 * SDK Module
 *
 * SDK adapters for controlled initialization.
 */

export { FirebaseAdapter } from './FirebaseAdapter';
export { AppsFlyerAdapter } from './AppsFlyerAdapter';
export { SentryAdapter } from './SentryAdapter';
export { AppLovinAdapter } from './AppLovinAdapter';
export { RevenueCatAdapter } from './RevenueCatAdapter';
export { FacebookAdapter } from './FacebookAdapter';
export type { RevenueCatPhase } from './RevenueCatAdapter';
export type { FacebookConfig } from './FacebookAdapter';
export { SDKStatus } from './types';
export type {
  ISDKAdapter,
  ITrackingSDK,
  IAdsSDK,
  FirebaseConfig,
  AppsFlyerConfig,
  SentryConfig,
  AppLovinConfig,
  RevenueCatPhase1Config,
  RevenueCatPhase2Config,
  RemoteConfigConfig,
} from './types';
