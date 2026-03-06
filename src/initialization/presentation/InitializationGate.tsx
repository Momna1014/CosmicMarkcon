/**
 * Initialization Gate
 *
 * React component that blocks UI until initialization reaches a specific state.
 * Renders children only when the app is ready.
 * 
 * IMPORTANT: Returns null while waiting so native splash screen remains visible.
 * The Usercentrics consent popup will appear on top of the splash screen.
 */

import React, { useEffect, useState, useCallback, ReactNode, JSX } from 'react';
import { getOrchestrator } from '../orchestrator';
import { InitState } from '../state-machine';

/**
 * Props for InitializationGate
 */
interface InitializationGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredStates?: InitState[];
  onReady?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Default states that indicate the app is ready
 */
const DEFAULT_READY_STATES: InitState[] = [
  InitState.NAVIGATING_TO_ONBOARDING,
  InitState.ONBOARDING_ACTIVE,
  InitState.ONBOARDING_COMPLETE,
  InitState.ATT_PENDING,
  InitState.ATT_PRESENTING,
  InitState.ATT_RESOLVED,
  InitState.FINALIZING_ADS_MODE,
  InitState.READY,
  InitState.ACTIVE,
];

/**
 * Initialization Gate Component
 * 
 * Returns null while waiting for initialization to complete.
 * This allows the native splash screen (react-native-bootsplash) to remain visible
 * while the Usercentrics consent popup appears on top of it.
 */
export function InitializationGate({
  children,
  fallback = null, // Default to null so splash remains visible
  requiredStates = DEFAULT_READY_STATES,
  onReady,
  onError,
}: InitializationGateProps): JSX.Element | null {
  const [isReady, setIsReady] = useState(false);
  const [currentState, setCurrentState] = useState<InitState>(InitState.IDLE);

  const orchestrator = getOrchestrator();

  const checkReady = useCallback(
    (state: InitState) => {
      const ready = requiredStates.includes(state);
      if (ready && !isReady) {
        setIsReady(true);
        onReady?.();
      }
      return ready;
    },
    [requiredStates, isReady, onReady],
  );

  useEffect(() => {
    // Check initial state
    const initialState = orchestrator.getState();
    setCurrentState(initialState);
    checkReady(initialState);

    // Subscribe to state changes
    const unsubscribe = orchestrator.subscribe(info => {
      setCurrentState(info.to);
      checkReady(info.to);

      // Check for error states
      if (
        info.to === InitState.ERROR_FATAL ||
        info.to === InitState.ERROR_CONSENT_FAILED ||
        info.to === InitState.ERROR_SDK_INIT_FAILED
      ) {
        const error = new Error(`Initialization failed in state: ${info.to}`);
        onError?.(error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orchestrator, checkReady, onError]);

  // Log state in dev mode
  if (__DEV__ && !isReady) {
    console.log(`[InitializationGate] Waiting for ready state. Current: ${currentState}`);
  }

  if (isReady) {
    return <>{children}</>;
  }

  // Return fallback (null by default) - native splash remains visible
  if (fallback) {
    return <>{fallback}</>;
  }

  // Return null to keep native splash screen visible
  // Usercentrics popup will appear on top of the splash
  return null;
}

export default InitializationGate;
