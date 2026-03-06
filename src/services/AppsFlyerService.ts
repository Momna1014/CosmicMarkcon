import { Platform } from 'react-native';
import appsflyer from 'react-native-appsflyer';

/**
 * AppsFlyer Service
 * Provides a unified interface for tracking attribution, events, and deep links
 * 
 * Features:
 * - Attribution tracking
 * - Event tracking
 * - Deep linking
 * - User properties
 * - Revenue tracking
 */

export interface AppsFlyerConfig {
  devKey: string;
  appId: string; // iOS App ID (Apple ID)
  isDebug?: boolean;
  onInstallConversionDataListener?: boolean;
  onDeepLinkListener?: boolean;
  timeToWaitForATTUserAuthorization?: number;
}

export interface ConversionData {
  status: 'success' | 'failure';
  type: 'onInstallConversionDataLoaded' | 'onInstallConversionFailure';
  data: any;
}

export interface DeepLinkData {
  status: 'success' | 'failure';
  data: any;
}

class AppsFlyerService {
  private isInitialized = false;
  private conversionDataCallback?: (data: ConversionData) => void;
  private deepLinkCallback?: (data: DeepLinkData) => void;

  /**
   * Initialize AppsFlyer SDK
   * OPTIMIZED: Non-blocking initialization
   */
  async initialize(config: AppsFlyerConfig): Promise<void> {
    if (this.isInitialized) {
      console.log('[AppsFlyer] Already initialized');
      return;
    }

    try {
      console.log('[AppsFlyer] 🚀 Initializing AppsFlyer SDK...');
      console.log('[AppsFlyer] 🔑 Config received:');
      console.log('[AppsFlyer]   - Dev Key:', config.devKey);
      console.log('[AppsFlyer]   - App ID:', config.appId);
      console.log('[AppsFlyer]   - Debug:', config.isDebug);
      console.log('[AppsFlyer]   - Platform:', Platform.OS);

      // Configure AppsFlyer options
      const options = {
        devKey: config.devKey,
        isDebug: config.isDebug ?? __DEV__,
        appId: config.appId,
        onInstallConversionDataListener: config.onInstallConversionDataListener ?? true,
        onDeepLinkListener: config.onDeepLinkListener ?? true,
        timeToWaitForATTUserAuthorization: config.timeToWaitForATTUserAuthorization ?? 10,
      };

      // Register listeners BEFORE initialization (non-blocking)
      if (config.onInstallConversionDataListener) {
        appsflyer.onInstallConversionData((data) => {
          console.log('[AppsFlyer] Install conversion data:', data);
          if (this.conversionDataCallback) {
            this.conversionDataCallback(data);
          }
        });
      }

      if (config.onDeepLinkListener) {
        appsflyer.onDeepLink((data) => {
          console.log('[AppsFlyer] Deep link data:', data);
          if (this.deepLinkCallback) {
            this.deepLinkCallback(data);
          }
        });
      }

      // Initialize SDK - this is fast, but we still await it
      await appsflyer.initSdk(options);
      this.isInitialized = true;
      console.log('[AppsFlyer] ✅ Initialized successfully with Dev Key:', config.devKey);
    } catch (error) {
      console.error('[AppsFlyer] ❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Log a custom event
   */
  logEvent(eventName: string, eventValues?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.logEvent(
        eventName,
        eventValues || {},
        (result) => {
          console.log('[AppsFlyer] Event logged successfully:', result);
        },
        (error) => {
          console.error('[AppsFlyer] Event logging failed:', error);
        }
      );
    } catch (error) {
      console.error('[AppsFlyer] Error logging event:', error);
    }
  }

  /**
   * Log a purchase event
   */
  logPurchase(
    revenue: number,
    currency: string,
    productId?: string,
    additionalData?: Record<string, any>
  ): void {
    const purchaseData = {
      af_revenue: revenue,
      af_currency: currency,
      af_content_id: productId,
      ...additionalData,
    };

    this.logEvent('af_purchase', purchaseData);
  }

  /**
   * Log app open
   */
  logAppOpen(): void {
    this.logEvent('af_app_opened');
  }

  /**
   * Log registration/sign up
   */
  logRegistration(method: string): void {
    this.logEvent('af_complete_registration', {
      af_registration_method: method,
    });
  }

  /**
   * Log login
   */
  logLogin(method: string): void {
    this.logEvent('af_login', {
      af_login_method: method,
    });
  }

  /**
   * Log content view
   */
  logContentView(contentId: string, contentType: string): void {
    this.logEvent('af_content_view', {
      af_content_id: contentId,
      af_content_type: contentType,
    });
  }

  /**
   * Log add to cart
   */
  logAddToCart(
    contentId: string,
    price: number,
    currency: string,
    quantity: number = 1
  ): void {
    this.logEvent('af_add_to_cart', {
      af_content_id: contentId,
      af_price: price,
      af_currency: currency,
      af_quantity: quantity,
    });
  }

  /**
   * Log tutorial completion
   */
  logTutorialCompletion(success: boolean): void {
    this.logEvent('af_tutorial_completion', {
      af_success: success,
    });
  }

  /**
   * Log level achievement
   */
  logLevelAchieved(level: number, score?: number): void {
    this.logEvent('af_level_achieved', {
      af_level: level,
      af_score: score,
    });
  }

  /**
   * Log ad revenue
   */
  logAdRevenue(
    revenue: number,
    currency: string,
    adNetwork: string,
    adFormat: string,
    placement?: string
  ): void {
    this.logEvent('af_ad_revenue', {
      af_revenue: revenue,
      af_currency: currency,
      af_adrev_ad_network: adNetwork,
      af_adrev_ad_format: adFormat,
      af_adrev_ad_placement: placement,
    });
  }

  /**
   * Set user ID for tracking
   */
  setCustomerUserId(userId: string): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.setCustomerUserId(userId, (success) => {
        console.log('[AppsFlyer] Customer user ID set:', success);
      });
    } catch (error) {
      console.error('[AppsFlyer] Error setting customer user ID:', error);
    }
  }

