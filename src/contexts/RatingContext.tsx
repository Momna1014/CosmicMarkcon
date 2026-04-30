/**
 * useRating hook (Provider-less)
 *
 * State lives in a module-level store and is consumed via
 * `useSyncExternalStore`, so any component can call `useRating()` without
 * needing a RatingProvider in the tree.
 */

import { useSyncExternalStore } from 'react';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import { trackAppRating } from '../utils/facebookEvents';

const RATING_SHOWN_KEY = '@app_rating_shown';
const RATING_COMPLETED_KEY = '@app_rating_completed';
const RATING_LAST_SHOWN_KEY = '@app_rating_last_shown';
const RATING_LAST_RATED_KEY = '@app_rating_last_rated';
const RATING_SESSION_COUNT_KEY = '@app_rating_session_count';

const DEV_TESTING_MODE = __DEV__ && false;
const MIN_SESSIONS_BEFORE_PROMPT = 0;
const DAYS_BETWEEN_RATING_PROMPTS = 1;

interface RatingState {
  isRatingModalVisible: boolean;
  hasRatedApp: boolean;
  isLoading: boolean;
  sessionCount: number;
}

export interface UseRatingResult extends RatingState {
  showRatingModal: () => void;
  hideRatingModal: () => void;
  submitRating: (rating: number) => Promise<void>;
  checkShouldShowRating: () => Promise<boolean>;
  incrementSessionCount: () => Promise<void>;
  resetRatingState: () => Promise<void>;
}

let state: RatingState = {
  isRatingModalVisible: false,
  hasRatedApp: false,
  isLoading: true,
  sessionCount: 0,
};

