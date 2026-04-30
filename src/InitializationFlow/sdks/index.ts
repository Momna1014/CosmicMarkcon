export { setupFirebaseCrashlytics, setupFirebaseAnalytics } from './setupFirebase';
export { setupSentryAnonymous, enableSentryFullTracking } from './setupSentry';
// @feature:admob:start
export { setupAdMob } from './setupAdMob';
// @feature:admob:end
// @feature:applovin-max:start [disabled]
// export { setupAppLovin } from './setupAppLovin';
// @feature:applovin-max:end
// @feature:adjust:start
export { setupAdjust, trackAdjustEvent, trackAdjustAdRevenue, setAdjustPushToken, sendAdjustGdprForgetMe } from './setupAdjust';
// @feature:adjust:end
// @feature:appsflyer:start [disabled]
// // AppsFlyer — kept for reference, replaced by Adjust in active use
// export { setupAppsFlyer } from './setupAppsFlyer';
// @feature:appsflyer:end
export { setupFacebook } from './setupFacebook';
export { setupRevenueCat } from './setupRevenueCat';
export { setupRemoteConfig } from './setupRemoteConfig';
