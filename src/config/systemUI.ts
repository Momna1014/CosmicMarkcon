import { Platform } from 'react-native';

// System UI Configuration
export const SYSTEM_UI_CONFIG = {
  // Whether to hide status bar and navigation bar globally
  HIDE_SYSTEM_UI: true,
  
  // iOS specific settings
  IOS: {
    HIDE_STATUS_BAR: false,
    STATUS_BAR_ANIMATION: 'fade' as const,
  },
  
  // Android specific settings
  ANDROID: {
    HIDE_STATUS_BAR: true,
    HIDE_NAVIGATION_BAR: true,
    STATUS_BAR_ANIMATION: 'fade' as const,
    USE_STICKY_IMMERSIVE: true, // Keeps bars hidden even after user interaction
    USE_FULL_SCREEN: false, // Alternative to sticky immersive
    USE_LEAN_BACK: true, // Additional hiding mechanism
    CONTINUOUS_MONITORING: true, // Continuously ensure bars stay hidden
  },
} as const;

// Theme colors for navigation bar (Android only)
export const NAVIGATION_BAR_COLORS = {
  LIGHT_THEME: '#FFFFFF',
  DARK_THEME: '#000000',
  TRANSPARENT: 'transparent',
} as const;

// Get platform-specific configuration
export const getCurrentPlatformConfig = () => {
  return Platform.OS === 'ios' ? SYSTEM_UI_CONFIG.IOS : SYSTEM_UI_CONFIG.ANDROID;
};

export const shouldHideSystemUI = () => {
  return SYSTEM_UI_CONFIG.HIDE_SYSTEM_UI;
};
