/**
 * RatingContext
 * 
 * Global state management for app rating:
 * - Tracks if rating modal has been shown
 * - Manages user rating selection
 * - Handles in-app review flow for high ratings (4-5 stars)
 * - Persists rating state to AsyncStorage
 * 
 * RATING LOGIC:
 * - 1-3 stars: Close modal silently (don't submit low ratings)
 * - 4-5 stars: Trigger native in-app review dialog
 * 
 * @module RatingContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import { trackAppRating } from '../utils/facebookEvents';

// AsyncStorage keys
const RATING_SHOWN_KEY = '@app_rating_shown';
const RATING_COMPLETED_KEY = '@app_rating_completed';
const RATING_LAST_SHOWN_KEY = '@app_rating_last_shown';
const RATING_LAST_RATED_KEY = '@app_rating_last_rated'; // Track when user last rated
const RATING_SESSION_COUNT_KEY = '@app_rating_session_count';

// ============================================
// DEV TESTING MODE - Set to true for repeated testing on iOS
// This will reset rating state on every app launch
// ============================================
const DEV_TESTING_MODE = __DEV__ && false; // Set to false to test real behavior

// Minimum sessions before showing rating prompt (adjustable)
const MIN_SESSIONS_BEFORE_PROMPT = 0;
// Days to wait before showing rating again AFTER user has rated
const DAYS_BETWEEN_RATING_PROMPTS = 1; // Show once per day after user rates

// Context type
interface RatingContextType {
  // State
  isRatingModalVisible: boolean;
  hasRatedApp: boolean;
  isLoading: boolean;
  sessionCount: number;
  
  // Actions
  showRatingModal: () => void;
  hideRatingModal: () => void;
  submitRating: (rating: number) => Promise<void>;
  checkShouldShowRating: () => Promise<boolean>;
  incrementSessionCount: () => Promise<void>;
  
  // For manual trigger (e.g., from settings)
  resetRatingState: () => Promise<void>;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

interface RatingProviderProps {
  children: ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  // State
  const [isRatingModalVisible, setIsRatingModalVisible] = useState<boolean>(false);
  const [hasRatedApp, setHasRatedApp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionCount, setSessionCount] = useState<number>(0);

  /**
   * Initialize rating state from AsyncStorage
   */
  useEffect(() => {
    initializeRatingState();
  }, []);

  const initializeRatingState = async (): Promise<void> => {
    try {
      console.log('[RatingContext] 🚀 Initializing rating state...');

      // DEV TESTING: Reset all rating state on every app launch for repeated testing
      if (DEV_TESTING_MODE) {
        console.log('[RatingContext] 🧪 DEV TESTING MODE - Resetting rating state for testing...');
        await AsyncStorage.multiRemove([
          RATING_SHOWN_KEY,
          RATING_COMPLETED_KEY,
          RATING_LAST_SHOWN_KEY,
          RATING_LAST_RATED_KEY,
          RATING_SESSION_COUNT_KEY,
        ]);
        setHasRatedApp(false);
        setSessionCount(0);
        console.log('[RatingContext] 🧪 Rating state reset for testing!');
        setIsLoading(false);
        return;
      }

      // Load completed state
      const completedValue = await AsyncStorage.getItem(RATING_COMPLETED_KEY);
      if (completedValue !== null) {
        const completed = JSON.parse(completedValue);
        setHasRatedApp(completed);
        console.log('[RatingContext] 📋 Rating completed:', completed);
      }

      // Load session count
      const sessionValue = await AsyncStorage.getItem(RATING_SESSION_COUNT_KEY);
      if (sessionValue !== null) {
        const count = parseInt(sessionValue, 10);
        setSessionCount(count);
        console.log('[RatingContext] 📋 Session count:', count);
      }

      console.log('[RatingContext] ✅ Rating state initialized');
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to initialize rating state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Increment session count (call on app launch)
   */
  const incrementSessionCount = useCallback(async (): Promise<void> => {
    try {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      await AsyncStorage.setItem(RATING_SESSION_COUNT_KEY, newCount.toString());
      console.log('[RatingContext] 📈 Session count incremented to:', newCount);
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to increment session count:', error);
    }
  }, [sessionCount]);

  /**
   * Check if we should show the rating modal
   * 
   * LOGIC:
   * - If user has NOT rated yet: Show every app open (until they rate)
   * - If user HAS rated: Show once per day (daily prompt after rating)
   */
  const checkShouldShowRating = useCallback(async (): Promise<boolean> => {
    try {
      // Check session count
      if (sessionCount < MIN_SESSIONS_BEFORE_PROMPT) {
        console.log('[RatingContext] ⏭️ Not enough sessions:', sessionCount, '/', MIN_SESSIONS_BEFORE_PROMPT);
        return false;
      }

      // Check if in-app review is available (important for testing)
      const isAvailable = InAppReview.isAvailable();
      console.log('[RatingContext] 📱 In-app review available:', isAvailable);

      // If user has already rated, check if 1 day has passed
      if (hasRatedApp) {
        const lastRatedValue = await AsyncStorage.getItem(RATING_LAST_RATED_KEY);
        if (lastRatedValue !== null) {
          const lastRated = new Date(JSON.parse(lastRatedValue));
          const now = new Date();
          
          // Check if it's a new day (compare dates, not exact time)
          const lastRatedDate = new Date(lastRated.getFullYear(), lastRated.getMonth(), lastRated.getDate());
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const daysSinceRated = Math.floor(
            (todayDate.getTime() - lastRatedDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceRated < DAYS_BETWEEN_RATING_PROMPTS) {
            console.log('[RatingContext] ⏭️ User rated today, showing tomorrow. Days since rated:', daysSinceRated);
            return false;
          }
          console.log('[RatingContext] 📅 New day, showing rating modal again. Days since rated:', daysSinceRated);
        }
      } else {
        // User hasn't rated yet - always show the modal
        console.log('[RatingContext] 🆕 User has not rated yet, will show modal');
      }

      console.log('[RatingContext] ✅ Should show rating modal');
      return true;
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to check rating conditions:', error);
      return false;
    }
  }, [hasRatedApp, sessionCount]);

  /**
   * Show the rating modal
   */
  const showRatingModal = useCallback((): void => {
    console.log('[RatingContext] 🎯 Showing rating modal');
    setIsRatingModalVisible(true);

    // Update last shown date
    AsyncStorage.setItem(RATING_LAST_SHOWN_KEY, JSON.stringify(new Date().toISOString())).catch(
      error => console.error('[RatingContext] Failed to save last shown date:', error)
    );
  }, []);

  /**
   * Hide the rating modal
   */
  const hideRatingModal = useCallback((): void => {
    console.log('[RatingContext] 🔒 Hiding rating modal');
    setIsRatingModalVisible(false);
  }, []);

  /**
   * Submit rating
   * 
   * LOGIC:
   * - 1-3 stars: Close modal, don't submit (we want to keep low ratings internal)
   * - 4-5 stars: Trigger native in-app review
   */
  const submitRating = useCallback(async (rating: number): Promise<void> => {
    console.log('[RatingContext] ⭐ Rating submitted:', rating);

    // Track the rating event
    try {
      await trackAppRating(rating, rating >= 4);
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to track rating:', error);
    }

    // Hide our custom modal first
    setIsRatingModalVisible(false);

    if (rating <= 3) {
      // LOW RATING: Just close silently
      // User will not be redirected to store - we don't want low ratings there
      console.log('[RatingContext] 📉 Low rating - closing silently');
      
      // Mark as rated and save the date (so we show again tomorrow, not every time)
      setHasRatedApp(true);
      await AsyncStorage.setItem(RATING_COMPLETED_KEY, JSON.stringify(true));
      await AsyncStorage.setItem(RATING_LAST_RATED_KEY, JSON.stringify(new Date().toISOString()));
      
      console.log('[RatingContext] 💬 Low rating saved, will show again tomorrow');
      
    } else {
      // HIGH RATING (4-5 stars): Trigger native in-app review
      console.log('[RatingContext] 📈 High rating - triggering in-app review');
      
      // Mark as completed and save the rating date
      setHasRatedApp(true);
      await AsyncStorage.setItem(RATING_COMPLETED_KEY, JSON.stringify(true));
      await AsyncStorage.setItem(RATING_LAST_RATED_KEY, JSON.stringify(new Date().toISOString()));
      
      // Small delay to let our modal close animation complete
      setTimeout(() => {
        triggerInAppReview();
      }, 600);
    }
    // triggerInAppReview is defined below but doesn't depend on any state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Trigger the native in-app review dialog
   * Separated for better error handling and logging
   */
  const triggerInAppReview = async (): Promise<void> => {
    try {
      // Check if in-app review is available
      const isAvailable = InAppReview.isAvailable();
      console.log('[RatingContext] 📱 In-app review available:', isAvailable);
      console.log('[RatingContext] 📱 Platform:', Platform.OS);

      if (isAvailable) {
        console.log('[RatingContext] 🚀 Requesting in-app review...');
        
        // Request the in-app review
        // NOTE: On iOS, this uses SKStoreReviewController.requestReview()
        // NOTE: On Android, this uses Play In-App Review API
        const hasFlowFinished = await InAppReview.RequestInAppReview();
        
        console.log('[RatingContext] ✅ In-app review flow finished:', hasFlowFinished);
        
        // NOTE: On Android, hasFlowFinished will be true when the review dialog is dismissed
        // On iOS, we can't know if the user actually submitted a review
        
      } else {
        // Fallback: Open store page directly
        console.log('[RatingContext] ⚠️ In-app review not available, opening store directly');
        console.log('[RatingContext] ⚠️ This can happen on Android debug builds or iOS simulator');
        openStorePageFallback();
      }
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to trigger in-app review:', error);
      // Fallback: Open store page directly
      openStorePageFallback();
    }
  };

  /**
   * Open app store page directly (fallback)
   * Defined as a regular function to avoid circular dependency
   */
  const openStorePageFallback = (): void => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id6759445866', // Replace with your App Store ID
      android: 'market://details?id=com.mangaverse', // Replace with your package name
      default: '',
    });

    if (storeUrl) {
      Linking.openURL(storeUrl).catch(error => {
        console.error('[RatingContext] ❌ Failed to open store:', error);
        // Fallback to web URL for Android
        if (Platform.OS === 'android') {
          Linking.openURL('https://play.google.com/store/apps/details?id=com.mangaverse');
        }
      });
    }
  };

  /**
   * Reset rating state (for testing or settings)
   */
  const resetRatingState = useCallback(async (): Promise<void> => {
    try {
      console.log('[RatingContext] 🔄 Resetting rating state...');
      await AsyncStorage.multiRemove([
        RATING_SHOWN_KEY,
        RATING_COMPLETED_KEY,
        RATING_LAST_SHOWN_KEY,
        RATING_LAST_RATED_KEY,
        RATING_SESSION_COUNT_KEY,
      ]);
      setHasRatedApp(false);
      setSessionCount(0);
      console.log('[RatingContext] ✅ Rating state reset');
    } catch (error) {
      console.error('[RatingContext] ❌ Failed to reset rating state:', error);
    }
  }, []);

  const contextValue: RatingContextType = {
    isRatingModalVisible,
    hasRatedApp,
    isLoading,
    sessionCount,
    showRatingModal,
    hideRatingModal,
    submitRating,
    checkShouldShowRating,
    incrementSessionCount,
    resetRatingState,
  };

  return (
    <RatingContext.Provider value={contextValue}>
      {children}
    </RatingContext.Provider>
  );
};

/**
 * Hook to access rating context
 */
export const useRating = (): RatingContextType => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

export default RatingContext;
