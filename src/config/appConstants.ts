/**
 * App Constants
 * 
 * Centralized constants for the application including
 * store links, app info, and sharing configurations.
 */

import { PLAY_STORE, APP_STORE, UNIVERSAL } from '@env';

/**
 * App Store Links
 * Values are loaded from .env file
 */
export const APP_STORE_LINKS = {
  // Google Play Store link
  PLAY_STORE: PLAY_STORE || '',
  
  // Apple App Store link  
  APP_STORE: APP_STORE || '',
  
  // Universal link (can be used for smart app banners)
  UNIVERSAL: UNIVERSAL || '',
};
