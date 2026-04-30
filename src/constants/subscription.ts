/**
 * Subscription & Paywall Constants
 * 
 * Central location for all subscription-related constants.
 * Must match RevenueCat Dashboard configuration.
 * 
 * @module subscription
 */

// ============================================================================
// ENTITLEMENT IDS
// ============================================================================

/**
 * RevenueCat Entitlement IDs
 * These must match exactly what's configured in RevenueCat Dashboard
 */
export const ENTITLEMENT_IDS = {
  /** Main premium entitlement - grants access to all premium features */
  PREMIUM: 'premium',
  /** Pro tier (if you have multiple tiers) */
  PRO: 'pro',
  /** All access (lifetime) */
  ALL_ACCESS: 'all_access',
} as const;

export type EntitlementId = typeof ENTITLEMENT_IDS[keyof typeof ENTITLEMENT_IDS];

// ============================================================================
// OFFERING IDS
// ============================================================================

/**
 * RevenueCat Offering IDs
 * Different offerings can show different products/prices
 */
export const OFFERING_IDS = {
  /** Default offering - shown to most users */
  DEFAULT: 'default',
  /** Discount offering - shown after hard paywall dismiss */
  DISCOUNT: 'discount',
  /** Trial offering - with free trial */
  TRIAL: 'trial',
  /** Onboarding specific offering */
  ONBOARDING: 'onboarding',
} as const;

export type OfferingId = typeof OFFERING_IDS[keyof typeof OFFERING_IDS];

// ============================================================================
// PRODUCT IDS
// ============================================================================

/**
 * Product IDs (must match App Store Connect / Google Play Console)
 */
export const PRODUCT_IDS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
  LIFETIME: 'premium_lifetime',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

// ============================================================================
// PAYWALL SOURCES
// ============================================================================

/**
 * Analytics sources - where paywall was triggered from
 * Use these for consistent analytics tracking
 */
export const PAYWALL_SOURCES = {
  // Onboarding
  ONBOARDING: 'onboarding',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  // App Open (show paywall when app opens)
  APP_OPEN: 'app_open',
  
  // Settings
  SETTINGS: 'settings',
  SETTINGS_SUBSCRIPTION: 'settings_subscription',
  SETTINGS_UPGRADE: 'settings_upgrade',
  
  // Feature Locks
  FEATURE_LOCK: 'feature_lock',
  AI_CORRECTION: 'ai_correction',
  AUDIO_PLAYBACK: 'audio_playback',
  UNLIMITED_RECORDING: 'unlimited_recording',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  OFFLINE_DOWNLOAD: 'offline_download',
  
  // Usage Limits
  RECORDING_LIMIT: 'recording_limit',
  DAILY_LIMIT: 'daily_limit',
  
  // Promotional
  PROMO: 'promo',
  DISCOUNT: 'discount',
  HARD_PAYWALL_DISMISSED: 'hard_paywall_dismissed',
  
  // Navigation
  HOME: 'home',
  HOME_BANNER: 'home_banner',  
  // External
  DEEP_LINK: 'deep_link',
  PUSH_NOTIFICATION: 'push_notification',

  DISCOUNT_OFFER: 'discount_offer',  
  // Unknown/Default
  UNKNOWN: 'unknown',
} as const;

export type PaywallSource = typeof PAYWALL_SOURCES[keyof typeof PAYWALL_SOURCES];

// ============================================================================
// PAYWALL TYPES
// ============================================================================

/**
 * Types of paywalls for analytics
 */
export const PAYWALL_TYPES = {
  /** User can dismiss and continue */
  SOFT: 'soft',
  /** User cannot dismiss - shows discount on dismiss */
  HARD: 'hard',
  /** Discounted offering paywall */
  DISCOUNT: 'discount',
  /** Footer-style paywall */
  FOOTER: 'footer',
} as const;

export type PaywallType = typeof PAYWALL_TYPES[keyof typeof PAYWALL_TYPES];

// ============================================================================
// PREMIUM FEATURES
// ============================================================================

/**
 * Premium feature identifiers for gating
 */
export const PREMIUM_FEATURES = {
  /** AI-powered correction feedback */
  AI_CORRECTION: 'ai_correction',
  /** Audio playback of ayahs */
  AUDIO_PLAYBACK: 'audio_playback',
  /** Unlimited recording attempts */
  UNLIMITED_RECORDING: 'unlimited_recording',
  /** Advanced analytics & progress tracking */
  ADVANCED_ANALYTICS: 'advanced_analytics',
  /** Download surahs for offline use */
  OFFLINE_DOWNLOAD: 'offline_download',
  /** Ad-free experience */
  AD_FREE: 'ad_free',
  /** Multiple reciter voices */
  MULTIPLE_RECITERS: 'multiple_reciters',
  RECITATION: 'recitation',
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * MMKV Storage keys for subscription/paywall state
 */
export const SUBSCRIPTION_STORAGE_KEYS = {
  /** Number of times paywall was dismissed */
  DISMISSAL_COUNT: 'paywall_dismissal_count',
  /** Whether onboarding paywall has been shown */
  ONBOARDING_PAYWALL_SEEN: 'paywall_onboarding_seen',
  /** Timestamp of last paywall shown */
  LAST_SHOWN: 'paywall_last_shown',
  /** Cached premium status */
  IS_PREMIUM: 'subscription_is_premium',
  /** Last customer info sync timestamp */
  LAST_SYNC: 'subscription_last_sync',
  /** Flag to show paywall when landing on QuranHome (set after onboarding) */
  SHOW_PAYWALL_ON_HOME: 'paywall_show_on_home',
  /** Flag indicating post-onboarding permissions (ATT/notifications) are complete */
  PERMISSIONS_COMPLETE: 'paywall_permissions_complete',
  /** Session ID for tracking paywall shown per app session */
  APP_SESSION_ID: 'paywall_app_session_id',
  /** Flag indicating paywall was shown this session */
  PAYWALL_SHOWN_THIS_SESSION: 'paywall_shown_this_session',
} as const;

export type SubscriptionStorageKey = typeof SUBSCRIPTION_STORAGE_KEYS[keyof typeof SUBSCRIPTION_STORAGE_KEYS];

// ============================================================================
// PAYWALL RULES
// ============================================================================

/**
 * Business rules for paywall behavior
 */
export const PAYWALL_RULES = {
  /** Number of dismissals before showing discount paywall */
  DISMISSALS_BEFORE_DISCOUNT: 2,
  /** Minimum seconds between showing paywalls */
  MIN_SECONDS_BETWEEN_PAYWALLS: 60,
  /** Maximum recording attempts for free users */
  FREE_RECORDING_LIMIT: 3,
  /** Days of free trial */
  FREE_TRIAL_DAYS: 7,
} as const;

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export default {
  ENTITLEMENT_IDS,
  OFFERING_IDS,
  PRODUCT_IDS,
  PAYWALL_SOURCES,
  PAYWALL_TYPES,
  PREMIUM_FEATURES,
  SUBSCRIPTION_STORAGE_KEYS,
  PAYWALL_RULES,
};
