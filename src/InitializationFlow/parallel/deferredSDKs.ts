/**
 * Deferred SDK Initialization (functional)
 *
 * Runs AFTER the splash hides, in two parallel groups:
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ Group A — Independent (no ATT dependency)                       │
 *   │   RemoteConfig, SentryFullTracking, RevenueCat (basic configure)│
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │ Group B — ATT-dependent                                         │
 *   │   Adjust, AdMob, AppLovin, Facebook                             │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Both groups are kicked off concurrently. Inside each group every task
 * runs in parallel via `Promise.allSettled` so a single failure cannot
 * block the others.
 *
 * HOW TO ADD A NEW SDK (junior-dev guide):
 *   1. Create `setupYourSdk()` in `../sdks/setupYourSdk.ts`.
 *   2. Decide the group:
 *        • Group A if it does NOT need ATT / device id.
 *        • Group B if it tracks the user and needs ATT to be answered.
 *   3. Add a `{ name, run }` entry guarded by the right policy helper
 *      (`isVendorAllowed`, `isAnalyticsAllowed`, `isAdvertisingAllowed`,
 *      `isCrashReportingAllowed`, `isPersonalizationAllowed`).
 *   4. Templates are NEVER hardcoded — gating comes from `parseConsent.ts`
 *      which reads the live Usercentrics templateId map.
 */

import type { ATTStatus, ConsentResult, AdsModeResult } from '../types';
// @feature:admob:start [disabled]
// import { setupAdMob } from '../sdks/setupAdMob';
// @feature:admob:end
// @feature:applovin-max:start [disabled]
// import { setupAppLovin } from '../sdks/setupAppLovin';
// @feature:applovin-max:end
// @feature:adjust:start
import { setupAdjust } from '../sdks/setupAdjust';
// @feature:adjust:end
import { setupFacebook } from '../sdks/setupFacebook';
import { enableSentryFullTracking } from '../sdks/setupSentry';
import { setupRemoteConfig } from '../sdks/setupRemoteConfig';
import { setupRevenueCat } from '../sdks/setupRevenueCat';
import {
  isAdvertisingAllowed,
  isAnalyticsAllowed,
  isCrashReportingAllowed,
  isPersonalizationAllowed,
  isVendorAllowed,
} from '../consent/consentPolicy';

type DeferredTask = {
  name: string;
  run: () => Promise<void>;
};

async function runDeferredBatch(label: string, tasks: DeferredTask[]): Promise<void> {
  if (tasks.length === 0) {
    console.log(`[InitializationFlow][Deferred] batch=${label} skipped (no tasks)`);
    return;
  }

  const batchStart = Date.now();
  const results = await Promise.allSettled(
    tasks.map(async ({ name, run }) => {
      const taskStart = Date.now();
      console.log(`[InitializationFlow][Deferred][${label}] ${name} init start`);
      await run();
      console.log(
        `[InitializationFlow][Deferred][${label}] ${name} init success (${Date.now() - taskStart}ms)`,
      );
    }),
  );

  const failed: string[] = [];
  for (let i = 0; i < results.length; i += 1) {
    if (results[i].status === 'rejected') {
      const taskName = tasks[i]?.name ?? `task-${i + 1}`;
      failed.push(taskName);
      console.error(
        `[InitializationFlow][Deferred][${label}] ${taskName} init failed`,
        (results[i] as PromiseRejectedResult).reason,
      );
    }
  }

  console.log(
    `[InitializationFlow][Deferred] batch=${label} done in ${Date.now() - batchStart}ms ` +
      `success=${tasks.length - failed.length} failed=${failed.length}`,
  );
}

// ──────────────────────────────────────────────────────────────────────
// Task builders — return the list of tasks for each parallel group.
// All gating is templateId-driven via consentPolicy helpers (no hardcoded ids).
// ──────────────────────────────────────────────────────────────────────

function buildGroupA(consent: ConsentResult, adsMode: AdsModeResult): DeferredTask[] {
  const tasks: DeferredTask[] = [];

  const trackingAllowed = adsMode.trackingAllowed;
  const personalizationAllowed = isPersonalizationAllowed(consent);
  const analyticsAllowed = isAnalyticsAllowed(consent);
  const crashAllowed = isCrashReportingAllowed(consent);

  // RevenueCat — basic configure (no attribution / no ATT-gated APIs).
  // Always configure so the in-app purchase paywall works regardless of consent.
  tasks.push({
    name: 'RevenueCat',
    run: () => setupRevenueCat(personalizationAllowed && trackingAllowed),
  });

  // RemoteConfig — needs analytics or explicit remoteConfig template grant.
  if (consent.status !== 'denied' && (isVendorAllowed(consent, 'remoteConfig') || analyticsAllowed)) {
    tasks.push({ name: 'RemoteConfig', run: () => setupRemoteConfig() });
  }

  // Sentry full tracking — requires crash-reporting consent.
  if (crashAllowed && isVendorAllowed(consent, 'sentry')) {
    tasks.push({ name: 'SentryFullTracking', run: () => enableSentryFullTracking() });
  }

  return tasks;
}

