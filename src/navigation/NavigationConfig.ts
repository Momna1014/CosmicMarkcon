/**
 * Navigation Configuration
 * 
 * Configure navigation structure for your app
 * Enable/disable features based on your needs
 */

import env from '../config/env';

export const NavigationConfig = {
  /**
   * Enable/Disable Drawer Navigation
   * Set to false if you don't need drawer menu
   * 
   * When enabled:
   * - Users can swipe from left edge to open drawer
   * - Hamburger menu icon appears in header
   * - Provides access to Settings and other menu items
   * 
   * When disabled:
   * - App uses bottom tab navigation only
   * - Settings screen accessible via stack navigation
   * 
   * Note: Requires @react-navigation/drawer to be installed
   */
  enableDrawer: false,
  
  /**
   * Enable/Disable Onboarding
   * Set to false to skip onboarding flow
   */
  enableOnboarding: true,
  
  /**
   * Enable/Disable Paywall
   * Set to false if you don't have premium features
   */
  enablePaywall: true,
  
  /**
   * App Tracking Transparency (ATT) Configuration
   * Controls privacy tracking permissions for iOS and Android
   */
  tracking: {
    enabled: true,              // Enable/disable tracking
    autoRequest: true,          // Auto-request permission on app launch
    delayMs: 1500,             // Delay before auto-requesting (ms) - reduced to show prompt sooner
    showInSettings: true,      // Show tracking status in settings
  },
  
  /**
   * Tab Bar Configuration
   * Control which tabs to show
   */
  tabs: {
    showHome: true,
    showProfile: true,
    showFirebase: true,
    showABTesting: true,
    showAdsTest: true,  // Ad testing screen
  },
  
  /**
   * Drawer Configuration
   * Customize drawer behavior
   */
  drawer: {
    position: 'left' as 'left' | 'right',
    type: 'slide' as 'front' | 'back' | 'slide' | 'permanent',
    swipeEnabled: true,
    showSettings: true,
    showPremiumUpgrade: true,
    showDevTools: true, // Only visible in __DEV__ mode
  },
  
  /**
   * Screens where drawer should be disabled
   * On these screens, the drawer won't open via swipe or header button
   */
  disableDrawerScreens: [
    'Settings',  // Example: Disable drawer on Settings screen
    // 'Profile',   // Example: Disable drawer on Profile screen
    // Add screen names here where you don't want drawer to be accessible
  ] as string[],
  
  /**
   * Screens where tab bar should be hidden
   */
  hiddenTabScreens: [
    'Details',
    'Paywall',
    // Add more screen names here
  ],
  
  /**
   * Deep Linking Configuration
   */
  deepLinking: {
    enabled: true,
    prefixes: [
      'templateapp://',
      'https://templateapp.com',
    ],
  },
  
  /**
   * Facebook Analytics Configuration
   * Controls event tracking and analytics
   * 
   * Configuration loaded from .env file:
   * - FACEBOOK_APP_ID: Your Facebook App ID
   * - FACEBOOK_CLIENT_TOKEN: Your Facebook Client Token
   * 
   * Get these from:
   * 1. Go to https://developers.facebook.com/apps
   * 2. Create or select your app
   * 3. Get your App ID from App Dashboard
   * 4. Get Client Token from Settings > Advanced > Security
   */
  facebook: {
    enabled: true,                           // Enable/disable Facebook Analytics
    appId: env.FACEBOOK_APP_ID,             // App ID from .env
    clientToken: env.FACEBOOK_CLIENT_TOKEN, // Client Token from .env
    displayName: env.FACEBOOK_DISPLAY_NAME,       // Your app display name
    autoLogAppEvents: true,                 // Auto-log app lifecycle events
    advertiserTrackingEnabled: true,        // Enable ad tracking (requires ATT)
    showTestingInSettings: true,            // Show analytics testing card in Settings
  },
};

export default NavigationConfig;
