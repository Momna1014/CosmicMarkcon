/**
 * SDK Bootstrapper
 *
 * Coordinates SDK initialization with proper ordering and error handling.
 * Ensures SDKs are initialized exactly once and in the correct sequence.
 */

import { AsyncLock, withTimeout } from '../core';
import { SDKInitializationError, SDKAlreadyInitializedError } from '../core/errors';
import {
  FirebaseAdapter,
  AppsFlyerAdapter,
  SentryAdapter,
  AppLovinAdapter,
  RevenueCatAdapter,
  FacebookAdapter,
  SDKStatus,
} from '../sdk';
import { AdsMode, AdsModeResolution, AdsConfig } from '../ads/types';

/**
 * SDK initialization timeouts
 */
const TIMEOUTS = {
  core: 5000,
  tracking: 10000,
  ads: 8000,
};

/**
 * Core SDK configuration
 */
export interface CoreSDKConfig {
  crashlytics: {
    enabled: boolean;
    fullMode: boolean;
  };
  sentry: {
    enabled: boolean;
    fullMode: boolean;
  };
}

/**
 * SDK Bootstrapper Implementation
 */
export class SDKBootstrapper {
  // SDK Adapters
  readonly firebase: FirebaseAdapter;
  readonly appsFlyer: AppsFlyerAdapter;
  readonly sentry: SentryAdapter;
  readonly appLovin: AppLovinAdapter;
  readonly revenueCat: RevenueCatAdapter;
  readonly facebook: FacebookAdapter;

  private readonly initLock = new AsyncLock();
  private readonly initStatus: Map<string, SDKStatus> = new Map();
  
  // Store ATT status for Facebook initialization
  private attAuthorized: boolean = false;

  constructor() {
    this.firebase = new FirebaseAdapter();
    this.appsFlyer = new AppsFlyerAdapter();
    this.sentry = new SentryAdapter();
    this.appLovin = new AppLovinAdapter();
    this.revenueCat = new RevenueCatAdapter();
    this.facebook = new FacebookAdapter();
  }

  /**
   * Set ATT authorization status (call this after ATT prompt)
   */
  setATTAuthorized(authorized: boolean): void {
    this.attAuthorized = authorized;
    console.log('[Bootstrapper] ATT authorization set:', authorized);
  }

  /**
   * Initialize minimal bootstrap (RevenueCat Phase 1 only)
   */
  async initializeMinimal(): Promise<void> {
    console.log('[Bootstrapper] Starting minimal bootstrap...');

    try {
      await this.initializeSDK('revenuecat-phase1', () =>
        this.revenueCat.initializePhase1(),
      );
      console.log('[Bootstrapper] Minimal bootstrap complete');
    } catch (error) {
      console.error('[Bootstrapper] Minimal bootstrap failed:', error);
      // Non-critical for boot flow
    }
  }

  /**
   * Initialize core SDKs (crash reporting)
   */
  async initializeCore(config: CoreSDKConfig): Promise<void> {
    console.log('[Bootstrapper] Starting core SDK initialization...');

    // Log skipped SDKs when consent denied
    if (!config.crashlytics.enabled) {
      console.log('[Bootstrapper] Firebase/Crashlytics will be DISABLED (no consent)');
    }
    if (!config.sentry.enabled) {
      console.log('[Bootstrapper] Sentry skipped (no consent)');
    }

    const results = await Promise.allSettled([
      // Firebase (Crashlytics)
      config.crashlytics.enabled
        ? this.initializeSDK('firebase', () =>
            this.firebase.initialize({
              analyticsEnabled: false,
              crashlyticsEnabled: true,
              crashlyticsFullMode: config.crashlytics.fullMode,
            }),
          )
        : this.initializeSDK('firebase-disable', () =>
            // Explicitly disable Firebase collection when consent denied
            this.firebase.initialize({
              analyticsEnabled: false,
              crashlyticsEnabled: false,
              crashlyticsFullMode: false,
            }),
          ),

      // Sentry
      config.sentry.enabled
        ? this.initializeSDK('sentry', () =>
            this.sentry.initialize({
              dsn: '',
              environment: __DEV__ ? 'development' : 'production',
              enableUserTracking: config.sentry.fullMode,
              tracesSampleRate: __DEV__ ? 1.0 : 0.2,
            }),
          )
        : Promise.resolve(),
    ]);

    // Log results
    results.forEach((result, index) => {
      const sdkName = index === 0 ? 'Firebase' : 'Sentry';
      if (result.status === 'rejected') {
        console.warn(`[Bootstrapper] ${sdkName} init failed:`, result.reason);
      }
    });

    console.log('[Bootstrapper] Core SDK initialization complete');
  }

