/**
 * Core Module
 *
 * Shared utilities and error classes for the initialization architecture.
 */

// Utilities
export { AsyncLock } from './utils/AsyncLock';
export {
  withTimeout,
  TimeoutError,
  delay,
  cancellableDelay,
} from './utils/withTimeout';

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
} from './errors';
