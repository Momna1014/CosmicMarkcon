// // App.tsx
// import React, { JSX, useEffect, useState } from 'react';
// import { StatusBar, InteractionManager } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Provider, useDispatch } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import Toast from 'react-native-toast-message';
// import RootNavigator from './src/navigation/RootNavigator';
// import { store, persistor } from './src/redux/store';
// import { setUserId } from './src/redux/slices/authSlice';
// import {
//   ThemeProvider,
//   useTheme,
//   useDeviceTheme,
// } from './src/theme/ThemeProvider';
// import { initializeNotifications, requestNotificationPermissions } from './src/config/initializers/notificationInitializer';
// import { useSDKInitialization, runConsentFlow } from './src/services/initialization';
// import { signInAnonymously } from './src/services/firebase';
// import { AlertProvider } from './src/contexts/AlertContext';
// import env from './src/config/env';
// import { getOrchestrator, InitState, InitializationGate } from './src/initialization';
// /**
//  * App Content Component (wrapped with ThemeProvider)
//  * 
//  * PERFORMANCE OPTIMIZED:
//  * - Uses InteractionManager to defer heavy tasks after UI is interactive
//  * - SDKs initialize in parallel using Promise.all()
//  * - App shows immediately, SDKs load in background
//  * - Optimized for old/slow devices
//  * 
//  * PERFORMANCE TRACKING ENABLED
//  */
// const AppContent = (): JSX.Element => {
//   const theme = useTheme();
//   const deviceTheme = useDeviceTheme();
//   const isDark = deviceTheme === 'dark';
//   const [appReady, setAppReady] = useState(false);
//   const [appStartTime] = useState(() => Date.now());
//   const dispatch = useDispatch();

//   // Initialize SDK orchestrator with hooks
//   // This handles Phase 1 (Critical Services) automatically on mount
//   const {
//     phase1Complete,
//     isFullyInitialized,
//     consentDecision,
//     getDebugInfo,
//   } = useSDKInitialization({
//     debugLogging: __DEV__,
//     remoteConfigDefaults: {
//       feature_ads_enabled: true,
//       feature_premium_enabled: true,
//       maintenance_mode: false,
//     },
//     onPhase1Complete: () => {
//       const timeToPhase1 = Date.now() - appStartTime;
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       console.log('⚡ PERFORMANCE TRACKING - PHASE 1 COMPLETE');
//       console.log(`📊 Time to Phase 1: ${timeToPhase1}ms`);
//       console.log('✅ App is now INTERACTIVE and READY for user');
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       // Mark app as ready immediately after Phase 1, don't wait for everything
//       setAppReady(true);
//     },
//     onConsentReceived: (decision) => {
//       console.log('[App] 📋 Consent received:', decision);
//     },
//     onFullyInitialized: () => {
//       const totalTime = Date.now() - appStartTime;
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//       console.log('🎉 PERFORMANCE TRACKING - FULLY INITIALIZED');
//       console.log(`📊 Total initialization time: ${totalTime}ms`);
//       console.log('✅ All SDKs ready (tracking, analytics, etc.)');
//       if (__DEV__) {
//         console.log('[App] Debug info:', getDebugInfo());
//       }
//       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     },
//   });

//   // Anonymous login - runs once when phase1 is complete
//   useEffect(() => {
//     if (!phase1Complete) return;

//     const performAnonymousLogin = async () => {
//       try {
//         const userId = await signInAnonymously();
//         dispatch(setUserId(userId));
//         console.log('✅ Anonymous login complete, userId stored:', userId);
//       } catch (error) {
//         console.error('❌ Anonymous login failed:', error);
//       }
//     };

//     performAnonymousLogin();
//   }, [phase1Complete, dispatch]);

//   // Run consent flow AFTER app is interactive (deferred)
//   // This handles Phase 2 (Usercentrics) and Phase 3 (Consent-Dependent SDKs)
//   useEffect(() => {
//     if (!phase1Complete || consentDecision !== 'not-determined') return;

