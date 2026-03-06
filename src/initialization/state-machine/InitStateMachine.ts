/**
 * Initialization State Machine
 *
 * Deterministic state machine that controls the entire boot flow.
 * All state transitions are explicit and logged.
 */

import {
  InitState,
  InitEvent,
  StateContext,
  StateEvent,
  StateTransitionInfo,
  StateListener,
  EffectHandler,
  IStateMachine,
  INITIAL_CONTEXT,
} from './types';
import { stateTransitions } from './transitions';
import { evaluateGuard } from './guards';
import { ConsentStatus } from '../consent/types';
import { ATTStatus } from '../att/types';

/**
 * State waiter for async state waiting
 */
interface StateWaiter {
  states: InitState[];
  resolve: () => void;
}

/**
 * Initialization State Machine Implementation
 */
export class InitStateMachine implements IStateMachine {
  private currentState: InitState = InitState.IDLE;
  private context: StateContext;
  private listeners: Set<StateListener> = new Set();
  private effectHandlers: Map<string, EffectHandler> = new Map();
  private stateWaiters: StateWaiter[] = [];
  private isProcessing = false;
  private eventQueue: StateEvent[] = [];

  constructor(initialContext?: Partial<StateContext>) {
    this.context = {
      ...INITIAL_CONTEXT,
      ...initialContext,
      bootStartTime: Date.now(),
    };

    console.log('[StateMachine] Initialized in state:', this.currentState);
  }

  /**
   * Send an event to the state machine
   */
  send(event: InitEvent, payload?: unknown): void {
    const stateEvent: StateEvent = {
      type: event,
      payload,
      timestamp: Date.now(),
    };

    // Queue event if currently processing
    if (this.isProcessing) {
      this.eventQueue.push(stateEvent);
      return;
    }

    this.processEvent(stateEvent);
  }

  /**
   * Process a state event
   */
  private processEvent(event: StateEvent): void {
    this.isProcessing = true;

    try {
      console.log(`[StateMachine] Processing event '${event.type}' in state '${this.currentState}'`);
      
      const transition = this.findTransition(this.currentState, event.type);

      if (!transition) {
        console.warn(
          `[StateMachine] ⚠️ No transition for event '${event.type}' in state '${this.currentState}'`,
        );
        return;
      }

      // Check guard if present
      if (transition.guard) {
        const guardPassed = evaluateGuard(transition.guard, this.context, event);
        if (!guardPassed) {
          console.warn(
            `[StateMachine] ⛔ Guard '${transition.guard}' FAILED for event '${event.type}' in state '${this.currentState}'`,
          );
          return;
        }
        console.log(`[StateMachine] ✅ Guard '${transition.guard}' passed`);
      }

      // Execute transition
      const previousState = this.currentState;
      this.currentState = transition.target;

      // Update context based on event
      this.updateContext(event);

      console.log(
        `[StateMachine] ✅ Transition: ${previousState} -> ${this.currentState} (${event.type})`,
      );

      // Notify listeners
      this.notifyListeners(previousState, this.currentState, event.type);

      // Resolve state waiters
      this.resolveStateWaiters(this.currentState);

      // Execute effect (async, non-blocking to state machine)
      if (transition.effect) {
        this.executeEffect(transition.effect);
      }
    } finally {
      this.isProcessing = false;

      // Process queued events
      if (this.eventQueue.length > 0) {
        const nextEvent = this.eventQueue.shift()!;
        this.processEvent(nextEvent);
      }
    }
  }

  /**
   * Find transition for current state and event
   */
  private findTransition(state: InitState, event: InitEvent) {
    const stateTransition = stateTransitions[state];
    if (!stateTransition) return undefined;
    return stateTransition[event];
  }

