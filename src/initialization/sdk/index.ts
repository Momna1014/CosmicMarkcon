/**
 * SDK Module
 *
 * SDK adapters for controlled initialization.
 */

export { FirebaseAdapter } from './FirebaseAdapter';
export { AdjustAdapter } from './AdjustAdapter';
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
  AdjustConfig,
  SentryConfig,
  AppLovinConfig,
  RevenueCatPhase1Config,
  RevenueCatPhase2Config,
  RemoteConfigConfig,
} from './types';
