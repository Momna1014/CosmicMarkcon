/**
 * Onboarding Analytics Events
 *
 * Simple view event tracking for all onboarding screens (1–12).
 * Integrates both Facebook Analytics and Firebase Analytics.
 *
 * Event naming convention: onboarding_{screen_number}_{what_is_on_screen}
 */

import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';
import firebase from '../services/firebase/FirebaseService';

/**
 * Helper to log to both Facebook and Firebase
 */
const logEvent = async (eventName: string, params: Record<string, any> = {}) => {
  const enrichedParams = {
    ...params,
    platform: Platform.OS,
    timestamp: Date.now(),
  };
  await Promise.all([
    facebookAnalytics.logCustomEvent(eventName, enrichedParams),
    firebase.logEvent(eventName, enrichedParams),
  ]);
};

// ─────────────────────────────────────────────
// FLOW
// ─────────────────────────────────────────────

export const trackOnboardingStarted = async () => {
  await logEvent('onboarding_started', { step: 0 });
};

// ─────────────────────────────────────────────
// SCREEN 1 – Welcome intro video
// ─────────────────────────────────────────────

export const trackOnboarding1View = async () => {
  await logEvent('onboarding_1_welcome_video', { step: 1 });
};

// ─────────────────────────────────────────────
// SCREEN 2 – Seeking options selection
// ─────────────────────────────────────────────

export const trackOnboarding2View = async () => {
  await logEvent('onboarding_2_seeking_options', { step: 2 });
};

// ─────────────────────────────────────────────
// SCREEN 3 – Clarity grid selection
// ─────────────────────────────────────────────

export const trackOnboarding3ClarityView = async () => {
  await logEvent('onboarding_3_clarity_grid', { step: 3 });
};

// ─────────────────────────────────────────────
// AGREEMENT – Consent screen after onboarding 3
// ─────────────────────────────────────────────

export const trackAgreementAfterOnboarding3 = async () => {
  await logEvent('agreement_after_onboarding_3', { step: 3.5 });
};

// ─────────────────────────────────────────────
// SCREEN 4 – Gender selection
// ─────────────────────────────────────────────

export const trackOnboarding4GenderView = async () => {
  await logEvent('onboarding_4_gender_selection', { step: 4 });
};

// ─────────────────────────────────────────────
// SCREEN 5 – Name input
// ─────────────────────────────────────────────

export const trackOnboarding5NameInputView = async () => {
  await logEvent('onboarding_5_name_input', { step: 5 });
};

// ─────────────────────────────────────────────
// SCREEN 6 – Cosmic profile taking shape
// ─────────────────────────────────────────────

export const trackOnboarding6CosmicProfileView = async () => {
  await logEvent('onboarding_6_cosmic_profile', { step: 6 });
};

// ─────────────────────────────────────────────
// SCREEN 7 – Birthday & zodiac selection
// ─────────────────────────────────────────────

export const trackOnboarding7BirthdayView = async () => {
  await logEvent('onboarding_7_birthday_zodiac', { step: 7 });
};

// ─────────────────────────────────────────────
// SCREEN 8 – Birthplace selection
// ─────────────────────────────────────────────

export const trackOnboarding8BirthplaceView = async () => {
  await logEvent('onboarding_8_birthplace_selection', { step: 8 });
};

// ─────────────────────────────────────────────
// SCREEN 9 – Daily insights preview
// ─────────────────────────────────────────────

export const trackOnboarding9InsightsPreviewView = async () => {
  await logEvent('onboarding_9_insights_preview', { step: 9 });
};

// ─────────────────────────────────────────────
// SCREEN 10 – Love match video
// ─────────────────────────────────────────────

export const trackOnboarding10LoveMatchVideoView = async () => {
  await logEvent('onboarding_10_love_match_video', { step: 10 });
};

// ─────────────────────────────────────────────
// SCREEN 11 – AI chat video
// ─────────────────────────────────────────────

export const trackOnboarding11AiVideoView = async () => {
  await logEvent('onboarding_11_ai_chat_video', { step: 11 });
};

// ─────────────────────────────────────────────
// SCREEN 12 – Final video
// ─────────────────────────────────────────────

export const trackOnboarding12FinalVideoView = async () => {
  await logEvent('onboarding_12_final_video', { step: 12 });
};