const listeners = new Set<() => void>();
const getSnapshot = (): RatingState => state;
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const setState = (patch: Partial<RatingState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const openStorePageFallback = (): void => {
  const storeUrl = Platform.select({
    ios: 'https://apps.apple.com/app/id6759445866',
    android: 'market://details?id=com.cosmic.markcon',
    default: '',
  });
  if (storeUrl) {
    Linking.openURL(storeUrl).catch((error) => {
      console.error('[Rating] ❌ Failed to open store:', error);
      if (Platform.OS === 'android') {
        Linking.openURL('https://play.google.com/store/apps/details?id=com.cosmic.markcon');
      }
    });
  }
};

const triggerInAppReview = async (): Promise<void> => {
  try {
    const isAvailable = InAppReview.isAvailable();
    console.log('[Rating] 📱 In-app review available:', isAvailable);
    if (isAvailable) {
      const hasFlowFinished = await InAppReview.RequestInAppReview();
      console.log('[Rating] ✅ In-app review flow finished:', hasFlowFinished);
    } else {
      console.log('[Rating] ⚠️ In-app review not available, opening store directly');
      openStorePageFallback();
    }
  } catch (error) {
    console.error('[Rating] ❌ Failed to trigger in-app review:', error);
    openStorePageFallback();
  }
};

const incrementSessionCount = async (): Promise<void> => {
  try {
    const newCount = state.sessionCount + 1;
    setState({ sessionCount: newCount });
    await AsyncStorage.setItem(RATING_SESSION_COUNT_KEY, newCount.toString());
    console.log('[Rating] 📈 Session count incremented to:', newCount);
  } catch (error) {
    console.error('[Rating] ❌ Failed to increment session count:', error);
  }
};

const checkShouldShowRating = async (): Promise<boolean> => {
  try {
    if (state.sessionCount < MIN_SESSIONS_BEFORE_PROMPT) {
      console.log('[Rating] ⏭️ Not enough sessions:', state.sessionCount);
      return false;
    }

    if (state.hasRatedApp) {
      const lastRatedValue = await AsyncStorage.getItem(RATING_LAST_RATED_KEY);
      if (lastRatedValue !== null) {
        const lastRated = new Date(JSON.parse(lastRatedValue));
        const now = new Date();
        const lastRatedDate = new Date(
          lastRated.getFullYear(),
          lastRated.getMonth(),
          lastRated.getDate(),
        );
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceRated = Math.floor(
          (todayDate.getTime() - lastRatedDate.getTime()) / 86400000,
        );

        if (daysSinceRated < DAYS_BETWEEN_RATING_PROMPTS) {
          console.log('[Rating] ⏭️ User rated today. Days since:', daysSinceRated);
          return false;
        }
        console.log('[Rating] 📅 New day, showing rating modal again');
      }
    } else {
      console.log('[Rating] 🆕 User has not rated yet, will show modal');
    }

    return true;
  } catch (error) {
    console.error('[Rating] ❌ Failed to check rating conditions:', error);
    return false;
  }
};

const showRatingModal = (): void => {
  console.log('[Rating] 🎯 Showing rating modal');
  setState({ isRatingModalVisible: true });
  AsyncStorage.setItem(RATING_LAST_SHOWN_KEY, JSON.stringify(new Date().toISOString())).catch(
    (error) => console.error('[Rating] Failed to save last shown date:', error),
  );
};

const hideRatingModal = (): void => {
  console.log('[Rating] 🔒 Hiding rating modal');
  setState({ isRatingModalVisible: false });
};

const submitRating = async (rating: number): Promise<void> => {
  console.log('[Rating] ⭐ Rating submitted:', rating);

  try {
    await trackAppRating(rating, rating >= 4);
  } catch (error) {
    console.error('[Rating] ❌ Failed to track rating:', error);
  }

  setState({ isRatingModalVisible: false, hasRatedApp: true });
  await AsyncStorage.setItem(RATING_COMPLETED_KEY, JSON.stringify(true));
  await AsyncStorage.setItem(RATING_LAST_RATED_KEY, JSON.stringify(new Date().toISOString()));

  setTimeout(() => {
    triggerInAppReview();
  }, 600);
};

const resetRatingState = async (): Promise<void> => {
  try {
    console.log('[Rating] 🔄 Resetting rating state...');
    await AsyncStorage.multiRemove([
      RATING_SHOWN_KEY,
      RATING_COMPLETED_KEY,
      RATING_LAST_SHOWN_KEY,
      RATING_LAST_RATED_KEY,
      RATING_SESSION_COUNT_KEY,
    ]);
    setState({ hasRatedApp: false, sessionCount: 0 });
    console.log('[Rating] ✅ Rating state reset');
  } catch (error) {
    console.error('[Rating] ❌ Failed to reset rating state:', error);
  }
};

let initStarted = false;
const bootstrap = async (): Promise<void> => {
  if (initStarted) return;
  initStarted = true;

  try {
    console.log('[Rating] 🚀 Initializing rating state...');

    if (DEV_TESTING_MODE) {
      console.log('[Rating] 🧪 DEV TESTING MODE - Resetting rating state');
      await AsyncStorage.multiRemove([
        RATING_SHOWN_KEY,
        RATING_COMPLETED_KEY,
        RATING_LAST_SHOWN_KEY,
        RATING_LAST_RATED_KEY,
        RATING_SESSION_COUNT_KEY,
      ]);
      setState({ hasRatedApp: false, sessionCount: 0, isLoading: false });
      return;
    }

    const completedValue = await AsyncStorage.getItem(RATING_COMPLETED_KEY);
    if (completedValue !== null) {
      const completed = JSON.parse(completedValue);
      setState({ hasRatedApp: completed });
      console.log('[Rating] 📋 Rating completed:', completed);
    }

    const sessionValue = await AsyncStorage.getItem(RATING_SESSION_COUNT_KEY);
    if (sessionValue !== null) {
      const count = parseInt(sessionValue, 10);
      setState({ sessionCount: count });
      console.log('[Rating] 📋 Session count:', count);
    }

    console.log('[Rating] ✅ Rating state initialized');
  } catch (error) {
    console.error('[Rating] ❌ Failed to initialize rating state:', error);
  } finally {
    setState({ isLoading: false });
  }
};
bootstrap();

/**
 * Hook to access rating state and actions.
 * Does NOT require a Provider — backed by a module-level store.
 */
export const useRating = (): UseRatingResult => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    showRatingModal,
    hideRatingModal,
    submitRating,
    checkShouldShowRating,
    incrementSessionCount,
    resetRatingState,
  };
};
