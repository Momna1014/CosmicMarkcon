import { Usercentrics } from '@usercentrics/react-native-sdk';
import {
  parseConsentResponse,
  hasConsentChanged,
} from './parseConsent';
import {
  DEFAULT_CONSENT_GRANTS,
  DEFAULT_VENDOR_GRANTS,
  type ConsentResult,
} from '../types';
import {
  isEarlyConfigured,
  getEarlyStatusPromise,
} from './earlyUsercentrics';
import { initLog } from '../../utils/initLogger';
import {
  saveConsentPopupMetric,
  getRuntimeBuildMode,
  getRuntimePlatform,
} from './consentMetrics';
import {
  buildUsercentricsOptions,
  resolveUsercentricsIdentity,
} from './usercentricsIdentity';
import {
  loadConsentSnapshot,
  saveConsentSnapshot,
  clearConsentSnapshot,
} from './consentSnapshot';

/**
 * Consent flow (Usercentrics is the source of truth; MMKV is a splash-gating
 * optimization only — see consentSnapshot.ts).
 *
 * On every cold launch we ask Usercentrics for `status()` to know:
 *   • `shouldCollectConsent` — primary signal that works in BOTH RuleSetId
 *     and SettingsId modes:
 *       - true  → user must answer → show first-layer popup, BLOCK
 *       - false → user has already answered (or RuleSet says non-EU) →
 *                 reuse stored consents, NO popup
 *   • `geolocationRuleset.bannerRequiredAtLocation` — RuleSet-only flag,
 *     used as an optimization to distinguish "outside ruleset / non-EU"
 *     from "already consented" when `shouldCollectConsent` is false.
 *
 * First-launch banner: `Usercentrics.showFirstLayer()`.
 * Manage Preferences (Profile/Settings): `openConsentPreferences()` calls
 * `showSecondLayer()` — pre-populated with the user's previous selections.
 */

const CONFIG = {
  initTimeout: 5000,
  maxRetries: 3,
  retryDelayBase: 1500,
};
const POPUP_CHECKPOINTS_MS = [30000, 60000, 120000] as const;

let isInitialized = false;
let initPromise: Promise<any> | null = null;
let lastStatus: any | null = null;

export type ManagePreferencesOutcome = 'updated' | 'no-change' | 'not-eu';

export type ManagePreferencesResult = {
  outcome: ManagePreferencesOutcome;
  changed: boolean;
  previous: ConsentResult | null;
  consent: ConsentResult;
};

