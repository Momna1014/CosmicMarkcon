/**
 * Onboarding Analytics Events
 * 
 * Comprehensive event tracking for all onboarding screens (1-11)
 * Integrates both Facebook Analytics and Firebase Analytics
 * 
 * Event naming convention: onboarding_{screen_number}_{action}
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
 * SCREEN 1: LIFE ALIGNMENT
 * ====================
 */

/**
 * Track when user views Screen 1
 */
export const trackOnboarding1View = async () => {
  await logEvent('onboarding_1_view', {
    screen_name: 'life_alignment',
    step: 1,
    total_steps: 11,
  });
};

/**
 * Track when user selects an alignment option
 */
export const trackOnboarding1AlignmentSelected = async (
  alignment: 'in-my-flow' | 'figuring-it-out' | 'totally-lost'
) => {
  await logEvent('onboarding_1_alignment_selected', {
    alignment_choice: alignment,
    screen_name: 'life_alignment',
    step: 1,
  });
};

/**
 * ====================
 * SCREEN 2: NAME INPUT
 * ====================
 */

/**
 * Track when user views Screen 2
 */
export const trackOnboarding2View = async () => {
  await logEvent('onboarding_2_view', {
    screen_name: 'name_input',
    step: 2,
    total_steps: 11,
  });
};

/**
 * Track when user starts typing their name
 */
export const trackOnboarding2NameStarted = async () => {
  await logEvent('onboarding_2_name_started', {
    screen_name: 'name_input',
    step: 2,
  });
};

/**
 * Track when user submits their name
 */
export const trackOnboarding2NameSubmitted = async (nameLength: number) => {
  await logEvent('onboarding_2_name_submitted', {
    name_length: nameLength,
    screen_name: 'name_input',
    step: 2,
  });
};

/**
 * ====================
 * SCREEN 3: BIRTHDAY INPUT
 * ====================
 */

/**
 * Track when user views Screen 3
 */
export const trackOnboarding3View = async () => {
  await logEvent('onboarding_3_view', {
    screen_name: 'birthday_input',
    step: 3,
    total_steps: 11,
  });
};

/**
 * Track when user selects a birthday
 */
export const trackOnboarding3BirthdaySelected = async (zodiacSign: string) => {
  await logEvent('onboarding_3_birthday_selected', {
    zodiac_sign: zodiacSign,
    screen_name: 'birthday_input',
    step: 3,
  });
};

/**
 * Track when user proceeds from birthday screen
 */
export const trackOnboarding3Continue = async (zodiacSign: string) => {
  await logEvent('onboarding_3_continue', {
    zodiac_sign: zodiacSign,
    screen_name: 'birthday_input',
    step: 3,
  });
};

/**
 * ====================
 * SCREEN 4: COSMIC INSIGHT (Typewriter)
 * ====================
 */

/**
 * Track when user views Screen 4
 */
export const trackOnboarding4View = async (zodiacSign: string, insightNumber: number) => {
  await logEvent('onboarding_4_view', {
    screen_name: 'cosmic_insight',
    zodiac_sign: zodiacSign,
    insight_number: insightNumber,
    step: 4,
    total_steps: 11,
  });
};

/**
 * Track when typewriter animation completes
 */
export const trackOnboarding4TypewriterComplete = async (zodiacSign: string) => {
  await logEvent('onboarding_4_typewriter_complete', {
    zodiac_sign: zodiacSign,
    screen_name: 'cosmic_insight',
    step: 4,
  });
};

/**
 * Track auto-navigation from Screen 4
 */
export const trackOnboarding4AutoNavigate = async () => {
  await logEvent('onboarding_4_auto_navigate', {
    screen_name: 'cosmic_insight',
    step: 4,
  });
};

/**
 * ====================
 * SCREEN 5: COSMIC MAP REVEAL
 * ====================
 */

/**
 * Track when user views Screen 5
 */
export const trackOnboarding5View = async () => {
  await logEvent('onboarding_5_view', {
    screen_name: 'cosmic_map_reveal',
    step: 5,
    total_steps: 11,
  });
};

/**
 * Track when user taps "Discover my map"
 */
export const trackOnboarding5DiscoverMapClicked = async () => {
  await logEvent('onboarding_5_discover_map_clicked', {
    screen_name: 'cosmic_map_reveal',
    step: 5,
  });
};

