export const ANALYTICS_EVENTS = {
  /** User accepted Usercentrics consent on splash */
  SPLASH: 'splash',
  /** App launched */
  APP_OPENED: 'app_opened',
  /** Onboarding screen mounted */
  ONBOARDING_STARTED: 'onboarding_started',
  /** User tapped "Start Learning" */
  ONBOARDING_COMPLETED: 'onboarding_completed',
  /** QuranHome screen mounted */
  HOME_VIEWED: 'home_viewed',

  // ============================================================================
  // SUBSCRIPTION / PAYWALL EVENTS
  // ============================================================================
  // NOTE: Paywall events are defined in src/utils/paywallAnalytics.ts (PAYWALL_EVENTS)
  // They are listed here for reference only — DO NOT duplicate logging.
  // paywall_viewed, paywall_dismissed, purchase_started, purchase_completed,
  // purchase_failed, purchase_cancelled, restore_started, restore_completed,
  // restore_failed, feature_blocked, hard_paywall_shown, discount_paywall_shown

  // ============================================================================
  // SETTINGS & MISC EVENTS
  // ============================================================================

  /** SettingsProfile tab opened */
  SETTINGS_OPENED: 'settings_opened',
  /** Upgrade button pressed */
  UPGRADE_TAPPED: 'upgrade_tapped',
  /** Share action triggered */
  SHARE_TAPPED: 'share_tapped',

  // ============================================================================
  // TRIAL EVENTS
  // ============================================================================

  /** User started a free trial */
  TRIAL_STARTED: 'trial_started',
  /** Free trial ended (converted to paid or expired) */
  TRIAL_ENDED: 'trial_ended',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
