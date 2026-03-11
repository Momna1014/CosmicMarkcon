/**
 * Deep Linking Configuration
 * 
 * Configure deep linking for the app
 * Supports: App links, Universal links, Custom URL schemes
 */

import {LinkingOptions} from '@react-navigation/native';

export type RootStackParamList = {
  // Auth/Onboarding
  Onboarding: undefined;
  
  // Paywall
  Paywall: undefined;
  
  // Main App
  MainApp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Discover: undefined;
  Me: undefined;
};

/**
 * Deep linking configuration
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'templateapp://',
    'https://templateapp.com',
    'https://*.templateapp.com',
  ],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Paywall: 'paywall',
      MainApp: {
        screens: {
          Home: 'home',
          Library: 'library',
          Discover: 'discover',
          Me: 'me',
        },
      },
    },
  },
};

/**
 * Example deep link URLs:
 * 
 * - templateapp://home
 * - templateapp://library
 * - templateapp://discover
 * - templateapp://me
 */

export default linking;
