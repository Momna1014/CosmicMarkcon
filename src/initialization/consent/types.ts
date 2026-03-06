/**
 * Consent Types
 *
 * Type definitions for consent management.
 */

/**
 * User consent status
 */
export enum ConsentStatus {
  UNKNOWN = 'UNKNOWN',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
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
 * Individual consent grants for specific purposes
 */
export interface ConsentGrants {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  crashReporting: boolean;
}

/**
 * Default consent grants (all denied)
 */
export const DEFAULT_CONSENT_GRANTS: ConsentGrants = {
  analytics: false,
  advertising: false,
  personalization: false,
  crashReporting: false,
};

/**
 * Full consent grants (all accepted)
 */
export const FULL_CONSENT_GRANTS: ConsentGrants = {
  analytics: true,
  advertising: true,
  personalization: true,
  crashReporting: true,
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