function buildGroupB(consent: ConsentResult, adsMode: AdsModeResult): DeferredTask[] {
  const tasks: DeferredTask[] = [];

  const trackingAllowed = adsMode.trackingAllowed;
  const advertisingAllowed = isAdvertisingAllowed(consent);
  const analyticsAllowed = isAnalyticsAllowed(consent);

  // ────────────────────────────────────────────────────────────────────
  // GDPR ads policy (NPA-always strategy)
  //
  // Three states, decided strictly by GDPR consent + ATT (resolveAdsMode):
  //
  //   1. PERSONALIZED — advertisingAllowed && adsMode.mode === 'personalized'
  //      AdMob personalized + AppLovin personalized + Adjust ON + Facebook ON
  //
  //   2. NPA (Non-Personalized Ads)
  //      Triggered by ANY of:
  //        • consent.status === 'denied'         (Usercentrics Deny All)
  //        • marketing toggled off in granular   (advertisingAllowed === false)
  //        • iOS ATT not granted                 (adsMode.mode === 'non-personalized')
  //      AdMob NPA + AppLovin NPA + Adjust DISABLED + Facebook DISABLED
  //
  //   • Adjust (attribution) and Facebook (targeting) have NO compliant NPA
  //     mode under GDPR — they always require explicit advertising consent,
  //     so we disable both whenever we fall into the NPA state.
  //   • AdMob & AppLovin both honour the NPA flag at SDK level — they will
  //     only request contextual ads (no IDFA, no profile lookup).
  // ────────────────────────────────────────────────────────────────────
  const isPersonalized = advertisingAllowed && adsMode.mode === 'personalized';

  // @feature:adjust:start
  // Adjust — analytics-grade attribution. Only runs when advertising allowed.
  if (isPersonalized && (isVendorAllowed(consent, 'adjust') || analyticsAllowed)) {
    tasks.push({ name: 'Adjust', run: () => setupAdjust(consent, trackingAllowed) });
  } else {
    tasks.push({ name: 'AdjustDisable', run: () => setupAdjust(consent, false) });
  }
  // @feature:adjust:end

  // @feature:admob:start [disabled]
  // // AdMob — initialize in personalized OR NPA mode. Never disabled by consent
  // // (RC kill-switch uses disableAdMob() separately).
  // if (isPersonalized && isVendorAllowed(consent, 'admob')) {
  //   tasks.push({ name: 'AdMob', run: () => setupAdMob('personalized') });
  // } else {
  //   tasks.push({ name: 'AdMobNPA', run: () => setupAdMob('non-personalized') });
  // }
  // @feature:admob:end

  // @feature:applovin-max:start [disabled]
  // // AppLovin — same NPA-always strategy as AdMob.
  // if (isPersonalized && isVendorAllowed(consent, 'applovin')) {
    // tasks.push({ name: 'AppLovin', run: () => setupAppLovin(consent, 'personalized') });
  // } else {
    // tasks.push({ name: 'AppLovinNPA', run: () => setupAppLovin(consent, 'non-personalized') });
  // }
  // @feature:applovin-max:end

  // Facebook — no compliant NPA mode. Disable whenever not fully personalized.
  if (isPersonalized && isVendorAllowed(consent, 'facebook')) {
    tasks.push({ name: 'Facebook', run: () => setupFacebook(trackingAllowed, true) });
  } else {
    tasks.push({ name: 'FacebookDisable', run: () => setupFacebook(false, false) });
  }

  return tasks;
}

/**
 * Schedules deferred SDKs after splash hides.
 *
 * Both groups run in parallel; we don't `await` them in the caller so they
 * won't block first meaningful paint. `setTimeout(0)` yields the JS thread
 * back to React for the first frame.
 */
export function scheduleDeferredSDKs(
  consent: ConsentResult,
  _attStatus: ATTStatus,
  adsMode: AdsModeResult,
): void {
  setTimeout(() => {
    const groupA = buildGroupA(consent, adsMode);
    const groupB = buildGroupB(consent, adsMode);

    const overallStart = Date.now();
    const aPromise = runDeferredBatch('groupA-independent', groupA);
    const bPromise = runDeferredBatch('groupB-att-dependent', groupB);

    Promise.allSettled([aPromise, bPromise])
      .then(() => {
        console.log(
          `[InitializationFlow][Deferred] all-done in ${Date.now() - overallStart}ms`,
        );
      })
      .catch(() => {
        // Non-critical — never crash the app for deferred init.
      });
  }, 0);
}
