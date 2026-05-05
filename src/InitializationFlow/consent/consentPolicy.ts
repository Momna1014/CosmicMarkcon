/**
 * Vendor / category gating policy (functional).
 *
 * FOR DEVS:
 *   • Vendor matching uses TWO complementary strategies:
 *       1. Exact templateId lookup via `KNOWN_TEMPLATE_IDS` — highest confidence.
 *          Usercentrics templateIds are GLOBAL CATALOG IDs, identical across all
 *          dashboards for the same service. Safe and stable to register here.
 *       2. Name / category / dataProcessor / type token matching via
 *          `VENDOR_TOKEN_MAP` — belt-and-suspenders for services not yet in the
 *          catalog or with unexpected dashboard configuration.
 *   • To register a new vendor: add its templateId to `KNOWN_TEMPLATE_IDS` below
 *     with the correct `vendorKey` and `grants`. No other files need changing for
 *     known services.
 *   • `isEssential` and `categorySlug` come straight from Usercentrics; we don't
 *     override them in code.
 *   • Category helpers (`isAnalyticsAllowed`, `isAdvertisingAllowed`, …) are the
 *     high-level gates used by `deferredSDKs.ts` to decide which SDK to init.
 *     Keep them in sync with the token map if you add a new vendor key.
 */

import type { ConsentDecision, ConsentGrants, ConsentResult, ConsentVendorKey } from '../types';

// ---------------------------------------------------------------------------
// Template grant type
// ---------------------------------------------------------------------------

/**
 * Describes how a single Usercentrics templateId maps to SDK-level and
 * category-level consent grants.
 *
 * - `vendorKey`  — when set and the decision is granted, flips the matching
 *                  `VendorGrants` flag, enabling the exact SDK gate.
 * - `grants`     — category-level flags (`analytics`, `advertising`, …) the
 *                  templateId contributes to when granted. Use `[]` for
 *                  functional / essential services that must never inflate
 *                  consent grant counts.
 */
export type TemplateGrant = {
  vendorKey?: ConsentVendorKey;
  grants: ReadonlyArray<keyof ConsentGrants>;
};

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

// ---------------------------------------------------------------------------
// Known Usercentrics templateId catalog
//
// templateIds are GLOBAL catalog IDs — identical for the same service across
// all Usercentrics dashboards. Registering them here means that as soon as a
// service is added in the UC dashboard it is automatically routed to the
// correct vendor / category grants without any further code changes.
//
// Add entries as new services are onboarded. Keep `grants: []` for
// functional / essential services that must not inflate consent grant counts.
// ---------------------------------------------------------------------------

