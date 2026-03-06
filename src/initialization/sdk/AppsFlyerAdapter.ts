/**
 * AppsFlyer Adapter
 *
 * Wrapper around AppsFlyer SDK for attribution tracking.
 */

import appsFlyer from 'react-native-appsflyer';
import { SDKStatus, ITrackingSDK, AppsFlyerConfig } from './types';
import { AsyncLock } from '../core';
import env from '../../config/env';

/**
 * AppsFlyer Adapter Implementation
 */
export class AppsFlyerAdapter implements ITrackingSDK {
  readonly sdkId = 'appsflyer';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();
  private config: AppsFlyerConfig | null = null;

  /**
   * Initialize AppsFlyer SDK
   */
  async initialize(config?: AppsFlyerConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[AppsFlyer] Already initialized');
        return;
      }

      this.status = SDKStatus.INITIALIZING;
      this.config = config || {
        devKey: env.APPSFLYER_DEV_KEY || '',
        appId: env.APPSFLYER_APP_ID || '',
        isDebug: __DEV__,
        onInstallConversionDataListener: true,
      };

      try {
        console.log('[AppsFlyer] 🚀 Initializing...');
        console.log('[AppsFlyer] 🔑 Configuration:');
        console.log('[AppsFlyer]   - Dev Key:', this.config.devKey);
        console.log('[AppsFlyer]   - App ID:', this.config.appId);
        console.log('[AppsFlyer]   - Debug Mode:', this.config.isDebug);

        // Check if dev key is configured
        if (!this.config.devKey || this.config.devKey.includes('your_')) {
          console.warn('[AppsFlyer] ⚠️ Dev Key not configured - skipping initialization');
          this.status = SDKStatus.NOT_INITIALIZED;
          return;
        }

        await appsFlyer.initSdk({
          devKey: this.config.devKey,
          appId: this.config.appId,
          isDebug: this.config.isDebug,
          onInstallConversionDataListener: this.config.onInstallConversionDataListener,
          onDeepLinkListener: true,
        });

        this.status = SDKStatus.INITIALIZED;
        console.log('[AppsFlyer] ✅ Initialized successfully');
        
        // Log app open event
        try {
          appsFlyer.logEvent('af_app_opened', {});
          console.log('[AppsFlyer] 📊 App open event logged');
        } catch (appOpenError) {
          console.warn('[AppsFlyer] Failed to log app open:', appOpenError);
        }
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[AppsFlyer] Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Enable tracking
   */
  async enable(): Promise<void> {
    try {
      appsFlyer.startSdk();
      console.log('[AppsFlyer] Tracking enabled');
    } catch (error) {
      console.error('[AppsFlyer] Error enabling tracking:', error);
    }
  }

  /**
   * Disable tracking (stop SDK)
   */
  async disable(): Promise<void> {
    try {
      appsFlyer.stop(true);
      console.log('[AppsFlyer] Tracking disabled');
    } catch (error) {
      console.error('[AppsFlyer] Error disabling tracking:', error);
    }
  }

  /**
   * Set customer user ID
   */
  setCustomerUserId(userId: string): void {
    try {
      appsFlyer.setCustomerUserId(userId);
    } catch (error) {
      console.error('[AppsFlyer] Error setting customer user ID:', error);
    }
  }

  /**
   * Log event
   */
  async logEvent(eventName: string, eventValues?: Record<string, unknown>): Promise<void> {
    try {
      await appsFlyer.logEvent(eventName, eventValues || {});
    } catch (error) {
      console.error('[AppsFlyer] Error logging event:', error);
    }
  }

  /**
   * Update ATT status
   */
  updateTrackingStatus(authorized: boolean): void {
    try {
      // AppsFlyer handles IDFA authorization automatically
      // This is for manual control if needed
      if (!authorized) {
        // Optionally anonymize user data
        appsFlyer.anonymizeUser(true);
      } else {
        appsFlyer.anonymizeUser(false);
      }
    } catch (error) {
      console.error('[AppsFlyer] Error updating tracking status:', error);
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

export default AppsFlyerAdapter;
