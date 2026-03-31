/**
 * Main Screen Analytics Events
 * 
 * Comprehensive event tracking for all main screens:
 * Home, Horoscope, Love, Chat, Chiromancy, CosmicGuide, Profile
 * 
 * Integrates both Facebook Analytics and Firebase Analytics
 * 
 * Event naming convention: {screen_name}_{action}
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
  
  // Log to both services
  await Promise.all([
    facebookAnalytics.logCustomEvent(eventName, enrichedParams),
    firebase.logEvent(eventName, enrichedParams),
  ]);
};

/**
 * ====================
 * HOME SCREEN
 * ====================
 */

/**
 * Track when user views Home screen
 */
export const trackHomeView = async () => {
  await logEvent('home_screen_view', {
    screen_name: 'home',
    screen_category: 'main',
  });
};

/**
 * Track when user taps a feature card on Home
 */
export const trackHomeFeatureCardTap = async (featureName: string) => {
  await logEvent('home_feature_card_tap', {
    screen_name: 'home',
    feature_name: featureName,
  });
};

/**
 * Track when user taps Cosmic Guide on Home
 */
export const trackHomeCosmicGuideTap = async (guideId: string, guideName: string) => {
  await logEvent('home_cosmic_guide_tap', {
    screen_name: 'home',
    guide_id: guideId,
    guide_name: guideName,
  });
};

/**
 * Track when user taps daily horoscope on Home
 */
export const trackHomeDailyHoroscopeTap = async (zodiacSign: string) => {
  await logEvent('home_daily_horoscope_tap', {
    screen_name: 'home',
    zodiac_sign: zodiacSign,
  });
};

/**
 * ====================
 * HOROSCOPE SCREEN
 * ====================
 */

/**
 * Track when user views Horoscope screen
 */
export const trackHoroscopeView = async (zodiacSign: string) => {
  await logEvent('horoscope_screen_view', {
    screen_name: 'horoscope',
    screen_category: 'main',
    zodiac_sign: zodiacSign,
  });
};

/**
 * Track when user changes horoscope tab (today/tomorrow/weekly)
 */
export const trackHoroscopeTabChange = async (tab: string, zodiacSign: string) => {
  await logEvent('horoscope_tab_change', {
    screen_name: 'horoscope',
    selected_tab: tab,
    zodiac_sign: zodiacSign,
  });
};

/**
 * Track when user taps on a transit
 */
export const trackHoroscopeTransitTap = async (transitName: string, zodiacSign: string) => {
  await logEvent('horoscope_transit_tap', {
    screen_name: 'horoscope',
    transit_name: transitName,
    zodiac_sign: zodiacSign,
  });
};

/**
 * Track when user expands a horoscope section
 */
export const trackHoroscopeSectionExpand = async (sectionName: string, zodiacSign: string) => {
  await logEvent('horoscope_section_expand', {
    screen_name: 'horoscope',
    section_name: sectionName,
    zodiac_sign: zodiacSign,
  });
};

/**
 * ====================
 * LOVE SCREEN
 * ====================
 */

/**
 * Track when user views Love screen
 */
export const trackLoveView = async () => {
  await logEvent('love_screen_view', {
    screen_name: 'love',
    screen_category: 'main',
  });
};

/**
 * Track when user changes Love tab (Quick Match / Deep Bond)
 */
export const trackLoveTabChange = async (tab: 'quick_match' | 'deep_bond') => {
  await logEvent('love_tab_change', {
    screen_name: 'love',
    selected_tab: tab,
  });
};

/**
 * Track when user selects a zodiac sign in Quick Match
 */
export const trackLoveSignSelect = async (signType: 'your' | 'their', signName: string) => {
  await logEvent('love_sign_select', {
    screen_name: 'love',
    sign_type: signType,
    sign_name: signName,
  });
};

/**
 * Track when user taps Match Now button
 */
export const trackLoveMatchNowTap = async (yourSign: string, theirSign: string) => {
  await logEvent('love_match_now_tap', {
    screen_name: 'love',
    your_sign: yourSign,
    their_sign: theirSign,
  });
};

/**
 * Track when user adds a new partner
 */
export const trackLoveAddPartnerTap = async () => {
  await logEvent('love_add_partner_tap', {
    screen_name: 'love',
  });
};

/**
 * Track when user selects a partner for Deep Bond
 */
export const trackLovePartnerSelect = async (partnerName: string, partnerSign: string) => {
  await logEvent('love_partner_select', {
    screen_name: 'love',
    partner_name: partnerName,
    partner_sign: partnerSign,
  });
};

/**
 * ====================
 * LOVE MATCH SCREEN
 * ====================
 */

/**
 * Track when user views Love Match results
 */
