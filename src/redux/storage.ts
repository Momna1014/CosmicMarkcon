/**
 * MMKV Storage Wrapper
 * 
 * Provides an AsyncStorage-compatible API using MMKV for better performance.
 * MMKV is much faster than AsyncStorage and provides synchronous operations.
 * 
 * Key benefits:
 * - ~30x faster than AsyncStorage
 * - Synchronous operations
 * - Encrypted storage support
 * - JSI-based (C++ bridge)
 * 
 * @module storage
 */

import {createMMKV} from 'react-native-mmkv';

/**
 * Initialize MMKV storage instance
 * You can create multiple instances with different IDs for data separation
 */
export const storage = createMMKV({
  id: 'app-storage', // Unique identifier for this MMKV instance
  // encryptionKey: 'your-encryption-key-here', // Optional: Enable encryption
});

/**
 * Storage interface compatible with AsyncStorage
 * This allows easy migration from AsyncStorage
 * 
 * NOTE: These methods are async for compatibility but MMKV operations are actually synchronous
 */
export const StorageAdapter = {
  /**
   * Set a string value for a key
   */
  setItem: (key: string, value: string): Promise<void> => {
    storage.set(key, value);
    return Promise.resolve();
  },

  /**
   * Get a string value for a key
   */
  getItem: (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },

  /**
   * Remove a key from storage
   */
  removeItem: (key: string): Promise<void> => {
    storage.remove(key);
    return Promise.resolve();
  },

  /**
   * Get all keys
   */
  getAllKeys: (): Promise<string[]> => {
    return Promise.resolve(storage.getAllKeys());
  },

  /**
   * Remove multiple keys
   */
  multiRemove: (keys: string[]): Promise<void> => {
    keys.forEach(key => storage.remove(key));
    return Promise.resolve();
  },

  /**
   * Get multiple key-value pairs
   */
  multiGet: (keys: string[]): Promise<Array<[string, string | null]>> => {
    const result = keys.map(key => [key, storage.getString(key) ?? null] as [string, string | null]);
    return Promise.resolve(result);
  },

  /**
   * Set multiple key-value pairs
   */
  multiSet: (keyValuePairs: Array<[string, string]>): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => storage.set(key, value));
    return Promise.resolve();
  },

  /**
   * Clear all data from storage
   */
  clear: (): Promise<void> => {
    storage.clearAll();
    return Promise.resolve();
  },
};

/**
 * Synchronous storage operations (MMKV advantage)
 * Use these for better performance when you don't need promises
 */
export const SyncStorage = {
  /**
   * Set a string value synchronously
   */
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },

  /**
   * Get a string value synchronously
   */
  getItem: (key: string): string | undefined => {
    return storage.getString(key);
  },

  /**
   * Remove a key synchronously
   */
  removeItem: (key: string): void => {
    storage.remove(key);
  },

  /**
   * Check if a key exists
   */
  hasKey: (key: string): boolean => {
    return storage.contains(key);
  },

  /**
   * Get all keys synchronously
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  /**
   * Clear all data synchronously
   */
  clear: (): void => {
    storage.clearAll();
  },
};

/**
 * Type-safe storage helpers for common data types
 */
export const TypedStorage = {
  /**
   * Store a JSON-serializable object
   */
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * Get a JSON object
   */
  getObject: <T>(key: string): T | undefined => {
    const json = storage.getString(key);
    if (!json) return undefined;
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.error(`[Storage] Failed to parse JSON for key "${key}":`, error);
      return undefined;
    }
  },

  /**
   * Store a number
   */
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  /**
   * Get a number
   */
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  /**
   * Store a boolean
   */
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  /**
   * Get a boolean
   */
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },
};

/**
 * Export the raw MMKV instance for advanced usage
 */
export default StorageAdapter;
