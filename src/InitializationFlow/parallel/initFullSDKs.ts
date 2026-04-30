import type { ATTStatus, ConsentResult, AdsModeResult } from '../types';
import { setupFirebaseAnalytics, setupFirebaseCrashlytics } from '../sdks/setupFirebase';

/**
 * Critical SDKs only — must be ready before splash hides.
 * Non-critical SDKs (RevenueCat, ads, attribution, full Sentry, Remote Config) are deferred
 * via scheduleDeferredSDKs() after splash hides.
 */
export async function initFullSDKs(
  _consent: ConsentResult,
  _attStatus: ATTStatus,
  _adsMode: AdsModeResult,
): Promise<void> {
  await Promise.allSettled([
    setupFirebaseCrashlytics(),
    setupFirebaseAnalytics(),
  ]);
}