export const trackLoveMatchView = async (yourSign: string, theirSign: string, matchPercentage: number) => {
  await logEvent('love_match_screen_view', {
    screen_name: 'love_match',
    screen_category: 'love',
    your_sign: yourSign,
    their_sign: theirSign,
    match_percentage: matchPercentage,
  });
};

/**
 * Track when user taps Ask Oracle button
 */
export const trackLoveMatchAskOracleTap = async (yourSign: string, theirSign: string) => {
  await logEvent('love_match_ask_oracle_tap', {
    screen_name: 'love_match',
    your_sign: yourSign,
    their_sign: theirSign,
  });
};

/**
 * Track when user dismisses Love Match screen
 */
export const trackLoveMatchDismiss = async (yourSign: string, theirSign: string) => {
  await logEvent('love_match_dismiss', {
    screen_name: 'love_match',
    your_sign: yourSign,
    their_sign: theirSign,
  });
};

/**
 * ====================
 * ADD PARTNER SCREEN
 * ====================
 */

/**
 * Track when user views Add Partner screen
 */
export const trackAddPartnerView = async () => {
  await logEvent('add_partner_screen_view', {
    screen_name: 'add_partner',
    screen_category: 'love',
  });
};

/**
 * Track Add Partner step progress
 */
export const trackAddPartnerStep = async (step: 'name' | 'birthday' | 'location') => {
  await logEvent('add_partner_step', {
    screen_name: 'add_partner',
    step: step,
  });
};

/**
 * Track when partner is successfully added
 */
export const trackAddPartnerComplete = async (partnerSign: string, hasLocation: boolean) => {
  await logEvent('add_partner_complete', {
    screen_name: 'add_partner',
    partner_sign: partnerSign,
    has_location: hasLocation,
  });
};

/**
 * Track when user dismisses Add Partner screen
 */
export const trackAddPartnerDismiss = async (step: string) => {
  await logEvent('add_partner_dismiss', {
    screen_name: 'add_partner',
    dismissed_at_step: step,
  });
};

/**
 * ====================
 * CHAT SCREEN
 * ====================
 */

/**
 * Track when user views Chat screen
 */
export const trackChatView = async () => {
  await logEvent('chat_screen_view', {
    screen_name: 'chat',
    screen_category: 'main',
  });
};

/**
 * Track when user sends a message
 */
export const trackChatMessageSend = async (messageLength: number) => {
  await logEvent('chat_message_send', {
    screen_name: 'chat',
    message_length: messageLength,
  });
};

/**
 * Track when user taps a quick reply suggestion
 */
export const trackChatQuickReplyTap = async (replyText: string) => {
  await logEvent('chat_quick_reply_tap', {
    screen_name: 'chat',
    reply_text: replyText.substring(0, 50), // Limit length
  });
};

/**
 * Track when user receives AI response
 */
export const trackChatResponseReceived = async (responseTime: number) => {
  await logEvent('chat_response_received', {
    screen_name: 'chat',
    response_time_ms: responseTime,
  });
};

/**
 * ====================
 * CHIROMANCY SCREEN
 * ====================
 */

/**
 * Track when user views Chiromancy screen
 */
export const trackChiromancyView = async () => {
  await logEvent('chiromancy_screen_view', {
    screen_name: 'chiromancy',
    screen_category: 'main',
  });
};

/**
 * Track when user selects a hand (left/right)
 */
export const trackChiromancyHandSelect = async (hand: 'left' | 'right') => {
  await logEvent('chiromancy_hand_select', {
    screen_name: 'chiromancy',
    selected_hand: hand,
  });
};

/**
 * Track when user taps Scan Palm button
 */
export const trackChiromancyScanTap = async (hand: 'left' | 'right') => {
  await logEvent('chiromancy_scan_tap', {
    screen_name: 'chiromancy',
    selected_hand: hand,
  });
};

/**
 * ====================
 * PALM CAPTURE SCREEN
 * ====================
 */

/**
 * Track when user views Palm Capture screen
 */
export const trackPalmCaptureView = async (hand: 'left' | 'right') => {
  await logEvent('palm_capture_screen_view', {
    screen_name: 'palm_capture',
    screen_category: 'chiromancy',
    selected_hand: hand,
  });
};

/**
 * Track when user captures palm image
 */
export const trackPalmCaptureImage = async (hand: 'left' | 'right') => {
  await logEvent('palm_capture_image', {
    screen_name: 'palm_capture',
    selected_hand: hand,
  });
};

/**
 * Track when palm analysis starts
 */
export const trackPalmAnalysisStart = async (hand: 'left' | 'right') => {
  await logEvent('palm_analysis_start', {
    screen_name: 'palm_capture',
    selected_hand: hand,
  });
};

