/**
 * Early Usercentrics SDK Configuration
 *
 * Imported as the FIRST thing in index.js — before React, Redux,
 * Navigation, or any other heavy module loads.
 *
 * By calling Usercentrics.configure() AND Usercentrics.status() here,
 * we overlap the SDK's network request with the rest of the bundle
 * evaluation. On Android, bundle eval takes ~3-4.5s — the status()
 * API call (~625ms) completes entirely during that window.
 *
 * Without this: configure at T+3500, status() resolves T+4100
 * With this:    configure at T+50, status() resolves T+700 (during bundle eval)
 *               showConsent() awaits already-resolved promise → 0ms wait
 *
 * GDPR: configure()+status() are CMP initialization calls — they fetch
 * the consent configuration, not user data. Allowed pre-consent under
 * Article 6(1)(f) legitimate interest for the consent mechanism itself.
 */
import {
  Usercentrics,
} from '@usercentrics/react-native-sdk';
import { initLog } from '../../utils/initLogger';
import {
  buildUsercentricsOptions,
  resolveUsercentricsIdentity,
} from './usercentricsIdentity';

let _earlyConfigured = false;
const _earlyConfigureTime = Date.now();
let _earlyStatusPromise: Promise<any> | null = null;
let _earlyStatusResult: any = null;

export function isEarlyConfigured(): boolean {
  return _earlyConfigured;
}

export function getEarlyConfigureTime(): number {
  return _earlyConfigureTime;
}

/**
 * Returns the cached status result if early status() already resolved.
 * Avoids a redundant Usercentrics.status() bridge call.
 */
export function getEarlyStatusResult(): any {
  return _earlyStatusResult;
}

/**
 * Returns the early status() promise if available.
 * The adapter should await this instead of calling Usercentrics.status() again.
 * Returns null if early configure failed or status() wasn't started.
 */
export function getEarlyStatusPromise(): Promise<any> | null {
  return _earlyStatusPromise;
}

try {
  const identity = resolveUsercentricsIdentity();
  // The early call only needs to OVERLAP with bundle eval. If the network is
  // slow, the retry loop in showConsent.ts (5000ms timeout) will take over.
  // A shorter early timeout means a failed pre-warm fails fast and the retry
  // loop starts sooner instead of waiting 5s for the same network call.
  const options = buildUsercentricsOptions(3000);

  if (!options || !identity) {
    initLog.warn('[Usercentrics] Early configure skipped — missing RuleSetId/SettingsId');
  } else {
    initLog.log(`[Usercentrics] Early identity=${identity.key}`);
    initLog.log(`[Usercentrics] Early configure() at T+${Date.now() - _earlyConfigureTime}ms`);
    Usercentrics.configure(options);
    _earlyConfigured = true;

    _earlyStatusPromise = Usercentrics.status()
      .then(status => {
        initLog.log(`[Usercentrics] Early status() resolved at T+${Date.now() - _earlyConfigureTime}ms`);
        _earlyStatusResult = status;
        return status;
      });

    // Prevent unhandled rejection — showConsent() will await and handle failures
    _earlyStatusPromise.catch(err => {
      initLog.warn(`[Usercentrics] Early status() failed at T+${Date.now() - _earlyConfigureTime}ms: ${err?.message}`);
      _earlyConfigured = false; // Allow retry loop to do fresh configure()
    });
  }
} catch (e) {
  initLog.warn('[Usercentrics] Early configure() failed (will retry in adapter)');
}
