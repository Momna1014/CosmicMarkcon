/**
 * Main Screen Analytics Events
 *
 * View event tracking for bottom tab screens and their child stack screens.
 * Integrates both Facebook Analytics and Firebase Analytics.
 *
 * Event formats:
 *   - Bottom tab view:  bt_{screen_name}_viewed         (e.g. bt_home_viewed)
 *   - Child stack view: bt_{bottom_tab}_ch_{child}      (e.g. bt_home_ch_profile)
 */

import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';
import firebase from '../services/firebase/FirebaseService';

export type BottomTabSource = 'home' | 'horoscope' | 'love' | 'chiromancy' | 'chat';

const logBottomTabEvent = async (eventName: string) => {
  const enrichedParams = {
    platform: Platform.OS,
    timestamp: Date.now(),
  };
  console.log(`🎯 [Bottom Tab Event] ${eventName} → sending to Facebook + Firebase`, enrichedParams);
  await Promise.all([
    facebookAnalytics.logCustomEvent(eventName, enrichedParams),
    firebase.logEvent(eventName, enrichedParams),
  ]);
};

// ─────────────────────────────────────────────
// BOTTOM TAB VIEWED EVENTS
// Fires once when each bottom tab screen mounts.
// ─────────────────────────────────────────────

export const trackHomeTabView = async () => {
  await logBottomTabEvent('bt_home_viewed');
};

export const trackHoroscopeTabView = async () => {
  await logBottomTabEvent('bt_horoscope_viewed');
};

export const trackLoveTabView = async () => {
  await logBottomTabEvent('bt_love_viewed');
};

export const trackChiromancyTabView = async () => {
  await logBottomTabEvent('bt_chiromancy_viewed');
};

export const trackChatTabView = async () => {
  await logBottomTabEvent('bt_chat_viewed');
};

// ─────────────────────────────────────────────
// BOTTOM TAB CHILD SCREEN VIEWED EVENTS
// Fires once when a stack screen reachable from a bottom tab mounts.
// `bottomTab` identifies the originating tab (passed via route param for
// shared screens like Chat / ReportProblem / Paywall).
// ─────────────────────────────────────────────

export const trackBtChildView = async (
  bottomTab: BottomTabSource,
  childScreen: string,
) => {
  await logBottomTabEvent(`bt_${bottomTab}_ch_${childScreen}`);
};
