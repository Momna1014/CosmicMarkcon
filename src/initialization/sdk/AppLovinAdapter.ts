/**
 * AppLovin Adapter
 *
 * Wrapper around AppLovin MAX SDK for ads.
 * Supports both personalized and non-personalized ads.
 *
 * NOTE: AppLovin MAX v9+ uses setExtraParameter for privacy settings.
 * @see https://developers.applovin.com/en/react-native/overview/privacy
 */

import { AppLovinMAX } from 'react-native-applovin-max';
import { SDKStatus, IAdsSDK, AppLovinConfig } from './types';
import { AsyncLock } from '../core';
import { AdsMode } from '../ads/types';
import env from '../../config/env';

/**
 * Privacy Extra Parameter Keys (AppLovin MAX v9+)
 */
const PRIVACY_PARAMS = {
  HAS_USER_CONSENT: 'has_user_consent',
  IS_AGE_RESTRICTED_USER: 'is_age_restricted_user',
  DO_NOT_SELL: 'is_do_not_sell',
} as const;

/**
 * AppLovin Adapter Implementation
 */
export class AppLovinAdapter implements IAdsSDK {
  readonly sdkId = 'applovin';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();
  private config: AppLovinConfig | null = null;
  private currentAdsMode: AdsMode = AdsMode.NON_PERSONALIZED;

  /**
   * Initialize AppLovin MAX SDK
   */
  async initialize(config?: AppLovinConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[AppLovin] Already initialized');
        // Allow reconfiguration even if initialized
        if (config) {
          await this.updateConfiguration(config);
        }
        return;
      }

      this.status = SDKStatus.INITIALIZING;
      this.config = config || {
        sdkKey: env?.APPLOVIN_SDK_KEY || '',
        hasUserConsent: false,
        isAgeRestrictedUser: false,
        doNotSell: true,
        idfaEnabled: false,
      };

      try {
        console.log('[AppLovin] Initializing...');

        // Set privacy flags BEFORE initialization using extra parameters
        this.setPrivacyFlags(this.config);

        // Initialize SDK
        await AppLovinMAX.initialize(this.config.sdkKey);

        this.status = SDKStatus.INITIALIZED;
        console.log('[AppLovin] Initialized successfully');
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[AppLovin] Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Set privacy flags using extra parameters (AppLovin MAX v9+)
   */
  private setPrivacyFlags(config: AppLovinConfig): void {
    try {
      // Use setExtraParameter for privacy settings
      AppLovinMAX.setExtraParameter(
        PRIVACY_PARAMS.HAS_USER_CONSENT,
        config.hasUserConsent ? 'true' : 'false'
      );
      AppLovinMAX.setExtraParameter(
        PRIVACY_PARAMS.IS_AGE_RESTRICTED_USER,
        config.isAgeRestrictedUser ? 'true' : 'false'
      );
      AppLovinMAX.setExtraParameter(
        PRIVACY_PARAMS.DO_NOT_SELL,
        config.doNotSell ? 'true' : 'false'
      );

      console.log('[AppLovin] Privacy flags set:', {
        hasUserConsent: config.hasUserConsent,
        doNotSell: config.doNotSell,
      });
    } catch (error) {
      console.error('[AppLovin] Error setting privacy flags:', error);
    }
  }

  /**
   * Update configuration after initialization
   */
  async updateConfiguration(config: Partial<AppLovinConfig>): Promise<void> {
    if (!this.isInitialized()) {
      console.warn('[AppLovin] Cannot update config before initialization');
      return;
    }

    try {
      if (config.hasUserConsent !== undefined) {
        AppLovinMAX.setExtraParameter(
          PRIVACY_PARAMS.HAS_USER_CONSENT,
          config.hasUserConsent ? 'true' : 'false'
        );
      }

      if (config.doNotSell !== undefined) {
        AppLovinMAX.setExtraParameter(
          PRIVACY_PARAMS.DO_NOT_SELL,
          config.doNotSell ? 'true' : 'false'
        );
      }

      if (config.isAgeRestrictedUser !== undefined) {
        AppLovinMAX.setExtraParameter(
          PRIVACY_PARAMS.IS_AGE_RESTRICTED_USER,
          config.isAgeRestrictedUser ? 'true' : 'false'
        );
      }

      // Update stored config
      this.config = { ...this.config!, ...config };

      console.log('[AppLovin] Configuration updated');
    } catch (error) {
      console.error('[AppLovin] Error updating configuration:', error);
    }
  }

  /**
   * Configure for personalized ads
   */
  async configureForPersonalizedAds(): Promise<void> {
    this.currentAdsMode = AdsMode.PERSONALIZED;
    await this.updateConfiguration({
      hasUserConsent: true,
      doNotSell: false,
    });
    console.log('[AppLovin] Configured for PERSONALIZED ads');
  }

  /**
   * Configure for non-personalized ads
   */
  async configureForNonPersonalizedAds(): Promise<void> {
    this.currentAdsMode = AdsMode.NON_PERSONALIZED;
    await this.updateConfiguration({
      hasUserConsent: false,
      doNotSell: true,
    });
    console.log('[AppLovin] Configured for NON-PERSONALIZED ads');
  }

  /**
   * Set user consent flag
   */
  async setHasUserConsent(consent: boolean): Promise<void> {
    try {
      AppLovinMAX.setExtraParameter(
        PRIVACY_PARAMS.HAS_USER_CONSENT,
        consent ? 'true' : 'false'
      );
      if (this.config) {
        this.config.hasUserConsent = consent;
      }
    } catch (error) {
      console.error('[AppLovin] Error setting user consent:', error);
    }
  }

  /**
   * Set do not sell flag (CCPA)
   */
  async setDoNotSell(doNotSell: boolean): Promise<void> {
    try {
      AppLovinMAX.setExtraParameter(
        PRIVACY_PARAMS.DO_NOT_SELL,
        doNotSell ? 'true' : 'false'
      );
      if (this.config) {
        this.config.doNotSell = doNotSell;
      }
    } catch (error) {
      console.error('[AppLovin] Error setting do not sell:', error);
    }
  }

  /**
   * Get current ads mode
   */
  getAdsMode(): AdsMode {
    return this.currentAdsMode;
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

export default AppLovinAdapter;
