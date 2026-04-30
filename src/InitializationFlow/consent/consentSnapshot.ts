/**
 * Consent Snapshot — splash-gating optimization for second-cold-launch.
 *
 * On the FIRST cold launch the splash is gated on `Usercentrics.status()`,
 * which (in Settings-ID mode) requires downloading the full settings JSON
 * before it can resolve. To make the SECOND cold launch near-instant, we
 * persist the resolved `ConsentResult` to MMKV when the user has answered
 * (or when the SDK reports the region does not require a banner).
 *
 * On the next cold launch:
 *   1. `loadConsentSnapshot()` is read SYNCHRONOUSLY at module load.
 *   2. If a valid snapshot is present for the current identity, the
 *      orchestrator resolves consent from the snapshot and hides the splash
 *      immediately.
 *   3. A background `Usercentrics.status()` runs to validate. If the SDK
 *      decides the user must reconsent, the snapshot is cleared so the next
 *      launch shows the popup.
 *
 * GDPR: the snapshot stores only the consent decisions the user has already
 * given (the same data Usercentrics persists in its own native cache). It
 * contains NO PII (no IDFA/AAID, no email, no IP). It is keyed by the
 * Usercentrics identity (RuleSetId/SettingsId) so a configuration rotation
 * automatically invalidates the cache.
 */
import { createMMKV } from 'react-native-mmkv';
import type { ConsentResult } from '../types';
import { initLog } from '../../utils/initLogger';

const SCHEMA_VERSION = 1;
const SNAPSHOT_KEY = 'consent.snapshot.v1';
const SNAPSHOT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type StoredSnapshot = {
  schemaVersion: number;
  identityKey: string;
  savedAt: number;
  consent: ConsentResult;
};

const storage = createMMKV({ id: 'consent-storage' });

export function loadConsentSnapshot(identityKey: string): ConsentResult | null {
  if (!identityKey) {
    return null;
  }

  const raw = storage.getString(SNAPSHOT_KEY);
  if (!raw) {
    return null;
  }

  let parsed: StoredSnapshot | null = null;
  try {
    parsed = JSON.parse(raw) as StoredSnapshot;
  } catch {
    storage.remove(SNAPSHOT_KEY);
    return null;
  }

  if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
    storage.remove(SNAPSHOT_KEY);
    return null;
  }

  if (parsed.identityKey !== identityKey) {
    // Identity rotated (RuleSet/Settings ID changed) — drop the stale entry.
    storage.remove(SNAPSHOT_KEY);
    return null;
  }

  if (Date.now() - parsed.savedAt > SNAPSHOT_TTL_MS) {
    storage.remove(SNAPSHOT_KEY);
    return null;
  }

  return parsed.consent ?? null;
}

export function saveConsentSnapshot(consent: ConsentResult): void {
  const identityKey = consent.identity?.key;
  if (!identityKey) {
    return;
  }

  // Only persist final, user-actionable outcomes. Network failures must NOT
  // be cached — the next launch should retry against the SDK.
  if (consent.source === 'network-failure') {
    return;
  }

  const payload: StoredSnapshot = {
    schemaVersion: SCHEMA_VERSION,
    identityKey,
    savedAt: Date.now(),
    consent,
  };

  try {
    storage.set(SNAPSHOT_KEY, JSON.stringify(payload));
  } catch (error) {
    initLog.warn(
      `[ConsentSnapshot] save failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function clearConsentSnapshot(): void {
  storage.remove(SNAPSHOT_KEY);
}
