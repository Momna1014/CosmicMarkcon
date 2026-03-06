/**
 * SDK Initialization Module
 *
 * Public API for the SDK initialization system.
 * Import from this file to access all initialization functionality.
 *
 * @module initialization
 *
 * @example
 * ```tsx
 * import {
 *   useSDKInitialization,
 *   runConsentFlow,
 *   sdkOrchestrator,
 * } from './services/initialization';
 *
 * const { phase1Complete, isFullyInitialized } = useSDKInitialization({
 *   debugLogging: __DEV__,
 * });
 *
 * useEffect(() => {
 *   if (phase1Complete) {
 *     runConsentFlow({ ruleSetId: 'your-ruleset-id' });
 *   }
 * }, [phase1Complete]);
 * ```
 */

// Main Orchestrator
export { sdkOrchestrator } from './SDKInitializationOrchestrator';
export { default as SDKInitializationOrchestrator } from './SDKInitializationOrchestrator';

// React Hooks
export {
  useSDKInitialization,
  usePhase1Complete,
  useInitializationComplete,
  useTrackingEnabled,
  useConsentDecision,
} from './useSDKInitialization';

// Phase 1: Critical Services
export {
  initializeCriticalServices,
  getRemoteConfigValue,
  isFeatureEnabled,
} from './CriticalServicesInitializer';

// Phase 2: Consent Flow
export {
  runConsentFlow,
  showPrivacySettings,
  getConsentStatus,
  resetConsent,
} from './ConsentFlowIntegration';

// Phase 3: Consent-Dependent SDKs
export {
  initializeConsentDependentSDKs,
  disableAllTracking,
  getATTStatus,
} from './ConsentDependentInitializer';

// Types
export * from './types';
