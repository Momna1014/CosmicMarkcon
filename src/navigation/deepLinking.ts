/**
 * Deep Linking Configuration
 *
 * Configure deep linking for the app
 * Supports: App links, Universal links, Custom URL schemes
 */

import { LinkingOptions } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth/Onboarding
  Onboarding: undefined;

  // Paywall
  Paywall: { source?: string; offeringIdentifier?: string } | undefined;

  // Main App
  MainApp: undefined;

  // Cosmic Guide Screens (Stack screens without tabs)
  CosmicGuideDetail: { guideId: string };
  LessonDetail: {
    guideId: string;
    lessonId: string;
    totalLessons: number;
  };

  // Love Match Screen (Stack screen without tabs)
  LoveMatch: {
    yourSign: string;
    theirSign: string;
  };

  // Add Partner Screen (Stack screen without tabs)
  AddPartner: undefined;

  // Profile Screen (Stack screen without tabs)
  Profile: undefined;

  // Chat Screen (Stack screen without tabs)
  Chat:
    | {
        source?: 'palm' | 'love';
        imageUri?: string;
        handType?: 'leftHand' | 'rightHand';
        yourSign?: string;
        theirSign?: string;
        loveMatchSummary?: string;
      }
    | undefined;

  // Palm Capture Screen (Stack screen without tabs)
  PalmCapture: {
    handType: 'leftHand' | 'rightHand';
  };
};

export type MainTabParamList = {
  Home: undefined;
  Horoscope: undefined;
  Love: undefined;
  Chiromancy: undefined;
  Chat: undefined;
  Video: undefined;
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
          Horoscope: 'horoscope',
          Love: 'love',
          Chiromancy: 'chiromancy',
          Chat: 'chat',
        },
      },
    },
  },
};

/**
 * Example deep link URLs:
 *
 * - templateapp://home
 * - templateapp://horoscope
 * - templateapp://love
 * - templateapp://chiromancy
 * - templateapp://profile
 */

export default linking;
