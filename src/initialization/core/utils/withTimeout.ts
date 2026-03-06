/**
 * withTimeout - Wraps a promise with a timeout
 *
 * Ensures async operations don't hang indefinitely by enforcing
 * a maximum execution time.
 *
 * @example
 * try {
 *   const result = await withTimeout(
 *     fetchData(),
 *     5000,
 *     'Data fetch timeout'
 *   );
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     // Handle timeout
 *   }
 * }
 */

/**
 * Custom error class for timeout errors
 */
export class TimeoutError extends Error {
  readonly isTimeout = true;
  readonly durationMs: number;

  constructor(message: string, durationMs: number) {
    super(message);
    this.name = 'TimeoutError';
    this.durationMs = durationMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Wrap a promise with a timeout
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout duration in milliseconds
 * @param errorMessage - Custom error message for timeout
 * @returns Promise that rejects with TimeoutError if timeout exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string,
): Promise<T> {
  if (timeoutMs <= 0) {
    return promise;
  }

  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage || `Operation timed out after ${timeoutMs}ms`,
          timeoutMs,
        ),
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Create a promise that resolves after a delay
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a cancellable delay
 *
 * @param ms - Delay in milliseconds
 * @returns Object with promise and cancel function
 */
export function cancellableDelay(ms: number): {
  promise: Promise<void>;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout>;
  let cancelled = false;

  const promise = new Promise<void>((resolve, _reject) => {
    timeoutId = setTimeout(() => {
      if (!cancelled) {
        resolve();
      }
    }, ms);
  });

  const cancel = () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };

  return { promise, cancel };
}

export default withTimeout;
