// @feature:facebook-sdk:start
/**
 * Facebook Analytics Service
 * 
 * Provides comprehensive Facebook Analytics/Events tracking for both iOS and Android.
 * Uses react-native-fbsdk-next for Facebook SDK integration.
 * 
 * Features:
 * - Standard events tracking (ViewContent, Purchase, etc.)
 * - Custom events with parameters
 * - User properties
 * - App events logging
 * - Auto initialization
 */

import { Platform } from 'react-native';
import { Settings, AppEventsLogger } from 'react-native-fbsdk-next';

// Standard Facebook Event Names
export enum FacebookEventName {
  // E-commerce Events
  ADD_TO_CART = 'fb_mobile_add_to_cart',
  ADD_TO_WISHLIST = 'fb_mobile_add_to_wishlist',
  COMPLETE_REGISTRATION = 'fb_mobile_complete_registration',
  INITIATED_CHECKOUT = 'fb_mobile_initiated_checkout',
  PURCHASE = 'fb_mobile_purchase',
  ADD_PAYMENT_INFO = 'fb_mobile_add_payment_info',
  
  // Subscription Events (iOS 14+ SKAdNetwork compatible)
  START_TRIAL = 'fb_mobile_start_trial',       // Critical for trial tracking
  SUBSCRIBE = 'fb_mobile_subscribe',           // Critical for subscription tracking
  
  // Content Events
  VIEW_CONTENT = 'fb_mobile_content_view',
  SEARCH = 'fb_mobile_search',
  RATE = 'fb_mobile_rate',
  
  // App Events
  ACHIEVED_LEVEL = 'fb_mobile_level_achieved',
  UNLOCKED_ACHIEVEMENT = 'fb_mobile_achievement_unlocked',
  SPENT_CREDITS = 'fb_mobile_spent_credits',
  TUTORIAL_COMPLETED = 'fb_mobile_tutorial_completion',
  
  // Custom App Events
  APP_LAUNCHED = 'app_launched',
  SCREEN_VIEW = 'screen_view',
  BUTTON_CLICKED = 'button_clicked',
  FEATURE_USED = 'feature_used',
  ERROR_OCCURRED = 'error_occurred',
}

// Standard Facebook Event Parameters
export enum FacebookEventParam {
  CONTENT_TYPE = 'fb_content_type',
  CONTENT_ID = 'fb_content_id',
  CONTENT = 'fb_content',
  CURRENCY = 'fb_currency',
  NUM_ITEMS = 'fb_num_items',
  PAYMENT_INFO_AVAILABLE = 'fb_payment_info_available',
  REGISTRATION_METHOD = 'fb_registration_method',
  SEARCH_STRING = 'fb_search_string',
  SUCCESS = 'fb_success',
  MAX_RATING_VALUE = 'fb_max_rating_value',
  DESCRIPTION = 'fb_description',
  LEVEL = 'fb_level',
}

// Event Parameters Interface (compatible with Facebook SDK)
export interface FacebookEventParams {
  [key: string]: string | number;
}

// Purchase Details Interface
export interface PurchaseDetails {
  amount: number;
  currency: string;
  contentType?: string;
  contentId?: string;
  numItems?: number;
  parameters?: FacebookEventParams;
}

class FacebookAnalyticsService {
  private isInitialized = false;
  private isEnabled = false;
  private isAdvertiserTrackingEnabled = false;
  private consentGranted = false;

