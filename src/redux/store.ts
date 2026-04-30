import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import StorageAdapter from './storage';
import rootReducer, {RootState} from './rootReducer';

/**
 * Redux Persist Configuration
 * 
 * Persists specific slices to MMKV storage
 * Only persists auth slice (tokens) by default
 * Customize whitelist/blacklist as needed
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage: StorageAdapter,
  whitelist: [
    'auth',
    'onboarding',
    'partners',
    'cosmicGuides',
    'keys',
    'horoscope',
    'cosmicData',
  ], // Slices to persist across app restarts
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
      // Disable expensive dev-only checks — these add ~200-300ms to startup
      immutableCheck: false,
    }),
  devTools: false, // Redux DevTools middleware is extremely expensive during rehydration
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
    await StorageAdapter.clear();
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
    const keys = await StorageAdapter.getAllKeys();
    const result = await StorageAdapter.multiGet(keys);
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
