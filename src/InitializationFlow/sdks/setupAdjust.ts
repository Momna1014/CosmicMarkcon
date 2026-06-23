// @feature:adjust:start [disabled]
// import { Linking, Platform } from 'react-native';
// import {
//   Adjust,
//   AdjustConfig,
//   AdjustAdRevenue,
//   AdjustDeeplink,
//   AdjustEvent,
//   AdjustThirdPartySharing,
// } from 'react-native-adjust';
// import Purchases from 'react-native-purchases';
// import env from '../../config/env';
// import type { ConsentResult } from '../types';
// import {
//   isAdvertisingAllowed,
//   isAnalyticsAllowed,
// } from '../consent/consentPolicy';
//
// /**
//  * Initialize the Adjust SDK with consent-aware configuration.
//  *
//  * Called from deferredSDKs after splash hides (non-critical path).
//  * Adjust is the Mobile Measurement Partner (MMP) for the project.
//  *
//  * Note: Adjust v5 reads ATT status from the OS automatically —
//  * no need to pass attStatus explicitly.
//  */
// export async function setupAdjust(
//   consent: ConsentResult,
//   trackingAllowed: boolean,
// ): Promise<void> {
//   const appToken = Platform.OS === 'ios'
//     ? env.ADJUST_APP_TOKEN_IOS
//     : env.ADJUST_APP_TOKEN_ANDROID;
//
//   if (!appToken) {
//     console.warn('[InitializationFlow] Adjust app token missing for', Platform.OS, ', skipping');
//     return;
//   }
//
//   // __DEV__ is true in debug builds, false in release builds (set by Metro bundler)
//   // Release builds (Android release APK/AAB, iOS Archive) automatically use production
//   const environment = __DEV__
//     ? AdjustConfig.EnvironmentSandbox
//     : AdjustConfig.EnvironmentProduction;
//
//   const adjustConfig = new AdjustConfig(appToken, environment);
//
//   // Logging: verbose in dev for debugging, suppress in release
//   if (__DEV__) {
//     adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
//   } else {
//     adjustConfig.setLogLevel(AdjustConfig.LogLevelSuppress);
//   }
//
//   // Enable cost data in attribution (CPI, CPA tracking)
//   adjustConfig.enableCostDataInAttribution();
//
//   // Attribution change callback — forward attribution data to RevenueCat
//   adjustConfig.setAttributionCallback((attribution) => {
//     console.log('[Adjust] Attribution changed:', {
//       trackerToken: attribution.trackerToken,
//       trackerName: attribution.trackerName,
//       network: attribution.network,
//       campaign: attribution.campaign,
//       adgroup: attribution.adgroup,
//       creative: attribution.creative,
//     });
//
//     // Don't forward attribution to RevenueCat if user denied consent (GDPR compliance)
//     if (!isAnalyticsAllowed(consent) && !isAdvertisingAllowed(consent)) {
//       console.log('[Adjust] Consent denied, skipping attribution forwarding');
//       return;
//     }
//
//     // Guard: RevenueCat may not be configured yet (both init in same Promise.allSettled batch)
//     Purchases.isConfigured()
//       .then((isConfigured) => {
//         if (!isConfigured) {
//           console.warn(
//             '[Adjust] RevenueCat not configured yet, skipping attribution forwarding',
//           );
//           return;
//         }
//
//         // Forward Adjust ID to RevenueCat (adid is available by the time attribution fires)
//         Adjust.getAdid((adid) => {
//           if (adid) {
//             Purchases.setAdjustID(adid).catch((err) =>
//               console.error(
//                 '[Adjust] Failed to set Adjust ID on RevenueCat:',
//                 err,
//               ),
//             );
//           }
//         });
//
//         // Forward campaign metadata to RevenueCat for dashboard attribution
//         Purchases.setAttributes({
//           $mediaSource: attribution.network || '',
//           $campaign: attribution.campaign || '',
//           $adGroup: attribution.adgroup || '',
//           $ad: attribution.creative || '',
//         }).catch((err) =>
//           console.error(
//             '[Adjust] Failed to set attribution on RevenueCat:',
//             err,
//           ),
//         );
//       })
//       .catch((err) =>
//         console.error(
//           '[Adjust] Failed to check RevenueCat configuration:',
//           err,
//         ),
//       );
//   });
//
//   // Deferred deep link callback — log when deferred deep link arrives
//   adjustConfig.setDeferredDeeplinkCallback((deeplink) => {
//     console.log('[Adjust] Deferred deep link:', deeplink.deeplink);
//   });
//
//   // SKAdNetwork conversion value update callback (iOS only)
//   if (Platform.OS === 'ios') {
//     adjustConfig.setSkanUpdatedCallback((skanData) => {
//       console.log('[Adjust] SKAN updated:', {
//         conversionValue: skanData.conversionValue,
//         coarseValue: skanData.coarseValue,
//         lockWindow: skanData.lockWindow,
//         error: skanData.error,
//       });
//     });
//   }
//
//   // Initialize the SDK
//   Adjust.initSdk(adjustConfig);
//   console.log(
//     `[Adjust] Initialized successfully (env=${__DEV__ ? 'sandbox' : 'production'}, token=${appToken})`,
//   );
//
//   // Forward deep links to Adjust for reattribution tracking
//   // Handles re-engagement campaigns for already-installed users
//   setupDeepLinkForwarding();
//
//   // Apply privacy / third-party sharing settings based on consent
//   applyConsentSettings(consent, trackingAllowed);
// }
//
// /**
//  * Forward deep links to Adjust for reattribution tracking.
//  * Deferred deep links (install attribution) are handled via setDeferredDeeplinkCallback.
//  * This handles re-engagement deep links for already-installed users.
//  */
// function setupDeepLinkForwarding(): void {
//   const forwardToAdjust = (url: string | null) => {
//     if (url) {
//       const adjustDeeplink = new AdjustDeeplink(url);
//       Adjust.processDeeplink(adjustDeeplink);
//     }
//   };
//
//   // Handle the deep link that opened/cold-started the app
//   Linking.getInitialURL()
//     .then(forwardToAdjust)
//     .catch((err) =>
//       console.error('[Adjust] Failed to get initial URL:', err),
//     );
//
//   // Handle deep links while app is already running (warm start)
//   Linking.addEventListener('url', (event) => forwardToAdjust(event.url));
// }
//
// /**
//  * Map Usercentrics consent grants to Adjust third-party sharing controls.
//  * Must be called after Adjust.initSdk().
//  */
// function applyConsentSettings(
//   consent: ConsentResult,
//   trackingAllowed: boolean,
// ): void {
//   const advertisingAllowed = isAdvertisingAllowed(consent);
//   const analyticsAllowed = isAnalyticsAllowed(consent);
//
//   if (consent.status === 'denied') {
//     // User denied all consent — disable third-party sharing entirely
//     const disableSharing = new AdjustThirdPartySharing(false);
//     Adjust.trackThirdPartySharing(disableSharing);
//     return;
//   }
//
//   const thirdPartySharing = new AdjustThirdPartySharing(null);
//
//   // Google DMA compliance (Digital Markets Act)
//   // Use the region field from consent to accurately determine EEA status
//   // (consent.source becomes 'cached' on second launch, so source alone is unreliable)
//   const isEEA = consent.region === 'eu';
//   thirdPartySharing.addGranularOption(
//     'google_dma',
//     'eea',
//     isEEA ? '1' : '0',
//   );
//   thirdPartySharing.addGranularOption(
//     'google_dma',
//     'ad_personalization',
//     advertisingAllowed && trackingAllowed ? '1' : '0',
//   );
//   thirdPartySharing.addGranularOption(
//     'google_dma',
//     'ad_user_data',
//     advertisingAllowed && trackingAllowed ? '1' : '0',
//   );
//
//   // Facebook Limited Data Use (CCPA compliance)
//   if (!advertisingAllowed || !trackingAllowed) {
//     thirdPartySharing.addGranularOption(
//       'facebook',
//       'data_processing_options_country',
//       '1',
//     );
//     thirdPartySharing.addGranularOption(
//       'facebook',
//       'data_processing_options_state',
//       '1000',
//     );
//   }
//
//   // Granular consent: disable sharing for partners where user denied specific grants
//   if (consent.status === 'granular') {
//     if (!analyticsAllowed) {
//       thirdPartySharing.addPartnerSharingSetting('all', 'event', false);
//       thirdPartySharing.addPartnerSharingSetting('all', 'session', false);
//     }
//     if (!advertisingAllowed) {
//       thirdPartySharing.addPartnerSharingSetting('all', 'ad_revenue', false);
//     }
//   }
//
//   Adjust.trackThirdPartySharing(thirdPartySharing);
//
//   // Measurement consent for Adjust's own data privacy settings
//   Adjust.trackMeasurementConsent(analyticsAllowed || advertisingAllowed);
// }
//
// /**
//  * Track a custom event in Adjust.
//  * @param eventToken - 6-character event token from Adjust Dashboard
//  * @param revenue - Optional revenue amount
//  * @param currency - Optional ISO 4217 currency code (e.g. 'USD')
//  * @param deduplicationId - Optional transaction ID for revenue deduplication
//  */
// export function trackAdjustEvent(
//   eventToken: string,
//   revenue?: number,
//   currency?: string,
//   deduplicationId?: string,
// ): void {
//   const event = new AdjustEvent(eventToken);
//
//   if (revenue != null && currency) {
//     event.setRevenue(revenue, currency);
//   }
//
//   if (deduplicationId) {
//     event.setDeduplicationId(deduplicationId);
//   }
//
//   Adjust.trackEvent(event);
// }
//
// /**
//  * Track ad revenue from a mediation source (AdMob, etc.)
//  * @param source - Ad revenue source identifier (e.g. 'admob_sdk')
//  * @param revenue - Revenue amount
//  * @param currency - ISO 4217 currency code
//  * @param network - Ad network name
//  * @param unit - Ad unit identifier
//  * @param placement - Ad placement name
//  */
// export function trackAdjustAdRevenue(
//   source: string,
//   revenue: number,
//   currency: string,
//   network?: string,
//   unit?: string,
//   placement?: string,
// ): void {
//   const adRevenue = new AdjustAdRevenue(source);
//   adRevenue.setRevenue(revenue, currency);
//
//   if (network) {
//     adRevenue.setAdRevenueNetwork(network);
//   }
//   if (unit) {
//     adRevenue.setAdRevenueUnit(unit);
//   }
//   if (placement) {
//     adRevenue.setAdRevenuePlacement(placement);
//   }
//
//   Adjust.trackAdRevenue(adRevenue);
// }
//
// /**
//  * Set the push token for Adjust (used for Audiences and uninstall tracking).
//  * Call this whenever the FCM/APNs token is refreshed.
//  */
// export function setAdjustPushToken(token: string): void {
//   Adjust.setPushToken(token);
// }
//
// /**
//  * Send GDPR erasure request to Adjust.
//  * Permanently deletes all user data from Adjust's servers.
//  */
// export function sendAdjustGdprForgetMe(): void {
//   Adjust.gdprForgetMe();
// }
//
// /**
//  * Re-export Adjust instance for direct SDK access if needed.
//  */
// export { Adjust } from 'react-native-adjust';
// @feature:adjust:end
