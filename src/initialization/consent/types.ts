/**
 * Consent Types
 *
 * Type definitions for consent management.
 */

/**
 * User consent status
 *
 * - ACCEPTED: User accepted ALL vendors via Usercentrics "Accept All"
 * - DENIED: User denied ALL vendors via Usercentrics "Deny All"
 * - GRANULAR: User made selective choices via the Usercentrics second layer
 *   (some vendors on, some off). The exact per-vendor flags live in `ConsentGrants`.
 */
export enum ConsentStatus {
  UNKNOWN = 'UNKNOWN',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
  GRANULAR = 'GRANULAR',
}

/**
 * Consent source - how consent was obtained
 */
export enum ConsentSource {
  USERCENTRICS = 'USERCENTRICS',
  CACHED = 'CACHED',
  DEFAULT = 'DEFAULT',
  REGION_NOT_REQUIRED = 'REGION_NOT_REQUIRED',
}

/**
 * Individual consent grants for specific purposes.
 *
 * Coarse buckets (analytics/advertising/personalization/crashReporting) are kept
 * for backwards compatibility with existing consumers. Per-vendor flags drive
 * the actual granular SDK enable/disable behaviour.
 */
export interface ConsentGrants {
  // Coarse buckets (legacy)
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  crashReporting: boolean;

  // Per-vendor flags (granular)
  firebaseAnalytics: boolean;
  crashlytics: boolean;
  sentry: boolean;
  facebook: boolean;
  adjust: boolean;
  appLovin: boolean;
  revenueCat: boolean;
  appsFlyer: boolean;
}

/**
 * Default consent grants (all denied)
 */
export const DEFAULT_CONSENT_GRANTS: ConsentGrants = {
  analytics: false,
  advertising: false,
  personalization: false,
  crashReporting: false,
  firebaseAnalytics: false,
  crashlytics: false,
  sentry: false,
  facebook: false,
  adjust: false,
  appLovin: false,
  revenueCat: false,
  appsFlyer: false,
};

/**
 * Full consent grants (all accepted)
 */
export const FULL_CONSENT_GRANTS: ConsentGrants = {
  analytics: true,
  advertising: true,
  personalization: true,
  crashReporting: true,
  firebaseAnalytics: true,
  crashlytics: true,
  sentry: true,
  facebook: true,
  adjust: true,
  appLovin: true,
  revenueCat: true,
  appsFlyer: true,
};

/**
 * Stored consent data
 */
export interface StoredConsent {
  status: ConsentStatus;
  grants: ConsentGrants;
  source: ConsentSource;
  timestamp: number;
  version: string;
}

/**
 * Consent result from presentation
 */
export interface ConsentResult {
  status: ConsentStatus;
  grants: ConsentGrants;
  source: ConsentSource;
}

/**
 * Consent gate interface
 */
export interface IConsentGate {
  presentConsentUI(): Promise<ConsentResult>;
  waitForConsent(): Promise<ConsentStatus>;
  getConsentStatus(): ConsentStatus;
  getConsentGrants(): ConsentGrants;
  isConsentResolved(): boolean;
  persistConsent(result: ConsentResult): Promise<void>;
  requireConsent(): void;
  requireConsentAccepted(): void;
}

/**
 * Usercentrics adapter interface
 */
export interface IUsercentricsAdapter {
  initialize(): Promise<void>;
  showConsentBanner(): Promise<ConsentResult>;
  /**
   * Re-open the Usercentrics second layer for an already-consented user
   * (e.g. from a Settings screen). Single-shot — does NOT loop on dismiss.
   * Returns the new ConsentResult, or null if the user dismissed without a decision.
   */
  showSecondLayerForUpdate(): Promise<ConsentResult | null>;
  getStatus(): Promise<UsercentricsStatus>;
  isConsentRequired(): Promise<boolean>;
}

/**
 * Usercentrics SDK status
 */
export interface UsercentricsStatus {
  shouldCollectConsent: boolean;
  geolocationRuleset?: {
    bannerRequiredAtLocation: boolean;
  };
}

/**
 * Consent storage interface
 */
export interface IConsentStorage {
  getStoredConsent(): Promise<StoredConsent | null>;
  storeConsent(consent: StoredConsent): Promise<void>;
  clearConsent(): Promise<void>;
}
