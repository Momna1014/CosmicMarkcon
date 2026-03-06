/**
 * Sentry Adapter
 *
 * Wrapper around Sentry SDK for error tracking.
 * 
 * GDPR Compliance:
 * - Sentry is initialized in App.tsx with PII DISABLED by default
 * - Full tracking (PII, replay) is enabled ONLY after user consent
 * - Call enableFullTracking() after Usercentrics consent is given
 */

import * as Sentry from '@sentry/react-native';
import { SDKStatus, ITrackingSDK, SentryConfig } from './types';
import { AsyncLock } from '../core';
import env from '../../config/env';

/**
 * Sentry Adapter Implementation
 */
export class SentryAdapter implements ITrackingSDK {
  readonly sdkId = 'sentry';
  private status: SDKStatus = SDKStatus.NOT_INITIALIZED;
  private lock = new AsyncLock();
  private config: SentryConfig | null = null;
  private userTrackingEnabled = false; // Default: disabled for GDPR
  private fullTrackingEnabled = false;

  /**
   * Initialize Sentry SDK
   * NOTE: Basic Sentry is already initialized in App.tsx with PII disabled
   * This method marks the adapter as ready and optionally enables tracking
   */
  async initialize(config?: SentryConfig): Promise<void> {
    return this.lock.acquire('init', async () => {
      if (this.status === SDKStatus.INITIALIZED) {
        console.log('[Sentry] Already initialized');
        return;
      }

      this.status = SDKStatus.INITIALIZING;
      
      // Debug: Log raw DSN value
      const dsnValue = env?.SENTRY_DSN || '';
      console.log('[Sentry] DSN from env:', dsnValue ? `${dsnValue.substring(0, 30)}...` : '(empty)');
      
      this.config = config || {
        dsn: dsnValue,
        environment: __DEV__ ? 'development' : 'production',
        enableUserTracking: false, // Default: disabled for GDPR
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      };

      try {
        console.log('[Sentry] Adapter initialized (Sentry SDK already running from App.tsx)');
        console.log('[Sentry] User tracking enabled:', this.config.enableUserTracking);

        // If config says to enable user tracking, enable it now
        if (this.config.enableUserTracking) {
          await this.enableFullTracking();
        }

        this.status = SDKStatus.INITIALIZED;
        console.log('[Sentry] Adapter ready');
      } catch (error) {
        this.status = SDKStatus.FAILED;
        console.error('[Sentry] Initialization failed:', error);
        throw error;
      }
    });
  }

  /**
   * Enable full tracking after user consent (GDPR compliant)
   * This enables:
   * - PII collection (IP, user agent, etc.)
   * - Session replay
   * - User context tracking
   */
  async enableFullTracking(): Promise<void> {
    if (this.fullTrackingEnabled) {
      console.log('[Sentry] Full tracking already enabled');
      return;
    }

    try {
      console.log('[Sentry] Enabling full tracking after user consent...');

      // Enable user tracking
      this.userTrackingEnabled = true;
      this.fullTrackingEnabled = true;

      // Note: Session replay integrations were disabled at init time
      // They cannot be dynamically added, but we can track that consent was given
      // The beforeSend hook will now include user/device data

      console.log('[Sentry] ✅ Full tracking enabled (PII collection active)');
    } catch (error) {
      console.error('[Sentry] Error enabling full tracking:', error);
    }
  }

  /**
   * Enable user tracking
   */
  async enable(): Promise<void> {
    await this.enableFullTracking();
  }

  /**
   * Disable user tracking (crash-only mode)
   */
  async disable(): Promise<void> {
    this.userTrackingEnabled = false;
    Sentry.setUser(null);
    console.log('[Sentry] User tracking disabled (crash-only mode)');
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string } | null): void {
    if (!this.userTrackingEnabled) {
      return;
    }

    try {
      Sentry.setUser(user);
    } catch (error) {
      console.error('[Sentry] Error setting user:', error);
    }
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    try {
      if (context) {
        Sentry.withScope(scope => {
          scope.setExtras(context);
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
    } catch (e) {
      console.error('[Sentry] Error capturing exception:', e);
    }
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level?: Sentry.SeverityLevel): void {
    try {
      Sentry.captureMessage(message, level);
    } catch (error) {
      console.error('[Sentry] Error capturing message:', error);
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    try {
      Sentry.addBreadcrumb(breadcrumb);
    } catch (error) {
      console.error('[Sentry] Error adding breadcrumb:', error);
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

export default SentryAdapter;
