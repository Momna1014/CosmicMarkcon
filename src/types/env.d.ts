/**
 * Environment Variables Type Definitions
 * 
 * Ensures type safety for @env imports from react-native-dotenv
 * Values are loaded from .env file at build time
 */
declare module '@env' {
  // API Configuration (Required)
  export const API_BASE_URL: string

  // Analytics & Monitoring (Optional)
  export const SENTRY_DSN: string
  export const SENTRY_URL: string
  export const SENTRY_ORG: string
  export const SENTRY_PROJECT: string
  export const SENTRY_AUTH_TOKEN: string
  export const FIREBASE_API_KEY: string
  export const FIREBASE_APP_ID: string
  export const FIREBASE_PROJECT_ID: string
  
  // In-App Purchases (RevenueCat)
  export const REVENUECAT_IOS_KEY: string
  export const REVENUECAT_ANDROID_KEY: string
  
  // Advertising (Google AdMob)
  // @feature:admob:start [disabled]
  // export const ADMOB_APP_ID_IOS: string
  // export const ADMOB_APP_ID_ANDROID: string
  // export const ADMOB_BANNER_AD_UNIT_IOS: string
  // export const ADMOB_BANNER_AD_UNIT_ANDROID: string
  // export const ADMOB_INTERSTITIAL_AD_UNIT_IOS: string
  // export const ADMOB_INTERSTITIAL_AD_UNIT_ANDROID: string
  // export const ADMOB_REWARDED_AD_UNIT_IOS: string
  // export const ADMOB_REWARDED_AD_UNIT_ANDROID: string
  // export const ADMOB_APP_OPEN_AD_UNIT_IOS: string
  // export const ADMOB_APP_OPEN_AD_UNIT_ANDROID: string
  // export const ADMOB_NATIVE_AD_UNIT_IOS: string
  // export const ADMOB_NATIVE_AD_UNIT_ANDROID: string
  // @feature:admob:end
  
  // Facebook SDK
  export const FACEBOOK_APP_ID: string
  export const FACEBOOK_CLIENT_TOKEN: string

  // @feature:adjust:start [disabled]
  // // Attribution (Adjust)
  // export const ADJUST_APP_TOKEN_ANDROID: string
  // export const ADJUST_APP_TOKEN_IOS: string
  // @feature:adjust:end

  // Consent Management (Usercentrics)
  export const USER_CENTRIC: string
  export const USER_CENTRIC_RULESET_ID_ANDROID: string
  export const USER_CENTRIC_RULESET_ID_IOS: string
  export const USER_CENTRIC_SETTINGS_ID: string
  export const USER_CENTRIC_IDENTITY_MODE: string

  // Social Sign-In (Optional - App works without these)
  // See SOCIAL_SIGNIN_GUIDE.md for setup instructions
  export const GOOGLE_WEB_CLIENT_ID: string  // From Google Cloud Console
  export const APPLE_SERVICE_ID: string      // From Apple Developer Portal

  // OpenAI API Key - NO LONGER STORED LOCALLY
  // Fetched securely from backend via OpenAIConfigService
  // export const OPENAI_API_KEY: string

  // App Store Links
  export const PLAY_STORE: string
  export const APP_STORE: string
  export const UNIVERSAL: string

    // GPT Keys API
  export const GPT_KEYS_BASE_URL: string
}
