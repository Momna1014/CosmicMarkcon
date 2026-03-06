/**
 * Sentry Service
 * 
 * Comprehensive error tracking and performance monitoring service
 * Integrates Sentry for crash reporting, error tracking, and performance monitoring
 * 
 * Features:
 * - Automatic crash reporting
 * - Error boundary integration
 * - Performance monitoring
 * - User context tracking
 * - Breadcrumb tracking
 * - Custom tags and context
 * - Release tracking
 * 
 * @see https://docs.sentry.io/platforms/react-native/
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

interface SentryConfig {
  dsn: string;
  url?: string;
  org?: string;
  project?: string;
  authToken?: string;
  environment?: string;
  debug?: boolean;
  enableAutoSessionTracking?: boolean;
  sessionTrackingIntervalMillis?: number;
  enableNative?: boolean;
  enableNativeCrashHandling?: boolean;
  tracesSampleRate?: number;
  enableAutoPerformanceTracing?: boolean;
}

interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

class SentryService {
  private isInitialized: boolean = false;

  /**
   * Initialize Sentry
   * Call this at app startup before rendering any components
   */
  initialize(config: SentryConfig): void {
    if (this.isInitialized) {
      console.log('[Sentry] Already initialized');
      return;
    }

    try {
      // Skip initialization if DSN is a placeholder or invalid
      if (!config.dsn || 
          config.dsn.includes('YOUR_') || 
          config.dsn === 'https://examplePublicKey@o0.ingest.sentry.io/0') {
        console.log('[Sentry] Skipping initialization - placeholder DSN detected. Add your real Sentry DSN to enable error tracking.');
        return;
      }

      // Log configuration (without sensitive tokens)
      if (config.debug) {
        console.log('[Sentry] Configuration:', {
          url: config.url || 'Not configured',
          org: config.org || 'Not configured',
          project: config.project || 'Not configured',
          environment: config.environment || (__DEV__ ? 'development' : 'production'),
          authToken: config.authToken ? '***configured***' : 'Not configured',
        });
      }

      Sentry.init({
        dsn: config.dsn,
        environment: config.environment || (__DEV__ ? 'development' : 'production'),
        debug: config.debug !== undefined ? config.debug : __DEV__,
        
        // Session Tracking
        enableAutoSessionTracking: config.enableAutoSessionTracking !== undefined 
          ? config.enableAutoSessionTracking 
          : true,
        sessionTrackingIntervalMillis: config.sessionTrackingIntervalMillis || 30000,
        
        // Native Integration
        enableNative: config.enableNative !== undefined ? config.enableNative : true,
        enableNativeCrashHandling: config.enableNativeCrashHandling !== undefined 
          ? config.enableNativeCrashHandling 
          : false,
        
        // Performance Monitoring
        tracesSampleRate: config.tracesSampleRate !== undefined 
          ? config.tracesSampleRate 
          : (config.environment === 'production' ? 0.2 : 1.0), // 20% in prod, 100% in dev
        enableAutoPerformanceTracing: config.enableAutoPerformanceTracing !== undefined
          ? config.enableAutoPerformanceTracing
          : true,
        
        // Device Context
        beforeSend: (event, hint) => {
          return event;
        },
      });

      // Set default tags
      Sentry.setTag('platform', Platform.OS);
      
      this.isInitialized = true;
      console.log('[Sentry] Initialized successfully');
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error);
      // Don't throw - allow app to continue without Sentry
    }
  }

  /**
   * Check if Sentry is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('[Sentry] Not initialized, cannot capture exception');
      return;
    }

    try {
      if (context) {
        Sentry.withScope((scope) => {
          Object.keys(context).forEach((key) => {
            scope.setExtra(key, context[key]);
          });
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
      console.log('[Sentry] Exception captured:', error.message);
    } catch (err) {
      console.error('[Sentry] Failed to capture exception:', err);
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level?: Sentry.SeverityLevel): void {
    if (!this.isInitialized) {
      console.warn('[Sentry] Not initialized, cannot capture message');
      return;
    }

    try {
      Sentry.captureMessage(message, level || 'info');
      console.log('[Sentry] Message captured:', message);
    } catch (error) {
      console.error('[Sentry] Failed to capture message:', error);
    }
  }

  /**
   * Add breadcrumb for tracking user actions
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category || 'user-action',
        level: breadcrumb.level || 'info',
        data: breadcrumb.data,
      });
    } catch (error) {
      console.error('[Sentry] Failed to add breadcrumb:', error);
    }
  }

  /**
   * Set user context
   */
  setUser(user: UserContext | null): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setUser(user);
      console.log('[Sentry] User context set');
    } catch (error) {
      console.error('[Sentry] Failed to set user context:', error);
    }
  }

  /**
   * Set custom tag
   */
  setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setTag(key, value);
    } catch (error) {
      console.error('[Sentry] Failed to set tag:', error);
    }
  }

  /**
   * Set custom context
   */
  setContext(key: string, context: Record<string, any> | null): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setContext(key, context);
    } catch (error) {
      console.error('[Sentry] Failed to set context:', error);
    }
  }

  /**
   * Set extra data
   */
  setExtra(key: string, value: any): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      Sentry.setExtra(key, value);
    } catch (error) {
      console.error('[Sentry] Failed to set extra data:', error);
    }
  }

  /**
   * Start a span for performance monitoring
   */
  startSpan(name: string, op: string): any {
    if (!this.isInitialized) {
      return undefined;
    }

    try {
      // In newer Sentry versions, use startSpan or startInactiveSpan
      return Sentry.startInactiveSpan({ name, op });
    } catch (error) {
      console.error('[Sentry] Failed to start span:', error);
      return undefined;
    }
  }

  /**
   * Wrap a function to capture errors
   */
  wrap<T extends (...args: any[]) => any>(fn: T): T {
    if (!this.isInitialized) {
      return fn;
    }

    return Sentry.wrap(fn) as T;
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.setUser(null);
  }

  /**
   * Flush pending events
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await Sentry.flush();
      return true;
    } catch (error) {
      console.error('[Sentry] Failed to flush:', error);
      return false;
    }
  }

  /**
   * Close Sentry
   */
  async close(timeout: number = 2000): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await Sentry.close();
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('[Sentry] Failed to close:', error);
      return false;
    }
  }

  /**
   * Get the native Sentry instance for advanced usage
   */
  getNativeInstance(): typeof Sentry {
    return Sentry;
  }
}

// Export singleton instance
export const sentryService = new SentryService();

// Export types
export type { SentryConfig, UserContext };
export { Sentry };
