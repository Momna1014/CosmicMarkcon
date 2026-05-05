/**
 * AppContext
 * 
 * Global state management for:
 * - Onboarding completion status
 * - Subscription/Premium status (synced with RevenueCat)
 * - Other app-wide state
 * 
 * Uses MMKV SyncStorage for instant loading - no async delays!
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import { SyncStorage, TypedStorage } from '../redux/storage';
import {revenueCatService, CustomerInfo} from '../services/RevenueCatService';
// @feature:admob:start [disabled]
// import { adMobService } from '../services/AdMob/AdMobService';
// @feature:admob:end
import firebaseService from '../services/firebase/FirebaseService';
import { trackTrialEnded } from '../utils/paywallAnalytics';

const ONBOARDING_KEY = '@app_onboarding_completed';
const SUBSCRIPTION_KEY = '@app_subscription_status';
const TRIAL_STATUS_KEY = '@app_trial_status';
const TRIAL_DAYS_KEY = '@app_trial_days';

interface AppContextType {
  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  
  // Subscription
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  refreshSubscriptionStatus: () => Promise<boolean>;
  
  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  // Initialize state SYNCHRONOUSLY from MMKV for instant UI
  const [onboardingCompleted, setOnboardingCompletedState] = useState(() => {
    return TypedStorage.getBoolean(ONBOARDING_KEY) ?? false;
  });
  const [isPremium, setIsPremiumState] = useState(() => {
    const cachedValue = TypedStorage.getBoolean(SUBSCRIPTION_KEY) ?? false;
    console.log('[AppContext] Initial isPremium from cache:', cachedValue);
    return cachedValue;
  });
  const [isLoading, setIsLoading] = useState(false); // No loading needed - sync storage!
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let elapsedMs = 0;
    const pollIntervalMs = 250;
    const pollTimeoutMs = 30000;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const onRevenueCatReady = () => {
      if (isCancelled) {
        return;
      }

      setIsInitialized(true);
      refreshSubscriptionStatus().catch(error => {
        console.error('[AppContext] Failed to refresh subscription status:', error);
      });
    };

    if (revenueCatService.getInitializationStatus()) {
      onRevenueCatReady();
    } else {
      pollTimer = setInterval(() => {
        elapsedMs += pollIntervalMs;

        if (revenueCatService.getInitializationStatus()) {
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          onRevenueCatReady();
          return;
        }

        if (elapsedMs >= pollTimeoutMs) {
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
          console.warn('[AppContext] RevenueCat initialization not ready within polling window');
        }
      }, pollIntervalMs);
    }

    return () => {
      isCancelled = true;
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, []);

  // Sync isPremium to AdMob service and Firebase user property whenever it changes
  useEffect(() => {
    // @feature:admob:start [disabled]
    // adMobService.setIsPremium(isPremium);
    // @feature:admob:end
    if (firebaseService.isAnalyticsEnabled()) {
      firebaseService.setUserProperty(
        'subscription_status',
        isPremium ? 'premium' : 'free',
      );
    }
  }, [isPremium]);

  // Listen for RevenueCat customer info updates
  useEffect(() => {
    if (!isInitialized) return;

    const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
      const premiumStatus = revenueCatService.isPremium(customerInfo);
      console.log('[AppContext] 📢 Customer info update received, isPremium:', premiumStatus);

      // Detect trial_ended: was on trial, now either converted or expired
      const wasTrial = TypedStorage.getBoolean(TRIAL_STATUS_KEY) ?? false;
      const entitlements = customerInfo.entitlements?.active || {};
      const premiumEntitlement = entitlements.premium || entitlements.Premium || Object.values(entitlements)[0];
      const isCurrentlyTrial = premiumEntitlement?.periodType === 'TRIAL';

      if (wasTrial && !isCurrentlyTrial) {
        const activeSubscription = customerInfo.activeSubscriptions?.[0] || 'unknown';
        const reason = premiumStatus ? 'converted' : 'expired';
        const trialDays = TypedStorage.getNumber(TRIAL_DAYS_KEY) ?? 0;
        trackTrialEnded({ productId: activeSubscription, reason, trialDays });
        console.log(`[AppContext] 📊 Trial ended: ${reason}`);
      }

      // Persist current trial status
      TypedStorage.setBoolean(TRIAL_STATUS_KEY, isCurrentlyTrial);

      setIsPremiumState(premiumStatus);
      // Persist to MMKV storage (sync - instant!)
      TypedStorage.setBoolean(SUBSCRIPTION_KEY, premiumStatus);
      console.log('[AppContext] ✅ Premium status persisted to storage:', premiumStatus);
    };

    console.log('[AppContext] Adding RevenueCat customer info listener');
    revenueCatService.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

    // Note: RevenueCat SDK doesn't provide a removeListener method
    // The listener is managed internally by the SDK
    return () => {
      console.log('[AppContext] Customer info listener cleanup (SDK manages lifecycle)');
    };
  }, [isInitialized]);

  const refreshSubscriptionStatus = async (): Promise<boolean> => {
    try {
      if (!revenueCatService.getInitializationStatus()) {
        console.log('[AppContext] RevenueCat not initialized, using cached status');
        return isPremium;
      }

      console.log('[AppContext] Refreshing subscription status from RevenueCat...');
      const customerInfo = await revenueCatService.getCustomerInfo();
      const premiumStatus = revenueCatService.isPremium(customerInfo);
      
      console.log('[AppContext] Subscription status refreshed:', {
        isPremium: premiumStatus,
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: Object.keys(customerInfo.entitlements.active),
      });

      setIsPremiumState(premiumStatus);
      
      // Persist to MMKV storage (sync - instant!)
      TypedStorage.setBoolean(SUBSCRIPTION_KEY, premiumStatus);
      
      return premiumStatus;
    } catch (error) {
      console.error('[AppContext] Failed to refresh subscription status:', error);
      // Return current cached value on error
      return isPremium;
    }
  };

  const setOnboardingCompleted = (completed: boolean) => {
    try {
      TypedStorage.setBoolean(ONBOARDING_KEY, completed);
      setOnboardingCompletedState(completed);
      console.log('Onboarding completed status saved:', completed);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const setIsPremium = (premium: boolean) => {
    try {
      TypedStorage.setBoolean(SUBSCRIPTION_KEY, premium);
      setIsPremiumState(premium);
      console.log('[AppContext] Premium status manually set:', premium);
    } catch (error) {
      console.error('[AppContext] Failed to save premium status:', error);
    }
  };

  const value: AppContextType = {
    onboardingCompleted,
    setOnboardingCompleted,
    isPremium,
    setIsPremium,
    refreshSubscriptionStatus,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to access app context
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/**
 * Reset all persisted state (useful for testing/debugging)
 */
export const resetAppState = () => {
  try {
    SyncStorage.removeItem(ONBOARDING_KEY);
    SyncStorage.removeItem(SUBSCRIPTION_KEY);
    console.log('App state reset successfully');
  } catch (error) {
    console.error('Failed to reset app state:', error);
  }
};

export default AppContext;