//     console.log('⏳ Starting Phase 2 & 3 (deferred, non-blocking)...');
    
//     // Use InteractionManager to defer until after UI is ready
//     const task = InteractionManager.runAfterInteractions(() => {
//       // Small delay to let UI settle
//       setTimeout(() => {
//         const phase2StartTime = Date.now();
//         runConsentFlow({
//           ruleSetId: env.USER_CENTRIC,
//           debugLogging: __DEV__,
//         })
//           .then(() => {
//             const phase2Duration = Date.now() - phase2StartTime;
//             console.log(`✅ Consent flow completed in ${phase2Duration}ms`);
//           })
//           .catch((err: Error) => console.error('[App] Consent flow error:', err));
//       }, 300);
//     });

//     return () => task.cancel();
//   }, [phase1Complete, consentDecision]);

//   // Initialize notifications AFTER everything else (lowest priority)
//   useEffect(() => {
//     if (!isFullyInitialized) return;

//     console.log('⏳ Initializing notifications (lowest priority)...');
    
//     // Defer to background thread
//     const task = InteractionManager.runAfterInteractions(() => {
//       setTimeout(async () => {
//         try {
//           const notifStartTime = Date.now();
//           // Run notification initialization in parallel (both can happen together)
//           await Promise.all([
//             initializeNotifications(0),
//             requestNotificationPermissions(),
//           ]);
//           const notifDuration = Date.now() - notifStartTime;
//           console.log(`✅ Notifications ready in ${notifDuration}ms`);
//         } catch (error) {
//           console.error('[App] Notifications setup error:', error);
//         }
//       }, 500);
//     });

//     return () => task.cancel();
//   }, [isFullyInitialized]);

//   // Log when UI first renders
//   useEffect(() => {
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('🎨 UI RENDERED - User can see the app now!');
//     console.log(`📊 Time to first render: ${Date.now() - appStartTime}ms`);
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   }, []);

//   // return (
//   //   <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
//   //     <StatusBar
//   //       barStyle={isDark ? 'light-content' : 'dark-content'}
//   //       backgroundColor={theme.colors.background}
//   //     />
//   //     <AlertProvider>
//   //       {/* Show navigator immediately, don't wait for full SDK initialization */}
//   //       <RootNavigator />
//   //     </AlertProvider>
//   //     <Toast />
//   //   </SafeAreaView>
//   // );

//   // Initialization state tracking
//   const [initState, setInitState] = useState<InitState>(InitState.IDLE);

//   // Show force update modal AFTER initialization passes splash/consent phase
//   // This prevents blocking the Usercentrics consent popup
//   useEffect(() => {
//     const postSplashStates: InitState[] = [
//       InitState.ONBOARDING_ACTIVE,
//       InitState.ONBOARDING_COMPLETE,
//       InitState.ATT_PENDING,
//       InitState.ATT_PRESENTING,
//       InitState.ATT_RESOLVED,
//       InitState.FINALIZING_ADS_MODE,
//       InitState.READY,
//       InitState.ACTIVE,
//     ];

//   }, [initState]);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
//       <StatusBar
//         barStyle={isDark ? 'light-content' : 'dark-content'}
//         backgroundColor={theme.colors.background}
//       />
//       <InitializationGate
//         requiredStates={[
//           InitState.NAVIGATING_TO_ONBOARDING,
//           InitState.ONBOARDING_ACTIVE,
//           InitState.ONBOARDING_COMPLETE,
//           InitState.ATT_PENDING,
//           InitState.ATT_PRESENTING,
//           InitState.ATT_RESOLVED,
//           InitState.FINALIZING_ADS_MODE,
//           InitState.READY,
//           InitState.ACTIVE,
//         ]}
//       >
//         <RootNavigator />
//       </InitializationGate>
//       <Toast />

