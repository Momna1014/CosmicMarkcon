/**
 * Firebase Adapter
 *
 * Wrapper around Firebase SDKs (Analytics, Crashlytics, Remote Config).
 */

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import remoteConfig from '@react-native-firebase/remote-config';
import { SDKStatus, ISDKAdapter, FirebaseConfig, RemoteConfigConfig } from './types';
import { AsyncLock } from '../core';

/**
 * Default remote config settings
 */
const DEFAULT_REMOTE_CONFIG: RemoteConfigConfig = {
  minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000, // 1 hour in production
  fetchTimeoutMillis: 10000,
};

/**
 * Firebase Adapter Implementation
 */
export class FirebaseAdapter implements ISDKAdapter {
  readonly sdkId = 'firebase';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();
  private config: FirebaseConfig | null = null;

  /**
   * Initialize Firebase SDKs
   */
  async initialize(config?: FirebaseConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[Firebase] Already initialized');
        return;
      }

      this.status = SDKStatus.INITIALIZING;
      this.config = config || {
        analyticsEnabled: false,
        crashlyticsEnabled: true,
        crashlyticsFullMode: true,
      };

      try {
        console.log('[Firebase] Initializing...');

        // Initialize Crashlytics (only if enabled)
        if (this.config.crashlyticsEnabled) {
          await this.initializeCrashlytics();
        } else {
          // Explicitly disable crashlytics collection when consent denied
          try {
            await crashlytics().setCrashlyticsCollectionEnabled(false);
            console.log('[Firebase] Crashlytics DISABLED (no consent)');
          } catch (crashError) {
            console.warn('[Firebase] Crashlytics disable error:', crashError);
          }
        }

        // Initialize Analytics (if enabled)
        if (this.config.analyticsEnabled) {
          await this.initializeAnalytics();
        } else {
          // Explicitly disable analytics collection when consent denied
          try {
            await analytics().setAnalyticsCollectionEnabled(false);
            console.log('[Firebase] Analytics DISABLED (no consent)');
          } catch (analyticsError) {
            console.warn('[Firebase] Analytics disable error:', analyticsError);
          }
        }

        this.status = SDKStatus.INITIALIZED;
        console.log('[Firebase] Initialized successfully');
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[Firebase] Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Initialize Crashlytics
   */
  private async initializeCrashlytics(): Promise<void> {
    try {
      const enabled = this.config?.crashlyticsEnabled ?? true;
      await crashlytics().setCrashlyticsCollectionEnabled(enabled);

      if (!this.config?.crashlyticsFullMode) {
        // Anonymous mode - don't set user identifiers
        console.log('[Firebase] Crashlytics in anonymous mode');
      }

      console.log('[Firebase] Crashlytics enabled:', enabled);
    } catch (error) {
      console.warn('[Firebase] Crashlytics init error:', error);
    }
  }

  /**
   * Initialize Analytics
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('[Firebase] Analytics enabled');
    } catch (error) {
      console.warn('[Firebase] Analytics init error:', error);
    }
  }

  /**
   * Enable analytics collection
   */
  async enableAnalytics(): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('[Firebase] Analytics collection enabled');
    } catch (error) {
      console.error('[Firebase] Error enabling analytics:', error);
    }
  }

  /**
   * Disable analytics collection
   */
  async disableAnalytics(): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(false);
      console.log('[Firebase] Analytics collection disabled');
    } catch (error) {
      console.error('[Firebase] Error disabling analytics:', error);
    }
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('[Firebase] Error setting user ID:', error);
    }
  }

  /**
   * Log analytics event
   */
  async logEvent(name: string, params?: Record<string, unknown>): Promise<void> {
    try {
      await analytics().logEvent(name, params);
    } catch (error) {
      console.error('[Firebase] Error logging event:', error);
    }
  }

  /**
   * Initialize Remote Config
   */
  async initializeRemoteConfig(config?: RemoteConfigConfig): Promise<void> {
    const settings = config || DEFAULT_REMOTE_CONFIG;

    try {
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: settings.minimumFetchIntervalMillis,
        fetchTimeMillis: settings.fetchTimeoutMillis,
      });

      await remoteConfig().fetchAndActivate();
      console.log('[Firebase] Remote Config initialized');
    } catch (error) {
      console.warn('[Firebase] Remote Config init error:', error);
      // Non-critical - continue with defaults
    }
  }

  /**
   * Get remote config value
   */
  getRemoteConfigValue(key: string): string {
    return remoteConfig().getValue(key).asString();
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

export default FirebaseAdapter;
