/**
 * Ads Mode Resolver
 *
 * Centralized logic for determining personalized vs non-personalized ads.
 * Implements the consent/ATT decision matrix.
 *
 * DECISION MATRIX:
 * ┌─────────────────┬─────────────┬──────────────────┬─────────────┬──────────────────┐
 * │ Consent Status  │ ATT Status  │ Ads Mode         │ IDFA        │ Tracking Allowed │
 * ├─────────────────┼─────────────┼──────────────────┼─────────────┼──────────────────┤
 * │ ACCEPTED        │ AUTHORIZED  │ PERSONALIZED     │ ✅ Enabled   │ ✅ Yes           │
 * │ ACCEPTED        │ DENIED      │ NON-PERSONALIZED │ ❌ Disabled  │ ✅ Yes           │
 * │ ACCEPTED        │ RESTRICTED  │ NON-PERSONALIZED │ ❌ Disabled  │ ✅ Yes           │
 * │ ACCEPTED        │ NOT_DET.    │ NON-PERSONALIZED │ ❌ Disabled  │ ✅ Yes           │
 * │ ACCEPTED        │ N/A (Android)│ PERSONALIZED    │ ❌ N/A       │ ✅ Yes           │
 * │ DENIED          │ ANY         │ NON-PERSONALIZED │ ❌ Disabled  │ ❌ No            │
 * │ UNKNOWN         │ ANY         │ NON-PERSONALIZED │ ❌ Disabled  │ ❌ No            │
 * └─────────────────┴─────────────┴──────────────────┴─────────────┴──────────────────┘
 *
 * CRITICAL RULES:
 * 1. Consent DENIED → ALWAYS non-personalized, NO tracking (applies to BOTH iOS and Android)
 * 2. ATT cannot override consent denial
 * 3. Personalized ads require BOTH consent AND ATT authorization (iOS) OR just consent (Android)
 * 4. Ads are ALWAYS shown (personalized or non-personalized)
 * 5. Android: Consent ACCEPTED → PERSONALIZED ads (user data allowed)
 * 6. Android: Consent DENIED → NON-PERSONALIZED ads (NO user data, contextual ads only)
 */

import { ConsentStatus } from '../consent/types';
import { ATTStatus } from '../att/types';
import { AdsMode, AdsModeResolution, IAdsModeResolver } from './types';

/**
 * Ads Mode Resolver Implementation
 */
export class AdsModeResolver implements IAdsModeResolver {
  /**
   * Resolve ads mode based on consent and ATT status
   */
  resolve(consent: ConsentStatus, att: ATTStatus): AdsModeResolution {
    // ═══════════════════════════════════════════════════════════════
    // RULE 1: Consent DENIED always forces non-personalized
    // This CANNOT be overridden by ATT
    // ═══════════════════════════════════════════════════════════════
    if (consent === ConsentStatus.DENIED) {
      return {
        mode: AdsMode.NON_PERSONALIZED,
        idfaEnabled: false,
        trackingAllowed: false,
        reason: 'User denied Usercentrics consent - no tracking permitted',
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // RULE 2: Consent UNKNOWN (should not happen, but fail-safe)
    // ═══════════════════════════════════════════════════════════════
    if (consent === ConsentStatus.UNKNOWN) {
      return {
        mode: AdsMode.NON_PERSONALIZED,
        idfaEnabled: false,
        trackingAllowed: false,
        reason: 'Consent status unknown - defaulting to non-personalized',
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // At this point, consent is ACCEPTED
    // Now check ATT status (iOS) or platform (Android)
    // ═══════════════════════════════════════════════════════════════

    // ANDROID: Consent ACCEPTED → PERSONALIZED ads with full tracking
    // Android doesn't have ATT concept, so consent alone determines ads mode
    // User data CAN be used for personalized ads when consent is accepted
    if (att === ATTStatus.NOT_APPLICABLE) {
      return {
        mode: AdsMode.PERSONALIZED,
        idfaEnabled: false, // No IDFA on Android (Android uses GAID which is handled differently)
        trackingAllowed: true, // User data allowed - consent was accepted
        reason: 'Android platform with Usercentrics consent accepted - personalized ads with user data',
      };
    }

    // iOS with ATT authorized
    if (att === ATTStatus.AUTHORIZED) {
      return {
        mode: AdsMode.PERSONALIZED,
        idfaEnabled: true,
        trackingAllowed: true,
        reason: 'Full consent and ATT authorization - personalized ads enabled',
      };
    }

    // iOS with ATT not authorized (denied, restricted, or not determined)
    return {
      mode: AdsMode.NON_PERSONALIZED,
      idfaEnabled: false,
      trackingAllowed: true, // Tracking allowed (consent given), just no IDFA
      reason: this.getATTReasonString(att),
    };
  }

  /**
   * Get human-readable reason for ATT status
   */
  private getATTReasonString(att: ATTStatus): string {
    switch (att) {
      case ATTStatus.DENIED:
        return 'User denied ATT permission - non-personalized ads only';
      case ATTStatus.RESTRICTED:
        return 'ATT restricted by system - non-personalized ads only';
      case ATTStatus.NOT_DETERMINED:
        return 'ATT not yet determined - non-personalized ads until requested';
      default:
        return 'ATT not authorized - non-personalized ads only';
    }
  }

  /**
   * Quick check if personalized ads are possible
   */
  canShowPersonalizedAds(consent: ConsentStatus, att: ATTStatus): boolean {
    const resolution = this.resolve(consent, att);
    return resolution.mode === AdsMode.PERSONALIZED;
  }

  /**
   * Quick check if tracking is allowed
   */
  isTrackingAllowed(consent: ConsentStatus, att: ATTStatus): boolean {
    const resolution = this.resolve(consent, att);
    return resolution.trackingAllowed;
  }
}

export default AdsModeResolver;
