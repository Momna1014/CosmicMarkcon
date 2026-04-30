import type { ATTStatus, ConsentResult, AdsModeResult } from '../types';
import {
  setupFirebaseAnalytics,
  setupFirebaseCrashlytics,
  disableFirebaseAnalytics,
  disableFirebaseCrashlytics,
} from '../sdks/setupFirebase';
import {
  setupSentryAnonymous,
} from '../sdks/setupSentry';
import {
  isAnalyticsAllowed,
  isCrashReportingAllowed,
} from '../consent/consentPolicy';

/**
 * Critical SDKs only for granular consent — must be ready before splash hides.
 * Non-critical SDKs (RevenueCat, ads, attribution, full Sentry, Remote Config) are deferred
 * via scheduleDeferredSDKs() after splash hides.
 */
export async function initGranularSDKs(
  consent: ConsentResult,
  _attStatus: ATTStatus,
  _adsMode: AdsModeResult,
): Promise<void> {
  const tasks: Array<Promise<void>> = [];

  if (isAnalyticsAllowed(consent)) {
    tasks.push(setupFirebaseAnalytics());
  } else {
    tasks.push(disableFirebaseAnalytics());
  }

  if (isCrashReportingAllowed(consent)) {
    tasks.push(setupFirebaseCrashlytics());
  } else {
    tasks.push(disableFirebaseCrashlytics());
    tasks.push(setupSentryAnonymous());
  }

  await Promise.allSettled(tasks);
}
