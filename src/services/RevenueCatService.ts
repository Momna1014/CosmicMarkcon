/**
 * RevenueCat Service
 * 
 * Manages in-app purchases and subscriptions using RevenueCat
 * - Initialize SDK with API keys
 * - Fetch available offerings
 * - Handle purchases
 * - Restore purchases
 * - Check subscription status
 */

import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { Platform } from 'react-native';
import env from '../config/env';
import { 
  setRevenueCatAttribution,
  setRevenueCatUserAttributes,
  setRevenueCatDeviceInfo
} from './RevenueCatAttribution';

class RevenueCatService {
  private isInitialized = false;
  private currentOfferings: PurchasesOfferings | null = null;

  /**
   * Initialize RevenueCat SDK
   * Call this once when app starts
   */
  async initialize(userId?: string): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[RevenueCat] Already initialized');
        return;
      }

      // Configure SDK
      Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Use INFO or WARN in production

      // Get platform-specific API key from environment
      const apiKey = Platform.select({
        ios: env.REVENUECAT_IOS_KEY,
        android: env.REVENUECAT_ANDROID_KEY,
      });

      if (!apiKey) {
        throw new Error('No RevenueCat API key found for this platform. Please add REVENUECAT_IOS_KEY and REVENUECAT_ANDROID_KEY to your .env file');
      }

      // Configure and initialize
      await Purchases.configure({
        apiKey,
        appUserID: userId, // Optional: pass user ID for cross-platform purchases
      });

      this.isInitialized = true;
      console.log('[RevenueCat] Initialized successfully');

      // Fetch initial customer info
      const customerInfo = await this.getCustomerInfo();
      console.log('[RevenueCat] Customer Info:', {
        isPremium: this.isPremium(customerInfo),
        activeSubscriptions: customerInfo.activeSubscriptions,
      });

      // Set attribution data (IDFA, AppsFlyer, Facebook)
      // This should be called after ATT permission is granted
      await this.setupAttribution();

    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup attribution tracking for RevenueCat
   * Should be called after ATT permission is granted
   * Can also be called manually to refresh attribution data
   */
  async setupAttribution(): Promise<void> {
    try {
      console.log('[RevenueCat] Setting up attribution...');
      
      // Set all attribution identifiers (IDFA, AppsFlyer, Facebook)
      await setRevenueCatAttribution();
      
      // Set device information
      await setRevenueCatDeviceInfo();
      
      console.log('[RevenueCat] Attribution setup completed');
    } catch (error) {
      console.error('[RevenueCat] Attribution setup failed:', error);
      // Don't throw - attribution is optional
    }
  }

  /**
   * Set user attributes for better segmentation
   * Call this when user information becomes available
   */
  async setUserAttributes(attributes: {
    userId?: string;
    email?: string;
    displayName?: string;
    [key: string]: any;
  }): Promise<void> {
    try {
      await setRevenueCatUserAttributes(attributes);
    } catch (error) {
      console.error('[RevenueCat] Failed to set user attributes:', error);
      // Don't throw - attributes are optional
    }
  }

  /**
   * Get current customer info (subscription status)
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Check if user has active premium subscription
   */
  isPremium(customerInfo: CustomerInfo): boolean {
    // Check for your specific entitlement ID from RevenueCat Dashboard
    // Your entitlement is named 'Premium_Access'
    const entitlementId = 'Premium_Access';
    const hasSpecificEntitlement = 
      customerInfo.entitlements.active[entitlementId] !== undefined;

    // Fallback: Check if user has ANY active entitlement
    const hasAnyEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

    // Fallback: Check if user has any active subscription
    const hasActiveSubscription = customerInfo.activeSubscriptions.length > 0;

    // Log for debugging
    console.log('[RevenueCat] 🔍 isPremium check:', {
      entitlementId,
      hasSpecificEntitlement,
      hasAnyEntitlement,
      hasActiveSubscription,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
      activeSubscriptions: customerInfo.activeSubscriptions,
    });

    // Return true if user has the specific entitlement OR any active subscription
    const isPremium = hasSpecificEntitlement || hasAnyEntitlement || hasActiveSubscription;
    console.log('[RevenueCat] 💰 isPremium result:', isPremium);
    
    return isPremium;
  }

  /**
   * Fetch available offerings (subscription plans)
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings;

      if (offerings.current !== null) {
        console.log('[RevenueCat] Available offerings:', {
          identifier: offerings.current.identifier,
          packages: offerings.current.availablePackages.map(pkg => ({
            identifier: pkg.identifier,
            product: {
              identifier: pkg.product.identifier,
              price: pkg.product.priceString,
            },
          })),
        });
      } else {
        console.warn('[RevenueCat] No current offering available');
      }

      return offerings;
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      throw error;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{
    customerInfo: CustomerInfo;
    productIdentifier: string;
  }> {
    try {
      console.log('[RevenueCat] Purchasing package:', pkg.identifier);

      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);

      console.log('[RevenueCat] Purchase successful:', {
        productIdentifier,
        isPremium: this.isPremium(customerInfo),
        activeSubscriptions: customerInfo.activeSubscriptions,
      });

      // Refresh attribution data after purchase
      // This ensures IDFA and other identifiers are captured with the purchase
      await this.setupAttribution();

      return { customerInfo, productIdentifier };
    } catch (error: any) {
      // Handle purchase errors
      if (error.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
      } else {
        console.error('[RevenueCat] Purchase failed:', error);
      }
      throw error;
    }
  }

  /**
   * Purchase a specific product by StoreProduct object
   */
  async purchaseProduct(product: PurchasesStoreProduct): Promise<{
    customerInfo: CustomerInfo;
    productIdentifier: string;
  }> {
    try {
      console.log('[RevenueCat] Purchasing product:', product.identifier);

      const { customerInfo, productIdentifier } = 
        await Purchases.purchaseStoreProduct(product);

      console.log('[RevenueCat] Purchase successful:', {
        productIdentifier,
        isPremium: this.isPremium(customerInfo),
      });

      // Refresh attribution data after purchase
      // This ensures IDFA and other identifiers are captured with the purchase
      await this.setupAttribution();

      return { customerInfo, productIdentifier };
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
      } else {
        console.error('[RevenueCat] Purchase failed:', error);
      }
      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      console.log('[RevenueCat] Restoring purchases...');

      const customerInfo = await Purchases.restorePurchases();

      console.log('[RevenueCat] Purchases restored:', {
        isPremium: this.isPremium(customerInfo),
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
      });

      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Set user ID (for cross-platform purchases)
   */
  async login(userId: string): Promise<void> {
    try {
      console.log('[RevenueCat] Logging in user:', userId);
      await Purchases.logIn(userId);
      console.log('[RevenueCat] User logged in successfully');
    } catch (error) {
      console.error('[RevenueCat] Failed to login:', error);
      throw error;
    }
  }

  /**
   * Clear user ID
   */
  async logout(): Promise<void> {
    try {
      console.log('[RevenueCat] Logging out user...');
      await Purchases.logOut();
      console.log('[RevenueCat] User logged out successfully');
    } catch (error) {
      console.error('[RevenueCat] Failed to logout:', error);
      throw error;
    }
  }

  /**
   * Get cached offerings (if available)
   */
  getCachedOfferings(): PurchasesOfferings | null {
    return this.currentOfferings;
  }

  /**
   * Check if SDK is initialized
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * Add listener for customer info updates
   */
  addCustomerInfoUpdateListener(
    listener: (customerInfo: CustomerInfo) => void
  ): void {
    Purchases.addCustomerInfoUpdateListener(listener);
  }

  /**
   * Present RevenueCat's native paywall UI
   * This uses RevenueCat's pre-built paywall component
   * 
   * @param offeringIdentifier - Optional specific offering identifier to display
   * @returns Promise that resolves with paywall result
   */
  async presentPaywall(offeringIdentifier?: string): Promise<any> {
    try {
      console.log('[RevenueCat] Presenting native paywall UI');
      
      const options: any = {};
      if (offeringIdentifier) {
        options.offering = offeringIdentifier;
      }
      
      const result = await RevenueCatUI.presentPaywall(options);

      console.log('[RevenueCat] Paywall result:', result);
      
      // Refresh customer info after paywall is dismissed
      const customerInfo = await this.getCustomerInfo();
      
      // Always refresh attribution data after paywall (in case purchase was made)
      // This is a lightweight operation that ensures we capture IDFA with purchases
      await this.setupAttribution();
      
      return {
        result,
        customerInfo,
        isPremium: this.isPremium(customerInfo),
      };
    } catch (error) {
      console.error('[RevenueCat] Failed to present paywall:', error);
      throw error;
    }
  }

  /**
   * Present RevenueCat's Customer Center
   * Allows users to manage their subscription, restore purchases, etc.
   * 
   * @returns Promise that resolves when customer center is closed
   */
  async presentCustomerCenter(): Promise<void> {
    try {
      console.log('[RevenueCat] Presenting Customer Center');
      await RevenueCatUI.presentCustomerCenter();
      console.log('[RevenueCat] Customer Center closed');
    } catch (error) {
      console.error('[RevenueCat] Failed to present Customer Center:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();

// Export types for use in components
export type {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  PurchasesStoreProduct,
};