/**
 * Track when palm analysis completes
 */
export const trackPalmAnalysisComplete = async (hand: 'left' | 'right', analysisTime: number) => {
  await logEvent('palm_analysis_complete', {
    screen_name: 'palm_capture',
    selected_hand: hand,
    analysis_time_ms: analysisTime,
  });
};

/**
 * ====================
 * COSMIC GUIDE SCREEN
 * ====================
 */

/**
 * Track when user views Cosmic Guide screen (main list)
 */
export const trackCosmicGuideListView = async () => {
  await logEvent('cosmic_guide_list_view', {
    screen_name: 'cosmic_guide_list',
    screen_category: 'cosmic_guide',
  });
};

/**
 * Track when user taps a guide card
 */
export const trackCosmicGuideSelect = async (guideId: string, guideName: string) => {
  await logEvent('cosmic_guide_select', {
    screen_name: 'cosmic_guide_list',
    guide_id: guideId,
    guide_name: guideName,
  });
};

/**
 * ====================
 * COSMIC GUIDE DETAIL SCREEN
 * ====================
 */

/**
 * Track when user views Cosmic Guide Detail screen
 */
export const trackCosmicGuideDetailView = async (guideId: string, guideName: string, totalLessons: number) => {
  await logEvent('cosmic_guide_detail_view', {
    screen_name: 'cosmic_guide_detail',
    screen_category: 'cosmic_guide',
    guide_id: guideId,
    guide_name: guideName,
    total_lessons: totalLessons,
  });
};

/**
 * Track when user taps a lesson in guide detail
 */
export const trackCosmicGuideLessonTap = async (guideId: string, lessonId: string, lessonNumber: number) => {
  await logEvent('cosmic_guide_lesson_tap', {
    screen_name: 'cosmic_guide_detail',
    guide_id: guideId,
    lesson_id: lessonId,
    lesson_number: lessonNumber,
  });
};

/**
 * ====================
 * LESSON DETAIL SCREEN
 * ====================
 */

/**
 * Track when user views Lesson Detail screen
 */
export const trackLessonDetailView = async (guideId: string, lessonId: string, lessonTitle: string) => {
  await logEvent('lesson_detail_view', {
    screen_name: 'lesson_detail',
    screen_category: 'cosmic_guide',
    guide_id: guideId,
    lesson_id: lessonId,
    lesson_title: lessonTitle,
  });
};

/**
 * Track when user completes a lesson
 */
export const trackLessonComplete = async (guideId: string, lessonId: string, lessonNumber: number) => {
  await logEvent('lesson_complete', {
    screen_name: 'lesson_detail',
    guide_id: guideId,
    lesson_id: lessonId,
    lesson_number: lessonNumber,
  });
};

/**
 * Track when user dismisses lesson detail
 */
export const trackLessonDetailDismiss = async (guideId: string, lessonId: string, wasCompleted: boolean) => {
  await logEvent('lesson_detail_dismiss', {
    screen_name: 'lesson_detail',
    guide_id: guideId,
    lesson_id: lessonId,
    was_completed: wasCompleted,
  });
};

/**
 * ====================
 * PROFILE SCREEN
 * ====================
 */

/**
 * Track when user views Profile screen
 */
export const trackProfileView = async (zodiacSign: string) => {
  await logEvent('profile_screen_view', {
    screen_name: 'profile',
    screen_category: 'main',
    zodiac_sign: zodiacSign,
  });
};

/**
 * Track when user taps Edit Profile button
 */
export const trackProfileEditTap = async () => {
  await logEvent('profile_edit_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user saves profile changes
 */
export const trackProfileSave = async (changedFields: string[]) => {
  await logEvent('profile_save', {
    screen_name: 'profile',
    changed_fields: changedFields.join(','),
    fields_count: changedFields.length,
  });
};

/**
 * Track when user taps Settings
 */
export const trackProfileSettingsTap = async () => {
  await logEvent('profile_settings_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user taps subscription/premium
 */
export const trackProfileSubscriptionTap = async () => {
  await logEvent('profile_subscription_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user taps notifications settings
 */
export const trackProfileNotificationsTap = async () => {
  await logEvent('profile_notifications_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user taps restore purchases
 */
export const trackProfileRestorePurchasesTap = async () => {
  await logEvent('profile_restore_purchases_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user taps privacy policy
 */
export const trackProfilePrivacyPolicyTap = async () => {
  await logEvent('profile_privacy_policy_tap', {
    screen_name: 'profile',
  });
};

/**
 * Track when user taps terms of service
 */
export const trackProfileTermsTap = async () => {
  await logEvent('profile_terms_tap', {
    screen_name: 'profile',
  });
};
