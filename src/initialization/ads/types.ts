/**
 * Ads Types
 *
 * Type definitions for ads mode management.
 */

/**
 * Ads personalization mode
 */
export enum AdsMode {
  PERSONALIZED = 'PERSONALIZED',
  NON_PERSONALIZED = 'NON_PERSONALIZED',
}

/**
 * Ads mode resolution result
 */
export interface AdsModeResolution {
  mode: AdsMode;
  idfaEnabled: boolean;
  trackingAllowed: boolean;
  reason: string;
}

/**
 * Ads configuration for SDKs
 */
export interface AdsConfig {
  mode: AdsMode;
  hasUserConsent: boolean;
  isAgeRestrictedUser: boolean;
  doNotSell: boolean;
  idfaEnabled: boolean;
}

/**
 * Ads mode resolver interface
 */
export interface IAdsModeResolver {
  resolve(
    consentStatus: import('../consent/types').ConsentStatus,
    attStatus: import('../att/types').ATTStatus,
  ): AdsModeResolution;
}
