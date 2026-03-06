/**
 * useInitialization Hook
 *
 * React hook for accessing initialization state and orchestrator.
 */

import { useState, useEffect, useCallback } from 'react';
import { getOrchestrator } from '../orchestrator';
import { InitState, StateContext, StateTransitionInfo } from '../state-machine';

/**
 * Hook return type
 */
interface UseInitializationResult {
  state: InitState;
  context: StateContext;
  isReady: boolean;
  isComplete: boolean;
  isError: boolean;
  onboardingComplete: () => void;
}

/**
 * States considered "ready" for UI rendering
 */
const READY_STATES: InitState[] = [
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
 * States considered "complete"
 */
const COMPLETE_STATES: InitState[] = [InitState.READY, InitState.ACTIVE];

/**
 * Error states
 */
const ERROR_STATES: InitState[] = [
  InitState.ERROR_CONSENT_FAILED,
  InitState.ERROR_SDK_INIT_FAILED,
  InitState.ERROR_FATAL,
];

/**
 * Hook for accessing initialization state
 */
export function useInitialization(): UseInitializationResult {
  const orchestrator = getOrchestrator();

  const [state, setState] = useState<InitState>(orchestrator.getState());
  const [context, setContext] = useState<StateContext>(orchestrator.getContext());

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe((info: StateTransitionInfo) => {
      setState(info.to);
      setContext(info.context);
    });

    // Update initial state
    setState(orchestrator.getState());
    setContext(orchestrator.getContext());

    return () => {
      unsubscribe();
    };
  }, [orchestrator]);

  const onboardingComplete = useCallback(() => {
    orchestrator.onboardingCompleted();
  }, [orchestrator]);

  return {
    state,
    context,
    isReady: READY_STATES.includes(state),
    isComplete: COMPLETE_STATES.includes(state),
    isError: ERROR_STATES.includes(state),
    onboardingComplete,
  };
}

/**
 * Hook for checking if specific initialization is complete
 */
export function useInitializationState(
  checkStates: InitState[],
): { matches: boolean; currentState: InitState } {
  const { state } = useInitialization();

  return {
    matches: checkStates.includes(state),
    currentState: state,
  };
}

export default useInitialization;
