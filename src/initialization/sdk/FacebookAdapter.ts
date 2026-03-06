/**
 * Facebook Adapter
 *
 * Wrapper around Facebook SDK for analytics and event tracking.
 * Handles ATT-compliant initialization with proper advertiser tracking settings.
 */

import { Platform } from 'react-native';
import { Settings, AppEventsLogger } from 'react-native-fbsdk-next';
import { SDKStatus, ITrackingSDK } from './types';
import { AsyncLock } from '../core';

/**
 * Facebook SDK Configuration
 */
export interface FacebookConfig {
  attAuthorized?: boolean; // Whether ATT is authorized (iOS)
  autoLogAppEvents?: boolean;
  advertiserIDCollectionEnabled?: boolean;
}

/**
 * Facebook Adapter Implementation
 */
export class FacebookAdapter implements ITrackingSDK {
  readonly sdkId = 'facebook';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();
  private isAdvertiserTrackingEnabled = false;

  /**
   * Initialize Facebook SDK
   * 
   * @param config - Configuration options including ATT authorization status
   */
  async initialize(config?: FacebookConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[Facebook] Already initialized');
        return;
      }

      this.status = SDKStatus.INITIALIZING;

      try {
        console.log('[Facebook] Initializing SDK...');
        
        const attAuthorized = config?.attAuthorized ?? false;
        const autoLogAppEvents = config?.autoLogAppEvents ?? true;
        
        // Initialize Facebook SDK
        Settings.initializeSDK();
        console.log('[Facebook] SDK core initialized');
        
        // Enable auto-logging of app events
        Settings.setAutoLogAppEventsEnabled(autoLogAppEvents);
        console.log('[Facebook] Auto-logging:', autoLogAppEvents);
        
        // Set advertiser tracking based on ATT authorization status
        // Only enable if user explicitly authorized via ATT (GDPR/privacy compliant)
        this.isAdvertiserTrackingEnabled = attAuthorized;
        Settings.setAdvertiserTrackingEnabled(attAuthorized);
        console.log(`[Facebook] Advertiser tracking: ${attAuthorized ? 'ENABLED' : 'DISABLED'}`);
        
        // Set data processing options for GDPR compliance
        // Note: setDataProcessingOptions may not be available in all versions of the SDK
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          try {
            // Check if method exists before calling (some SDK versions don't support it)
            if (typeof Settings.setDataProcessingOptions === 'function') {
              // Empty array = no restrictions (consent granted)
              // ['LDU'] = Limited Data Use (consent denied or ATT denied)
              Settings.setDataProcessingOptions(attAuthorized ? [] : ['LDU']);
              console.log(`[Facebook] Data processing: ${attAuthorized ? 'FULL' : 'LIMITED (LDU)'}`);
            } else {
              console.log('[Facebook] setDataProcessingOptions not available in this SDK version');
            }
          } catch {
            // This is non-critical - SDK will still work without data processing options
            console.log('[Facebook] Data processing options not set (SDK limitation)');
          }
        }

        this.status = SDKStatus.INITIALIZED;
        console.log('[Facebook] ✅ SDK initialized successfully');
        
        // Log app activation event
        AppEventsLogger.logEvent('fb_mobile_activate_app');
        
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[Facebook] ❌ Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Enable tracking (update advertiser tracking to enabled)
   */
  async enable(): Promise<void> {
    if (this.status !== SDKStatus.INITIALIZED) {
      console.warn('[Facebook] SDK not initialized');
      return;
    }
    
    this.isAdvertiserTrackingEnabled = true;
    Settings.setAdvertiserTrackingEnabled(true);
    Settings.setAutoLogAppEventsEnabled(true);
    console.log('[Facebook] Tracking enabled');
  }

  /**
   * Disable tracking (set Limited Data Use mode)
   */
  async disable(): Promise<void> {
    if (this.status !== SDKStatus.INITIALIZED) {
      console.warn('[Facebook] SDK not initialized');
      return;
    }
    
    this.isAdvertiserTrackingEnabled = false;
    Settings.setAdvertiserTrackingEnabled(false);
    Settings.setDataProcessingOptions(['LDU']);
    console.log('[Facebook] Tracking disabled (LDU mode)');
  }

  /**
   * Update advertiser tracking status
   * Call this when ATT status changes
   */
  updateAdvertiserTracking(authorized: boolean): void {
    if (this.status !== SDKStatus.INITIALIZED) {
      console.warn('[Facebook] SDK not initialized');
      return;
    }
    
    this.isAdvertiserTrackingEnabled = authorized;
    Settings.setAdvertiserTrackingEnabled(authorized);
    Settings.setDataProcessingOptions(authorized ? [] : ['LDU']);
    console.log(`[Facebook] Advertiser tracking updated: ${authorized ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log custom event
   */
  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    try {
      if (parameters) {
        AppEventsLogger.logEvent(eventName, parameters as Record<string, string | number>);
      } else {
        AppEventsLogger.logEvent(eventName);
      }
    } catch (error) {
      console.error('[Facebook] Error logging event:', error);
    }
  }

  /**
   * Log purchase event
   */
  logPurchase(amount: number, currency: string, parameters?: Record<string, unknown>): void {
    try {
      AppEventsLogger.logPurchase(amount, currency, parameters as Record<string, string | number>);
    } catch (error) {
      console.error('[Facebook] Error logging purchase:', error);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    try {
      AppEventsLogger.setUserID(userId);
    } catch (error) {
      console.error('[Facebook] Error setting user ID:', error);
    }
  }

  /**
   * Clear user ID
   */
  clearUserId(): void {
    try {
      AppEventsLogger.setUserID(null);
    } catch (error) {
      console.error('[Facebook] Error clearing user ID:', error);
    }
  }

  /**
   * Get initialization status
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

  /**
   * Check if advertiser tracking is enabled
   */
  isTrackingEnabled(): boolean {
    return this.isAdvertiserTrackingEnabled;
  }
}

export default FacebookAdapter;
