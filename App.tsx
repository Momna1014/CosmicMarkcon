// App.tsx
/**
 * Main App Entry Point
 *
 * ARCHITECTURE OVERVIEW:
 * - Initialization is handled by InitializationFlow
 * - SDK boot flow: Consent → ATT → Parallel SDK init → App ready
 * - Privacy-compliant: No tracking before consent
 * - Splash screen controlled by InitializationFlow
 *
 * @see src/InitializationFlow for flow details
 */
import React, { JSX, useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { store, persistor, type AppDispatch } from './src/redux/store';
import {
  ThemeProvider,
  useTheme,
  useDeviceTheme,
} from './src/theme/ThemeProvider';
import { AppProvider } from './src/contexts/AppContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { setUserId } from './src/redux/slices/authSlice';
import { setKeysConfig } from './src/redux/slices/keysSlice';
import { signInAnonymously } from './src/services/firebase/FirebaseAuthService';
import { keysService } from './src/services/keysService';

import { startApp } from './src/InitializationFlow';

// Lazy i18n init — called before first render, not at bundle eval time
import { initI18n } from './src/i18n';
import { Colors } from './src/theme';

/**
 * App Content Component (wrapped with ThemeProvider)
 *
 * IMPORTANT: SDK initialization is now controlled by InitializationFlow
 * Flow: Consent → ATT → Parallel SDK init → App ready
 */
const AppContent = (): JSX.Element => {
  const theme = useTheme();
  const deviceTheme = useDeviceTheme();
  const isDark = deviceTheme === 'dark';
  const [appStartTime] = useState(() => Date.now());

  const [bootComplete, setBootComplete] = useState(false);
  const dispatch = useDispatch<AppDispatch>();


  /**
   * Start initialization flow — 
   * If a force/optional update is required, the flow never starts,
   * so no ads, paywall, or SDK initialization will fire.
   */
  useEffect(() => {
    let isCancelled = false;

    const boot = async () => {
      try {
        initI18n(); // Init i18n lazily — after bundle eval, before first render
        console.log('[App] 🚀 Starting InitializationFlow...');
        await startApp();
        if (!isCancelled) {
          setBootComplete(true);
        }
      } catch (error) {
        console.error('[App] InitializationFlow failed:', error);
      }
    };

    boot();

    return () => {
      isCancelled = true;
    };
  }, []);

  /**
   * Anonymous Firebase sign-in + GPT keys fetch.
   *
   * Gated on `bootComplete` so it only runs AFTER `startApp()` has finished:
   *   - Usercentrics consent popup answered
   *   - ATT prompt answered (iOS)
   *   - Firebase native SDK + Crashlytics/Analytics initialized
   *   - Splash hidden
   *
   * Running before bootComplete races against Firebase native init and the
   * axios interceptors, which is what was producing the runtime errors.
   * Each step is independent: if login fails the app still works; if keys
   * fail login still succeeds.
   */
  useEffect(() => {
    if (!bootComplete) return;

    let isCancelled = false;

    const performAnonymousLogin = async () => {
      try {
        const userId = await signInAnonymously();
        if (isCancelled) return;
        dispatch(setUserId(userId));
        console.log('✅ [App] Anonymous login complete, userId stored:', userId);

        // Fire-and-forget GPT keys fetch — non-blocking.
        keysService
          .getGptKeys()
          .then(keysData => {
            if (isCancelled) return;
            if (keysData) {
              dispatch(setKeysConfig(keysData));
              console.log('✅ [App] GPT Keys fetched and stored');
            } else {
              console.warn('⚠️ [App] No GPT keys received');
            }
          })
          .catch(err => {
            console.warn('⚠️ [App] GPT keys fetch failed:', err);
          });
      } catch (error) {
        console.error('❌ [App] Anonymous login failed:', error);
      }
    };

    performAnonymousLogin();

    return () => {
      isCancelled = true;
    };
  }, [bootComplete, dispatch]);

  // useEffect(()=>{

  // },[])

  // Log when UI first renders
  // useEffect(() => {
  //   if (!bootComplete) return;
  //   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  //   console.log('🎨 UI RENDERED - User can see the app now!');
  //   console.log(`📊 Time to first render: ${Date.now() - appStartTime}ms`);
  //   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // }, [appStartTime, bootComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background}}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <RootNavigator />
      <Toast />
    </View>
  );
};

/**
 * Main App Component
 *
 * Providers (in order):
 * - Redux Provider: Global state management
 * - PersistGate: Rehydrates persisted state on app start (non-blocking)
 * - ThemeProvider: Automatic dark/light theme detection based on device settings
 * - Toast: Global toast notifications
 *
 * Features:
 * - ✅ Automatic theme switching (light/dark mode)
 * - ✅ Redux state management with persistence
 * - ✅ Toast notifications
 * - ✅ Type-safe navigation
 * - ✅ Optimized splash screen (fast startup)
 */
const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </AppProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
