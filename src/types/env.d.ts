/**
 * Environment Variables Type Definitions
 * 
 * Ensures type safety for @env imports from react-native-dotenv
 * Values are loaded from .env file at build time
 */
declare module '@env' {
  // API Configuration (Required)
  export const API_BASE_URL: string
  export const MANGA_API_BASE_URL: string

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
  
  // Advertising (AppLovin MAX)
  export const APPLOVIN_SDK_KEY: string
  export const APPLOVIN_BANNER_AD_UNIT_IOS: string
  export const APPLOVIN_BANNER_AD_UNIT_ANDROID: string
  export const APPLOVIN_INTERSTITIAL_AD_UNIT_IOS: string
  export const APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID: string
  export const APPLOVIN_REWARDED_AD_UNIT_IOS: string
  export const APPLOVIN_REWARDED_AD_UNIT_ANDROID: string
  export const APPLOVIN_APP_OPEN_AD_UNIT_IOS: string
  export const APPLOVIN_APP_OPEN_AD_UNIT_ANDROID: string
  
  // Facebook SDK
  export const FACEBOOK_APP_ID: string
  export const FACEBOOK_CLIENT_TOKEN: string
  
  // Attribution (AppsFlyer)
  export const APPSFLYER_DEV_KEY: string
  export const APPSFLYER_APP_ID: string

  // Consent Management (Usercentrics)
  export const USER_CENTRIC: string

  // Social Sign-In (Optional - App works without these)
  // See SOCIAL_SIGNIN_GUIDE.md for setup instructions
  export const GOOGLE_WEB_CLIENT_ID: string  // From Google Cloud Console
  export const APPLE_SERVICE_ID: string      // From Apple Developer Portal
}