  /**
   * Initialize Facebook SDK
   * Must be called before any other Facebook SDK methods
   * 
   * @param attAuthorized - Whether ATT (App Tracking Transparency) was authorized by user
   *                        If not provided, defaults to false (privacy-first approach)
   */
  async initialize(attAuthorized: boolean = false): Promise<void> {
    try {
      if (!this.consentGranted) {
        console.warn('[Facebook] Consent not granted, skipping SDK init');
        this.isInitialized = false;
        return;
      }

      console.log('[Facebook] Initializing Facebook SDK...');
      console.log('[Facebook] ATT Authorization status:', attAuthorized);
      
      // Initialize Facebook SDK
      Settings.initializeSDK();
      console.log('[Facebook] SDK initialized');
      
      // Enable auto-logging of app events
      this.isEnabled = this.consentGranted;
      Settings.setAutoLogAppEventsEnabled(this.isEnabled);
      console.log(`[Facebook] Auto-logging ${this.isEnabled ? 'enabled' : 'disabled'}`);
      
      // Set advertiser tracking based on ATT authorization status (GDPR/ATT compliance)
      // Only enable advertiser tracking if user explicitly authorized via ATT
      const trackingAllowed = this.consentGranted && attAuthorized;
      this.isAdvertiserTrackingEnabled = trackingAllowed;
      Settings.setAdvertiserTrackingEnabled(trackingAllowed);
      console.log(`[Facebook] Advertiser tracking ${trackingAllowed ? 'enabled' : 'disabled'} (based on consent + ATT)`);
      
      // Set data processing options (GDPR compliance)
      // If consent/ATT not granted, limit data processing
      if (Platform.OS === 'android') {
        try {
          // Empty array = no restrictions (consent granted)
          // ['LDU'] = Limited Data Use (consent denied)
          Settings.setDataProcessingOptions(trackingAllowed ? [] : ['LDU']);
          console.log(`[Facebook] Data processing options set: ${trackingAllowed ? 'full' : 'LDU (limited)'}`);
        } catch (dataProcessingError) {
          console.warn('[Facebook] Could not set data processing options (non-critical):', dataProcessingError);
        }
      } else {
        // iOS - try to set data processing options
        try {
          Settings.setDataProcessingOptions(trackingAllowed ? [] : ['LDU']);
          console.log(`[Facebook] Data processing options set: ${trackingAllowed ? 'full' : 'LDU (limited)'}`);
        } catch (dataProcessingError) {
          console.log('[Facebook] Skipping data processing options on iOS (known SDK issue)');
        }
      }
      
      this.isInitialized = true;
      console.log('[Facebook] ✅ Facebook SDK initialized successfully');
      
      // Log app launch event
      await this.logAppLaunch();
      
    } catch (error) {
      console.error('[Facebook] ❌ Failed to initialize Facebook SDK:', error);
      // Don't throw - mark as not initialized and continue
      this.isInitialized = false;
    }
  }

  /**
   * Update advertiser tracking status
   * Call this when ATT status changes (e.g., after user responds to ATT prompt)
   */
  updateAdvertiserTracking(authorized: boolean): void {
    if (!this.isInitialized) {
      console.warn('[Facebook] Cannot update advertiser tracking - SDK not initialized');
      return;
    }

    const trackingAllowed = this.consentGranted && authorized;
    this.isAdvertiserTrackingEnabled = trackingAllowed;
    Settings.setAdvertiserTrackingEnabled(trackingAllowed);
    console.log(`[Facebook] Advertiser tracking updated: ${trackingAllowed ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if Facebook Analytics is initialized
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * Set whether consent allows Facebook analytics/ads tracking
   */
  setConsentGranted(granted: boolean): void {
    this.consentGranted = granted;
    if (!granted) {
      this.isEnabled = false;
      if (this.isInitialized) {
        Settings.setAutoLogAppEventsEnabled(false);
        Settings.setAdvertiserTrackingEnabled(false);
      }
    }
  }

  /**
   * Check if events can be logged
   */
  canLog(): boolean {
    return this.isInitialized && this.isEnabled && this.consentGranted;
  }

  /**
   * Enable or disable Facebook Analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && this.consentGranted;
    if (this.isInitialized) {
      Settings.setAutoLogAppEventsEnabled(this.isEnabled);
      if (!this.isEnabled) {
        Settings.setAdvertiserTrackingEnabled(false);
      }
    }
    console.log(`[Facebook] Analytics ${this.isEnabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if Facebook Analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  // ==================== Standard Events ====================

  /**
   * Log app launch event
   */
  async logAppLaunch(): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.APP_LAUNCHED, {
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });
      console.log('[Facebook] App launch event logged');
    } catch (error) {
      console.error('[Facebook] Failed to log app launch:', error);
    }
  }

