/**
 * Deep Linking Configuration
 * 
 * Configure deep linking for the app
 * Supports: App links, Universal links, Custom URL schemes
 */

import {LinkingOptions} from '@react-navigation/native';

// Import types for PDFReader
import { MangaInfo, PDFChapter } from '../components/ComicReader';

export type RootStackParamList = {
  // Auth/Onboarding
  Onboarding: undefined;
  
  // Main App
  MainApp: undefined;
  
  // Modal Screens
  Paywall: {source?: string};
  Details: {id?: string};
  NotificationTest: undefined;
  AdsTest: undefined;
  
  // Temporary (until drawer is installed)
  HomeDetail: undefined;
  DiscoveryDetail: undefined;
  Chapters: undefined;
  ReviewsDetail: undefined;
  Settings: undefined;
  
  // PDF Reader Screen
  PDFReader: {
    manga: MangaInfo;
    chapter: PDFChapter;
    chapters?: PDFChapter[];
  };
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  FirebaseTest: undefined;
  ABTesting: undefined;
  AdsTest: undefined;
  Library: undefined;
  Discover: undefined;
  Me: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  HomeDetail: undefined;
  DiscoveryDetail: undefined;
  Chapters: undefined;
  ReviewsDetail: undefined;
  Settings: undefined;
  NotificationTest: undefined;
  PDFReader: {
    manga: MangaInfo;
    chapter: PDFChapter;
    chapters?: PDFChapter[];
  };
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
      MainApp: {
        screens: {
          Drawer: {
            screens: {
              MainTabs: {
                screens: {
                  Home: 'home',
                  Profile: 'profile',
                  FirebaseTest: 'firebase',
                  ABTesting: 'abtesting',
                },
              },
              Settings: 'settings',
            },
          },
        },
      },
      Paywall: 'paywall',
      Details: 'details/:id',
      NotificationTest: 'notifications',
      AdsTest: 'ads',
    },
  },
};

/**
 * Example deep link URLs:
 * 
 * - templateapp://home
 * - templateapp://profile
 * - templateapp://settings
 * - templateapp://paywall
 * - templateapp://details/123
 * - templateapp://firebase
 * - templateapp://abtesting
 * 
 * Web URLs (if configured):
 * - https://templateapp.com/home
 * - https://templateapp.com/paywall
 * - https://templateapp.com/details/123
 */

export default linking;