export const KNOWN_TEMPLATE_IDS: Record<string, TemplateGrant> = {
  // ---- Ad Networks (advertising grant only) -------------------------------
  'hv3CkcEHZ9EQ_j': { grants: ['advertising'] },              // Ad Quality by ironSource
  'J64M6DKwx':      { grants: ['advertising'] },              // AdColony
  'bTFVs8qY_hqoug': { grants: ['advertising'] },              // AdColony (alt)
  'N2spyFPL':        { grants: ['advertising'] },              // Amazon Advertising
  '1dArEN3cO':       { grants: ['advertising'] },              // Amazon Mobile Ads
  'IUyljv4X5':       { grants: ['advertising'] },              // Amazon Publisher Service
  'XFAdcSj-7Jc-JJ':  { grants: ['advertising'] },              // Appodeal
  'fcn0BvY5_U3k6G':  { grants: ['advertising'] },              // BIGO Ads
  'IEbRp3saT':       { grants: ['advertising'] },              // Chartboost
  'q6FEv3jcYyYunG':  { grants: ['advertising'] },              // Digital Turbine Ignite
  'H17alcVo_iZ7':    { grants: ['advertising'] },              // Fyber
  'b5UwVqnTvXtU4Q':  { grants: ['advertising'] },              // Gadsme
  'n9pGpcK5L':       { grants: ['advertising'] },              // Google Ad Exchange
  '7M0cXS2pQ':       { grants: ['advertising'] },              // Google Ad Manager
  'S1_9Vsuj-Q':      { grants: ['advertising'] },              // Google Ads
  'ROCBK21nx':       { grants: ['advertising'] },              // HyprMX
  'ykdq8J5a9MExGT':  { grants: ['advertising'] },              // InMobi
  'Hyu6e9VjdoWQ':    { grants: ['advertising'] },              // InMobi Pte
  '9dchbL797':       { grants: ['advertising'] },              // ironSource
  'EMD3qUMa8':       { grants: ['advertising'] },              // Liftoff
  'E6AgqirYV':       { grants: ['advertising'] },              // Mintegral SDK
  'VPSyZyTbYPSHpF':  { grants: ['advertising'] },              // MobileFuse
  'p0b03PgiffqmVQ':  { grants: ['advertising'] },              // Moloco Ad Cloud
  'asj2W6ayi':       { grants: ['advertising'] },              // MoPub
  'S0i4seKvH':       { grants: ['advertising'] },              // myTarget SDK
  'M8wnlqZvUAkxEv':  { grants: ['advertising'] },              // odeeo
  'rJ-vecVo_s-m':    { grants: ['advertising'] },              // Ogury
  'HWSNU_Ll1':       { grants: ['advertising'] },              // Pangle SDK
  'Bym-eqViuo-X':    { grants: ['advertising'] },              // PubMatic
  'Byt-l54i_i-Q':    { grants: ['advertising'] },              // Smaato
  'QcD9GVNXZ':       { grants: ['advertising'] },              // Snapchat
  'xLgL2b0bmU-RT_':  { grants: ['advertising'] },              // Supersonic
  'B1DLe54jui-X':    { grants: ['advertising'] },              // Tapjoy
  'hpb62D82I':       { grants: ['advertising'] },              // Unity Ads
  '5bv4OvSwoXKh-G':  { grants: ['advertising'] },              // Verve HyBid / PubNative

  // ---- Ad Networks with vendorKey -----------------------------------------
  'r7rvuoyDz':       { vendorKey: 'admob',     grants: ['advertising'] },   // AdMob
  'fHczTMzX8':       { vendorKey: 'applovin',  grants: ['advertising'] },   // AppLovin
  'Gx9iMF__f':       { vendorKey: 'appsflyer', grants: ['analytics', 'advertising'] }, // AppsFlyer
  '1XvFW-Y2k':       { vendorKey: 'facebook',  grants: ['advertising'] },   // Facebook
  'ax0Nljnj2szF_r':  { vendorKey: 'facebook',  grants: ['advertising'] },   // Facebook Audience Network
  'ocv9HNX_g':       { vendorKey: 'facebook',  grants: ['advertising'] },   // Facebook SDK

  // ---- Analytics-only (no vendorKey, no dedicated SDK gate needed) --------
  'NzIW86WRUkmZJK':  { grants: ['analytics'] },                             // devtodev
  'bQTbuxnTb':       { grants: ['analytics'] },                             // GameAnalytics SDK
  'HkocEodjb7':      { grants: ['analytics'] },                             // Google Analytics
  'BJ59EidsWQ':      { grants: ['analytics'] },                             // Google Tag Manager
  'RXkipVe3xznWMq':  { grants: ['analytics'] },                             // Unity Analytics

  // ---- Firebase / Google analytics — map to firebaseAnalytics vendorKey ---
  '42vRvlulK96R-F':  { vendorKey: 'firebaseAnalytics', grants: ['analytics'] },             // Firebase
  'diWdt4yLB':       { vendorKey: 'firebaseAnalytics', grants: ['analytics'] },             // Google Analytics for Firebase
  'uNl9XGnZC':       { vendorKey: 'firebaseAnalytics', grants: ['analytics'] },             // Google Firebase
  'kjk3gPD2cxt_Ea':  { vendorKey: 'firebaseAnalytics', grants: ['analytics'] },             // Google Firebase Analytics
  'GqhZxB-iiydzEk':  { vendorKey: 'firebaseAnalytics', grants: ['analytics', 'advertising'] }, // Google Analytics Advertising for Firebase

  // ---- Crash reporting ------------------------------------------------------
  'cE0B0wy4Z':        { vendorKey: 'firebaseCrashlytics', grants: ['crashReporting'] }, // Firebase Crashlytics
  'rH1vNPCFR':        { vendorKey: 'sentry',              grants: ['crashReporting'] }, // Sentry

  // ---- Personalization ------------------------------------------------------
  '2LQcBGGtLPkeZx':   { vendorKey: 'revenuecat', grants: ['personalization'] }, // RevenueCat

  // ---- Functional / essential — must NOT inflate consent grant counts ------
  'Mp0TG-j8k':        { grants: [] }, // Firebase Cloud Messaging
  'smOQ7x8wu':        { grants: [] }, // Firebase Auth
  'OO202MrWM':        { grants: [] }, // Firebase Firestore
  'XJGT8f-58':        { grants: [] }, // Google Sign-In
  'Hko_qNsui-Q':      { grants: [] }, // reCAPTCHA
  'H1Vl5NidjWX':      { grants: [] }, // Usercentrics CMP
};

/**
 * Pre-built lowercase key lookup for O(1) case-insensitive templateId access.
 * Computed once at module initialisation — zero runtime cost per lookup.
 */
const TEMPLATE_IDS_LOWER: Record<string, TemplateGrant> = Object.fromEntries(
  Object.entries(KNOWN_TEMPLATE_IDS).map(([k, v]) => [k.toLowerCase(), v]),
);

/**
 * Returns the `TemplateGrant` for a given Usercentrics templateId.
 * The lookup is case-insensitive.
 * Returns `undefined` for templateIds not in the catalog.
 */
export function getTemplateGrant(templateId: string): TemplateGrant | undefined {
  return TEMPLATE_IDS_LOWER[templateId.toLowerCase()];
}

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
