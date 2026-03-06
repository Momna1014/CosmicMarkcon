/**
 * RevenueCat Adapter
 *
 * Two-phase RevenueCat initialization:
 * - Phase 1: Anonymous mode (no user tracking)
 * - Phase 2: User-aware mode (full features, consent required)
 */

import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { SDKStatus, ISDKAdapter, RevenueCatPhase1Config, RevenueCatPhase2Config } from './types';
import { AsyncLock } from '../core';
import env from '../../config/env';

/**
 * RevenueCat initialization phase
 */
export type RevenueCatPhase = 'NOT_INITIALIZED' | 'PHASE_1' | 'PHASE_2';

/**
 * RevenueCat Adapter Implementation
 */
export class RevenueCatAdapter implements ISDKAdapter {
  readonly sdkId = 'revenuecat';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private phase: RevenueCatPhase = 'NOT_INITIALIZED';
  private lock = new AsyncLock();

  /**
   * Initialize RevenueCat (entry point - decides phase based on config)
   */
  async initialize(config?: RevenueCatPhase1Config): Promise<void> {
    return this.initializePhase1(config);
  }

  /**
   * Phase 1: Anonymous mode initialization
   * - No user ID
   * - No device identifiers
   * - No search ads attribution
   */
  async initializePhase1(config?: RevenueCatPhase1Config): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.phase !== 'NOT_INITIALIZED') {
        console.log('[RevenueCat] Already initialized in phase:', this.phase);
        return;
      }

      this.status = SDKStatus.INITIALIZING;

      try {
        console.log('[RevenueCat] Initializing Phase 1 (anonymous mode)...');

        const apiKey = config?.apiKey ||
          (Platform.OS === 'ios' ? env.REVENUECAT_IOS_KEY : env.REVENUECAT_ANDROID_KEY);

        if (!apiKey) {
          throw new Error('RevenueCat API key not configured');
        }

        // Configure with minimal settings
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

        // Configure RevenueCat
        // Note: RevenueCat v9+ removed observerMode and setAutomaticAppleSearchAdsAttributionCollection
        // Use automaticDeviceIdentifierCollectionEnabled instead
        Purchases.configure({
          apiKey,
          appUserID: null, // Anonymous
          automaticDeviceIdentifierCollectionEnabled: false, // Disable for Phase 1
        });

        this.phase = 'PHASE_1';
        this.status = SDKStatus.INITIALIZED;
        console.log('[RevenueCat] Phase 1 initialized (anonymous mode)');
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[RevenueCat] Phase 1 initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Phase 2: Upgrade to user-aware mode
   * - Enables device identifiers
   * - Enables search ads attribution
   * - Can set user ID and attributes
   *
   * IMPORTANT: Only call this if consent is ACCEPTED
   */
  async upgradeToPhase2(config?: RevenueCatPhase2Config): Promise<void> {
    return this.lock.acquire('upgrade', async () => {
      if (this.phase === 'NOT_INITIALIZED') {
        throw new Error('Must initialize Phase 1 first');
      }

      if (this.phase === 'PHASE_2') {
        console.log('[RevenueCat] Already in Phase 2');
        return;
      }

      try {
        console.log('[RevenueCat] Upgrading to Phase 2 (user-aware mode)...');

        const options = config || {
          collectDeviceIdentifiers: true,
          automaticAppleSearchAdsAttributionCollection: true,
        };

        // Enable tracking features
        if (options.collectDeviceIdentifiers) {
          await Purchases.collectDeviceIdentifiers();
        }

        // Enable Ad Services attribution collection on iOS
        if (options.automaticAppleSearchAdsAttributionCollection && Platform.OS === 'ios') {
          try {
            await Purchases.enableAdServicesAttributionTokenCollection();
            console.log('[RevenueCat] Ad Services attribution enabled');
          } catch (e) {
            console.warn('[RevenueCat] Failed to enable Ad Services attribution:', e);
          }
        }

        // Set user ID if provided
        if (options.appUserID) {
          await Purchases.logIn(options.appUserID);
        }

        this.phase = 'PHASE_2';
        console.log('[RevenueCat] Phase 2 activated (user-aware mode)');
      } catch (error) {
        console.error('[RevenueCat] Phase 2 upgrade failed:', error);
        throw error;
      }
    });
  }

  /**
   * Get current phase
   */
  getPhase(): RevenueCatPhase {
    return this.phase;
  }

  /**
   * Check if in Phase 2
   */
  isPhase2(): boolean {
    return this.phase === 'PHASE_2';
  }

  /**
   * Set user attributes (Phase 2 only)
   */
  async setAttributes(attributes: Record<string, string>): Promise<void> {
    if (this.phase !== 'PHASE_2') {
      console.warn('[RevenueCat] setAttributes requires Phase 2');
      return;
    }

    try {
      await Purchases.setAttributes(attributes);
    } catch (error) {
      console.error('[RevenueCat] Error setting attributes:', error);
    }
  }

  /**
   * Set email (Phase 2 only)
   */
  async setEmail(email: string): Promise<void> {
    if (this.phase !== 'PHASE_2') {
      console.warn('[RevenueCat] setEmail requires Phase 2');
      return;
    }

    try {
      await Purchases.setEmail(email);
    } catch (error) {
      console.error('[RevenueCat] Error setting email:', error);
    }
  }

  /**
   * Log in user (Phase 2 only)
   */
  async logIn(appUserID: string): Promise<void> {
    if (this.phase !== 'PHASE_2') {
      console.warn('[RevenueCat] logIn requires Phase 2');
      return;
    }

    try {
      await Purchases.logIn(appUserID);
    } catch (error) {
      console.error('[RevenueCat] Error logging in:', error);
    }
  }

  /**
   * Get offerings (works in both phases)
   */
  async getOfferings() {
    try {
      return await Purchases.getOfferings();
    } catch (error) {
      console.error('[RevenueCat] Error getting offerings:', error);
      return null;
    }
  }

  /**
   * Get customer info (works in both phases)
   */
  async getCustomerInfo() {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('[RevenueCat] Error getting customer info:', error);
      return null;
    }
  }

  /**
   * Get SDK status
   */
  getStatus(): SDKStatus {
    return this.status;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.status === SDKStatus.INITIALIZED;
  }
}

export default RevenueCatAdapter;
