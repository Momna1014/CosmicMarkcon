/**
 * SDK Initialization Orchestrator
 *
 * Main singleton that manages the complete SDK initialization flow.
 * Coordinates all phases and maintains global initialization state.
 *
 * Flow:
 * 1. Phase 1 (Critical): Sentry, Crashlytics, RevenueCat, Remote Config
 * 2. Phase 2 (Consent): Usercentrics consent collection
 * 3. Phase 3 (Consent-Dependent): ATT, Facebook, Analytics, AppsFlyer, AppLovin
 *
 * @module SDKInitializationOrchestrator
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { initializeCriticalServices } from './CriticalServicesInitializer';
import { initializeConsentDependentSDKs, disableAllTracking } from './ConsentDependentInitializer';

import {
  InitPhase,
  SDKInitStatus,
  InitializationState,
  InitEvent,
  InitEventListener,
  InitConfig,
  ConsentDecision,
  ConsentSource,
  ATTStatus,
  PersistedConsentState,
  DEFAULT_INIT_STATE,
  DEFAULT_SDK_STATUS,
} from './types';

// Storage keys
const STORAGE_KEY_CONSENT = '@sdk_init_consent_state';
const STORAGE_KEY_VERSION = '@sdk_init_app_version';

const LOG_PREFIX = '[SDKOrchestrator]';

/**
 * Get app version (placeholder - implement based on your setup)
 */