//       {/* Force Update Modal - blocks app usage */}
//       {/* {updateState && (
//         <ForceUpdateModal
//           visible={showForceUpdate}
//           updateState={updateState}
//           onUpdate={handleUpdate}
//           isTestMode={__DEV__} // DEV ONLY: Show modal if FORCE_UPDATE_TEST env var is set
//           onClose={() => setShowForceUpdate(false)} // DEV ONLY: Allow closing the modal in test mode
//         />
//       )} */}
//     </SafeAreaView>
//   );
// };

// /**
//  * Main App Component
//  *
//  * Providers (in order):
//  * - Redux Provider: Global state management
//  * - PersistGate: Rehydrates persisted state on app start (non-blocking)
//  * - ThemeProvider: Automatic dark/light theme detection based on device settings
//  * - Toast: Global toast notifications
//  *
//  * Features:
//  * - ✅ Automatic theme switching (light/dark mode)
//  * - ✅ Redux state management with persistence
//  * - ✅ Toast notifications
//  * - ✅ Type-safe navigation
//  * - ✅ Optimized splash screen (fast startup)
//  */
// const App = (): JSX.Element => {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <ThemeProvider>
//           <AppContent />
//         </ThemeProvider>
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;




/**
 * Main App Entry Point
 *
 * ARCHITECTURE OVERVIEW:
 * - Initialization is handled by InitializationOrchestrator
 * - SDK boot flow: Consent → SDK Init → Onboarding → ATT → Active
 * - Privacy-compliant: No tracking before consent
 * - Splash screen controlled by orchestrator
 *
 * @see src/initialization/README.md for full architecture details
 */
import React, { JSX, useEffect, useState, useRef } from 'react';
import { StatusBar, View } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { store, persistor } from './src/redux/store';
import {
  ThemeProvider,
  useTheme,
  useDeviceTheme,
} from './src/theme/ThemeProvider';

// NEW: Import initialization orchestrator
import { getOrchestrator, InitState, InitializationGate } from './src/initialization';
import { signInAnonymously } from './src/services/firebase';
import { setUserId } from './src/redux/slices/authSlice';
import { AlertProvider } from './src/contexts/AlertContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { RatingProvider } from './src/contexts/RatingContext';




// Import i18n configuration
import './src/i18n';
import * as Sentry from '@sentry/react-native';

// Sentry.init({
//   dsn: 'https://8fcbf2458b61c3fd019c4d3eb7169465@o4509863677329408.ingest.us.sentry.io/4510906320486400',

//   // GDPR Compliance: PII disabled by default, enabled after user consent
//   // Full tracking is enabled via SentryAdapter after Usercentrics consent
//   sendDefaultPii: false,

//   // Enable Logs (non-PII)
//   enableLogs: true,

//   // Session Replay disabled until consent - enabled via enableFullTracking()
//   replaysSessionSampleRate: 0,
//   replaysOnErrorSampleRate: 0,

//   // Basic integrations only - no PII collection
//   integrations: [
//     // Replay and feedback will be enabled after consent
//   ],

//   // uncomment the line below to enable Spotlight (https://spotlightjs.com)
//   // spotlight: __DEV__,
// });

/**
 * App Content Component (wrapped with ThemeProvider)
 *
 * IMPORTANT: SDK initialization is now controlled by InitializationOrchestrator
 * Flow: Boot → Consent → SDK Init → Onboarding → ATT → Active
 */
