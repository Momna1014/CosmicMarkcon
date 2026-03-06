/**
 * Consent Manager
 * 
 * Manages user consent state and conditional SDK initialization.
 * Handles the logic for Accept/Deny decisions and ATT permission integration.
 * 
 * Flow:
 * 1. User Centric shown (only in required regions, only on first launch)
 * 2. User chooses Accept or Deny
 * 3. If Accept → Check ATT permission
 *    - If ATT Authorized → Initialize all SDKs
 *    - If ATT Denied → No SDK initialization
 * 4. If Deny → No SDK initialization
 * 5. Outside required regions → Initialize all SDKs automatically
 * 
 * @module ConsentManager
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeTrackingSDKs, disableAllTracking } from '../config/initializers/conditionalInitializer';
import { getTrackingPermissionStatus } from '../services/TrackingService';

const CONSENT_STATE_KEY = '@app_user_consent_state';

/**
 * User consent state
 */
export type ConsentState = 'accepted' | 'denied' | 'not-determined';

/**
 * Consent decision reason
 */
export type ConsentReason = 'user-accept' | 'user-deny' | 'region-not-required' | 'not-first-launch';

/**
 * Consent manager class
 */
class ConsentManager {
  private static instance: ConsentManager;
  private consentState: ConsentState = 'not-determined';
  private sdksInitialized: boolean = false;

  private constructor() {
    this.loadConsentState();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  /**
   * Load consent state from storage
   */
  private async loadConsentState(): Promise<void> {
    try {
      const state = await AsyncStorage.getItem(CONSENT_STATE_KEY);
      if (state) {
        this.consentState = state as ConsentState;
        console.log('[ConsentManager] Loaded consent state:', this.consentState);
      }
    } catch (error) {
      console.error('[ConsentManager] Error loading consent state:', error);
    }
  }

  /**
   * Save consent state to storage
   */
  private async saveConsentState(state: ConsentState): Promise<void> {
    try {
      await AsyncStorage.setItem(CONSENT_STATE_KEY, state);
      this.consentState = state;
      console.log('[ConsentManager] Saved consent state:', state);
    } catch (error) {
      console.error('[ConsentManager] Error saving consent state:', error);
    }
  }

  /**
   * Get current consent state
   */
  public getConsentState(): ConsentState {
    return this.consentState;
  }

  /**
   * Check if SDKs have been initialized
   */
  public areSdksInitialized(): boolean {
    return this.sdksInitialized;
  }

  /**
   * Handle user accepting consent
   * This will check ATT status and conditionally initialize SDKs
   */
  public async handleAccept(): Promise<void> {
    console.log('[ConsentManager] User accepted consent');
    await this.saveConsentState('accepted');

    // Check ATT permission status
    const attStatus = await getTrackingPermissionStatus();
    console.log('[ConsentManager] ATT Status:', attStatus);

    if (attStatus === 'authorized') {
      console.log('[ConsentManager] ATT authorized - initializing all SDKs');
      await this.initializeAllSDKs();
    } else {
      console.log('[ConsentManager] ATT not authorized - skipping SDK initialization');
      // ATT denied or restricted - do not initialize tracking SDKs
    }
  }

  /**
   * Handle user denying consent
   * No SDKs will be initialized
   */
  public async handleDeny(): Promise<void> {
    console.log('[ConsentManager] User denied consent');
    await this.saveConsentState('denied');
    
    // Do NOT initialize any SDKs
    console.log('[ConsentManager] No SDKs will be initialized due to consent denial');
  }

  /**
   * Handle automatic consent (region doesn't require User Centric)
   * Initialize all SDKs without consent check
   */
  public async handleAutomaticConsent(reason: ConsentReason = 'region-not-required'): Promise<void> {
    console.log('[ConsentManager] Automatic consent granted -', reason);
    
    // Don't override existing consent decision
    if (this.consentState === 'not-determined') {
      await this.saveConsentState('accepted');
    }
    
    // Initialize all SDKs
    await this.initializeAllSDKs();
  }

  /**
   * Initialize all tracking SDKs
   * Call this only when consent is granted AND ATT is authorized
   */
  private async initializeAllSDKs(): Promise<void> {
    if (this.sdksInitialized) {
      console.log('[ConsentManager] SDKs already initialized, skipping');
      return;
    }

    console.log('[ConsentManager] 🚀 Starting SDK initialization...');

    try {
      // Initialize all tracking SDKs
      await initializeTrackingSDKs();

      this.sdksInitialized = true;
      console.log('[ConsentManager] ✅ All SDKs initialized successfully');
    } catch (error) {
      console.error('[ConsentManager] ❌ Error initializing SDKs:', error);
      // Don't throw - allow app to continue
    }
  }

  /**
   * Reset consent state (for testing only)
   */
  public async resetConsent(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONSENT_STATE_KEY);
      this.consentState = 'not-determined';
      this.sdksInitialized = false;
      console.log('[ConsentManager] Consent state reset');
    } catch (error) {
      console.error('[ConsentManager] Error resetting consent:', error);
    }
  }
}

// Export singleton instance
export const consentManager = ConsentManager.getInstance();

// Export class for type checking
export default ConsentManager;