/**
 * ====================
 * SCREEN 6: COSMIC LAYERS
 * ====================
 */

/**
 * Track when user views Screen 6
 */
export const trackOnboarding6View = async () => {
  await logEvent('onboarding_6_view', {
    screen_name: 'cosmic_layers',
    step: 6,
    total_steps: 11,
  });
};

/**
 * Track when user taps "Deepen my analysis"
 */
export const trackOnboarding6DeepenAnalysisClicked = async () => {
  await logEvent('onboarding_6_deepen_analysis_clicked', {
    screen_name: 'cosmic_layers',
    step: 6,
  });
};

/**
 * ====================
 * SCREEN 7: EASTERN ASTROLOGY
 * ====================
 */

/**
 * Track when user views Screen 7
 */
export const trackOnboarding7View = async (
  westernSign: string,
  easternSign: string,
  combinationPercentage: number
) => {
  await logEvent('onboarding_7_view', {
    screen_name: 'eastern_astrology',
    western_sign: westernSign,
    eastern_sign: easternSign,
    combination_percentage: combinationPercentage,
    step: 7,
    total_steps: 11,
  });
};

/**
 * Track when user continues from Screen 7
 */
export const trackOnboarding7Continue = async (
  westernSign: string,
  easternSign: string
) => {
  await logEvent('onboarding_7_continue', {
    western_sign: westernSign,
    eastern_sign: easternSign,
    screen_name: 'eastern_astrology',
    step: 7,
  });
};

/**
 * ====================
 * SCREEN 8: ENERGY PATTERN
 * ====================
 */

/**
 * Track when user views Screen 8
 */
export const trackOnboarding8View = async (element: string) => {
  await logEvent('onboarding_8_view', {
    screen_name: 'energy_pattern',
    element: element, // Fire, Earth, Air, Water
    step: 8,
    total_steps: 11,
  });
};

/**
 * Track when user continues from Screen 8
 */
export const trackOnboarding8Continue = async (element: string) => {
  await logEvent('onboarding_8_continue', {
    element: element,
    screen_name: 'energy_pattern',
    step: 8,
  });
};

/**
 * ====================
 * SCREEN 9: BIRTH TIME & PLACE
 * ====================
 */

/**
 * Track when user views Screen 9
 */
export const trackOnboarding9View = async () => {
  await logEvent('onboarding_9_view', {
    screen_name: 'birth_time_place',
    step: 9,
    total_steps: 11,
  });
};

/**
 * Track when user opens time picker
 */
