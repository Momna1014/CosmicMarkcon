/**
 * StackNavigator
 *
 * Root stack navigator managing the main navigation flow:
 * - Onboarding (first launch only) - configurable
 * - Main App (with tabs or drawer based on config)
 * - Modal screens (Details, etc.)
 * 
 * Note: Paywall uses showPaywallModal() imperative API - no screen needed
 */

import React, { useEffect } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useApp} from '../contexts/AppContext';
import NavigationConfig from './NavigationConfig';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import {OnboardingContainer} from '../screens/Onboarding';
import PaywallScreen from '../screens/Paywall';
import {CosmicGuideDetail, LessonDetail} from '../screens/CosmicGuide';
import LoveMatchScreen from '../screens/Love/LoveMatchScreen';
import AddPartnerScreen from '../screens/Love/AddPartnerScreen';
import ChatScreen from '../screens/Chat';
import PalmCaptureScreen from '../screens/Chiromancy/PalmCaptureScreen';
import ProfileScreen from '../screens/Profile';
import ReportProblemScreen from '../screens/ReportProblem';

// Conditionally import DrawerNavigator
let DrawerNavigator: any = null;
if (NavigationConfig.enableDrawer) {
  try {
    DrawerNavigator = require('./DrawerNavigator').default;
    console.log('✅ DrawerNavigator loaded successfully');
  } catch (error) {
    console.warn(
      '⚠️ DrawerNavigator not available. Install @react-navigation/drawer to enable drawer navigation.',
    );
    console.error('Drawer import error:', error);
  }
}

import { RootStackParamList } from './deepLinking';
import { useNavigation } from '@react-navigation/native';


const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack Navigator Component
 *
 * Determines initial route based on onboarding status and config
 * - Shows Onboarding if enabled and not completed
 * - Shows MainApp with Drawer or Tabs based on config
 */
export const StackNavigator: React.FC = () => {
  const { onboardingCompleted,  isPremium } = useApp();
  const navigation = useNavigation();

  // Track screen transitions for interstitial ads
  useEffect(() => {
    if (isPremium) return;

    const unsubscribe = navigation.addListener('state', () => {
      // @feature:admob:start [disabled]
      // adMobService.recordScreenTransition();
      // @feature:admob:end
    });

    return unsubscribe;
  }, [navigation, isPremium]);

  // Determine if we should show onboarding
  const shouldShowOnboarding =
    NavigationConfig.enableOnboarding && !onboardingCompleted;

  // Determine initial route after onboarding
  // Show MainApp (TabNavigator) as the main screen after onboarding
  const initialRoute = shouldShowOnboarding
    ? 'Onboarding'
    : !isPremium
      ? 'Paywall'
      : 'MainApp';

  // Choose main navigator based on config
  // If drawer is enabled but not available, fallback to tabs
  const MainNavigator =
    NavigationConfig.enableDrawer && DrawerNavigator
      ? DrawerNavigator
      : TabNavigator;

  // Remove the isLoading check that returns null - this causes tabs to not show on first launch
  // The TabNavigator should always render, even during initialization
  // if (isLoading) {
  //   // You can return a loading screen here
  //   return null;
  // }

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

      {/* Add Partner Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="AddPartner"
        component={AddPartnerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
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

      {/* Profile Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Report Problem Screen - Stack screen without bottom tabs */}
      <Stack.Screen
        name="ReportProblem"
        component={ReportProblemScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Other Modal Screens can go here if needed */}
      
      {/* Settings Screen (if drawer is disabled, add as stack screen) */}

    </Stack.Navigator>
  );
};

export default StackNavigator;