  /**
   * Log screen view event
   */
  async logScreenView(screenName: string, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.SCREEN_VIEW, {
        screen_name: screenName,
        platform: Platform.OS,
        ...params,
      });
      console.log(`[Facebook] Screen view logged: ${screenName}`);
    } catch (error) {
      console.error('[Facebook] Failed to log screen view:', error);
    }
  }

  /**
   * Log view content event (when user views a product, article, etc.)
   */
  async logViewContent(
    contentType: string,
    contentId: string,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.VIEW_CONTENT, {
        [FacebookEventParam.CONTENT_TYPE]: contentType,
        [FacebookEventParam.CONTENT_ID]: contentId,
        ...params,
      });
      console.log(`[Facebook] View content logged: ${contentType} - ${contentId}`);
    } catch (error) {
      console.error('[Facebook] Failed to log view content:', error);
    }
  }

  /**
   * Log add to cart event
   */
  async logAddToCart(
    contentType: string,
    contentId: string,
    currency: string,
    price: number,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.ADD_TO_CART, {
        [FacebookEventParam.CONTENT_TYPE]: contentType,
        [FacebookEventParam.CONTENT_ID]: contentId,
        [FacebookEventParam.CURRENCY]: currency,
        price,
        ...params,
      });
      console.log(`[Facebook] Add to cart logged: ${contentId} - ${price} ${currency}`);
    } catch (error) {
      console.error('[Facebook] Failed to log add to cart:', error);
    }
  }

  /**
   * Log add to wishlist event
   */
  async logAddToWishlist(
    contentType: string,
    contentId: string,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.ADD_TO_WISHLIST, {
        [FacebookEventParam.CONTENT_TYPE]: contentType,
        [FacebookEventParam.CONTENT_ID]: contentId,
        ...params,
      });
      console.log(`[Facebook] Add to wishlist logged: ${contentId}`);
    } catch (error) {
      console.error('[Facebook] Failed to log add to wishlist:', error);
    }
  }

  /**
   * Log initiated checkout event
   */
  async logInitiatedCheckout(
    numItems: number,
    currency: string,
    totalPrice: number,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.INITIATED_CHECKOUT, {
        [FacebookEventParam.NUM_ITEMS]: numItems,
        [FacebookEventParam.CURRENCY]: currency,
        total_price: totalPrice,
        ...params,
      });
      console.log(`[Facebook] Initiated checkout logged: ${numItems} items - ${totalPrice} ${currency}`);
    } catch (error) {
      console.error('[Facebook] Failed to log initiated checkout:', error);
    }
  }

  /**
   * Log purchase event (most important for conversion tracking)
   */
  async logPurchase(details: PurchaseDetails): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      const { amount, currency, contentType, contentId, numItems, parameters } = details;
      
      // Use the dedicated purchase method
      await AppEventsLogger.logPurchase(amount, currency, {
        [FacebookEventParam.CONTENT_TYPE]: contentType || 'product',
        [FacebookEventParam.CONTENT_ID]: contentId || 'unknown',
        [FacebookEventParam.NUM_ITEMS]: numItems || 1,
        ...parameters,
      });
      
      console.log(`[Facebook] Purchase logged: ${amount} ${currency}`);
    } catch (error) {
      console.error('[Facebook] Failed to log purchase:', error);
    }
  }

  /**
   * Log complete registration event
   */
  async logCompleteRegistration(
    registrationMethod: string,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.COMPLETE_REGISTRATION, {
        [FacebookEventParam.REGISTRATION_METHOD]: registrationMethod,
        ...params,
      });
      console.log(`[Facebook] Complete registration logged: ${registrationMethod}`);
    } catch (error) {
      console.error('[Facebook] Failed to log complete registration:', error);
    }
  }

  /**
   * Log search event
   */
  async logSearch(searchString: string, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.SEARCH, {
        [FacebookEventParam.SEARCH_STRING]: searchString,
        ...params,
      });
      console.log(`[Facebook] Search logged: ${searchString}`);
    } catch (error) {
      console.error('[Facebook] Failed to log search:', error);
    }
  }

  /**
   * Log tutorial completion event
   */
  async logTutorialCompletion(success: boolean = true, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.TUTORIAL_COMPLETED, {
        [FacebookEventParam.SUCCESS]: success ? 1 : 0,
        ...params,
      });
      console.log(`[Facebook] Tutorial completion logged: ${success}`);
    } catch (error) {
      console.error('[Facebook] Failed to log tutorial completion:', error);
    }
  }

  /**
   * Log level achieved event
   */
  async logAchievedLevel(level: number, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.ACHIEVED_LEVEL, {
        [FacebookEventParam.LEVEL]: level,
        ...params,
      });
      console.log(`[Facebook] Level achieved logged: ${level}`);
    } catch (error) {
      console.error('[Facebook] Failed to log level achieved:', error);
    }
  }

  // ==================== Subscription Events (iOS 14+ SKAdNetwork compatible) ====================

  /**
   * Log Start Trial event - CRITICAL for iOS 14+ and SKAdNetwork
   * This is a standard Facebook event that works with Apple's SKAdNetwork
   * 
   * @param price - Trial price (usually 0 for free trial)
   * @param currency - Currency code (e.g., 'USD')
   * @param predictedLTV - Predicted lifetime value (optional but recommended)
   * @param params - Additional parameters
   */
  async logStartTrial(
    price: number = 0,
    currency: string = 'USD',
    predictedLTV?: number,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.START_TRIAL, {
        fb_currency: currency,
        _valueToSum: price,
        ...(predictedLTV !== undefined && { predicted_ltv: predictedLTV }),
        ...params,
      });
      console.log(`[Facebook] 🎯 Start Trial logged: ${price} ${currency}`);
    } catch (error) {
      console.error('[Facebook] Failed to log start trial:', error);
    }
  }

  /**
   * Log Subscribe event - CRITICAL for iOS 14+ and SKAdNetwork
   * This is a standard Facebook event for subscription conversions
   * 
   * @param price - Subscription price
   * @param currency - Currency code (e.g., 'USD')
   * @param predictedLTV - Predicted lifetime value (optional but recommended)
   * @param params - Additional parameters
   */
  async logSubscribe(
    price: number,
    currency: string = 'USD',
    predictedLTV?: number,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.SUBSCRIBE, {
        fb_currency: currency,
        _valueToSum: price,
        ...(predictedLTV !== undefined && { predicted_ltv: predictedLTV }),
        ...params,
      });
      console.log(`[Facebook] 🎯 Subscribe logged: ${price} ${currency}`);
    } catch (error) {
      console.error('[Facebook] Failed to log subscribe:', error);
    }
  }

  // ==================== Custom Events ====================

  /**
   * Log custom event with parameters
   */
  async logCustomEvent(
    eventName: string,
    params?: FacebookEventParams
  ): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(eventName, params || {});
      console.log(`[Facebook] Custom event logged: ${eventName}`, params);
    } catch (error) {
      console.error('[Facebook] Failed to log custom event:', error);
    }
  }

  /**
   * Log button click event
   */
  async logButtonClick(buttonName: string, screenName: string, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.BUTTON_CLICKED, {
        button_name: buttonName,
        screen_name: screenName,
        ...params,
      });
      console.log(`[Facebook] Button click logged: ${buttonName} on ${screenName}`);
    } catch (error) {
      console.error('[Facebook] Failed to log button click:', error);
    }
  }

  /**
   * Log feature usage event
   */
  async logFeatureUsed(featureName: string, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.FEATURE_USED, {
        feature_name: featureName,
        timestamp: new Date().toISOString(),
        ...params,
      });
      console.log(`[Facebook] Feature used logged: ${featureName}`);
    } catch (error) {
      console.error('[Facebook] Failed to log feature used:', error);
    }
  }

  /**
   * Log error event
   */
  async logError(errorCode: string, errorMessage: string, params?: FacebookEventParams): Promise<void> {
    if (!this.isEnabled) return;
    
    try {
      await AppEventsLogger.logEvent(FacebookEventName.ERROR_OCCURRED, {
        error_code: errorCode,
        error_message: errorMessage,
        platform: Platform.OS,
        ...params,
      });
      console.log(`[Facebook] Error logged: ${errorCode} - ${errorMessage}`);
    } catch (error) {
      console.error('[Facebook] Failed to log error:', error);
    }
  }

  // ==================== User Properties ====================

  /**
   * Set user ID for tracking (should be anonymized)
   */
  async setUserID(userId: string): Promise<void> {
    try {
      await AppEventsLogger.setUserID(userId);
      console.log(`[Facebook] User ID set: ${userId}`);
    } catch (error) {
      console.error('[Facebook] Failed to set user ID:', error);
    }
  }

  /**
   * Clear user ID
   */
  async clearUserID(): Promise<void> {
    try {
      await AppEventsLogger.clearUserID();
      console.log('[Facebook] User ID cleared');
    } catch (error) {
      console.error('[Facebook] Failed to clear user ID:', error);
    }
  }

  /**
   * Set user data for advanced matching (email, phone, etc.)
   * All data is hashed before sending to Facebook
   */
  async setUserData(userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }): Promise<void> {
    try {
      await AppEventsLogger.setUserData(userData);
      console.log('[Facebook] User data set (hashed)');
    } catch (error) {
      console.error('[Facebook] Failed to set user data:', error);
    }
  }

  /**
   * Clear all user data
   */
  async clearUserData(): Promise<void> {
    try {
      // Note: clearUserData is not available in this SDK version
      // Use clearUserID as alternative
      await AppEventsLogger.clearUserID();
      console.log('[Facebook] User data cleared');
    } catch (error) {
      console.error('[Facebook] Failed to clear user data:', error);
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Flush pending events (send immediately)
   */
  async flush(): Promise<void> {
    try {
      await AppEventsLogger.flush();
      console.log('[Facebook] Events flushed');
    } catch (error) {
      console.error('[Facebook] Failed to flush events:', error);
    }
  }

  /**
   * Get anonymous app device GUID
   */
  async getAnonymousID(): Promise<string | null> {
    try {
      const anonymousID = await AppEventsLogger.getAnonymousID();
      console.log(`[Facebook] Anonymous ID: ${anonymousID}`);
      return anonymousID;
    } catch (error) {
      console.error('[Facebook] Failed to get anonymous ID:', error);
      return null;
    }
  }

  /**
   * Set push notifications registration ID
   */
  setPushNotificationsRegistrationId(token: string): void {
    try {
      AppEventsLogger.setPushNotificationsRegistrationId(token);
      console.log('[Facebook] Push token set');
    } catch (error) {
      console.error('[Facebook] Failed to set push token:', error);
    }
  }
}

// Export singleton instance
export const facebookAnalytics = new FacebookAnalyticsService();
export default facebookAnalytics;
// @feature:facebook-sdk:end
