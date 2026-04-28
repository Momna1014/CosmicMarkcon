/**
 * Adjust Adapter
 *
 * Wrapper around the Adjust SDK for mobile attribution tracking.
 * Replaces the previous AppsFlyer integration.
 *
 * Key design decisions:
 * - ATT prompt is handled externally by ATTController; Adjust's built-in
 *   ATT wrapper is disabled via disableAppTrackingTransparencyUsage().
 * - After ATT resolves, updateTrackingStatus(authorized) must be called so
 *   Adjust's servers receive the measurement-consent signal.
 * - Environment is driven purely by __DEV__: Sandbox in dev builds,
 *   Production in release builds — no manual switching required.
 */

import { Platform } from 'react-native';
import { Adjust, AdjustConfig as AdjustSDKConfig } from 'react-native-adjust';
import { SDKStatus, ITrackingSDK, AdjustConfig } from './types';
import { AsyncLock } from '../core';
import env from '../../config/env';

/**
 * Adjust SDK Adapter Implementation
 */
export class AdjustAdapter implements ITrackingSDK {
  readonly sdkId = 'adjust';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();

  /**
   * Initialize Adjust SDK.
   *
   * Must only be called after user consent has been obtained.
   * The environment is automatically set based on __DEV__:
   *   - __DEV__ === true  → EnvironmentSandbox
   *   - __DEV__ === false → EnvironmentProduction
   */
  async initialize(config?: AdjustConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[Adjust] Already initialized');
        return;
      }

      this.status = SDKStatus.INITIALIZING;

      // Select the correct token for the current platform
      const appToken =
        Platform.OS === 'ios'
          ? (config?.tokenIos ?? env.ADJUST_TOKEN_IOS)
          : (config?.tokenAndroid ?? env.ADJUST_TOKEN_ANDROID);

      if (!appToken || appToken.includes('your_')) {
        console.warn('[Adjust] ⚠️ App token not configured — skipping initialization');
        this.status = SDKStatus.NOT_INITIALIZED;
        return;
      }

      // Sandbox for dev builds, Production for release builds
      const environment = __DEV__
        ? AdjustSDKConfig.EnvironmentSandbox
        : AdjustSDKConfig.EnvironmentProduction;

      try {
        console.log('[Adjust] 🚀 Initializing...');
        console.log('[Adjust]   Platform :', Platform.OS);
        console.log('[Adjust]   Token    :', appToken);
        console.log('[Adjust]   Env      :', environment);

        const adjustConfig = new AdjustSDKConfig(appToken, environment);

        // Disable Adjust's own ATT prompt — ATTController manages the prompt
        // independently. After the prompt resolves, call updateTrackingStatus().
        adjustConfig.disableAppTrackingTransparencyUsage();

        // Attribution callback: fired on first install and on re-attribution.
        // Campaign data is logged here; downstream consumers (e.g. RevenueCat)
        // read it via Adjust.getAttribution().
        adjustConfig.setAttributionCallback((attribution) => {
          console.log('[Adjust] 📊 Attribution updated:');
          console.log('[Adjust]   Network  :', attribution.network);
          console.log('[Adjust]   Campaign :', attribution.campaign);
          console.log('[Adjust]   Adgroup  :', attribution.adgroup);
          console.log('[Adjust]   Creative :', attribution.creative);
        });

        // Verbose logging in dev builds only
        if (__DEV__) {
          adjustConfig.setLogLevel(AdjustSDKConfig.LogLevelVerbose);
        }

        Adjust.initSdk(adjustConfig);

        this.status = SDKStatus.INITIALIZED;
        console.log('[Adjust] ✅ Initialized successfully');
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[Adjust] ❌ Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Resume / re-enable Adjust tracking.
   * Safe to call even if the SDK is already enabled.
   */
  async enable(): Promise<void> {
    try {
      Adjust.enable();
      console.log('[Adjust] Tracking enabled');
    } catch (error) {
      console.error('[Adjust] Error enabling tracking:', error);
    }
  }

  /**
   * Pause / disable Adjust tracking.
   * The SDK will stop sending data until enable() is called.
   */
  async disable(): Promise<void> {
    try {
      Adjust.disable();
      console.log('[Adjust] Tracking disabled');
    } catch (error) {
      console.error('[Adjust] Error disabling tracking:', error);
    }
  }

  /**
   * Communicate the ATT / consent result to Adjust servers.
   *
   * Call this after ATTController resolves:
   *   - authorized = true  → user granted IDFA (full attribution)
   *   - authorized = false → user denied or restricted
   *
   * Adjust uses this signal to apply the correct data-privacy rules
   * on the server side and to decide whether to collect the IDFA.
   */
  updateTrackingStatus(authorized: boolean): void {
    try {
      Adjust.trackMeasurementConsent(authorized);
      console.log('[Adjust] Measurement consent updated:', authorized);
    } catch (error) {
      console.error('[Adjust] Error updating measurement consent:', error);
    }
  }

  /**
   * Return the current SDK lifecycle status.
   */
  getStatus(): SDKStatus {
    return this.status;
  }

  /**
   * Returns true once the SDK has been successfully initialized.
   */
  isInitialized(): boolean {
    return this.status === SDKStatus.INITIALIZED;
  }
}

export default AdjustAdapter;
