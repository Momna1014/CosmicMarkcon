/**
 * SDK Initialization Types
 *
 * TypeScript types and interfaces for the SDK initialization system.
 * Defines the structure for initialization phases, results, and state management.
 *
 * @module types
 */

/**
 * Initialization phases
 */
export enum InitPhase {
  NATIVE = 'native',
  CRITICAL = 'critical',
  CONSENT = 'consent',
  CONSENT_DEPENDENT = 'consent-dependent',
  COMPLETE = 'complete',
}

/**
 * SDK initialization status
 */
export enum SDKInitStatus {
  NOT_STARTED = 'not-started',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  DISABLED = 'disabled',
}

/**
 * User consent decision
 */
export type ConsentDecision =
  | 'not-determined'
  | 'accepted'
  | 'denied'
  | 'region-not-required'
  | 'dismissed';

/**
 * Source of consent decision
 */
export type ConsentSource =
  | 'usercentrics-accepted'
  | 'usercentrics-denied'
  | 'usercentrics-granular'
  | 'region-not-required'
  | 'cached'
  | 'not-first-launch'
  | 'dismissed'
  | 'error';

/**
 * ATT (App Tracking Transparency) status
 */
export type ATTStatus =
  | 'authorized'
  | 'denied'
  | 'not-determined'
  | 'restricted'
  | 'unavailable';

/**
 * Individual SDK initialization result
 */
export interface SDKInitResult {
  sdkId: string;
  status: SDKInitStatus;
  error?: Error;
  duration?: number;
}

/**
 * Phase initialization result
 */
export interface PhaseInitResult {
  phase: InitPhase;
  success: boolean;
  sdkResults: SDKInitResult[];
  duration?: number;
  error?: Error;
}

/**
 * Consent-dependent initialization result
 */
export interface ConsentInitResult extends PhaseInitResult {
  attStatus: ATTStatus;
  trackingEnabled: boolean;
}

/**
 * SDK status map
 */
export interface SDKStatusMap {
  sentry: SDKInitStatus;
  crashlytics: SDKInitStatus;
  revenueCat: SDKInitStatus;
  remoteConfig: SDKInitStatus;
  facebook: SDKInitStatus;
  firebaseAnalytics: SDKInitStatus;
  appsFlyer: SDKInitStatus;
  appLovin: SDKInitStatus;
  att: SDKInitStatus;
}

/**
 * Complete initialization state
 */
export interface InitializationState {
  currentPhase: InitPhase;
  sdkStatus: SDKStatusMap;
  consentDecision: ConsentDecision;
  consentSource: ConsentSource | null;
  attStatus: ATTStatus;
  attDialogShown: boolean;
  trackingEnabled: boolean;
  isFullyInitialized: boolean;
  errors: Error[];
  startTime: number | null;
  endTime: number | null;
}

/**
 * Initialization event types
 */
export type InitEventType =
  | 'phase-started'
  | 'phase-completed'
  | 'sdk-initialized'
  | 'sdk-failed'
  | 'consent-received'
  | 'att-result'
  | 'initialization-complete'
  | 'error';

/**
 * Initialization event
 */
export interface InitEvent {
  type: InitEventType;
  phase?: InitPhase;
  sdkId?: string;
  status?: SDKInitStatus;
  consentDecision?: ConsentDecision;
  attStatus?: ATTStatus;
  error?: Error;
  timestamp: number;
}

/**
 * Event listener function
 */
export type InitEventListener = (event: InitEvent) => void;

/**
 * Initialization configuration
 */
export interface InitConfig {
  debugLogging?: boolean;
  autoStart?: boolean;
  remoteConfigDefaults?: Record<string, boolean | string | number>;
  onPhase1Complete?: () => void;
  onConsentReceived?: (decision: ConsentDecision) => void;
  onFullyInitialized?: () => void;
}

/**
 * Consent flow configuration
 */
export interface ConsentFlowConfig {
  ruleSetId: string;
  debugLogging?: boolean;
  retryCount?: number;
  retryDelayMs?: number;
}

/**
 * Critical services initialization configuration
 */
export interface CriticalServicesConfig {
  debugLogging?: boolean;
  remoteConfigDefaults?: Record<string, boolean | string | number>;
}

/**
 * Consent-dependent initialization configuration
 */
export interface ConsentDependentConfig {
  consentDecision: ConsentDecision;
  debugLogging?: boolean;
  skipATT?: boolean;
}

/**
 * Persisted consent state for returning users
 */
export interface PersistedConsentState {
  consentDecision: ConsentDecision;
  consentSource: ConsentSource;
  attStatus: ATTStatus;
  attDialogShown: boolean;
  timestamp: number;
  appVersion: string;
}

/**
 * useSDKInitialization hook return type
 */
export interface UseSDKInitializationResult {
  state: InitializationState;
  phase1Complete: boolean;
  isFullyInitialized: boolean;
  isTrackingEnabled: boolean;
  consentDecision: ConsentDecision;
  handleConsent: (decision: ConsentDecision, source: ConsentSource) => Promise<void>;
  handleConsentRevoked: () => Promise<void>;
  getDebugInfo: () => Record<string, unknown>;
}

/**
 * Default SDK status map
 */
export const DEFAULT_SDK_STATUS: SDKStatusMap = {
  sentry: SDKInitStatus.NOT_STARTED,
  crashlytics: SDKInitStatus.NOT_STARTED,
  revenueCat: SDKInitStatus.NOT_STARTED,
  remoteConfig: SDKInitStatus.NOT_STARTED,
  facebook: SDKInitStatus.NOT_STARTED,
  firebaseAnalytics: SDKInitStatus.NOT_STARTED,
  appsFlyer: SDKInitStatus.NOT_STARTED,
  appLovin: SDKInitStatus.NOT_STARTED,
  att: SDKInitStatus.NOT_STARTED,
};

/**
 * Default initialization state
 */
export const DEFAULT_INIT_STATE: InitializationState = {
  currentPhase: InitPhase.NATIVE,
  sdkStatus: { ...DEFAULT_SDK_STATUS },
  consentDecision: 'not-determined',
  consentSource: null,
  attStatus: 'not-determined',
  attDialogShown: false,
  trackingEnabled: false,
  isFullyInitialized: false,
  errors: [],
  startTime: null,
  endTime: null,
};
