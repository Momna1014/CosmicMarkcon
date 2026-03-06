/**
 * State Guards
 *
 * Guard functions that determine if a transition should be allowed.
 * Guards must be pure functions that return boolean.
 */

import { Platform } from 'react-native';
import { StateContext, StateEvent, GuardFunction } from './types';
import { ConsentStatus } from '../consent/types';

/**
 * Maximum retry counts
 */
const MAX_CONSENT_RETRIES = 3;
const MAX_SDK_INIT_RETRIES = 2;

/**
 * Guard: Validate consent payload exists
 */
export const validateConsentPayload: GuardFunction = (
  _context: StateContext,
  event: StateEvent,
): boolean => {
  return event.payload !== undefined && event.payload !== null;
};

/**
 * Guard: Check if platform is iOS
 */
export const isIOSPlatform: GuardFunction = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Guard: Check if platform is Android or ATT is not required
 */
export const isAndroidOrATTNotRequired: GuardFunction = (
  context: StateContext,
): boolean => {
  // Android doesn't have ATT
  if (Platform.OS !== 'ios') return true;

  // If consent was denied, skip ATT
  if (context.consentStatus === ConsentStatus.DENIED) return true;

  return false;
};

/**
 * Guard: Check if consent retry is allowed
 */
export const canRetryConsent: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.consentRetryCount < MAX_CONSENT_RETRIES;
};

/**
 * Guard: Check if max consent retries exceeded
 */
export const maxRetriesExceeded: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.consentRetryCount >= MAX_CONSENT_RETRIES;
};

/**
 * Guard: Check if SDK init retry is allowed
 */
export const canRetrySDKInit: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.errorCount < MAX_SDK_INIT_RETRIES;
};

/**
 * Guard: Check if consent was accepted
 */
export const isConsentAccepted: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.consentStatus === ConsentStatus.ACCEPTED;
};

/**
 * Guard: Check if consent was denied
 */
export const isConsentDenied: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.consentStatus === ConsentStatus.DENIED;
};

/**
 * Guard: Check if onboarding is complete
 */
export const isOnboardingComplete: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.isOnboardingComplete;
};

/**
 * Guard: Check if app is in degraded mode
 */
export const isDegradedMode: GuardFunction = (
  context: StateContext,
): boolean => {
  return context.isDegraded;
};

/**
 * Guard registry - maps guard names to functions
 */
export const guards: Record<string, GuardFunction> = {
  validateConsentPayload,
  isIOSPlatform,
  isAndroidOrATTNotRequired,
  canRetryConsent,
  maxRetriesExceeded,
  canRetrySDKInit,
  isConsentAccepted,
  isConsentDenied,
  isOnboardingComplete,
  isDegradedMode,
};

/**
 * Evaluate a guard by name or function
 */
export function evaluateGuard(
  guard: string | GuardFunction,
  context: StateContext,
  event: StateEvent,
): boolean {
  if (typeof guard === 'function') {
    return guard(context, event);
  }

  const guardFn = guards[guard];
  if (!guardFn) {
    console.warn(`[Guards] Unknown guard: ${guard}, defaulting to true`);
    return true;
  }

  return guardFn(context, event);
}

export default guards;
