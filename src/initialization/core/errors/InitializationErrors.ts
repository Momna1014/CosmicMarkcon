/**
 * Initialization Error Classes
 *
 * Custom error types for the initialization system.
 * Provides detailed error information for debugging and recovery.
 */

/**
 * Base class for all initialization errors
 */
export class InitializationError extends Error {
  readonly isInitializationError = true;
  readonly timestamp: number;
  readonly recoverable: boolean;

  constructor(message: string, recoverable: boolean = true) {
    super(message);
    this.name = 'InitializationError';
    this.timestamp = Date.now();
    this.recoverable = recoverable;
    Object.setPrototypeOf(this, InitializationError.prototype);
  }
}

/**
 * Error when consent has not been resolved yet
 */
export class ConsentNotResolvedError extends InitializationError {
  constructor() {
    super('Consent has not been resolved yet. Cannot proceed without consent decision.', false);
    this.name = 'ConsentNotResolvedError';
    Object.setPrototypeOf(this, ConsentNotResolvedError.prototype);
  }
}

/**
 * Error when trying to access features that require consent acceptance
 */
export class ConsentNotAcceptedError extends InitializationError {
  constructor() {
    super('User did not accept consent. Tracking features are disabled.', false);
    this.name = 'ConsentNotAcceptedError';
    Object.setPrototypeOf(this, ConsentNotAcceptedError.prototype);
  }
}

/**
 * Error when consent presentation fails
 */
export class ConsentPresentationError extends InitializationError {
  readonly underlyingError?: unknown;

  constructor(message: string, underlyingError?: unknown) {
    super(message, true);
    this.name = 'ConsentPresentationError';
    this.underlyingError = underlyingError;
    Object.setPrototypeOf(this, ConsentPresentationError.prototype);
  }
}

/**
 * Error when an SDK is already initialized
 */
export class SDKAlreadyInitializedError extends InitializationError {
  readonly sdkId: string;

  constructor(sdkId: string) {
    super(`SDK '${sdkId}' has already been initialized.`, false);
    this.name = 'SDKAlreadyInitializedError';
    this.sdkId = sdkId;
    Object.setPrototypeOf(this, SDKAlreadyInitializedError.prototype);
  }
}

/**
 * Error when SDK initialization is already in progress
 */
export class SDKInitializationInProgressError extends InitializationError {
  readonly sdkId: string;

  constructor(sdkId: string) {
    super(`SDK '${sdkId}' initialization is already in progress.`, false);
    this.name = 'SDKInitializationInProgressError';
    this.sdkId = sdkId;
    Object.setPrototypeOf(this, SDKInitializationInProgressError.prototype);
  }
}

/**
 * Error when SDK initialization fails
 */
export class SDKInitializationError extends InitializationError {
  readonly sdkId: string;
  readonly underlyingError?: unknown;

  constructor(sdkId: string, message: string, underlyingError?: unknown) {
    super(`SDK '${sdkId}' initialization failed: ${message}`, true);
    this.name = 'SDKInitializationError';
    this.sdkId = sdkId;
    this.underlyingError = underlyingError;
    Object.setPrototypeOf(this, SDKInitializationError.prototype);
  }
}

/**
 * Error when state machine receives an invalid event
 */
export class InvalidStateTransitionError extends InitializationError {
  readonly currentState: string;
  readonly event: string;

  constructor(currentState: string, event: string) {
    super(
      `Invalid state transition: Cannot process event '${event}' in state '${currentState}'`,
      false,
    );
    this.name = 'InvalidStateTransitionError';
    this.currentState = currentState;
    this.event = event;
    Object.setPrototypeOf(this, InvalidStateTransitionError.prototype);
  }
}

/**
 * Error when state guard fails
 */
export class GuardFailedError extends InitializationError {
  readonly guardName: string;
  readonly state: string;
  readonly event: string;

  constructor(guardName: string, state: string, event: string) {
    super(
      `Guard '${guardName}' failed for transition from '${state}' with event '${event}'`,
      false,
    );
    this.name = 'GuardFailedError';
    this.guardName = guardName;
    this.state = state;
    this.event = event;
    Object.setPrototypeOf(this, GuardFailedError.prototype);
  }
}

/**
 * Error when orchestrator boot fails
 */
export class OrchestratorBootError extends InitializationError {
  readonly phase: string;
  readonly underlyingError?: unknown;

  constructor(phase: string, message: string, underlyingError?: unknown) {
    super(`Orchestrator boot failed in phase '${phase}': ${message}`, true);
    this.name = 'OrchestratorBootError';
    this.phase = phase;
    this.underlyingError = underlyingError;
    Object.setPrototypeOf(this, OrchestratorBootError.prototype);
  }
}

/**
 * Fatal error that cannot be recovered
 */
export class FatalInitializationError extends InitializationError {
  readonly underlyingError?: unknown;

  constructor(message: string, underlyingError?: unknown) {
    super(message, false);
    this.name = 'FatalInitializationError';
    this.underlyingError = underlyingError;
    Object.setPrototypeOf(this, FatalInitializationError.prototype);
  }
}
