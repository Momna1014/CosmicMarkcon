/**
 * Firebase Service
 * 
 * Centralized Firebase service for Analytics, Crashlytics, and Events
 * Provides a clean API for logging events, tracking screens, and managing crashes
 * 
 * @module FirebaseService
 */

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {Platform} from 'react-native';

// ==================== TYPE DEFINITIONS ====================

export interface FirebaseEventParams {
  [key: string]: string | number | boolean | undefined;
}

export interface UserProperties {
  [key: string]: string;
}

export interface CrashAttributes {
  [key: string]: string;
}

// ==================== FIREBASE SERVICE CLASS ====================

class FirebaseService {
  private static instance: FirebaseService;
  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance of FirebaseService
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase services
   */
  private async initialize(): Promise<void> {
    try {
      // Enable Crashlytics data collection
      await crashlytics().setCrashlyticsCollectionEnabled(true);

      // Set initial user properties
      await this.setUserProperty('platform', Platform.OS);
      await this.setUserProperty('app_version', '1.0.0');

      this.isInitialized = true;
      console.log('✅ Firebase Service initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Service initialization failed:', error);
    }
  }

  // ==================== ANALYTICS METHODS ====================

  /**
   * Log a custom event to Firebase Analytics
   * @param eventName - Name of the event (max 40 characters, alphanumeric and underscores only)
   * @param params - Event parameters (max 25 parameters, each key max 40 chars, value max 100 chars)
   */
  async logEvent(
    eventName: string,
    params?: FirebaseEventParams,
  ): Promise<void> {
    try {
      await analytics().logEvent(eventName, params);
      console.log(`📊 Analytics Event: ${eventName}`, params);
    } catch (error) {
      console.error(`Failed to log event ${eventName}:`, error);
    }
  }