export async function showConsent(): Promise<ConsentResult> {
  const flowStartedAt = Date.now();
  const platform = getRuntimePlatform();
  const buildMode = getRuntimeBuildMode();
  const identity = resolveUsercentricsIdentity();

  // Step 0: snapshot fast-path. On the second cold launch (and every launch
  // thereafter, until the user changes consent or the dashboard rotates the
  // identity), the snapshot lets us skip the splash-blocking status() call.
  // We still validate against the SDK in the background so a server-side
  // change to `shouldCollectConsent` invalidates the cache before next launch.
  if (identity) {
    const snapshot = loadConsentSnapshot(identity.key);
    if (snapshot) {
      initLog.log('[Usercentrics][Timing] Snapshot hit — skipping status() on critical path');
      saveConsentPopupMetric({
        timestamp: flowStartedAt,
        platform,
        buildMode,
        source: 'cached',
        popupShown: false,
        outcome: snapshot.status,
        details: 'Resolved from MMKV snapshot; status() running in background',
      });
      validateSnapshotInBackground(identity.key);
      return snapshot;
    }
  }

  // Step 1: ask Usercentrics for status (region + banner requirement).
  let ucStatus: any;
  try {
    ucStatus = await initializeUsercentrics();
  } catch (error) {
    initLog.warn('[Usercentrics] Init failed, defaulting to denied mode (privacy-safe)');
    saveConsentPopupMetric({
      timestamp: flowStartedAt,
      platform,
      buildMode,
      source: 'network-failure',
      popupShown: false,
      outcome: 'init-failure',
      details: getErrorMessage(error),
    });
    return buildDeniedConsent('network-failure', identity);
  }

  // Step 2: decide if we need to show the popup.
  //
  // `shouldCollectConsent` is the SDK-wide signal that works for BOTH
  // RuleSetId and SettingsId modes. It is `true` whenever the user must
  // see the banner (no stored decision, or geolocation requires it), and
  // `false` once the user has already answered (or, in RuleSet mode, the
  // location is outside the configured ruleset).
  //
  // `geolocationRuleset.bannerRequiredAtLocation` is populated ONLY when
  // a RuleSetId is configured. In SettingsId-only mode it is undefined or
  // false even for first-time EU users — relying on it would skip the
  // popup on first launch. We use it only as a RuleSet-mode optimization
  // to distinguish "outside ruleset" (non-EU) from "already consented".
  const shouldCollectConsent = ucStatus?.shouldCollectConsent !== false;
  const isRuleSetMode = identity?.type === 'ruleset';
  const bannerRequiredAtLocation = ucStatus?.geolocationRuleset?.bannerRequiredAtLocation;
  const ruleSetSaysNonEU = isRuleSetMode && bannerRequiredAtLocation === false;

  if (!shouldCollectConsent) {
    // User has already answered (any mode) OR RuleSet says non-EU.
    const region: 'eu' | 'non-eu' = ruleSetSaysNonEU ? 'non-eu' : 'eu';
    const source = ruleSetSaysNonEU ? 'region-not-required' : 'cached';

    if (ruleSetSaysNonEU) {
      const result = buildRegionNotRequiredConsent(identity);
      saveConsentPopupMetric({
        timestamp: flowStartedAt,
        platform,
        buildMode,
        source: 'region-not-required',
        popupShown: false,
        outcome: 'accepted',
        details: 'Banner not required at location; popup skipped',
      });
      saveConsentSnapshot(result);
      return result;
    }

    // Stored consents exist — synthesize result from the SDK status snapshot.
    const result = await buildConsentFromUsercentricsResponse(
      { consents: ucStatus?.consents },
      'cached',
      region,
      flowStartedAt,
      identity,
    );
    saveConsentPopupMetric({
      timestamp: flowStartedAt,
      platform,
      buildMode,
      source: 'cached',
      popupShown: false,
      outcome: result.status,
      details: 'Consent already stored; popup skipped',
    });
    saveConsentSnapshot(result);
    initLog.log(`[Usercentrics][Timing] Reused stored consent, status=${result.status}`);
    return result;
  }

  // Step 3: show the FIRST-LAYER banner. BLOCKS until user makes a choice.
  // First layer = initial consent banner (Accept All / Deny All / Manage).
  // Second layer = Manage Preferences (used by `openConsentPreferences`).
  // Calling `showSecondLayer()` on a fresh install is unreliable — on first
  // cold launch the SDK has no persisted state and the call resolves
  // without rendering UI, which is why the popup previously only appeared
  // on the second launch in SettingsId-only mode.
  const popupShownAt = Date.now();
  const checkpointsReachedSec: number[] = [];
  const checkpointTimers = startPopupCheckpointTimers(
    popupShownAt,
    checkpointsReachedSec,
    platform,
    buildMode,
  );

  initLog.log(`[Usercentrics][Timing] Popup shown (${platform}, ${buildMode})`);

  try {
    // First-launch banner = first layer. Manage Preferences uses second layer.
    const response = await Usercentrics.showSecondLayer();
    const popupResolvedAt = Date.now();
    stopPopupCheckpointTimers(checkpointTimers);
    const popupVisibleMs = popupResolvedAt - popupShownAt;

    const result = await buildConsentFromUsercentricsResponse(
      response,
      'usercentrics',
      'eu',
      popupResolvedAt,
      identity,
    );

    saveConsentPopupMetric({
      timestamp: flowStartedAt,
      platform,
      buildMode,
      source: 'usercentrics',
      popupShown: true,
      popupShownAt,
      popupResolvedAt,
      popupVisibleMs,
      checkpointsReachedSec,
      outcome: result.status,
      details: 'Resolved via user interaction',
    });

    initLog.log(
      `[Usercentrics][Timing] Popup resolved in ${popupVisibleMs}ms, status=${result.status}`,
    );

    saveConsentSnapshot(result);
    return result;
  } catch (error) {
    const popupResolvedAt = Date.now();
    stopPopupCheckpointTimers(checkpointTimers);

    saveConsentPopupMetric({
      timestamp: flowStartedAt,
      platform,
      buildMode,
      source: 'popup-error',
      popupShown: true,
      popupShownAt,
      popupResolvedAt,
      popupVisibleMs: popupResolvedAt - popupShownAt,
      checkpointsReachedSec,
      outcome: 'popup-error',
      details: getErrorMessage(error),
    });

    throw error;
  }
}

