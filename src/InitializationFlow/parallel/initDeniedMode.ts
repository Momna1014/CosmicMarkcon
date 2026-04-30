import type { ConsentResult } from '../types';
import {
  disableFirebaseAnalytics,
  disableFirebaseCrashlytics,
} from '../sdks/setupFirebase';
import { setupSentryAnonymous } from '../sdks/setupSentry';

/**
 * Critical SDKs only for denied consent — must be ready before splash hides.
 * Non-critical SDKs (RevenueCat, ads, attribution, Facebook) are deferred
 * via scheduleDeferredSDKs() after splash hides.
 */
export async function initDeniedMode(_consent: ConsentResult): Promise<void> {
  await Promise.allSettled([
    disableFirebaseAnalytics(),
    disableFirebaseCrashlytics(),
    setupSentryAnonymous(),
  ]);
}
