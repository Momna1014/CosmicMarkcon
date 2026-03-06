/**
 * Consent Module
 *
 * Handles user consent collection and enforcement.
 */

export { ConsentGate } from './ConsentGate';
export { UsercentricsAdapter } from './UsercentricsAdapter';
export { ConsentStorage, createDefaultStoredConsent } from './ConsentStorage';
export {
  ConsentStatus,
  ConsentSource,
  DEFAULT_CONSENT_GRANTS,
  FULL_CONSENT_GRANTS,
} from './types';
export type {
  ConsentGrants,
  ConsentResult,
  StoredConsent,
  IConsentGate,
  IUsercentricsAdapter,
  IConsentStorage,
} from './types';
