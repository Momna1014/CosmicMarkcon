/**
 * NetworkUtils
 * 
 * Utility functions for checking network connectivity
 * Used to optimize network requests and provide better UX when offline
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

// Cache the last known network state to avoid redundant calls
let cachedNetworkState: NetInfoState | null = null;
let lastCheckTime = 0;
const CACHE_DURATION_MS = 5000; // Cache network state for 5 seconds

/**
 * Network connectivity information
 */
export interface NetworkStatus {
  isConnected: boolean;
  isWifi: boolean;
  isCellular: boolean;
  type: NetInfoStateType;
}

/**
 * Get current network status
 * Uses caching to avoid excessive NetInfo calls
 */
export const getNetworkStatus = async (): Promise<NetworkStatus> => {
  const now = Date.now();
  
  // Return cached state if still valid
  if (cachedNetworkState && (now - lastCheckTime) < CACHE_DURATION_MS) {
    return parseNetInfoState(cachedNetworkState);
  }

  try {
    const state = await NetInfo.fetch();
    cachedNetworkState = state;
    lastCheckTime = now;
    return parseNetInfoState(state);
  } catch (error) {
    console.warn('[NetworkUtils] Failed to fetch network state:', error);
    return {
      isConnected: true, // Assume connected on error to allow retry
      isWifi: false,
      isCellular: false,
      type: 'unknown' as NetInfoStateType,
    };
  }
};

/**
 * Parse NetInfoState into NetworkStatus
 */
const parseNetInfoState = (state: NetInfoState): NetworkStatus => {
  return {
    isConnected: state.isConnected ?? false,
    isWifi: state.type === 'wifi',
    isCellular: state.type === 'cellular',
    type: state.type,
  };
};

/**
 * Check if device is online
 * Quick check using cached state if available
 */
export const isOnline = async (): Promise<boolean> => {
  const status = await getNetworkStatus();
  return status.isConnected;
};

/**
 * Subscribe to network state changes
 * Returns an unsubscribe function
 */
export const subscribeToNetworkChanges = (
  callback: (status: NetworkStatus) => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    cachedNetworkState = state;
    lastCheckTime = Date.now();
    callback(parseNetInfoState(state));
  });

  return unsubscribe;
};

/**
 * Wait for network connection with timeout
 * Useful for operations that need connectivity
 */
export const waitForConnection = async (
  timeoutMs: number = 10000
): Promise<boolean> => {
  const status = await getNetworkStatus();
  if (status.isConnected) {
    return true;
  }

  return new Promise((resolve) => {
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(false);
      }
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!resolved && state.isConnected) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
};

/**
 * Execute a function with network check
 * Returns null if offline, otherwise executes the function
 */
export const withNetworkCheck = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  const online = await isOnline();
  
  if (!online) {
    console.log('[NetworkUtils] Device is offline, skipping network operation');
    return fallback ?? null;
  }
  
  return operation();
};

/**
 * Retry an operation with network awareness
 * Will not retry if device is offline
 */
export const retryWithNetworkCheck = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  shouldRetry?: (error: unknown) => boolean
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Check network before each attempt
    const online = await isOnline();
    
    if (!online) {
      console.log(`[NetworkUtils] Offline, skipping attempt ${attempt}/${maxRetries}`);
      // Wait a bit and check again if we have retries left
      if (attempt < maxRetries) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), delayMs));
        continue;
      }
      throw new Error('Network connection unavailable');
    }
    
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`[NetworkUtils] Retry ${attempt}/${maxRetries} failed, waiting ${delayMs}ms`);
        await new Promise<void>((resolve) => setTimeout(() => resolve(), delayMs * attempt));
      }
    }
  }
  
  throw lastError;
};

/**
 * Clear cached network state
 * Call this when you need fresh network status
 */
export const clearNetworkCache = (): void => {
  cachedNetworkState = null;
  lastCheckTime = 0;
};

export default {
  getNetworkStatus,
  isOnline,
  subscribeToNetworkChanges,
  waitForConnection,
  withNetworkCheck,
  retryWithNetworkCheck,
  clearNetworkCache,
};