  /**
   * Initialize tracking SDKs (consent required)
   * 
   * NOTE: AppsFlyer initialization temporarily disabled - uncomment when devKey is configured
   */
  async initializeTracking(): Promise<void> {
    console.log('[Bootstrapper] Starting tracking SDK initialization...');
    console.log('[Bootstrapper] ATT authorized status:', this.attAuthorized);

    // Sequential initialization for tracking SDKs
    const sdks = [
      {
        name: 'firebase-analytics',
        init: async () => {
          if (this.firebase.isInitialized()) {
            await this.firebase.enableAnalytics();
          } else {
            await this.firebase.initialize({
              analyticsEnabled: true,
              crashlyticsEnabled: true,
              crashlyticsFullMode: true,
            });
          }
        },
      },
      {
        name: 'sentry-full-tracking',
        init: async () => {
          // Enable full Sentry tracking (PII, user context) after consent
          await this.sentry.enableFullTracking();
        },
      },
      {
        name: 'facebook',
        init: async () => {
          await this.facebook.initialize({
            attAuthorized: this.attAuthorized,
            autoLogAppEvents: true,
          });
        },
      },
      {
        name: 'appsflyer',
        init: () => this.appsFlyer.initialize(),
      },
      {
        name: 'remote-config',
        init: () => this.firebase.initializeRemoteConfig(),
      },
      {
        name: 'revenuecat-phase2',
        init: () =>
          this.revenueCat.upgradeToPhase2({
            collectDeviceIdentifiers: true,
            automaticAppleSearchAdsAttributionCollection: true,
          }),
      },
    ];

    for (const sdk of sdks) {
      try {
        await this.initializeSDK(sdk.name, sdk.init);
      } catch (error) {
        console.warn(`[Bootstrapper] ${sdk.name} init failed:`, error);
        // Continue with other SDKs
      }
    }

    console.log('[Bootstrapper] Tracking SDK initialization complete');
  }

  /**
   * Initialize ads SDK
   */
  async initializeAds(config: AdsConfig): Promise<void> {
    console.log('[Bootstrapper] Starting ads SDK initialization...');

    try {
      await this.initializeSDK('applovin', () =>
        this.appLovin.initialize({
          sdkKey: '',
          hasUserConsent: config.hasUserConsent,
          isAgeRestrictedUser: config.isAgeRestrictedUser,
          doNotSell: config.doNotSell,
          idfaEnabled: config.idfaEnabled,
        }),
      );

      // Configure ads mode
      if (config.mode === AdsMode.PERSONALIZED) {
        await this.appLovin.configureForPersonalizedAds();
      } else {
        await this.appLovin.configureForNonPersonalizedAds();
      }

      console.log('[Bootstrapper] Ads SDK initialized with mode:', config.mode);
    } catch (error) {
      console.error('[Bootstrapper] Ads SDK initialization failed:', error);
      throw error;
    }
  }

  /**
   * Update ads configuration after ATT resolution
   */
  async updateAdsConfiguration(resolution: AdsModeResolution): Promise<void> {
    if (!this.appLovin.isInitialized()) {
      console.warn('[Bootstrapper] AppLovin not initialized, skipping ads update');
      return;
    }

    try {
      if (resolution.mode === AdsMode.PERSONALIZED) {
        await this.appLovin.configureForPersonalizedAds();
      } else {
        await this.appLovin.configureForNonPersonalizedAds();
      }

      // Update AppsFlyer if tracking is allowed
      if (resolution.trackingAllowed && this.appsFlyer.isInitialized()) {
        this.appsFlyer.updateTrackingStatus(resolution.idfaEnabled);
      }

      console.log('[Bootstrapper] Ads configuration updated:', resolution.mode);
    } catch (error) {
      console.error('[Bootstrapper] Error updating ads configuration:', error);
    }
  }

  /**
   * Get SDK status
   */
  getStatus(sdkId: string): SDKStatus {
    return this.initStatus.get(sdkId) ?? SDKStatus.NOT_INITIALIZED;
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(sdkId: string): boolean {
    return this.getStatus(sdkId) === SDKStatus.INITIALIZED;
  }

  /**
   * Get all initialized SDKs
   */
  getInitializedSDKs(): string[] {
    const initialized: string[] = [];
    this.initStatus.forEach((status, id) => {
      if (status === SDKStatus.INITIALIZED) {
        initialized.push(id);
      }
    });
    return initialized;
  }

  /**
   * Get all failed SDKs
   */
  getFailedSDKs(): string[] {
    const failed: string[] = [];
    this.initStatus.forEach((status, id) => {
      if (status === SDKStatus.FAILED) {
        failed.push(id);
      }
    });
    return failed;
  }

  /**
   * Internal: Initialize a single SDK with lock protection
   */
  private async initializeSDK(
    sdkId: string,
    initializer: () => Promise<void>,
  ): Promise<void> {
    return this.initLock.acquire(sdkId, async () => {
      const status = this.initStatus.get(sdkId);

      if (status === SDKStatus.INITIALIZED) {
        console.log(`[Bootstrapper] ${sdkId} already initialized`);
        return;
      }

      if (status === SDKStatus.INITIALIZING) {
        throw new SDKAlreadyInitializedError(sdkId);
      }

      this.initStatus.set(sdkId, SDKStatus.INITIALIZING);

      try {
        const timeout = this.getTimeoutForSDK(sdkId);
        await withTimeout(
          initializer(),
          timeout,
          `${sdkId} initialization timeout`,
        );

        this.initStatus.set(sdkId, SDKStatus.INITIALIZED);
        console.log(`[Bootstrapper] ${sdkId} initialized`);
      } catch (error) {
        this.initStatus.set(sdkId, SDKStatus.FAILED);
        throw new SDKInitializationError(sdkId, (error as Error).message, error);
      }
    });
  }

  /**
   * Get timeout for SDK category
   */
  private getTimeoutForSDK(sdkId: string): number {
    if (sdkId.includes('applovin')) {
      return TIMEOUTS.ads;
    }
    if (
      sdkId.includes('analytics') ||
      sdkId.includes('appsflyer') ||
      sdkId.includes('revenuecat-phase2')
    ) {
      return TIMEOUTS.tracking;
    }
    return TIMEOUTS.core;
  }

  /**
   * Reset all SDK states (for testing)
   */
  reset(): void {
    this.initStatus.clear();
  }
}

export default SDKBootstrapper;