  /**
   * Log screen view event
   * @param screenName - Name of the screen
   * @param screenClass - Class/component name of the screen
   */
  async logScreenView(
    screenName: string,
    screenClass?: string,
  ): Promise<void> {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`📱 Screen View: ${screenName}`);
    } catch (error) {
      console.error(`Failed to log screen view ${screenName}:`, error);
    }
  }

  /**
   * Set user ID for analytics
   * @param userId - Unique user identifier
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      await analytics().setUserId(userId);
      console.log(`👤 User ID set: ${userId}`);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Set user property for analytics
   * @param name - Property name (max 24 characters)
   * @param value - Property value (max 36 characters)
   */
  async setUserProperty(name: string, value: string): Promise<void> {
    try {
      await analytics().setUserProperty(name, value);
      console.log(`🏷️  User Property: ${name} = ${value}`);
    } catch (error) {
      console.error(`Failed to set user property ${name}:`, error);
    }
  }

  /**
   * Set multiple user properties at once
   * @param properties - Object with property name-value pairs
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    try {
      const promises = Object.entries(properties).map(([name, value]) =>
        this.setUserProperty(name, value),
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Enable or disable analytics data collection
   * @param enabled - Whether to enable analytics
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
      console.log(`📊 Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to set analytics collection:', error);
    }
  }

  // ==================== CRASHLYTICS METHODS ====================

  /**
   * Record a non-fatal error/exception
   * @param error - Error object or string
   * @param jsErrorName - Optional custom error name
   */
  async recordError(error: Error | string, jsErrorName?: string): Promise<void> {
    try {
      if (typeof error === 'string') {
        await crashlytics().recordError(new Error(error));
      } else {
        await crashlytics().recordError(error, jsErrorName);
      }
      console.log(`💥 Error recorded:`, error);
    } catch (err) {
      console.error('Failed to record error:', err);
    }
  }

  /**
   * Log a message to Crashlytics
   * @param message - Message to log
   */
  async log(message: string): Promise<void> {
    try {
      await crashlytics().log(message);
      console.log(`📝 Crashlytics log: ${message}`);
    } catch (error) {
      console.error('Failed to log to Crashlytics:', error);
    }
  }

  /**
   * Set custom key-value attribute for crash reports
   * @param key - Attribute key
   * @param value - Attribute value
   */
  async setCrashlyticsAttribute(
    key: string,
    value: string | number | boolean,
  ): Promise<void> {
    try {
      await crashlytics().setAttribute(key, String(value));
      console.log(`🔑 Crashlytics attribute: ${key} = ${value}`);
    } catch (error) {
      console.error(`Failed to set crashlytics attribute ${key}:`, error);
    }
  }

  /**
   * Set multiple custom attributes at once
   * @param attributes - Object with key-value pairs
   */
  async setCrashlyticsAttributes(
    attributes: CrashAttributes,
  ): Promise<void> {
    try {
      await crashlytics().setAttributes(attributes);
      console.log(`🔑 Crashlytics attributes set:`, attributes);
    } catch (error) {
      console.error('Failed to set crashlytics attributes:', error);
    }
  }

  /**
   * Set user identifier for crash reports
   * @param userId - User ID
   */
  async setCrashlyticsUserId(userId: string): Promise<void> {
    try {
      await crashlytics().setUserId(userId);
      console.log(`👤 Crashlytics User ID: ${userId}`);
    } catch (error) {
      console.error('Failed to set crashlytics user ID:', error);
    }
  }

  /**
   * Force a crash (for testing purposes only)
   * WARNING: This will crash the app immediately
   */
  crash(): void {
    console.warn('⚠️  Forcing app crash for testing...');
    crashlytics().crash();
  }

  /**
   * Enable or disable crash collection
   * @param enabled - Whether to enable crash collection
   */
  async setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await crashlytics().setCrashlyticsCollectionEnabled(enabled);
      console.log(
        `💥 Crashlytics collection ${enabled ? 'enabled' : 'disabled'}`,
      );
    } catch (error) {
      console.error('Failed to set crashlytics collection:', error);
    }
  }

  /**
   * Check if crashlytics collection is enabled
   */
  async isCrashlyticsCollectionEnabled(): Promise<boolean> {
    try {
      const enabled = crashlytics().isCrashlyticsCollectionEnabled;
      return enabled;
    } catch (error) {
      console.error('Failed to check crashlytics status:', error);
      return false;
    }
  }

  // ==================== PREDEFINED EVENTS ====================

  /**
   * Log app open event
   */
  async logAppOpen(): Promise<void> {
    await this.logEvent('app_open', {
      timestamp: Date.now(),
      platform: Platform.OS,
    });
  }

  /**
   * Log login event
   * @param method - Login method (e.g., 'google', 'apple', 'email')
   */
  async logLogin(method: string): Promise<void> {
    await this.logEvent('login', {method});
  }

  /**
   * Log signup event
   * @param method - Signup method (e.g., 'google', 'apple', 'email')
   */
  async logSignUp(method: string): Promise<void> {
    await this.logEvent('sign_up', {method});
  }

  /**
   * Log button click event
   * @param buttonName - Name/ID of the button
   * @param screenName - Screen where button was clicked
   */
  async logButtonClick(buttonName: string, screenName: string): Promise<void> {
    await this.logEvent('button_click', {
      button_name: buttonName,
      screen_name: screenName,
    });
  }

  /**
   * Log purchase event
   * @param itemId - Item identifier
   * @param itemName - Item name
   * @param price - Item price
   * @param currency - Currency code (e.g., 'USD')
   */
  async logPurchase(
    itemId: string,
    itemName: string,
    price: number,
    currency: string = 'USD',
  ): Promise<void> {
    await this.logEvent('purchase', {
      item_id: itemId,
      item_name: itemName,
      value: price,
      currency,
    });
  }

  /**
   * Log search event
   * @param searchTerm - Search query
   */
  async logSearch(searchTerm: string): Promise<void> {
    await this.logEvent('search', {search_term: searchTerm});
  }

  /**
   * Log share event
   * @param contentType - Type of content shared
   * @param itemId - ID of shared content
   * @param method - Share method (e.g., 'facebook', 'twitter')
   */
  async logShare(
    contentType: string,
    itemId: string,
    method: string,
  ): Promise<void> {
    await this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    });
  }
}

// ==================== EXPORT SINGLETON INSTANCE ====================

export default FirebaseService.getInstance();
