/**
 * Lightweight logger for InitializationFlow.
 *
 * On Android debug, each console.log call adds 10-30ms of blocking I/O.
 * This logger batches messages and flushes them once after init completes,
 * instead of blocking the startup path with individual console calls.
 *
 * Usage:
 *   import { initLog } from '../utils/initLogger';
 *   initLog.log('[Usercentrics] Early configure() at T+50ms');
 *   // ... later, after init is done:
 *   initLog.flush();
 */

const buffer: string[] = [];

export const initLog = {
  log(msg: string): void {
    if (__DEV__) {
      buffer.push(msg);
    }
  },

  warn(msg: string): void {
    if (__DEV__) {
      buffer.push(`⚠ ${msg}`);
    }
  },

  error(msg: string, err?: unknown): void {
    // Errors always log immediately — they need to be visible
    if (__DEV__) {
      console.error(msg, err);
    }
  },

  /** Flush all buffered messages at once after init completes. */
  flush(): void {
    if (__DEV__ && buffer.length > 0) {
      console.log(`[InitFlow] ──── Boot log (${buffer.length} entries) ────`);
      for (const msg of buffer) {
        console.log(msg);
      }
      console.log('[InitFlow] ──── End boot log ────');
      buffer.length = 0;
    }
  },
};