/**
 * Open Manage Preferences (second layer).
 * `previous` is the in-memory consent at call-time — used for change detection.
 * Pass `getConsentResult()` from the orchestrator at the call site.
 */
export async function openConsentPreferences(
  previous: ConsentResult | null = null,
): Promise<ManagePreferencesResult> {
  const identity = resolveUsercentricsIdentity();
  const status = await initializeUsercentrics();

  // Only short-circuit Manage Preferences when RuleSet explicitly says
  // we are outside the configured geolocation. In SettingsId mode the
  // `bannerRequiredAtLocation` flag is unreliable, so we always allow
  // the user to open the second layer.
  const isRuleSetMode = identity?.type === 'ruleset';
  const bannerRequiredAtLocation = status?.geolocationRuleset?.bannerRequiredAtLocation;
  const ruleSetSaysNonEU = isRuleSetMode && bannerRequiredAtLocation === false;

  if (ruleSetSaysNonEU) {
    const consent = previous && previous.region === 'non-eu'
      ? { ...previous, identity: previous.identity ?? identity }
      : buildRegionNotRequiredConsent(identity);

    return {
      outcome: 'not-eu',
      changed: false,
      previous,
      consent,
    };
  }

  const response = await Usercentrics.showSecondLayer();
  const consent = await buildConsentFromUsercentricsResponse(
    response,
    'usercentrics',
    'eu',
    Date.now(),
    identity,
  );

  const changed = hasConsentChanged(previous, consent);
  // Refresh the snapshot whenever the user opens Manage Preferences — even
  // when nothing changed, the SDK may have updated metadata we want cached.
  saveConsentSnapshot(consent);
  return {
    outcome: changed ? 'updated' : 'no-change',
    changed,
    previous,
    consent,
  };
}

