/**
 * State Machine Types
 *
 * Core type definitions for the initialization state machine.
 */

import { ConsentStatus } from '../consent/types';
import { ATTStatus } from '../att/types';
import { AdsMode } from '../ads/types';

/**
 * Initialization states
 */
export enum InitState {
  // Boot Phase
  IDLE = 'IDLE',
  BOOTING = 'BOOTING',
  SPLASH_VISIBLE = 'SPLASH_VISIBLE',

  // Consent Phase
  CONSENT_PENDING = 'CONSENT_PENDING',
  CONSENT_PRESENTING = 'CONSENT_PRESENTING',
  CONSENT_ACCEPTED = 'CONSENT_ACCEPTED',
  CONSENT_DENIED = 'CONSENT_DENIED',

  // SDK Initialization Phase
  INITIALIZING_CORE = 'INITIALIZING_CORE',
  INITIALIZING_TRACKING = 'INITIALIZING_TRACKING',
  INITIALIZING_ADS_PERSONALIZED = 'INITIALIZING_ADS_PERSONALIZED',
  INITIALIZING_ADS_NON_PERSONALIZED = 'INITIALIZING_ADS_NON_PERSONALIZED',

  // Navigation Phase
  NAVIGATING_TO_ONBOARDING = 'NAVIGATING_TO_ONBOARDING',
  ONBOARDING_ACTIVE = 'ONBOARDING_ACTIVE',
  ONBOARDING_COMPLETE = 'ONBOARDING_COMPLETE',

  // ATT Phase (iOS only)
  ATT_PENDING = 'ATT_PENDING',
  ATT_PRESENTING = 'ATT_PRESENTING',
  ATT_RESOLVED = 'ATT_RESOLVED',

  // Final Phase
  FINALIZING_ADS_MODE = 'FINALIZING_ADS_MODE',
  READY = 'READY',
  ACTIVE = 'ACTIVE',

  // Error States
  ERROR_CONSENT_FAILED = 'ERROR_CONSENT_FAILED',
  ERROR_SDK_INIT_FAILED = 'ERROR_SDK_INIT_FAILED',
  ERROR_FATAL = 'ERROR_FATAL',
}

/**
 * Initialization events
 */
export enum InitEvent {
  // Boot Events
  APP_LAUNCHED = 'APP_LAUNCHED',
  SPLASH_READY = 'SPLASH_READY',

  // Consent Events
  CONSENT_REQUIRED = 'CONSENT_REQUIRED',
  CONSENT_ACCEPTED = 'CONSENT_ACCEPTED',
  CONSENT_DENIED = 'CONSENT_DENIED',
  CONSENT_FAILED = 'CONSENT_FAILED',
  CONSENT_TIMEOUT = 'CONSENT_TIMEOUT',

  // SDK Events
  CORE_INIT_COMPLETE = 'CORE_INIT_COMPLETE',
  CORE_INIT_FAILED = 'CORE_INIT_FAILED',
  TRACKING_INIT_COMPLETE = 'TRACKING_INIT_COMPLETE',
  TRACKING_INIT_FAILED = 'TRACKING_INIT_FAILED',
  ADS_INIT_COMPLETE = 'ADS_INIT_COMPLETE',
  ADS_INIT_FAILED = 'ADS_INIT_FAILED',

  // Navigation Events
  HIDE_SPLASH = 'HIDE_SPLASH',
  ONBOARDING_STARTED = 'ONBOARDING_STARTED',
  ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED',

  // ATT Events
  ATT_REQUEST = 'ATT_REQUEST',
  ATT_AUTHORIZED = 'ATT_AUTHORIZED',
  ATT_DENIED = 'ATT_DENIED',
  ATT_NOT_DETERMINED = 'ATT_NOT_DETERMINED',
  ATT_RESTRICTED = 'ATT_RESTRICTED',
  ATT_SKIPPED = 'ATT_SKIPPED', // Android or already determined

  // Final Events
  ADS_MODE_FINALIZED = 'ADS_MODE_FINALIZED',
  ACTIVATION_COMPLETE = 'ACTIVATION_COMPLETE',

  // Recovery Events
  RETRY_CONSENT = 'RETRY_CONSENT',
  RETRY_SDK_INIT = 'RETRY_SDK_INIT',
  FALLBACK_TO_MINIMAL = 'FALLBACK_TO_MINIMAL',
}

/**
 * State machine context
 */
export interface StateContext {
  // Boot tracking
  bootStartTime: number;
  splashStartTime: number | null;

  // Consent state
  consentStatus: ConsentStatus;
  consentTimestamp: number | null;
  consentRetryCount: number;

  // ATT state
  attStatus: ATTStatus;
  attTimestamp: number | null;

  // Ads state
  adsMode: AdsMode;

  // SDK tracking
  initializedSDKs: string[];
  failedSDKs: string[];

  // Error tracking
  lastError: Error | null;
  errorCount: number;

  // Flags
  isOnboardingComplete: boolean;
  isDegraded: boolean;
}

/**
 * Initial context values
 */
export const INITIAL_CONTEXT: StateContext = {
  bootStartTime: 0,
  splashStartTime: null,
  consentStatus: ConsentStatus.UNKNOWN,
  consentTimestamp: null,
  consentRetryCount: 0,
  attStatus: ATTStatus.NOT_DETERMINED,
  attTimestamp: null,
  adsMode: AdsMode.NON_PERSONALIZED,
  initializedSDKs: [],
  failedSDKs: [],
  lastError: null,
  errorCount: 0,
  isOnboardingComplete: false,
  isDegraded: false,
};

/**
 * State event with optional payload
 */
export interface StateEvent<T = unknown> {
  type: InitEvent;
  payload?: T;
  timestamp: number;
}

/**
 * State listener callback
 */
export interface StateTransitionInfo {
  from: InitState;
  to: InitState;
  event: InitEvent;
  context: StateContext;
  timestamp: number;
}

export type StateListener = (info: StateTransitionInfo) => void;
export type Unsubscribe = () => void;

/**
 * Guard function type
 */
export type GuardFunction = (
  context: StateContext,
  event: StateEvent,
) => boolean;

/**
 * Effect handler type
 */
export type EffectHandler = (context: StateContext) => Promise<void>;

/**
 * State transition definition
 */
export interface StateTransition {
  target: InitState;
  guard?: string | GuardFunction;
  effect?: string;
}

/**
 * State transition map
 */
export type StateTransitionMap = {
  [state in InitState]?: {
    [event in InitEvent]?: StateTransition;
  };
};

/**
 * State machine interface
 */
export interface IStateMachine {
  send(event: InitEvent, payload?: unknown): void;
  getState(): InitState;
  getContext(): StateContext;
  subscribe(listener: StateListener): Unsubscribe;
  onEffect(effectName: string, handler: EffectHandler): void;
  waitForState(states: InitState[]): Promise<void>;
  reset(): void;
}
