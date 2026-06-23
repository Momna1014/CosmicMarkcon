export type ConsentStatus = 'accepted' | 'denied' | 'granular';
export type ConsentSource = 'usercentrics' | 'cached' | 'region-not-required' | 'network-failure';
export type Region = 'eu' | 'non-eu';
export type ConsentIdentityType = 'ruleset' | 'settings';

export type ConsentIdentity = {
  type: ConsentIdentityType;
  value: string;
  key: string;
};

export type ConsentInteraction =
  | 'accept-all'
  | 'deny-all'
  | 'granular'
  | 'no-interaction'
  | 'unknown';

export type ConsentDecision = {
  templateId: string;
  dataProcessor: string;
  category: string;
  type: string;
  isEssential: boolean;
  granted: boolean;
  version: string;
};

export type ConsentDecisionMap = Record<string, ConsentDecision>;

export type ConsentVendorKey =
  | 'firebaseAnalytics'
  | 'firebaseCrashlytics'
  | 'sentry'
  | 'adjust'
  // @feature:admob:start [disabled]
  // | 'admob'
  // @feature:admob:end
  | 'facebook'
  | 'revenuecat'
  | 'remoteConfig';

// admob is optional so the codebase still type-checks while AdMob stays
// disabled (its VendorGrants field is commented out).
export type VendorGrants = {
  firebaseAnalytics: boolean;
  firebaseCrashlytics: boolean;
  sentry: boolean;
  adjust?: boolean;
  // @feature:admob:start [disabled]
  // admob?: boolean;
  // @feature:admob:end
  facebook: boolean;
  revenuecat: boolean;
  remoteConfig: boolean;
};

export type ConsentGrants = {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  crashReporting: boolean;
};

export const DEFAULT_CONSENT_GRANTS: ConsentGrants = {
  analytics: false,
  advertising: false,
  personalization: false,
  crashReporting: false,
};

export const FULL_CONSENT_GRANTS: ConsentGrants = {
  analytics: true,
  advertising: true,
  personalization: true,
  crashReporting: true,
};

export const DEFAULT_VENDOR_GRANTS: VendorGrants = {
  firebaseAnalytics: false,
  firebaseCrashlytics: false,
  sentry: false,
  // @feature:adjust:start
  adjust: false,
  // @feature:adjust:end
  // @feature:admob:start [disabled]
  // admob: false,
  // @feature:admob:end
  facebook: false,
  revenuecat: false,
  remoteConfig: false,
};

export const EMPTY_CONSENT_DECISIONS: ConsentDecisionMap = {};

export type ConsentResult = {
  status: ConsentStatus;
  interaction: ConsentInteraction;
  grants: ConsentGrants;
  vendorGrants: VendorGrants;
  decisions: ConsentDecisionMap;
  identity: ConsentIdentity | null;
  source: ConsentSource;
  region: Region;
  timestamp: number;
};

export type ATTStatus =
  | 'authorized'
  | 'denied'
  | 'restricted'
  | 'not-determined'
  | 'not-applicable';

export type AdsMode = 'personalized' | 'non-personalized';

export type AdsModeResult = {
  mode: AdsMode;
  idfaEnabled: boolean;
  trackingAllowed: boolean;
  reason: string;
};

export type InitializationResult = {
  consent: ConsentResult;
  attStatus: ATTStatus;
  adsMode: AdsModeResult;
};
