/**
 * StackNavigator
 * 
 * Root stack navigator managing the main navigation flow:
 * - Onboarding (first launch only) - configurable
 * - Initial Paywall (after onboarding, before main app) - if not completed
 * - Main App (with tabs or drawer based on config)
 * - Modal screens (Paywall, Details)
 * 
 * NAVIGATION FLOW:
 * 1. If onboarding NOT completed → Onboarding screens
 * 2. If onboarding completed BUT initial paywall NOT completed AND not premium → Paywall
 * 3. Otherwise → MainApp
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useApp} from '../contexts/AppContext';
import NavigationConfig from './NavigationConfig';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import {OnboardingContainer} from '../screens/Onboarding';
import PaywallScreen from '../screens/Paywall';
import {CosmicGuideDetail, LessonDetail} from '../screens/CosmicGuide';
import LoveMatchScreen from '../screens/Love/LoveMatchScreen';
import ChatScreen from '../screens/Chat';
import PalmCaptureScreen from '../screens/Chiromancy/PalmCaptureScreen';



// Conditionally import DrawerNavigator
let DrawerNavigator: any = null;
if (NavigationConfig.enableDrawer) {
  try {
    DrawerNavigator = require('./DrawerNavigator').default;
    console.log('✅ DrawerNavigator loaded successfully');
  } catch (error) {
    console.warn('⚠️ DrawerNavigator not available. Install @react-navigation/drawer to enable drawer navigation.');
    console.error('Drawer import error:', error);
  }
}

import {RootStackParamList} from './deepLinking';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack Navigator Component
 * 
 * Determines initial route based on onboarding and paywall status:
 * - Shows Onboarding if enabled and not completed
 * - Shows Paywall if onboarding done but initial paywall not completed (and not premium)
 * - Shows MainApp with Drawer or Tabs based on config
 */
export const StackNavigator: React.FC = () => {
  const {onboardingCompleted, isLoading, shouldShowInitialPaywall, isPremium, initialPaywallCompleted} = useApp();
  
  // Determine if we should show onboarding
  const shouldShowOnboarding = NavigationConfig.enableOnboarding && !onboardingCompleted;
  
  // Choose main navigator based on config
  // If drawer is enabled but not available, fallback to tabs
  const MainNavigator = (NavigationConfig.enableDrawer && DrawerNavigator) 
    ? DrawerNavigator 
    : TabNavigator;

  // Determine initial route based on state
  // Priority: Onboarding > Paywall > MainApp
  const getInitialRoute = (): 'Onboarding' | 'Paywall' | 'MainApp' => {
    if (shouldShowOnboarding) return 'Onboarding';
    if (shouldShowInitialPaywall && NavigationConfig.enablePaywall) return 'Paywall';
    return 'MainApp';
  };

  const initialRoute = getInitialRoute();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('[StackNavigator] 🗺️ NAVIGATION DECISION');
  console.log('[StackNavigator] 📋 onboardingCompleted:', onboardingCompleted);
  console.log('[StackNavigator] 📋 initialPaywallCompleted:', initialPaywallCompleted);
  console.log('[StackNavigator] 💰 isPremium:', isPremium);
  console.log('[StackNavigator] 🎯 shouldShowOnboarding:', shouldShowOnboarding);
  console.log('[StackNavigator] 🎯 shouldShowInitialPaywall:', shouldShowInitialPaywall);
  console.log('[StackNavigator] 📍 initialRoute:', initialRoute);
  console.log('═══════════════════════════════════════════════════════════');

  if (isLoading) {
    console.log('[StackNavigator] ⏳ Still loading app state...');
    // You can return a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}>
      
      {/* Onboarding Flow (if enabled) */}
      {NavigationConfig.enableOnboarding && !onboardingCompleted && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingContainer}
          options={{
            headerShown: false,
            gestureEnabled: false, // Prevent swipe back
          }}
        />
      )}

      {/* Main App - Either Drawer or Tabs based on config */}
      <Stack.Screen
        name="MainApp"
        component={MainNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Paywall Screen - Full screen, not modal */}
      {/* Can be used as initial route or navigated to from anywhere */}
      {NavigationConfig.enablePaywall && (
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            headerShown: false,
            gestureEnabled: false, // Don't allow swipe back from paywall
            animation: 'fade',
          }}
        />
      )}

      {/* Cosmic Guide Screens - Stack screens without bottom tabs */}
      <Stack.Screen
        name="CosmicGuideDetail"
        component={CosmicGuideDetail}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetail}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Love Match Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="LoveMatch"
        component={LoveMatchScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Chat Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />

      {/* Palm Capture Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="PalmCapture"
        component={PalmCaptureScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />

      {/* Other Modal Screens can go here if needed */}
      
      {/* Settings Screen (if drawer is disabled, add as stack screen) */}

    </Stack.Navigator>
  );
};

export default StackNavigator;
