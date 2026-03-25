import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer, {RootState} from './rootReducer';

/**
 * Redux Persist Configuration
 * 
 * Persists specific slices to AsyncStorage
 * Only persists auth slice (tokens) by default
 * Customize whitelist/blacklist as needed
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'onboarding', 'partners'], // Persist auth, onboarding, and partners slices
  // blacklist: ['ui', 'temp'], // Don't persist these slices
  timeout: 10000, // 10 seconds timeout for rehydration
};

/**
 * Persisted Reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux Store
 * 
 * Features:
 * - Redux Toolkit's configureStore (includes thunk middleware)
 * - Redux Persist for state persistence
 * - DevTools enabled in development
 * - Type-safe dispatch and state
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Disable immutability checks in production for performance
      immutableCheck: __DEV__,
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

/**
 * Redux Persistor
 */
export const persistor = persistStore(store);

/**
 * Type-safe dispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Export RootState for use in selectors
 */
export type {RootState};

/**
 * Optional: Clear persisted state (useful for debugging)
 */
export const clearPersistedState = async () => {
  try {
    await persistor.purge();
    await AsyncStorage.clear();
    console.log('✅ Persisted state cleared');
  } catch (error) {
    console.error('❌ Failed to clear persisted state:', error);
  }
};

/**
 * Optional: Get persisted state size (useful for debugging)
 */
export const getPersistedStateSize = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    const totalSize = result.reduce((acc, [, value]) => {
      return acc + (value?.length || 0);
    }, 0);
    console.log(`📦 Persisted state size: ${(totalSize / 1024).toFixed(2)} KB`);
    return totalSize;
  } catch (error) {
    console.error('❌ Failed to get persisted state size:', error);
    return 0;
  }
};
