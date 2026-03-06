// /**
//  * RootNavigator
//  * 
//  * Main navigation container that wraps the entire app
//  * Integrates: StackNavigator, DeepLinking, NavigationService
//  */

// import React from 'react';
// import {Text, View, StyleSheet, ActivityIndicator} from 'react-native';
// import {NavigationContainer} from '@react-navigation/native';
// import RNBootSplash from 'react-native-bootsplash';

// // Import modular navigation
// import StackNavigator from './StackNavigator';
// import {linking} from './deepLinking';
// import {navigationRef} from './NavigationService';

// // Import context
// import {AppProvider} from '../contexts/AppContext';

// /**
//  * Loading Fallback Component
//  */
// // function LoadingFallback() {
// //   return (
// //     <View style={styles.loadingContainer}>
// //       <ActivityIndicator size="large" color="#007AFF" />
// //       <Text style={styles.loadingText}>Loading...</Text>
// //     </View>
// //   );
// // }

// /**
//  * Root Navigator Component
//  */
// function RootNavigatorContent() {
//   const [isNavigationReady, setIsNavigationReady] = React.useState(false);

//   React.useEffect(() => {
//     // Don't hide splash immediately - wait for navigation to be fully ready
//     // This prevents showing splash over popups
//     if (isNavigationReady) {
//       // Add a small delay to ensure UI is fully rendered
//       const timer = setTimeout(() => {
//         console.log('Navigation ready - hiding splash');
//         RNBootSplash.hide({fade: true});
//       }, 300); // 300ms delay after navigation is ready

//       return () => clearTimeout(timer);
//     }
//   }, [isNavigationReady]);

//   return (
//     <NavigationContainer
//       ref={navigationRef}
//       linking={linking as any}
//       // fallback={<LoadingFallback />}
//       onReady={() => {
//         setIsNavigationReady(true);
//         console.log('Navigation ready');
//       }}>
//       <StackNavigator />
//     </NavigationContainer>
//   );
// }

// /**
//  * Root Navigator with Context Provider
//  * 
//  * Wraps navigation with AppProvider for global state
//  */
// export default function RootNavigator() {
//   return (
//     <AppProvider>
//       <RootNavigatorContent />
//     </AppProvider>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#8E8E93',
//   },
// });


// new code
// * RootNavigator
//  *
//  * Main navigation container that wraps the entire app
//  * Integrates: StackNavigator, DeepLinking, NavigationService
//  *
//  * Now integrated with InitializationOrchestrator for coordinated boot flow:
//  * - Navigation ready signal is sent to orchestrator
//  * - Splash screen is controlled by orchestrator
//  */

import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Import modular navigation
import StackNavigator from './StackNavigator';
import { linking } from './deepLinking';
import { navigationRef } from './NavigationService';

// Import context
import { AppProvider } from '../contexts/AppContext';

// Import initialization orchestrator
import { getOrchestrator } from '../initialization';

/**
 * Root Navigator Component
 *
 * Signals navigation readiness to the orchestrator.
 * Splash screen hiding is now controlled by InitializationOrchestrator.
 */
function RootNavigatorContent() {
  const handleNavigationReady = useCallback(() => {
    console.log('[RootNavigator] Navigation ready - notifying orchestrator');

    // Notify orchestrator that navigation is ready
    // The orchestrator will handle splash screen hiding at the appropriate time
    getOrchestrator().setNavigationReady();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking as any}
      onReady={handleNavigationReady}
    >
      <StackNavigator />
    </NavigationContainer>
  );
}

/**
 * Root Navigator with Context Provider
 *
 * Wraps navigation with AppProvider for global state
 * Note: PaywallModal uses presentPaywall() API - no component needed
 */
export default function RootNavigator() {
  return (
    <AppProvider>
      <RootNavigatorContent />
    </AppProvider>
  );
}