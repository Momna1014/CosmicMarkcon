/**
 * useSDKInitialization Hook
 *
 * React hook for managing SDK initialization state.
 * Provides a clean interface to the SDK orchestrator for React components.
 *
 * @module useSDKInitialization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { sdkOrchestrator } from './SDKInitializationOrchestrator';

import {
  InitPhase,
  InitializationState,
  InitConfig,
  ConsentDecision,
  ConsentSource,
  UseSDKInitializationResult,
} from './types';

/**
 * React hook for SDK initialization
 *
 * @param options - Configuration options
 * @returns SDK initialization state and controls
 *
 * @example
 * ```tsx
 * const { phase1Complete, isFullyInitialized, consentDecision } = useSDKInitialization({
 *   debugLogging: __DEV__,
 *   onPhase1Complete: () => console.log('Phase 1 done'),
 *   onFullyInitialized: () => console.log('All done'),
 * });
 *
 * useEffect(() => {
 *   if (phase1Complete) {
 *     // Safe to run consent flow
 *   }
 * }, [phase1Complete]);
 * ```
 */
export function useSDKInitialization(
  options: InitConfig = {},
): UseSDKInitializationResult {
  const [state, setState] = useState<InitializationState>(sdkOrchestrator.getState());
  const hasInitialized = useRef(false);

  // Derived state
  const phase1Complete =
    state.currentPhase !== InitPhase.NATIVE && state.currentPhase !== InitPhase.CRITICAL;
  const isFullyInitialized = state.currentPhase === InitPhase.COMPLETE;
  const isTrackingEnabled = state.trackingEnabled;
  const consentDecision = state.consentDecision;

  // Auto-start initialization
  useEffect(() => {
    if (options.autoStart !== false && !hasInitialized.current) {
      hasInitialized.current = true;
      sdkOrchestrator.initialize(options);
    }
  }, []);

  // Subscribe to orchestrator events
  useEffect(() => {
    const unsubscribe = sdkOrchestrator.addEventListener(event => {
      // Update state on relevant events
      if (
        [
          'phase-started',
          'phase-completed',
          'consent-received',
          'att-result',
          'initialization-complete',
          'error',
        ].includes(event.type)
      ) {
        setState(sdkOrchestrator.getState());
      }
    });

    return unsubscribe;
  }, []);

  // Handle consent decision
  const handleConsent = useCallback(
    async (decision: ConsentDecision, source: ConsentSource): Promise<void> => {
      await sdkOrchestrator.handleConsentDecision(decision, source);
    },
    [],
  );

  // Handle consent revoked
  const handleConsentRevoked = useCallback(async (): Promise<void> => {
    await sdkOrchestrator.handleConsentRevoked();
  }, []);

  // Get debug info
  const getDebugInfo = useCallback((): Record<string, unknown> => {
    return sdkOrchestrator.getDebugInfo();
  }, []);

  return {
    state,
    phase1Complete,
    isFullyInitialized,
    isTrackingEnabled,
    consentDecision,
    handleConsent,
    handleConsentRevoked,
    getDebugInfo,
  };
}

/**
 * Hook to check if Phase 1 is complete
 * Lightweight hook for components that only need to know about Phase 1
 */
export function usePhase1Complete(): boolean {
  const [complete, setComplete] = useState(() => {
    const state = sdkOrchestrator.getState();
    return state.currentPhase !== InitPhase.NATIVE && state.currentPhase !== InitPhase.CRITICAL;
  });

  useEffect(() => {
    const unsubscribe = sdkOrchestrator.addEventListener(event => {
      if (event.type === 'phase-completed' && event.phase === InitPhase.CRITICAL) {
        setComplete(true);
      }
    });

    return unsubscribe;
  }, []);

  return complete;
}

/**
 * Hook to check if initialization is complete
 * Lightweight hook for components that only need to know about completion
 */
export function useInitializationComplete(): boolean {
  const [complete, setComplete] = useState(() => {
    const state = sdkOrchestrator.getState();
    return state.currentPhase === InitPhase.COMPLETE;
  });

  useEffect(() => {
    const unsubscribe = sdkOrchestrator.addEventListener(event => {
      if (event.type === 'initialization-complete') {
        setComplete(true);
      }
    });

    return unsubscribe;
  }, []);

  return complete;
}

/**
 * Hook to get tracking status
 * Lightweight hook for components that need to check tracking status
 */
export function useTrackingEnabled(): boolean {
  const [enabled, setEnabled] = useState(() => {
    const state = sdkOrchestrator.getState();
    return state.trackingEnabled;
  });

  useEffect(() => {
    const unsubscribe = sdkOrchestrator.addEventListener(event => {
      if (event.type === 'initialization-complete' || event.type === 'consent-received') {
        setEnabled(sdkOrchestrator.getState().trackingEnabled);
      }
    });

    return unsubscribe;
  }, []);

  return enabled;
}

/**
 * Hook to get consent decision
 * Lightweight hook for components that need consent state
 */
export function useConsentDecision(): ConsentDecision {
  const [decision, setDecision] = useState<ConsentDecision>(() => {
    const state = sdkOrchestrator.getState();
    return state.consentDecision;
  });

  useEffect(() => {
    const unsubscribe = sdkOrchestrator.addEventListener(event => {
      if (event.type === 'consent-received') {
        setDecision(sdkOrchestrator.getState().consentDecision);
      }
    });

    return unsubscribe;
  }, []);

  return decision;
}

export default useSDKInitialization;
