/**
 * State Transitions
 *
 * Defines all valid state transitions in the initialization state machine.
 * This is the single source of truth for the boot flow.
 */

import { InitState, InitEvent, StateTransitionMap } from './types';

/**
 * Complete state transition table
 */
export const stateTransitions: StateTransitionMap = {
  // =====================================================
  // BOOT PHASE
  // =====================================================
  [InitState.IDLE]: {
    [InitEvent.APP_LAUNCHED]: {
      target: InitState.BOOTING,
      effect: 'showSplash',
    },
  },

  [InitState.BOOTING]: {
    [InitEvent.SPLASH_READY]: {
      target: InitState.SPLASH_VISIBLE,
      effect: 'initializeMinimalBootstrap',
    },
  },

  [InitState.SPLASH_VISIBLE]: {
    [InitEvent.CONSENT_REQUIRED]: {
      target: InitState.CONSENT_PENDING,
      effect: 'presentConsentUI',
    },
  },

  // =====================================================
  // CONSENT PHASE
  // =====================================================
  [InitState.CONSENT_PENDING]: {
    [InitEvent.CONSENT_ACCEPTED]: {
      target: InitState.CONSENT_ACCEPTED,
      effect: 'storeConsentAccepted',
    },
    [InitEvent.CONSENT_DENIED]: {
      target: InitState.CONSENT_DENIED,
      effect: 'storeConsentDenied',
    },
    [InitEvent.CONSENT_FAILED]: {
      target: InitState.ERROR_CONSENT_FAILED,
      effect: 'logConsentError',
    },
    [InitEvent.CONSENT_TIMEOUT]: {
      // Fail-safe: treat timeout as denial
      target: InitState.CONSENT_DENIED,
      effect: 'logConsentTimeout',
    },
  },

  // =====================================================
  // CONSENT ACCEPTED PATH
  // NEW FLOW: Show ATT immediately after consent acceptance on splash
  // =====================================================
  [InitState.CONSENT_ACCEPTED]: {
    [InitEvent.CORE_INIT_COMPLETE]: {
      // iOS: After core init, go to ATT phase BEFORE tracking/ads
      // This event is sent on iOS only; Android sends ATT_SKIPPED
      target: InitState.ATT_PENDING,
      effect: 'presentATTDialog',
    },
    [InitEvent.ATT_SKIPPED]: {
      // Android or ATT not available - proceed to tracking
      target: InitState.INITIALIZING_TRACKING,
      effect: 'initializeTrackingSDKs',
    },
    [InitEvent.CORE_INIT_FAILED]: {
      target: InitState.INITIALIZING_ADS_NON_PERSONALIZED,
      effect: 'fallbackToDegradedMode',
    },
  },

  // ATT shown during splash (after consent accepted, before tracking)
  [InitState.ATT_PENDING]: {
    [InitEvent.ATT_AUTHORIZED]: {
      target: InitState.ATT_RESOLVED,
      effect: 'storeATTAuthorized',
    },
    [InitEvent.ATT_DENIED]: {
      target: InitState.ATT_RESOLVED,
      effect: 'storeATTDenied',
    },
    [InitEvent.ATT_RESTRICTED]: {
      target: InitState.ATT_RESOLVED,
      effect: 'storeATTRestricted',
    },
    [InitEvent.ATT_NOT_DETERMINED]: {
      target: InitState.ATT_RESOLVED,
      effect: 'storeATTNotDetermined',
    },
  },

  [InitState.ATT_RESOLVED]: {
    [InitEvent.ADS_MODE_FINALIZED]: {
      // After ATT resolved on splash, proceed to tracking
      target: InitState.INITIALIZING_TRACKING,
      effect: 'initializeTrackingSDKs',
    },
  },

  [InitState.INITIALIZING_TRACKING]: {
    [InitEvent.TRACKING_INIT_COMPLETE]: {
      target: InitState.INITIALIZING_ADS_PERSONALIZED,
      effect: 'initializePersonalizedAds',
    },
    [InitEvent.TRACKING_INIT_FAILED]: {
      target: InitState.INITIALIZING_ADS_NON_PERSONALIZED,
      effect: 'fallbackToNonPersonalizedAds',
    },
  },

  [InitState.INITIALIZING_ADS_PERSONALIZED]: {
    [InitEvent.ADS_INIT_COMPLETE]: {
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigate',
    },
    [InitEvent.ADS_INIT_FAILED]: {
      // Continue without ads on failure
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigateWithoutAds',
    },
  },

  // =====================================================
  // CONSENT DENIED PATH
  // =====================================================
  [InitState.CONSENT_DENIED]: {
    [InitEvent.CORE_INIT_COMPLETE]: {
      target: InitState.INITIALIZING_ADS_NON_PERSONALIZED,
      effect: 'initializeNonPersonalizedAds',
    },
    [InitEvent.CORE_INIT_FAILED]: {
      // Even core failed, continue to onboarding
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigateDegraded',
    },
  },

  [InitState.INITIALIZING_ADS_NON_PERSONALIZED]: {
    [InitEvent.ADS_INIT_COMPLETE]: {
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigate',
    },
    [InitEvent.ADS_INIT_FAILED]: {
      // Continue without ads on failure
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigateWithoutAds',
    },
  },

  // =====================================================
  // ONBOARDING PHASE
  // ATT is now shown on splash, so onboarding goes directly to finalization
  // =====================================================
  [InitState.NAVIGATING_TO_ONBOARDING]: {
    [InitEvent.ONBOARDING_STARTED]: {
      target: InitState.ONBOARDING_ACTIVE,
    },
  },

  [InitState.ONBOARDING_ACTIVE]: {
    [InitEvent.ONBOARDING_COMPLETED]: {
      // ATT already shown on splash - go directly to finalization
      target: InitState.FINALIZING_ADS_MODE,
      effect: 'applyFinalAdsConfiguration',
    },
  },

  // =====================================================
  // FINALIZATION PHASE
  // =====================================================
  [InitState.FINALIZING_ADS_MODE]: {
    [InitEvent.ACTIVATION_COMPLETE]: {
      target: InitState.READY,
      effect: 'markAppReady',
    },
  },

  [InitState.READY]: {
    [InitEvent.ACTIVATION_COMPLETE]: {
      target: InitState.ACTIVE,
      effect: 'enableFullAppFunctionality',
    },
  },

  // =====================================================
  // ERROR RECOVERY
  // =====================================================
  [InitState.ERROR_CONSENT_FAILED]: {
    [InitEvent.RETRY_CONSENT]: {
      target: InitState.CONSENT_PENDING,
      guard: 'canRetryConsent',
      effect: 'resetConsentState',
    },
    [InitEvent.FALLBACK_TO_MINIMAL]: {
      target: InitState.CONSENT_DENIED,
      guard: 'maxRetriesExceeded',
      effect: 'applyMinimalConfiguration',
    },
  },

  [InitState.ERROR_SDK_INIT_FAILED]: {
    [InitEvent.RETRY_SDK_INIT]: {
      target: InitState.INITIALIZING_CORE,
      guard: 'canRetrySDKInit',
      effect: 'resetSDKState',
    },
    [InitEvent.FALLBACK_TO_MINIMAL]: {
      target: InitState.NAVIGATING_TO_ONBOARDING,
      effect: 'hideSplashAndNavigateDegraded',
    },
  },
};

/**
 * Get available transitions for a state
 */
export function getAvailableTransitions(state: InitState): InitEvent[] {
  const transitions = stateTransitions[state];
  if (!transitions) return [];
  return Object.keys(transitions) as InitEvent[];
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(state: InitState, event: InitEvent): boolean {
  const transitions = stateTransitions[state];
  if (!transitions) return false;
  return event in transitions;
}

export default stateTransitions;
