/**
 * AsyncLock - Mutex implementation for async operations
 *
 * Prevents race conditions by ensuring only one async operation
 * can hold a lock at any given time.
 *
 * @example
 * const lock = new AsyncLock();
 * await lock.acquire('init', async () => {
 *   // Only one execution at a time
 *   await performOperation();
 * });
 */

type QueuedTask<T> = {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

export class AsyncLock {
  private locks: Map<string, boolean> = new Map();
  private queues: Map<string, QueuedTask<unknown>[]> = new Map();

  /**
   * Acquire a lock and execute the task
   * @param key - Lock identifier
   * @param task - Async function to execute while holding the lock
   * @returns Promise resolving to the task's return value
   */
  async acquire<T>(key: string, task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queuedTask: QueuedTask<T> = {
        execute: task,
        resolve,
        reject,
      };

      // Get or create queue for this key
      if (!this.queues.has(key)) {
        this.queues.set(key, []);
      }

      const queue = this.queues.get(key)!;
      queue.push(queuedTask as QueuedTask<unknown>);

      // If lock is not held, process the queue
      if (!this.locks.get(key)) {
        this.processQueue(key);
      }
    });
  }

  /**
   * Check if a lock is currently held
   */
  isLocked(key: string): boolean {
    return this.locks.get(key) === true;
  }

  /**
   * Process the queue for a given lock key
   */
  private async processQueue(key: string): Promise<void> {
    const queue = this.queues.get(key);
    if (!queue || queue.length === 0) {
      this.locks.set(key, false);
      return;
    }

    this.locks.set(key, true);
    const task = queue.shift()!;

    try {
      const result = await task.execute();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      // Process next task in queue
      this.processQueue(key);
    }
  }

  /**
   * Clear all locks and queues (for testing)
   */
  reset(): void {
    this.locks.clear();
    this.queues.clear();
  }
}

export default AsyncLock;
