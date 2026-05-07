/**
 * Paywall Source-Suffixed Events
 *
 * Dual-sends each event to Facebook + Firebase. Suffix `{src}` is one of:
 *   - 'onboarding'           when source === 'onboarding_complete'
 *   - 'bt_home_ch_profile'   when bottomTabSource === 'home'
 *   - 'splash'               otherwise (kill+reopen / cold-launch into paywall)
 *
 * Events:
 *   - paywall_viewed                         (generic, skipped when src === 'onboarding')
 *   - paywall_dismissed                      (generic, skipped when src === 'onboarding')
 *   - paywall_btn_tab                        (generic, skipped when src === 'onboarding')
 *   - paywall_purchase_completed             (generic, skipped when src === 'onboarding')
 *   - paywall_purchase_cancelled             (generic, skipped when src === 'onboarding')
 *   - paywall_purchase_restore               (generic, skipped when src === 'onboarding')
 *   - pw_viewed_{src}
 *   - pw_dismissed_{src}
 *   - pw_btn_tab_{src}                       (fires when user taps continue / free trial)
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

export const trackTrialBtnVia = async (ctx: PaywallContext) => {
  const src = resolvePaywallSrc(ctx);
  await Promise.all([
    logPaywallEvent(`pw_btn_tab_${src}`),
    src !== 'onboarding' ? logPaywallEvent('paywall_btn_tab') : Promise.resolve(),
  ]);
};

export const trackPaywallDismissedVia = async (ctx: PaywallContext) => {
  const src = resolvePaywallSrc(ctx);
  await Promise.all([
    logPaywallEvent(`pw_dismissed_${src}`),
    src !== 'onboarding' ? logPaywallEvent('paywall_dismissed') : Promise.resolve(),
  ]);
};

export const trackPurchaseCompletedVia = async (ctx: PaywallContext) => {
  const src = resolvePaywallSrc(ctx);
  await Promise.all([
    logPaywallEvent(`pw_purchase_completed_${src}`),
    src !== 'onboarding' ? logPaywallEvent('paywall_purchase_completed') : Promise.resolve(),
  ]);
};

export const trackPurchaseCancelledVia = async (ctx: PaywallContext) => {
  const src = resolvePaywallSrc(ctx);
  await Promise.all([
    logPaywallEvent(`pw_purchase_cancelled_${src}`),
    src !== 'onboarding' ? logPaywallEvent('paywall_purchase_cancelled') : Promise.resolve(),
  ]);
};

export const trackPurchaseRestoredVia = async (ctx: PaywallContext) => {
  const src = resolvePaywallSrc(ctx);
  await Promise.all([
    logPaywallEvent(`pw_purchase_restored_${src}`),
    src !== 'onboarding' ? logPaywallEvent('paywall_purchase_restore') : Promise.resolve(),
  ]);
};