function getAppVersion(): string {
  // You can use react-native-device-info or similar
  return '1.0.0';
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelayMs: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await new Promise<void>(resolve => setTimeout(resolve, initialDelayMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * SDK Initialization Orchestrator
 * Singleton class that manages the complete SDK initialization flow
 */
class SDKInitializationOrchestrator {
  private static instance: SDKInitializationOrchestrator;

  private state: InitializationState = { ...DEFAULT_INIT_STATE };
  private listeners: Set<InitEventListener> = new Set();
  private config: InitConfig = {};
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Load persisted consent state
    this.loadPersistedState();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SDKInitializationOrchestrator {
    if (!SDKInitializationOrchestrator.instance) {
      SDKInitializationOrchestrator.instance = new SDKInitializationOrchestrator();
    }
    return SDKInitializationOrchestrator.instance;
  }

  /**
   * Get current state
   */
  getState(): InitializationState {
    return { ...this.state };
  }

  /**
   * Add event listener
   */
  addEventListener(listener: InitEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: InitEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: InitEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`${LOG_PREFIX} Error in event listener:`, error);
      }
    });
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<InitializationState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Load persisted consent state for returning users
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_CONSENT);
      if (json) {
        const persisted: PersistedConsentState = JSON.parse(json);

        // Check if app version matches (optional: reset on version change)
        const currentVersion = getAppVersion();
        if (persisted.appVersion === currentVersion) {
          this.updateState({
            consentDecision: persisted.consentDecision,
            consentSource: persisted.consentSource,
            attStatus: persisted.attStatus,
            attDialogShown: persisted.attDialogShown,
          });

          if (this.config.debugLogging) {
            console.log(`${LOG_PREFIX} Loaded persisted consent state:`, persisted);
          }
        }
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Error loading persisted state:`, error);
    }
  }

  /**
   * Save consent state for returning users
   */
  private async persistConsentState(): Promise<void> {
    try {
      const state: PersistedConsentState = {
        consentDecision: this.state.consentDecision,
        consentSource: this.state.consentSource || 'cached',
        attStatus: this.state.attStatus,
        attDialogShown: this.state.attDialogShown,
        timestamp: Date.now(),
        appVersion: getAppVersion(),
      };

      await AsyncStorage.setItem(STORAGE_KEY_CONSENT, JSON.stringify(state));

      if (this.config.debugLogging) {
        console.log(`${LOG_PREFIX} Persisted consent state`);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Error persisting consent state:`, error);
    }
  }

  /**
   * Initialize Phase 1: Critical Services
   * This runs immediately at app launch
   */
  async initialize(config: InitConfig = {}): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.config = config;
    this.updateState({ startTime: Date.now() });

    this.initPromise = this.runPhase1();
    return this.initPromise;
  }

  /**
   * Run Phase 1: Critical Services
   */
  private async runPhase1(): Promise<void> {
    const debug = this.config.debugLogging ?? __DEV__;

    if (debug) console.log(`${LOG_PREFIX} 🚀 Starting initialization`);

    // Emit phase started event
    this.emitEvent({
      type: 'phase-started',
      phase: InitPhase.CRITICAL,
      timestamp: Date.now(),
    });

    this.updateState({ currentPhase: InitPhase.CRITICAL });

    try {
      // Run critical services initialization
      const result = await initializeCriticalServices({
        debugLogging: debug,
        remoteConfigDefaults: this.config.remoteConfigDefaults,
      });

      // Update SDK statuses
      const sdkStatus = { ...this.state.sdkStatus };
      result.sdkResults.forEach(r => {
        if (r.sdkId in sdkStatus) {
          (sdkStatus as any)[r.sdkId] = r.status;
        }
      });

      this.updateState({
        sdkStatus,
        currentPhase: InitPhase.CONSENT,
      });

      // Emit phase completed event
      this.emitEvent({
        type: 'phase-completed',
        phase: InitPhase.CRITICAL,
        timestamp: Date.now(),
      });

      if (debug) console.log(`${LOG_PREFIX} ✅ Phase 1 complete`);

      // Call callback
      this.config.onPhase1Complete?.();
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ Phase 1 failed:`, error);
      this.state.errors.push(error instanceof Error ? error : new Error(String(error)));

      this.emitEvent({
        type: 'error',
        phase: InitPhase.CRITICAL,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle returning user with cached consent
   * Returns true if cached consent was applied
   */
  async handleReturningUser(): Promise<boolean> {
    const debug = this.config.debugLogging ?? __DEV__;

    if (this.state.consentDecision !== 'not-determined') {
      if (debug) {
        console.log(`${LOG_PREFIX} Returning user with cached consent: ${this.state.consentDecision}`);
      }

      // Apply cached consent
      await this.handleConsentDecision(
        this.state.consentDecision,
        'cached',
      );

      return true;
    }

    return false;
  }

  /**
   * Handle consent decision from Usercentrics or other source
   */
  async handleConsentDecision(
    decision: ConsentDecision,
    source: ConsentSource,
  ): Promise<void> {
    const debug = this.config.debugLogging ?? __DEV__;

    if (debug) {
      console.log(`${LOG_PREFIX} Consent decision: ${decision} (source: ${source})`);
    }

    this.updateState({
      consentDecision: decision,
      consentSource: source,
    });

    // Emit consent received event
    this.emitEvent({
      type: 'consent-received',
      consentDecision: decision,
      timestamp: Date.now(),
    });

    // Persist consent state
    await this.persistConsentState();

    // Call callback
    this.config.onConsentReceived?.(decision);

    // Run Phase 3
    await this.runPhase3();
  }

  /**
   * Run Phase 3: Consent-Dependent SDKs
   */
  private async runPhase3(): Promise<void> {
    const debug = this.config.debugLogging ?? __DEV__;

    if (debug) console.log(`${LOG_PREFIX} 🚀 Starting Phase 3: Consent-Dependent SDKs`);

    // Emit phase started event
    this.emitEvent({
      type: 'phase-started',
      phase: InitPhase.CONSENT_DEPENDENT,
      timestamp: Date.now(),
    });

    this.updateState({ currentPhase: InitPhase.CONSENT_DEPENDENT });

    try {
      const result = await initializeConsentDependentSDKs({
        consentDecision: this.state.consentDecision,
        debugLogging: debug,
      });

      // Update SDK statuses
      const sdkStatus = { ...this.state.sdkStatus };
      result.sdkResults.forEach(r => {
        if (r.sdkId in sdkStatus) {
          (sdkStatus as any)[r.sdkId] = r.status;
        }
      });

      this.updateState({
        sdkStatus,
        attStatus: result.attStatus,
        attDialogShown: true,
        trackingEnabled: result.trackingEnabled,
        currentPhase: InitPhase.COMPLETE,
        isFullyInitialized: true,
        endTime: Date.now(),
      });

      // Emit ATT result event
      this.emitEvent({
        type: 'att-result',
        attStatus: result.attStatus,
        timestamp: Date.now(),
      });

      // Emit phase completed event
      this.emitEvent({
        type: 'phase-completed',
        phase: InitPhase.CONSENT_DEPENDENT,
        timestamp: Date.now(),
      });

      // Emit initialization complete event
      this.emitEvent({
        type: 'initialization-complete',
        timestamp: Date.now(),
      });

      // Persist updated state
      await this.persistConsentState();

      if (debug) {
        const duration = this.state.endTime! - this.state.startTime!;
        console.log(`${LOG_PREFIX} ✅ Initialization complete (${duration}ms)`);
      }

      // Call callback
      this.config.onFullyInitialized?.();
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ Phase 3 failed:`, error);
      this.state.errors.push(error instanceof Error ? error : new Error(String(error)));

      this.emitEvent({
        type: 'error',
        phase: InitPhase.CONSENT_DEPENDENT,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle consent revocation
   */
  async handleConsentRevoked(): Promise<void> {
    const debug = this.config.debugLogging ?? __DEV__;

    if (debug) console.log(`${LOG_PREFIX} ⛔ Consent revoked`);

    this.updateState({
      consentDecision: 'denied',
      consentSource: 'usercentrics-denied',
      trackingEnabled: false,
    });

    // Disable all tracking
    await disableAllTracking(debug);

    // Update SDK statuses
    const sdkStatus = { ...this.state.sdkStatus };
    sdkStatus.facebook = SDKInitStatus.DISABLED;
    sdkStatus.firebaseAnalytics = SDKInitStatus.DISABLED;
    sdkStatus.appsFlyer = SDKInitStatus.DISABLED;
    sdkStatus.appLovin = SDKInitStatus.DISABLED;

    this.updateState({ sdkStatus });

    // Persist updated state
    await this.persistConsentState();

    this.emitEvent({
      type: 'consent-received',
      consentDecision: 'denied',
      timestamp: Date.now(),
    });
  }

  /**
   * Get debug information
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      currentPhase: this.state.currentPhase,
      consentDecision: this.state.consentDecision,
      consentSource: this.state.consentSource,
      attStatus: this.state.attStatus,
      trackingEnabled: this.state.trackingEnabled,
      isFullyInitialized: this.state.isFullyInitialized,
      sdkStatus: this.state.sdkStatus,
      duration:
        this.state.startTime && this.state.endTime
          ? this.state.endTime - this.state.startTime
          : null,
      errors: this.state.errors.map(e => e.message),
    };
  }

  /**
   * Reset state (for testing only)
   */
  async reset(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY_CONSENT);
    this.state = { ...DEFAULT_INIT_STATE };
    this.initPromise = null;
    console.log(`${LOG_PREFIX} State reset`);
  }
}

// Export singleton instance
export const sdkOrchestrator = SDKInitializationOrchestrator.getInstance();

// Export class for type checking
export default SDKInitializationOrchestrator;
