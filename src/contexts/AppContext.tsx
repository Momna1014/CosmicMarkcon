/**
 * AppContext
 * 
 * Global state management for:
 * - Onboarding completion status
 * - Initial paywall completion status (tracks if user completed first paywall flow)
 * - Subscription/Premium status (synced with RevenueCat)
 * - Other app-wide state
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {revenueCatService, CustomerInfo} from '../services/RevenueCatService';

const ONBOARDING_KEY = '@app_onboarding_completed';
const SUBSCRIPTION_KEY = '@app_subscription_status';
const INITIAL_PAYWALL_KEY = '@app_initial_paywall_completed';

interface AppContextType {
  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  
  // Initial Paywall tracking
  initialPaywallCompleted: boolean;
  setInitialPaywallCompleted: (completed: boolean) => Promise<void>;
  
  // Subscription
  isPremium: boolean;
  setIsPremium: (premium: boolean) => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  
  // Helper to check if should show paywall on launch
  shouldShowInitialPaywall: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  const [initialPaywallCompleted, setInitialPaywallCompletedState] = useState(false);
  const [isPremium, setIsPremiumState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted state and initialize RevenueCat on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Listen for RevenueCat customer info updates
  useEffect(() => {
    if (!isInitialized) return;

    const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
      const premiumStatus = revenueCatService.isPremium(customerInfo);
      console.log('[AppContext] 💰 Customer info updated, isPremium:', premiumStatus);
      setIsPremiumState(premiumStatus);
      
      // If user becomes premium, mark initial paywall as completed
      if (premiumStatus) {
        console.log('[AppContext] ✅ User is premium - marking initial paywall as completed');
        setInitialPaywallCompletedState(true);
        AsyncStorage.setItem(INITIAL_PAYWALL_KEY, JSON.stringify(true)).catch(err =>
          console.error('[AppContext] Failed to save initial paywall status:', err)
        );
      }
      
      // Also persist to AsyncStorage for offline access
      AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(premiumStatus)).catch(err =>
        console.error('[AppContext] Failed to save premium status:', err)
      );
    };

    revenueCatService.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

    // Cleanup not needed as RevenueCat manages this
    return () => {};
  }, [isInitialized]);

  const initializeApp = async () => {
    try {
      console.log('[AppContext] 🚀 Initializing app state...');
      
      // Load persisted onboarding status immediately
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingValue !== null) {
        const parsed = JSON.parse(onboardingValue);
        setOnboardingCompletedState(parsed);
        console.log('[AppContext] 📋 Loaded onboardingCompleted:', parsed);
      }

      // Load cached initial paywall status
      const initialPaywallValue = await AsyncStorage.getItem(INITIAL_PAYWALL_KEY);
      if (initialPaywallValue !== null) {
        const parsed = JSON.parse(initialPaywallValue);
        setInitialPaywallCompletedState(parsed);
        console.log('[AppContext] 📋 Loaded initialPaywallCompleted:', parsed);
      }

      // Load cached subscription status for immediate display
      const cachedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (cachedSubscription !== null) {
        const parsed = JSON.parse(cachedSubscription);
        setIsPremiumState(parsed);
        console.log('[AppContext] 📋 Loaded isPremium (cached):', parsed);
      }

      // Mark loading as complete - this allows the app to show immediately
      setIsLoading(false);
      console.log('[AppContext] ✅ App state loaded, isLoading: false');

      // Initialize RevenueCat in the background after splash is hidden
      // This prevents blocking the initial render
      setTimeout(async () => {
        try {
          console.log('[AppContext] 🔄 Initializing RevenueCat in background...');
          await revenueCatService.initialize();
          setIsInitialized(true);
          console.log('[AppContext] ✅ RevenueCat initialized');

          // Refresh subscription status from RevenueCat
          await refreshSubscriptionStatus();
        } catch (error) {
          console.error('[AppContext] ❌ Failed to initialize RevenueCat:', error);
          // Continue with cached data if RevenueCat fails
        }
      }, 100); // Small delay to let splash screen hide first

    } catch (error) {
      console.error('[AppContext] ❌ Failed to initialize app:', error);
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      const premiumStatus = revenueCatService.isPremium(customerInfo);
      
      console.log('[AppContext] Subscription status:', {
        isPremium: premiumStatus,
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: Object.keys(customerInfo.entitlements.active),
      });

      setIsPremiumState(premiumStatus);
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(premiumStatus));
    } catch (error) {
      console.error('[AppContext] Failed to refresh subscription status:', error);
    }
  };

  const setOnboardingCompleted = async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
      setOnboardingCompletedState(completed);
      console.log('[AppContext] 📋 Onboarding completed status saved:', completed);
    } catch (error) {
      console.error('[AppContext] ❌ Failed to save onboarding status:', error);
    }
  };

  const setInitialPaywallCompleted = async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(INITIAL_PAYWALL_KEY, JSON.stringify(completed));
      setInitialPaywallCompletedState(completed);
      console.log('[AppContext] 📋 Initial paywall completed status saved:', completed);
    } catch (error) {
      console.error('[AppContext] ❌ Failed to save initial paywall status:', error);
    }
  };

  const setIsPremium = async (premium: boolean) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(premium));
      setIsPremiumState(premium);
      console.log('[AppContext] 💰 Premium status manually set:', premium);
    } catch (error) {
      console.error('[AppContext] ❌ Failed to save premium status:', error);
    }
  };

  // Helper to determine if we should show the initial paywall on app launch
  // Show paywall if: onboarding is complete AND user is NOT premium
  // Note: We show paywall again even for cancelled subscribers to encourage re-subscription
  const shouldShowInitialPaywall = onboardingCompleted && !isPremium;

  // Debug log for paywall decision
  console.log('[AppContext] 🎯 Paywall decision:', {
    onboardingCompleted,
    initialPaywallCompleted,
    isPremium,
    shouldShowInitialPaywall,
  });

  const value: AppContextType = {
    onboardingCompleted,
    setOnboardingCompleted,
    initialPaywallCompleted,
    setInitialPaywallCompleted,
    isPremium,
    setIsPremium,
    refreshSubscriptionStatus,
    isLoading,
    shouldShowInitialPaywall,
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
export const resetAppState = async () => {
  try {
    await AsyncStorage.multiRemove([ONBOARDING_KEY, SUBSCRIPTION_KEY, INITIAL_PAYWALL_KEY]);
    console.log('[AppContext] 🗑️ App state reset successfully');
  } catch (error) {
    console.error('[AppContext] ❌ Failed to reset app state:', error);
  }
};

export default AppContext;