  /**
   * Update context based on event
   */
  private updateContext(event: StateEvent): void {
    switch (event.type) {
      case InitEvent.SPLASH_READY:
        this.context.splashStartTime = Date.now();
        break;

      case InitEvent.CONSENT_ACCEPTED:
        this.context.consentStatus = ConsentStatus.ACCEPTED;
        this.context.consentTimestamp = Date.now();
        break;

      case InitEvent.CONSENT_DENIED:
      case InitEvent.CONSENT_TIMEOUT:
        this.context.consentStatus = ConsentStatus.DENIED;
        this.context.consentTimestamp = Date.now();
        break;

      case InitEvent.CONSENT_FAILED:
        this.context.consentRetryCount += 1;
        this.context.lastError = event.payload as Error;
        this.context.errorCount += 1;
        break;

      case InitEvent.ATT_AUTHORIZED:
        this.context.attStatus = ATTStatus.AUTHORIZED;
        this.context.attTimestamp = Date.now();
        break;

      case InitEvent.ATT_DENIED:
        this.context.attStatus = ATTStatus.DENIED;
        this.context.attTimestamp = Date.now();
        break;

      case InitEvent.ATT_RESTRICTED:
        this.context.attStatus = ATTStatus.RESTRICTED;
        this.context.attTimestamp = Date.now();
        break;

      case InitEvent.ATT_NOT_DETERMINED:
        this.context.attStatus = ATTStatus.NOT_DETERMINED;
        this.context.attTimestamp = Date.now();
        break;

      case InitEvent.ATT_SKIPPED:
        this.context.attStatus = ATTStatus.NOT_APPLICABLE;
        this.context.attTimestamp = Date.now();
        break;

      case InitEvent.ONBOARDING_COMPLETED:
        this.context.isOnboardingComplete = true;
        break;

      case InitEvent.CORE_INIT_FAILED:
      case InitEvent.TRACKING_INIT_FAILED:
      case InitEvent.ADS_INIT_FAILED:
        this.context.lastError = event.payload as Error;
        this.context.errorCount += 1;
        this.context.isDegraded = true;
        break;

      case InitEvent.FALLBACK_TO_MINIMAL:
        this.context.isDegraded = true;
        break;
    }
  }

  /**
   * Get current state
   */
  getState(): InitState {
    return this.currentState;
  }

  /**
   * Get current context
   */
  getContext(): StateContext {
    return { ...this.context };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Register an effect handler
   */
  onEffect(effectName: string, handler: EffectHandler): void {
    this.effectHandlers.set(effectName, handler);
  }

  /**
   * Wait for the machine to reach one of the specified states
   */
  async waitForState(states: InitState[]): Promise<void> {
    if (states.includes(this.currentState)) {
      return;
    }

    return new Promise<void>(resolve => {
      this.stateWaiters.push({ states, resolve });
    });
  }

  /**
   * Reset the state machine
   */
  reset(): void {
    this.currentState = InitState.IDLE;
    this.context = { ...INITIAL_CONTEXT, bootStartTime: Date.now() };
    this.stateWaiters = [];
    this.eventQueue = [];
    this.isProcessing = false;
    console.log('[StateMachine] Reset to IDLE state');
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(
    from: InitState,
    to: InitState,
    event: InitEvent,
  ): void {
    const info: StateTransitionInfo = {
      from,
      to,
      event,
      context: this.getContext(),
      timestamp: Date.now(),
    };

    for (const listener of this.listeners) {
      try {
        listener(info);
      } catch (error) {
        console.error('[StateMachine] Listener error:', error);
      }
    }
  }

  /**
   * Resolve waiters for a given state
   */
  private resolveStateWaiters(state: InitState): void {
    const toResolve = this.stateWaiters.filter(w => w.states.includes(state));

    for (const waiter of toResolve) {
      waiter.resolve();
    }

    this.stateWaiters = this.stateWaiters.filter(
      w => !w.states.includes(state),
    );
  }

  /**
   * Execute an effect handler
   */
  private async executeEffect(effectName: string): Promise<void> {
    const handler = this.effectHandlers.get(effectName);

    if (!handler) {
      console.warn(`[StateMachine] No handler for effect: ${effectName}`);
      return;
    }

    try {
      await handler(this.context);
    } catch (error) {
      console.error(`[StateMachine] Effect '${effectName}' failed:`, error);
      // Effects should handle their own errors and emit appropriate events
    }
  }
}

export default InitStateMachine;
