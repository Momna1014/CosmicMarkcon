/**
 * Onboarding Analytics Events
 *
 * View event tracking for all onboarding screens.
 * Integrates both Facebook Analytics and Firebase Analytics.
 *
 * Event naming convention: onboarding_step{N}_{screen_name}
 */

import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';
import firebase from '../services/firebase/FirebaseService';

const logEvent = async (eventName: string, params: Record<string, any> = {}) => {
  const enrichedParams = {
    ...params,
    platform: Platform.OS,
    timestamp: Date.now(),
  };
  console.log(`🎯 [Onboarding Event] ${eventName} → sending to Facebook + Firebase`, enrichedParams);
  await Promise.all([
    facebookAnalytics.logCustomEvent(eventName, enrichedParams),
    firebase.logEvent(eventName, enrichedParams),
  ]);
};

// ─────────────────────────────────────────────
// SCREEN 1 – Welcome intro video
// ─────────────────────────────────────────────

export const trackOnboarding1View = async () => {
  await logEvent('onboarding_step1_welcome_video', { step: 1 });
};

// ─────────────────────────────────────────────
// SCREEN 2 – Seeking options selection
// ─────────────────────────────────────────────

export const trackOnboarding2View = async () => {
  await logEvent('onboarding_step2_seeking_options', { step: 2 });
};

// ─────────────────────────────────────────────
// SCREEN 3 – Clarity grid selection
// ─────────────────────────────────────────────

export const trackOnboarding3ClarityView = async () => {
  await logEvent('onboarding_step3_clarity_grid', { step: 3 });
};

// ─────────────────────────────────────────────
// AGREEMENT – Consent screen after onboarding 3
// ─────────────────────────────────────────────

export const trackAgreementAfterOnboarding3 = async () => {
  await logEvent('onboarding_step3_5_consent_agreement', { step: 3.5 });
};

// ─────────────────────────────────────────────
// SCREEN 4 – Gender selection
// ─────────────────────────────────────────────

export const trackOnboarding4GenderView = async () => {
  await logEvent('onboarding_step4_gender_selection', { step: 4 });
};

// ─────────────────────────────────────────────
// SCREEN 5 – Name input
// ─────────────────────────────────────────────

export const trackOnboarding5NameInputView = async () => {
  await logEvent('onboarding_step5_name_input', { step: 5 });
};

// ─────────────────────────────────────────────
// SCREEN 6 – Cosmic profile taking shape
// ─────────────────────────────────────────────

export const trackOnboarding6CosmicProfileView = async () => {
  await logEvent('onboarding_step6_cosmic_profile', { step: 6 });
};

// ─────────────────────────────────────────────
// SCREEN 7 – Birthday & zodiac selection
// ─────────────────────────────────────────────

export const trackOnboarding7BirthdayView = async () => {
  await logEvent('onboarding_step7_birthday_zodiac', { step: 7 });
};

// ─────────────────────────────────────────────
// SCREEN 8 – Birthplace selection
// ─────────────────────────────────────────────

export const trackOnboarding8BirthplaceView = async () => {
  await logEvent('onboarding_step8_birthplace_selection', { step: 8 });
};

// ─────────────────────────────────────────────
// SCREEN 9 – Daily insights preview
// ─────────────────────────────────────────────

export const trackOnboarding9InsightsPreviewView = async () => {
  await logEvent('onboarding_step9_insights_preview', { step: 9 });
};

// ─────────────────────────────────────────────
// SCREEN 10 – Love match video
// ─────────────────────────────────────────────

export const trackOnboarding10LoveMatchVideoView = async () => {
  await logEvent('onboarding_step10_love_match_video', { step: 10 });
};

// ─────────────────────────────────────────────
// SCREEN 11 – AI chat video
// ─────────────────────────────────────────────

export const trackOnboarding11AiVideoView = async () => {
  await logEvent('onboarding_step11_ai_chat_video', { step: 11 });
};

// ─────────────────────────────────────────────
// SCREEN 12 – Final video
// ─────────────────────────────────────────────

export const trackOnboarding12FinalVideoView = async () => {
  await logEvent('onboarding_step12_final_video', { step: 12 });
};