const AppContent = (): JSX.Element => {
  const theme = useTheme();
  const deviceTheme = useDeviceTheme();
  const isDark = deviceTheme === 'dark';
  const [appStartTime] = useState(() => Date.now());
  const dispatch = useDispatch();
  const hasLoggedIn = useRef(false);

  // Initialization state tracking
  const [initState, setInitState] = useState<InitState>(InitState.IDLE);

  // Show force update modal AFTER initialization passes splash/consent phase
  // This prevents blocking the Usercentrics consent popup
  useEffect(() => {
    const postSplashStates: InitState[] = [
      InitState.ONBOARDING_ACTIVE,
      InitState.ONBOARDING_COMPLETE,
      InitState.ATT_PENDING,
      InitState.ATT_PRESENTING,
      InitState.ATT_RESOLVED,
      InitState.READY,
      InitState.ACTIVE,
    ];

  }, [initState]);

  /**
   * NEW: Start initialization orchestrator
   *
   * The orchestrator handles:
   * - Consent collection (Usercentrics)
   * - SDK initialization (Firebase, AppsFlyer, Sentry, AppLovin, RevenueCat)
   * - Onboarding flow
   * - ATT prompt (iOS)
   * - Splash screen management
   */
  useEffect(() => {
    console.log('[App] :rocket: Starting InitializationOrchestrator...');
    const orchestrator = getOrchestrator();

    // Subscribe to state changes for logging and tracking
    const unsubscribe = orchestrator.subscribe(transitionInfo => {
      // transitionInfo is a StateTransitionInfo object with { from, to, event, context, timestamp }
      const newState = transitionInfo.to;
      setInitState(newState);
      console.log(
        `[App] Init state changed: ${transitionInfo.from} -> ${newState} (${transitionInfo.event})`,
      );
    });

    // Start the boot process
    orchestrator.boot().catch(error => {
      console.error('[App] Boot failed:', error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

// Anonymous login - runs once when SDK core initialization is complete
  useEffect(() => {
    // Only run once
    if (hasLoggedIn.current) return;

    // Only trigger when we've passed core initialization (Firebase is ready)
    const postCoreInitStates: InitState[] = [
      InitState.NAVIGATING_TO_ONBOARDING,
      InitState.ONBOARDING_ACTIVE,
      InitState.ONBOARDING_COMPLETE,
      InitState.ATT_PENDING,
      InitState.ATT_PRESENTING,
      InitState.ATT_RESOLVED,
      InitState.FINALIZING_ADS_MODE,
      InitState.READY,
      InitState.ACTIVE,
    ];

    if (!postCoreInitStates.includes(initState)) return;

    hasLoggedIn.current = true;

    const performAnonymousLogin = async () => {
      try {
        const userId = await signInAnonymously();
        dispatch(setUserId(userId));
        console.log('✅ Anonymous login complete, userId stored:', userId);
      } catch (error) {
        console.error('❌ Anonymous login failed:', error);
      }
    };

    performAnonymousLogin();
  }, [initState, dispatch]);

  // Log when UI first renders
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(':art: UI RENDERED - User can see the app now!');
    console.log(`:bar_chart: Time to first render: ${Date.now() - appStartTime}ms`);
    console.log(`:bar_chart: Current init state: ${initState}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [appStartTime, initState]);

  return (
    <View style={{ flex: 1,}}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <InitializationGate
        requiredStates={[
          InitState.NAVIGATING_TO_ONBOARDING,
          InitState.ONBOARDING_ACTIVE,
          InitState.ONBOARDING_COMPLETE,
          InitState.ATT_PENDING,
          InitState.ATT_PRESENTING,
          InitState.ATT_RESOLVED,
          InitState.FINALIZING_ADS_MODE,
          InitState.READY,
          InitState.ACTIVE,
        ]}
      >
        <NotificationProvider>
          <RatingProvider>
            <AlertProvider>
              <RootNavigator />
            </AlertProvider>
          </RatingProvider>
        </NotificationProvider>      </InitializationGate>
      <Toast />
      {/* Force Update Modal - blocks app usage */}
      {/* {updateState && (
        <ForceUpdateModal
          visible={showForceUpdate}
          updateState={updateState}
          onUpdate={handleUpdate}
          isTestMode={__DEV__} // DEV ONLY: Show modal if FORCE_UPDATE_TEST env var is set
          onClose={() => setShowForceUpdate(false)} // DEV ONLY: Allow closing the modal in test mode
        />
      )} */}
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
 * - :white_check_mark: Automatic theme switching (light/dark mode)
 * - :white_check_mark: Redux state management with persistence
 * - :white_check_mark: Toast notifications
 * - :white_check_mark: Type-safe navigation
 * - :white_check_mark: Optimized splash screen (fast startup)
 */
const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default Sentry.wrap(App);