/**
 * Initialization Module
 *
 * Privacy-compliant SDK initialization architecture.
 *
 * ARCHITECTURE OVERVIEW:
 * ─────────────────────────────────────────────────────────────
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │              InitializationOrchestrator                 │
 * │  (Single entry point - drives entire boot flow)        │
 * └─────────────────────────────────────────────────────────┘
 *                           │
 *           ┌───────────────┼───────────────┐
 *           ▼               ▼               ▼
 *    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 *    │ StateMachine│ │ ConsentGate │ │ATTController│
 *    └─────────────┘ └─────────────┘ └─────────────┘
 *           │               │               │
 *           └───────────────┼───────────────┘
 *                           ▼
 *              ┌─────────────────────────┐
 *              │     SDKBootstrapper     │
 *              │  (Coordinates all SDKs) │
 *              └─────────────────────────┘
 *                           │
 *    ┌──────────┬──────────┼──────────┬──────────┐
 *    ▼          ▼          ▼          ▼          ▼
 * Firebase  AppsFlyer  Sentry   AppLovin  RevenueCat
 *
 * BOOT FLOW:
 * ─────────────────────────────────────────────────────────────
 * 1. APP_LAUNCHED      → Show splash, start timeout guard
 * 2. SPLASH_READY      → Initialize RevenueCat Phase 1
 * 3. CONSENT_REQUIRED  → Show Usercentrics consent banner
 * 4. CONSENT_*         → Initialize SDKs based on decision
 * 5. ADS_INIT_COMPLETE → Hide splash, navigate to onboarding
 * 6. ONBOARDING_DONE   → Request ATT (iOS only)
 * 7. ATT_*             → Finalize ads mode
 * 8. READY/ACTIVE      → App fully initialized
 *
 * PRIVACY RULES:
 * ─────────────────────────────────────────────────────────────
 * • No tracking before consent
 * • Ads always shown (personalized or non-personalized)
 * • Consent DENIED → NON-PERSONALIZED ads, NO tracking
 * • ATT cannot override consent denial
 * • All logic centralized in AdsModeResolver
 *
 * @example
 * // In App.tsx
 * import { getOrchestrator } from './initialization';
 *
 * const App = () => {
 *   useEffect(() => {
 *     getOrchestrator().boot();
 *   }, []);
 *
 *   return <RootNavigator />;
 * };
 */

// Core utilities
export {
  AsyncLock,
  withTimeout,
  TimeoutError,
  delay,
  cancellableDelay,
} from './core';

// Errors
export {
  InitializationError,
  ConsentNotResolvedError,
  ConsentNotAcceptedError,
  ConsentPresentationError,
  SDKAlreadyInitializedError,
  SDKInitializationInProgressError,
  SDKInitializationError,
  InvalidStateTransitionError,
  GuardFailedError,
  OrchestratorBootError,
  FatalInitializationError,
} from './core/errors';

// State Machine
export {
  InitStateMachine,
  InitState,
  InitEvent,
  INITIAL_CONTEXT,
  stateTransitions,
  guards,
} from './state-machine';
export type { StateContext } from './state-machine';

// Consent
export {
  ConsentGate,
  UsercentricsAdapter,
  ConsentStorage,
  ConsentStatus,
  ConsentSource,
  DEFAULT_CONSENT_GRANTS,
  FULL_CONSENT_GRANTS,
} from './consent';
export type { ConsentGrants } from './consent';

// ATT
export { ATTController, ATTStatus } from './att';

// Ads
export { AdsModeResolver, AdsMode } from './ads';
export type { AdsModeResolution, AdsConfig } from './ads';

// SDK Adapters
export {
  FirebaseAdapter,
  AppsFlyerAdapter,
  SentryAdapter,
  AppLovinAdapter,
  RevenueCatAdapter,
  SDKStatus,
} from './sdk';
export type { RevenueCatPhase } from './sdk';

// Bootstrapper
export { SDKBootstrapper } from './bootstrapper';
export type { CoreSDKConfig } from './bootstrapper';

// Services
export { SplashService, NavigationService, navigationRef } from './services';

// Orchestrator
export {
  InitializationOrchestrator,
  getOrchestrator,
  resetOrchestrator,
} from './orchestrator';
export type { OrchestratorConfig } from './orchestrator';

// Presentation
export {
  InitializationGate,
  useInitialization,
  useInitializationState,
} from './presentation';