async function initializeUsercentrics(): Promise<any> {
  if (isInitialized) {
    if (lastStatus) return lastStatus;
    const status = await Usercentrics.status();
    lastStatus = status;
    return status;
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    const identity = resolveUsercentricsIdentity();
    if (identity) {
      initLog.log(`[Usercentrics] Active identity=${identity.key}`);
    }

    // Fast path: reuse the early configure()+status() fired from index.js
    if (isEarlyConfigured()) {
      const earlyPromise = getEarlyStatusPromise();
      if (earlyPromise) {
        try {
          const status = await earlyPromise;
          isInitialized = true;
          lastStatus = status;
          initLog.log('[Usercentrics] Using early status() — 0ms wait');
          return status;
        } catch {
          initLog.warn('[Usercentrics] Early status() rejected, falling back to retry loop');
        }
      }
    }

    const options = buildUsercentricsOptions(CONFIG.initTimeout);
    if (!options) {
      throw new Error('Usercentrics identity is missing (RuleSetId or SettingsId)');
    }

    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt += 1) {
      try {
        if (!isEarlyConfigured()) {
          Usercentrics.configure(options);
        }
        const status = await Usercentrics.status();
        isInitialized = true;
        lastStatus = status;
        return status;
      } catch (error) {
        if (attempt >= CONFIG.maxRetries) throw error;
        await delay(CONFIG.retryDelayBase * attempt);
      }
    }
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let backgroundValidationStarted = false;

/**
 * Snapshot validator. Fired off the splash-critical path after a snapshot
 * fast-path hit. Asks the SDK whether the user must reconsent and clears the
 * snapshot if so, ensuring the popup appears on the NEXT cold launch.
 */
function validateSnapshotInBackground(identityKey: string): void {
  if (backgroundValidationStarted) {
    return;
  }
  backgroundValidationStarted = true;

  void (async () => {
    try {
      const status = await initializeUsercentrics();
      if (status?.shouldCollectConsent === true) {
        initLog.log('[Usercentrics] Background validation says reconsent required \u2014 clearing snapshot');
        clearConsentSnapshot();
      } else {
        initLog.log(`[Usercentrics] Background validation OK for identity=${identityKey}`);
      }
    } catch (error) {
      initLog.warn(
        `[Usercentrics] Background validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  })();
}

function startPopupCheckpointTimers(
  popupShownAt: number,
  checkpointsReachedSec: number[],
  platform: string,
  buildMode: string,
): ReturnType<typeof setTimeout>[] {
  return POPUP_CHECKPOINTS_MS.map(ms =>
    setTimeout(() => {
      const checkpointSec = Math.floor(ms / 1000);
      checkpointsReachedSec.push(checkpointSec);
      const elapsedSec = Math.round((Date.now() - popupShownAt) / 1000);
      initLog.log(
        `[Usercentrics][Timing] Popup still visible at ${elapsedSec}s (${platform}, ${buildMode})`,
      );
    }, ms),
  );
}

function stopPopupCheckpointTimers(timers: ReturnType<typeof setTimeout>[]): void {
  for (const timer of timers) clearTimeout(timer);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function buildConsentFromUsercentricsResponse(
  response: any,
  source: 'usercentrics' | 'region-not-required' | 'network-failure' | 'cached',
  region: 'eu' | 'non-eu',
  timestamp: number,
  identity: ReturnType<typeof resolveUsercentricsIdentity>,
): Promise<ConsentResult> {
  const consents = await loadRuntimeConsents(response);
  const services = await loadRuntimeServices();

  return parseConsentResponse(response, {
    source,
    region,
    timestamp,
    identity,
    consents,
    services,
  });
}

async function loadRuntimeConsents(response: any): Promise<any[]> {
  if (Array.isArray(response?.consents) && response.consents.length > 0) {
    return response.consents;
  }
  try {
    const consents = await Usercentrics.getConsents();
    return Array.isArray(consents) ? consents : [];
  } catch {
    return [];
  }
}

async function loadRuntimeServices(): Promise<any[]> {
  try {
    const cmpData = await Usercentrics.getCMPData();
    return Array.isArray(cmpData?.services) ? cmpData.services : [];
  } catch {
    return [];
  }
}

function buildRegionNotRequiredConsent(
  identity: ReturnType<typeof resolveUsercentricsIdentity>,
): ConsentResult {
  return {
    status: 'accepted',
    interaction: 'accept-all',
    grants: {
      analytics: true,
      advertising: true,
      personalization: true,
      crashReporting: true,
    },
    vendorGrants: {
      firebaseAnalytics: true,
      firebaseCrashlytics: true,
      sentry: true,
      // @feature:adjust:start
      adjust: true,
      // @feature:adjust:end
      // @feature:admob:start
      admob: true,
      // @feature:admob:end
      // @feature:applovin-max:start [disabled]
      // applovin: true,
      // @feature:applovin-max:end
      facebook: true,
      revenuecat: true,
      remoteConfig: true,
    },
    decisions: {},
    identity,
    source: 'region-not-required',
    region: 'non-eu',
    timestamp: Date.now(),
  };
}

function buildDeniedConsent(
  source: 'network-failure',
  identity: ReturnType<typeof resolveUsercentricsIdentity>,
): ConsentResult {
  return {
    status: 'denied',
    interaction: 'unknown',
    grants: DEFAULT_CONSENT_GRANTS,
    vendorGrants: DEFAULT_VENDOR_GRANTS,
    decisions: {},
    identity,
    source,
    region: 'eu',
    timestamp: Date.now(),
  };
}
