/**
 * App Initialization Orchestrator (functional)
 *
 * Strict splash-gated boot order — the native splash stays visible
 * until BOTH the Usercentrics popup and (on iOS) the ATT prompt are
 * answered by the user. Only then do we initialize SDKs and hide the splash.
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ 1. Native splash visible                                     │
 *   │ 2. Usercentrics popup  ── blocks until user picks            │
 *   │ 3. ATT prompt (iOS, if consent allows) ── blocks until done  │
 *   │ 4. initEssentials       (anonymous Sentry, if allowed)       │
 *   │ 5. initializeCriticalSDKs (Firebase Analytics + Crashlytics) │
 *   │ 6. hideSplash                                                │
 *   │ 7. scheduleDeferredSDKs (Group A + Group B in parallel)      │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * For junior devs: each step `await`s the previous one. There is NO timeout
 * and NO background navigation. The orchestrator is fully functional —
 * no classes, no singletons.
 */

import { Platform } from 'react-native';
import { showConsent } from './consent/showConsent';
import { requestATT } from './tracking/requestATT';
import { resolveAdsMode } from './tracking/resolveAdsMode';
import {
  initEssentials,
  initFullSDKs,
  initDeniedMode,
  initGranularSDKs,
  scheduleDeferredSDKs,
} from './parallel';
import { hideSplash } from './splash/splashControl';
import { initLog } from '../utils/initLogger';
import { isAnalyticsEnabled, logEvent } from '../services/firebase/FirebaseService';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';
import type {
  InitializationResult,
  ConsentResult,
  ATTStatus,
  AdsModeResult,
} from './types';

let lastConsent: ConsentResult | null = null;
let lastAdsMode: AdsModeResult | null = null;
let lastInitResult: InitializationResult | null = null;
let reconfigurePromise: Promise<InitializationResult> | null = null;

export function getConsentResult(): ConsentResult | null {
  return lastConsent;
}

export function getAdsModeResult(): AdsModeResult | null {
  return lastAdsMode;
}

export function getInitializationResult(): InitializationResult | null {
  return lastInitResult;
}

export async function startApp(): Promise<InitializationResult> {
  try {
    const flowStart = Date.now();

    // ── Step 1: native splash is already visible (controlled by react-native-bootsplash)

    // ── Step 2: Usercentrics consent popup (BLOCKS until user picks)
    const consentStart = Date.now();
    const consent = await showConsent();
    const consentEnd = Date.now();
    initLog.log(
      `[InitTiming] consent=${consentEnd - consentStart}ms source=${consent.source} status=${consent.status}`,
    );

    // ── Step 3: ATT prompt on iOS (BLOCKS until user picks)
    // INDEPENDENT of Usercentrics consent — Apple requires ATT regardless of
    // GDPR choice. The OS shows the prompt only once per install; subsequent
    // calls return the cached status, so this is safe to call every cold launch.
    let attStatus: ATTStatus = 'not-applicable';
    if (Platform.OS === 'ios') {
      attStatus = await requestATT();
    }
    const attEnd = Date.now();
    initLog.log(`[InitTiming] att=${attEnd - consentEnd}ms status=${attStatus}`);

    // ── Step 4: essentials (Sentry anonymous if crash-reporting consent allows)
    await initEssentials();
    const essentialsEnd = Date.now();
    initLog.log(`[InitTiming] essentials=${essentialsEnd - attEnd}ms`);

    // ── Step 5: critical SDKs (Firebase native bootstrap + analytics/crashlytics)
    const adsMode = resolveAdsMode(consent, attStatus);
    await initializeCriticalSDKs(consent, attStatus, adsMode);
    const criticalEnd = Date.now();
    initLog.log(`[InitTiming] critical-init=${criticalEnd - essentialsEnd}ms`);

    if (isAnalyticsEnabled()) {
      await logEvent(ANALYTICS_EVENTS.SPLASH, {
        consent_status: consent.status,
        consent_source: consent.source,
        att_status: attStatus,
        ads_mode: adsMode.mode,
        ads_reason: adsMode.reason,
      });
      initLog.log('[InitTiming] first-event=splash');
    }

    // ── Step 6: hide native splash → React UI takes over
    await hideSplash();
    const splashEnd = Date.now();
    initLog.log(`[InitTiming] splash-hide=${splashEnd - criticalEnd}ms`);
    initLog.log(`[InitTiming] total-to-ui=${splashEnd - flowStart}ms`);

    // ── Step 7: deferred SDKs in two parallel groups (A independent / B ATT-dependent)
    scheduleDeferredSDKs(consent, attStatus, adsMode);

    initLog.flush();

    const result: InitializationResult = { consent, attStatus, adsMode };
    lastConsent = consent;
    lastAdsMode = adsMode;
    lastInitResult = result;
    return result;
  } catch (error) {
    console.error('[InitializationFlow] startApp failed:', error);
    throw error;
  }
}

/**
 * Re-run the post-consent pipeline (used by Manage Preferences in Settings).
 * Does NOT touch the splash — UI is already visible at this point.
 */
export async function applyUpdatedConsent(consent: ConsentResult): Promise<InitializationResult> {
  if (reconfigurePromise) return reconfigurePromise;

  reconfigurePromise = (async () => {
    let attStatus: ATTStatus = 'not-applicable';
    if (Platform.OS === 'ios') {
      attStatus = await requestATT();
    }

    const adsMode = resolveAdsMode(consent, attStatus);
    await initializeCriticalSDKs(consent, attStatus, adsMode);
    scheduleDeferredSDKs(consent, attStatus, adsMode);

    const result: InitializationResult = { consent, attStatus, adsMode };
    lastConsent = consent;
    lastAdsMode = adsMode;
    lastInitResult = result;
    return result;
  })();

  try {
    return await reconfigurePromise;
  } finally {
    reconfigurePromise = null;
  }
}

async function initializeCriticalSDKs(
  consent: ConsentResult,
  attStatus: ATTStatus,
  adsMode: AdsModeResult,
): Promise<void> {
  if (consent.status === 'denied') {
    await initDeniedMode(consent);
  } else if (consent.status === 'granular') {
    await initGranularSDKs(consent, attStatus, adsMode);
  } else {
    await initFullSDKs(consent, attStatus, adsMode);
  }
}