export const trackOnboarding9TimePickerOpened = async () => {
  await logEvent('onboarding_9_time_picker_opened', {
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user selects birth time
 */
export const trackOnboarding9TimeSelected = async (ampm: string) => {
  await logEvent('onboarding_9_time_selected', {
    time_period: ampm, // AM or PM
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user opens country picker
 */
export const trackOnboarding9CountryPickerOpened = async () => {
  await logEvent('onboarding_9_country_picker_opened', {
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user selects country
 */
export const trackOnboarding9CountrySelected = async (countryCode: string) => {
  await logEvent('onboarding_9_country_selected', {
    country_code: countryCode,
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user opens city picker
 */
export const trackOnboarding9CityPickerOpened = async () => {
  await logEvent('onboarding_9_city_picker_opened', {
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user selects city
 */
export const trackOnboarding9CitySelected = async (countryCode: string) => {
  await logEvent('onboarding_9_city_selected', {
    country_code: countryCode,
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * Track when user completes Screen 9
 */
export const trackOnboarding9Continue = async (
  hasTime: boolean,
  hasCountry: boolean,
  hasCity: boolean
) => {
  await logEvent('onboarding_9_complete_reading_clicked', {
    has_time: hasTime ? 1 : 0,
    has_country: hasCountry ? 1 : 0,
    has_city: hasCity ? 1 : 0,
    screen_name: 'birth_time_place',
    step: 9,
  });
};

/**
 * ====================
 * SCREEN 10: LOADING & ALIGNMENT RESULT
 * ====================
 */

/**
 * Track when user views Screen 10 (loading starts)
 */
export const trackOnboarding10View = async () => {
  await logEvent('onboarding_10_view', {
    screen_name: 'alignment_result',
    step: 10,
    total_steps: 11,
  });
};

/**
 * Track when loading animation starts
 */
export const trackOnboarding10LoadingStarted = async () => {
  await logEvent('onboarding_10_loading_started', {
    screen_name: 'alignment_result',
    step: 10,
  });
};

/**
 * Track when loading animation completes
 */
export const trackOnboarding10LoadingComplete = async () => {
  await logEvent('onboarding_10_loading_complete', {
    screen_name: 'alignment_result',
    step: 10,
  });
};

/**
 * Track when user continues from Screen 10
 */
export const trackOnboarding10Continue = async () => {
  await logEvent('onboarding_10_continue', {
    screen_name: 'alignment_result',
    step: 10,
  });
};

/**
 * ====================
 * SCREEN 11: ENERGETIC SIGNATURE (Final)
 * ====================
 */

/**
 * Track when user views Screen 11
 */
export const trackOnboarding11View = async () => {
  await logEvent('onboarding_11_view', {
    screen_name: 'energetic_signature',
    step: 11,
    total_steps: 11,
  });
};

/**
 * Track when user completes onboarding
 */
export const trackOnboarding11Complete = async () => {
  await logEvent('onboarding_11_explore_readings_clicked', {
    screen_name: 'energetic_signature',
    step: 11,
  });
  
  // Also track overall completion
  await logEvent('onboarding_completed', {
    total_steps: 11,
    completed_at: Date.now(),
  });
};

/**
 * ====================
 * ONBOARDING FLOW EVENTS
 * ====================
 */

/**
 * Track onboarding started
 */
export const trackOnboardingStarted = async () => {
  await logEvent('onboarding_started', {
    started_at: Date.now(),
    total_steps: 11,
  });
};

/**
 * Track onboarding drop-off (if user exits before completing)
 */
export const trackOnboardingDropOff = async (lastScreen: number) => {
  await logEvent('onboarding_drop_off', {
    last_screen: lastScreen,
    dropped_at: Date.now(),
  });
};

/**
 * Track successful onboarding completion with all data
 */
export const trackOnboardingCompleteWithData = async (data: {
  alignment: string | null;
  hasName: boolean;
  zodiacSign: string;
  easternSign: string;
  hasTime: boolean;
  hasLocation: boolean;
}) => {
  await logEvent('onboarding_complete_with_data', {
    alignment: data.alignment || 'unknown',
    has_name: data.hasName ? 1 : 0,
    zodiac_sign: data.zodiacSign,
    eastern_sign: data.easternSign,
    has_birth_time: data.hasTime ? 1 : 0,
    has_location: data.hasLocation ? 1 : 0,
  });
};

// Export all tracking functions
export default {
  // Flow events
  trackOnboardingStarted,
  trackOnboardingDropOff,
  trackOnboardingCompleteWithData,
  
  // Screen 1
  trackOnboarding1View,
  trackOnboarding1AlignmentSelected,
  
  // Screen 2
  trackOnboarding2View,
  trackOnboarding2NameStarted,
  trackOnboarding2NameSubmitted,
  
  // Screen 3
  trackOnboarding3View,
  trackOnboarding3BirthdaySelected,
  trackOnboarding3Continue,
  
  // Screen 4
  trackOnboarding4View,
  trackOnboarding4TypewriterComplete,
  trackOnboarding4AutoNavigate,
  
  // Screen 5
  trackOnboarding5View,
  trackOnboarding5DiscoverMapClicked,
  
  // Screen 6
  trackOnboarding6View,
  trackOnboarding6DeepenAnalysisClicked,
  
  // Screen 7
  trackOnboarding7View,
  trackOnboarding7Continue,
  
  // Screen 8
  trackOnboarding8View,
  trackOnboarding8Continue,
  
  // Screen 9
  trackOnboarding9View,
  trackOnboarding9TimePickerOpened,
  trackOnboarding9TimeSelected,
  trackOnboarding9CountryPickerOpened,
  trackOnboarding9CountrySelected,
  trackOnboarding9CityPickerOpened,
  trackOnboarding9CitySelected,
  trackOnboarding9Continue,
  
  // Screen 10
  trackOnboarding10View,
  trackOnboarding10LoadingStarted,
  trackOnboarding10LoadingComplete,
  trackOnboarding10Continue,
  
  // Screen 11
  trackOnboarding11View,
  trackOnboarding11Complete,
};