  /**
   * Set additional user data
   */
  setAdditionalData(data: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.setAdditionalData(data, (success) => {
        console.log('[AppsFlyer] Additional data set:', success);
      });
    } catch (error) {
      console.error('[AppsFlyer] Error setting additional data:', error);
    }
  }

  /**
   * Set user email
   */
  setUserEmails(emails: string[], emailsCryptType: number = 0): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.setUserEmails(
        { emails, emailsCryptType },
        (success) => {
          console.log('[AppsFlyer] User emails set:', success);
        },
        (error) => {
          console.error('[AppsFlyer] User emails error:', error);
        }
      );
    } catch (error) {
      console.error('[AppsFlyer] Error setting user emails:', error);
    }
  }

  /**
   * Get AppsFlyer ID
   */
  async getAppsFlyerId(): Promise<string> {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return '';
    }

    return new Promise((resolve, reject) => {
      try {
        appsflyer.getAppsFlyerUID((error, appsFlyerId) => {
          if (error) {
            console.error('[AppsFlyer] Error getting AppsFlyer ID:', error);
            reject(error);
          } else {
            console.log('[AppsFlyer] AppsFlyer ID:', appsFlyerId);
            resolve(appsFlyerId);
          }
        });
      } catch (error) {
        console.error('[AppsFlyer] Error getting AppsFlyer ID:', error);
        reject(error);
      }
    });
  }

  /**
   * Set conversion data callback
   */
  setConversionDataCallback(callback: (data: ConversionData) => void): void {
    this.conversionDataCallback = callback;
  }

  /**
   * Set deep link callback
   */
  setDeepLinkCallback(callback: (data: DeepLinkData) => void): void {
    this.deepLinkCallback = callback;
  }

  /**
   * Enable/disable analytics collection
   */
  setOptOut(optOut: boolean): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.anonymizeUser(optOut, (success) => {
        console.log('[AppsFlyer] Anonymize user set:', success);
      });
    } catch (error) {
      console.error('[AppsFlyer] Error setting anonymize user:', error);
    }
  }

  /**
   * Enable/disable SDK
   */
  stop(shouldStop: boolean): void {
    if (!this.isInitialized) {
      console.warn('[AppsFlyer] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      appsflyer.stop(shouldStop, (success) => {
        console.log('[AppsFlyer] Stop SDK:', success);
      });
    } catch (error) {
      console.error('[AppsFlyer] Error stopping SDK:', error);
    }
  }

  /**
   * Check if SDK is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const appsFlyerService = new AppsFlyerService();
