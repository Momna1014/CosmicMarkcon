/**
 * Paywall Source-Suffixed Events
 *
 * Dual-sends each event to Facebook + Firebase. Suffix `{src}` is one of:
 *   - 'onboarding'           when source === 'onboarding_complete'
 *   - 'bt_home_ch_profile'   when bottomTabSource === 'home'
 *   - 'splash'               otherwise (kill+reopen / cold-launch into paywall)
 *
 * Events:
 *   - paywall_viewed                         (skipped when src === 'onboarding')
 *   - pw_viewed_{src}
 *   - pw_dismissed_{src}
 *   - pw_purchase_completed_{src}
 *   - pw_purchase_cancelled_{src}
 *   - pw_purchase_restored_{src}
 */

import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';
import firebase from '../services/firebase/FirebaseService';
import type { BottomTabSource } from './mainScreenAnalytics';

export type PaywallSrcSuffix = 'onboarding' | 'bt_home_ch_profile' | 'splash';

export interface PaywallContext {
  source?: string;
  bottomTabSource?: BottomTabSource;
}

export const resolvePaywallSrc = (ctx: PaywallContext): PaywallSrcSuffix => {
  if (ctx.source === 'onboarding_complete') return 'onboarding';
  if (ctx.bottomTabSource === 'home') return 'bt_home_ch_profile';
  return 'splash';
};

const logPaywallEvent = async (eventName: string) => {
  const enrichedParams = {
    platform: Platform.OS,
    timestamp: Date.now(),
  };
  console.log(`🎯 [Paywall Event] ${eventName} → sending to Facebook + Firebase`, enrichedParams);
  await Promise.all([
    facebookAnalytics.logCustomEvent(eventName, enrichedParams),
    firebase.logEvent(eventName, enrichedParams),
  ]);
};

export const trackPaywallViewed = async (ctx: PaywallContext) => {
  if (resolvePaywallSrc(ctx) === 'onboarding') return;
  await logPaywallEvent('paywall_viewed');
};

export const trackPaywallViewedVia = async (ctx: PaywallContext) => {
  await logPaywallEvent(`pw_viewed_${resolvePaywallSrc(ctx)}`);
};

export const trackPaywallDismissedVia = async (ctx: PaywallContext) => {
  await logPaywallEvent(`pw_dismissed_${resolvePaywallSrc(ctx)}`);
};

export const trackPurchaseCompletedVia = async (ctx: PaywallContext) => {
  await logPaywallEvent(`pw_purchase_completed_${resolvePaywallSrc(ctx)}`);
};

export const trackPurchaseCancelledVia = async (ctx: PaywallContext) => {
  await logPaywallEvent(`pw_purchase_cancelled_${resolvePaywallSrc(ctx)}`);
};

export const trackPurchaseRestoredVia = async (ctx: PaywallContext) => {
  await logPaywallEvent(`pw_purchase_restored_${resolvePaywallSrc(ctx)}`);
};
