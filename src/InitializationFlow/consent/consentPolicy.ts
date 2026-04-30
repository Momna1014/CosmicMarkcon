/**
 * Vendor / category gating policy (functional).
 *
 * IMPORTANT FOR JUNIOR DEVS:
 *   • Vendor matching is done by service NAME / category / dataProcessor /
 *     type strings returned at runtime by `Usercentrics.getCMPData()`.
 *   • templateIds DIFFER for every Usercentrics dashboard — NEVER hardcode
 *     them. Add tokens here when you add a new vendor in the dashboard.
 *   • `isEssential` and `categorySlug` come straight from Usercentrics; we
 *     don't override them in code.
 *   • Category helpers (`isAnalyticsAllowed`, `isAdvertisingAllowed`, …) are
 *     the high-level gates used by `deferredSDKs.ts` to decide which SDK to
 *     init. Keep them in sync with the token map below if you rename a
 *     vendor.
 */

import type { ConsentDecision, ConsentResult, ConsentVendorKey } from '../types';

export const VENDOR_TOKEN_MAP: Record<ConsentVendorKey, string[]> = {
  firebaseAnalytics: ['firebase analytics', 'firebase_analytics', 'analytics'],
  firebaseCrashlytics: ['firebase crashlytics', 'firebase_crashlytics', 'crashlytics', 'crash'],
  sentry: ['sentry', 'crash', 'diagnostic'],
  adjust: ['adjust', 'attribution'],
  admob: ['admob', 'google mobile ads', 'advertising', 'marketing', 'ads'],
  applovin: ['applovin', 'max', 'advertising', 'marketing', 'ads'],
  appsflyer: ['appsflyer', 'attribution'],
  facebook: ['facebook', 'meta', 'advertising', 'marketing', 'ads'],
  revenuecat: ['revenuecat', 'purchase', 'subscription', 'personalization', 'personalisation'],
  remoteConfig: ['remote config', 'remote_config', 'firebase remote config'],
};

function toSearchableText(decision: ConsentDecision): string {
  return [
    decision.templateId,
    decision.dataProcessor,
    decision.category,
    decision.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function hasDecisionMatch(
  consent: ConsentResult,
  tokens: string[],
  expectedGranted: boolean,
): boolean {
  const normalizedTokens = tokens.map(token => token.toLowerCase());

  return Object.values(consent.decisions).some(decision => {
    if (decision.granted !== expectedGranted) {
      return false;
    }

    const haystack = toSearchableText(decision);
    return normalizedTokens.some(token => haystack.includes(token));
  });
}

export function isVendorAllowed(consent: ConsentResult, vendor: ConsentVendorKey): boolean {
  const vendorGrant = consent.vendorGrants?.[vendor];
  if (typeof vendorGrant === 'boolean') {
    return vendorGrant;
  }

  const tokens = VENDOR_TOKEN_MAP[vendor];
  return hasDecisionMatch(consent, tokens, true);
}

export function isAnalyticsAllowed(consent: ConsentResult): boolean {
  return (
    isVendorAllowed(consent, 'firebaseAnalytics') ||
    isVendorAllowed(consent, 'adjust') ||
    isVendorAllowed(consent, 'remoteConfig') ||
    consent.grants.analytics
  );
}

export function isCrashReportingAllowed(consent: ConsentResult): boolean {
  return (
    isVendorAllowed(consent, 'firebaseCrashlytics') ||
    isVendorAllowed(consent, 'sentry') ||
    consent.grants.crashReporting
  );
}

export function isAdvertisingAllowed(consent: ConsentResult): boolean {
  return (
    isVendorAllowed(consent, 'admob') ||
    isVendorAllowed(consent, 'applovin') ||
    isVendorAllowed(consent, 'facebook') ||
    consent.grants.advertising
  );
}

export function isPersonalizationAllowed(consent: ConsentResult): boolean {
  return isVendorAllowed(consent, 'revenuecat') || consent.grants.personalization;
}

export function isDeniedConsent(consent: ConsentResult): boolean {
  return consent.status === 'denied' || !hasAnyGrantedNonEssentialDecision(consent);
}

export function hasAnyGrantedNonEssentialDecision(consent: ConsentResult): boolean {
  const decisions = Object.values(consent.decisions);
  if (decisions.length === 0) {
    return Object.values(consent.grants).some(Boolean);
  }

  return decisions.some(decision => !decision.isEssential && decision.granted);
}
