// @feature:admob:start [disabled]
// /**
//  * AdMob Service
//  *
//  * Centralized singleton managing all Google AdMob ad types:
//  * - Banner ads (component-based, see AdMobBannerComponent.tsx)
//  * - Interstitial ads (every 3rd screen transition)
//  * - App Open ads (cold start only, once per session)
//  * - Rewarded ads (infrastructure for future use)
//  *
//  * Respects:
//  * - isPremium: premium users see zero ads
//  * - adsEnabled: Firebase Remote Config kill switch
//  * - Personalized vs non-personalized ads mode
//  *
//  * Usage:
//  *   import { adMobService } from '../services/AdMob/AdMobService';
//  *   await adMobService.initialize();
//  *   adMobService.recordScreenTransition(); // call on every navigation
//  */
//
// import { Platform } from 'react-native';
// import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
// import {
//   InterstitialAd,
//   AdEventType,
// } from 'react-native-google-mobile-ads';
// import {
//   AppOpenAd,
// } from 'react-native-google-mobile-ads';
// import {
//   RewardedAd,
//   RewardedAdEventType,
// } from 'react-native-google-mobile-ads';
// import env from '../../config/env';
//
// // ─── Ad Unit IDs ───────────────────────────────────────────────────────────────
// // Production ad unit IDs come from .env.
// // In __DEV__ mode, Google's official test ad unit IDs are used instead so that
// // debug builds always show sample ads without risking policy violations.
//
// const TEST_AD_UNIT_IDS: Record<string, string> = {
//   banner: 'ca-app-pub-3940256099942544/9214589741',
//   interstitial: 'ca-app-pub-3940256099942544/1033173712',
//   appOpen: 'ca-app-pub-3940256099942544/9257395921',
//   rewarded: 'ca-app-pub-3940256099942544/5224354917',
//   native: Platform.OS === 'ios'
//     ? 'ca-app-pub-3940256099942544/3986624511'
//     : 'ca-app-pub-3940256099942544/2247696110',
// };
//
// const AD_UNIT_IDS = {
//   interstitial: {
//     ios: env.ADMOB_INTERSTITIAL_AD_UNIT_IOS || '',
//     android: env.ADMOB_INTERSTITIAL_AD_UNIT_ANDROID || '',
//   },
//   appOpen: {
//     ios: env.ADMOB_APP_OPEN_AD_UNIT_IOS || '',
//     android: env.ADMOB_APP_OPEN_AD_UNIT_ANDROID || '',
//   },
//   rewarded: {
//     ios: env.ADMOB_REWARDED_AD_UNIT_IOS || '',
//     android: env.ADMOB_REWARDED_AD_UNIT_ANDROID || '',
//   },
//   banner: {
//     ios: env.ADMOB_BANNER_AD_UNIT_IOS || '',
//     android: env.ADMOB_BANNER_AD_UNIT_ANDROID || '',
//   },
//   native: {
//     ios: env.ADMOB_NATIVE_AD_UNIT_IOS || '',
//     android: env.ADMOB_NATIVE_AD_UNIT_ANDROID || '',
//   },
// };
//
// /** Returns the ad unit ID for the current platform, or empty string if not configured */
// function getAdUnitId(type: keyof typeof AD_UNIT_IDS): string {
//   if (__DEV__ && TEST_AD_UNIT_IDS[type]) {
//     return TEST_AD_UNIT_IDS[type];
//   }
//   return Platform.OS === 'ios' ? AD_UNIT_IDS[type].ios : AD_UNIT_IDS[type].android;
// }
//
// // ─── Constants ─────────────────────────────────────────────────────────────────
//
// const INTERSTITIAL_EVERY_N_TRANSITIONS = 3;
// const MAX_RETRY_ATTEMPTS = 3;
// const BASE_RETRY_DELAY_MS = 30000; // 30s base, doubles each attempt
//
// // ─── Service Class ─────────────────────────────────────────────────────────────
//
// class AdMobService {
//   private isInitialized = false;
//   private isPremium = false;
//   private adsEnabled = true;
//   private requestNonPersonalizedAdsOnly = true;
//
//   // Interstitial state
//   private interstitialAd: InterstitialAd | null = null;
//   private isInterstitialReady = false;
//   private transitionCount = 0;
//   private interstitialRetryCount = 0;
//
//   // App Open state
//   private appOpenAd: AppOpenAd | null = null;
//   private isAppOpenReady = false;
//   private hasShownAppOpenThisSession = false;
//   private appOpenRetryCount = 0;
//
//   // App Open completion tracking — resolves when the ad has been shown & closed,
//   // or when it's determined that the ad won't show (premium, timeout, skip).
//   private appOpenCompleteResolve: (() => void) | null = null;
//   private appOpenCompletePromise: Promise<void>;
//
//   constructor() {
//     this.appOpenCompletePromise = new Promise<void>(resolve => {
//       this.appOpenCompleteResolve = resolve;
//     });
//   }
//
//   /** Await this to know when the cold-start app open ad sequence is done. */
//   waitForAppOpenAdComplete(): Promise<void> {
//     return this.appOpenCompletePromise;
//   }
//
//   private resolveAppOpenComplete(): void {
//     if (this.appOpenCompleteResolve) {
//       this.appOpenCompleteResolve();
//       this.appOpenCompleteResolve = null;
//     }
//   }
//
//   /** Skip app open ad entirely (e.g. onboarding not completed). Resolves the completion promise. */
//   skipAppOpenAd(): void {
//     this.hasShownAppOpenThisSession = true;
//     this.resolveAppOpenComplete();
//   }
//
//   // Rewarded state
//   private rewardedAd: RewardedAd | null = null;
//   private isRewardedReady = false;
//   private rewardCallback?: (reward: { type: string; amount: number }) => void;
//   private rewardedRetryCount = 0;
//
//   // ─── Initialization ────────────────────────────────────────────────────────
//
//   async initialize(): Promise<void> {
//     if (this.isInitialized) {
//       console.log('[AdMob] Already initialized');
//       return;
//     }
//
//     try {
//       console.log('[AdMob] Initializing SDK...');
//       console.log('[AdMob] Ad Unit IDs:', JSON.stringify({
//         banner: Platform.OS === 'ios' ? AD_UNIT_IDS.banner.ios : AD_UNIT_IDS.banner.android,
//         interstitial: Platform.OS === 'ios' ? AD_UNIT_IDS.interstitial.ios : AD_UNIT_IDS.interstitial.android,
//         appOpen: Platform.OS === 'ios' ? AD_UNIT_IDS.appOpen.ios : AD_UNIT_IDS.appOpen.android,
//         native: Platform.OS === 'ios' ? env.ADMOB_NATIVE_AD_UNIT_IOS : env.ADMOB_NATIVE_AD_UNIT_ANDROID,
//       }));
//       console.log('[AdMob] State: isPremium=%s, adsEnabled=%s', this.isPremium, this.adsEnabled);
//
//       // Configure the Google Mobile Ads SDK
//       await mobileAds().setRequestConfiguration({
//         maxAdContentRating: MaxAdContentRating.G,
//         tagForChildDirectedTreatment: false,
//         tagForUnderAgeOfConsent: false,
//       });
//
//       await mobileAds().initialize();
//       this.isInitialized = true;
//       console.log('[AdMob] SDK initialized successfully');
//
//       // Preload ads if eligible
//       const shouldShow = this.shouldShowAds();
//       console.log('[AdMob] shouldShowAds=%s (isInitialized=%s, isPremium=%s, adsEnabled=%s)',
//         shouldShow, this.isInitialized, this.isPremium, this.adsEnabled);
//       if (shouldShow) {
//         this.preloadAds();
//       }
//     } catch (error) {
//       console.error('[AdMob] Initialization failed:', error);
//       // Don't throw — ads failure should never crash the app
//     }
//   }
//
//   // ─── Configuration ─────────────────────────────────────────────────────────
//
//   setIsPremium(premium: boolean): void {
//     this.isPremium = premium;
//     console.log('[AdMob] isPremium set to:', premium);
//     if (premium) {
//       // Destroy loaded ads when user upgrades to premium
//       this.destroyAllAds();
//     } else if (this.isInitialized) {
//       // User downgraded from premium — preload ads
//       this.preloadAds();
//     }
//   }
//
//   setAdsEnabled(enabled: boolean): void {
//     this.adsEnabled = enabled;
//     console.log('[AdMob] adsEnabled set to:', enabled);
//     if (!enabled) {
//       this.destroyAllAds();
//     } else if (this.isInitialized && !this.isPremium) {
//       this.preloadAds();
//     }
//   }
//
//   setPersonalizedAds(personalized: boolean): void {
//     this.requestNonPersonalizedAdsOnly = !personalized;
//     console.log('[AdMob] Personalized ads:', personalized);
//   }
//
//   getIsInitialized(): boolean {
//     return this.isInitialized;
//   }
//
//   // ─── Banner (public getters for the component) ────────────────────────────
//
//   getBannerAdUnitId(): string {
//     return getAdUnitId('banner');
//   }
//
//   getNativeAdUnitId(): string {
//     return getAdUnitId('native');
//   }
//
//   getRequestNonPersonalizedAdsOnly(): boolean {
//     return this.requestNonPersonalizedAdsOnly;
//   }
//
//   shouldShowAds(): boolean {
//     return this.isInitialized && !this.isPremium && this.adsEnabled;
//   }
//
//   /**
//    * Force-show an interstitial ad immediately, bypassing the transition counter.
//    * Resets the counter so the next counter-based interstitial is spaced out.
//    */
//   showInterstitialNow(): void {
//     if (!this.shouldShowAds()) return;
//
//     if (this.isInterstitialReady && this.interstitialAd) {
//       console.log('[AdMob] Showing interstitial now (forced)');
//       this.interstitialAd.show();
//       this.transitionCount = 0;
//     } else {
//       console.log('[AdMob] Interstitial not ready for forced show, loading for next time');
//       this.loadInterstitialAd();
//     }
//   }
//
//   /**
//    * Show an interstitial ad and wait for it to close before resolving.
//    * Returns true if the ad was shown and closed, false if no ad was ready.
//    * Used to block navigation until the user has fully viewed the ad.
//    */
//   showInterstitialAndWait(): Promise<boolean> {
//     if (!this.shouldShowAds() || !this.isInterstitialReady || !this.interstitialAd) {
//       console.log('[AdMob] Interstitial not ready for blocking show, skipping');
//       return Promise.resolve(false);
//     }
//
//     return new Promise<boolean>(resolve => {
//       const ad = this.interstitialAd!;
//
//       const onClosed = () => {
//         console.log('[AdMob] Blocking interstitial closed');
//         ad.removeAllListeners();
//         this.isInterstitialReady = false;
//         this.transitionCount = 0;
//         this.loadInterstitialAd();
//         resolve(true);
//       };
//
//       const onError = () => {
//         ad.removeAllListeners();
//         resolve(false);
//       };
//
//       ad.addAdEventListener(AdEventType.CLOSED, onClosed);
//       ad.addAdEventListener(AdEventType.ERROR, onError);
//
//       console.log('[AdMob] Showing blocking interstitial');
//       ad.show();
//     });
//   }
//
//   /** Returns true if the given ad type has a configured (non-empty) ad unit ID */
//   private hasAdUnitId(type: keyof typeof AD_UNIT_IDS): boolean {
//     return getAdUnitId(type).length > 0;
//   }
//
//   // ─── Interstitial ─────────────────────────────────────────────────────────
//
//   /**
//    * Call this on every screen transition.
//    * Shows an interstitial every INTERSTITIAL_EVERY_N_TRANSITIONS navigations.
//    */
//   recordScreenTransition(): void {
//     if (!this.shouldShowAds()) return;
//
//     this.transitionCount++;
//     console.log('[AdMob] Screen transition #', this.transitionCount);
//
//     if (this.transitionCount >= INTERSTITIAL_EVERY_N_TRANSITIONS) {
//       this.showInterstitialAd();
//       this.transitionCount = 0;
//     }
//   }
//
//   /** Reset transition counter (e.g. after paywall screen to prevent immediate interstitial). */
//   resetTransitionCount(): void {
//     this.transitionCount = 0;
//   }
//
//   private showInterstitialAd(): void {
//     if (!this.shouldShowAds()) return;
//
//     if (this.isInterstitialReady && this.interstitialAd) {
//       console.log('[AdMob] Showing interstitial ad');
//       this.interstitialAd.show();
//     } else {
//       console.log('[AdMob] Interstitial not ready, loading...');
//       this.loadInterstitialAd();
//     }
//   }
//
//   private loadInterstitialAd(): void {
//     if (!this.isInitialized) return;
//
//     const adUnitId = getAdUnitId('interstitial');
//     if (!adUnitId) {
//       console.warn('[AdMob] Interstitial ad unit ID not configured for', Platform.OS, '— skipping');
//       return;
//     }
//
//     try {
//
//       this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
//         requestNonPersonalizedAdsOnly: this.requestNonPersonalizedAdsOnly,
//       });
//
//       this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
//         console.log('[AdMob] Interstitial loaded');
//         this.isInterstitialReady = true;
//         this.interstitialRetryCount = 0;
//       });
//
//       this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
//         console.log('[AdMob] Interstitial closed');
//         this.isInterstitialReady = false;
//         this.interstitialRetryCount = 0;
//         // Preload next interstitial
//         this.loadInterstitialAd();
//       });
//
//       this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
//         console.warn('[AdMob] Interstitial error:', error.message || error);
//         this.isInterstitialReady = false;
//         if (this.interstitialRetryCount < MAX_RETRY_ATTEMPTS) {
//           const delay = BASE_RETRY_DELAY_MS * Math.pow(2, this.interstitialRetryCount);
//           this.interstitialRetryCount++;
//           console.log(`[AdMob] Interstitial retry ${this.interstitialRetryCount}/${MAX_RETRY_ATTEMPTS} in ${delay / 1000}s`);
//           setTimeout(() => this.loadInterstitialAd(), delay);
//         } else {
//           console.log('[AdMob] Interstitial max retries reached, will retry on next preload');
//         }
//       });
//
//       this.interstitialAd.load();
//       console.log('[AdMob] Loading interstitial...');
//     } catch (error) {
//       console.error('[AdMob] Error creating interstitial:', error);
//     }
//   }
//
//   // ─── App Open ──────────────────────────────────────────────────────────────
//
//   /**
//    * Show app open ad. Call once on cold start after splash hides.
//    * Will wait for SDK initialization (up to 5s) then poll up to ~8s for ad to load.
//    * Only shows once per app session.
//    * The completion promise resolves when the ad closes or is skipped.
//    */
//   showAppOpenAd(): void {
//     if (this.hasShownAppOpenThisSession) {
//       console.log('[AdMob] App open ad already shown this session');
//       this.resolveAppOpenComplete();
//       return;
//     }
//
//     // Wait for SDK initialization first (up to 5s)
//     if (!this.isInitialized) {
//       console.log('[AdMob] SDK not initialized yet, waiting before showing app open ad...');
//       let initElapsed = 0;
//       const initPoll = 200;
//       const initMax = 5000;
//       const initTimer = setInterval(() => {
//         initElapsed += initPoll;
//         if (this.isInitialized) {
//           clearInterval(initTimer);
//           console.log('[AdMob] SDK initialized after ~' + initElapsed + 'ms, proceeding with app open ad');
//           this.showAppOpenAdAfterInit();
//         } else if (initElapsed >= initMax) {
//           clearInterval(initTimer);
//           console.log('[AdMob] SDK initialization timed out for app open ad');
//           this.resolveAppOpenComplete();
//         }
//       }, initPoll);
//       return;
//     }
//
//     this.showAppOpenAdAfterInit();
//   }
//
//   private showAppOpenAdAfterInit(): void {
//     if (!this.shouldShowAds()) {
//       this.resolveAppOpenComplete();
//       return;
//     }
//
//     if (this.isAppOpenReady && this.appOpenAd) {
//       console.log('[AdMob] Showing app open ad');
//       this.appOpenAd.show();
//       return;
//     }
//
//     // Poll for ad to become ready (up to ~8s)
//     console.log('[AdMob] App open ad not ready yet, waiting...');
//     let elapsed = 0;
//     const pollInterval = 300;
//     const maxWait = 8000;
//     const timer = setInterval(() => {
//       elapsed += pollInterval;
//       if (this.isAppOpenReady && this.appOpenAd) {
//         clearInterval(timer);
//         console.log('[AdMob] App open ad ready after ~' + elapsed + 'ms, showing');
//         this.appOpenAd.show();
//       } else if (elapsed >= maxWait) {
//         clearInterval(timer);
//         console.log('[AdMob] App open ad timed out after ' + maxWait + 'ms');
//         this.resolveAppOpenComplete();
//       }
//     }, pollInterval);
//   }
//
//   private loadAppOpenAd(): void {
//     if (!this.isInitialized) return;
//
//     const adUnitId = getAdUnitId('appOpen');
//     if (!adUnitId) {
//       console.warn('[AdMob] App open ad unit ID not configured for', Platform.OS, '— skipping');
//       return;
//     }
//
//     try {
//
//       this.appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
//         requestNonPersonalizedAdsOnly: this.requestNonPersonalizedAdsOnly,
//       });
//
//       this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
//         console.log('[AdMob] App open ad loaded');
//         this.isAppOpenReady = true;
//         this.appOpenRetryCount = 0;
//       });
//
//       this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
//         console.log('[AdMob] App open ad closed');
//         this.isAppOpenReady = false;
//         this.hasShownAppOpenThisSession = true;
//         this.resolveAppOpenComplete();
//       });
//
//       this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
//         console.warn('[AdMob] App open ad error:', error.message || error);
//         this.isAppOpenReady = false;
//         if (this.appOpenRetryCount < MAX_RETRY_ATTEMPTS) {
//           const delay = BASE_RETRY_DELAY_MS * Math.pow(2, this.appOpenRetryCount);
//           this.appOpenRetryCount++;
//           console.log(`[AdMob] App open retry ${this.appOpenRetryCount}/${MAX_RETRY_ATTEMPTS} in ${delay / 1000}s`);
//           setTimeout(() => this.loadAppOpenAd(), delay);
//         } else {
//           console.log('[AdMob] App open max retries reached');
//         }
//       });
//
//       this.appOpenAd.load();
//       console.log('[AdMob] Loading app open ad...');
//     } catch (error) {
//       console.error('[AdMob] Error creating app open ad:', error);
//     }
//   }
//
//   // ─── Rewarded ──────────────────────────────────────────────────────────────
//
//   /**
//    * Show rewarded ad. Pass a callback to receive the reward.
//    * Returns true if the ad was shown, false if not ready.
//    *
//    * Usage (future):
//    *   const shown = await adMobService.showRewardedAd((reward) => {
//    *     console.log('User earned:', reward.type, reward.amount);
//    *   });
//    */
//   async showRewardedAd(
//     onReward?: (reward: { type: string; amount: number }) => void,
//   ): Promise<boolean> {
//     if (!this.shouldShowAds()) return false;
//
//     if (!this.isRewardedReady || !this.rewardedAd) {
//       console.log('[AdMob] Rewarded ad not ready, loading...');
//       this.loadRewardedAd();
//       return false;
//     }
//
//     this.rewardCallback = onReward;
//     this.rewardedAd.show();
//     return true;
//   }
//
//   private loadRewardedAd(): void {
//     if (!this.isInitialized) return;
//
//     const adUnitId = getAdUnitId('rewarded');
//     if (!adUnitId) {
//       console.warn('[AdMob] Rewarded ad unit ID not configured for', Platform.OS, '— skipping');
//       return;
//     }
//
//     try {
//
//       this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
//         requestNonPersonalizedAdsOnly: this.requestNonPersonalizedAdsOnly,
//       });
//
//       this.rewardedAd.addAdEventListener(
//         RewardedAdEventType.LOADED,
//         () => {
//           console.log('[AdMob] Rewarded ad loaded');
//           this.isRewardedReady = true;
//           this.rewardedRetryCount = 0;
//         },
//       );
//
//       this.rewardedAd.addAdEventListener(
//         RewardedAdEventType.EARNED_REWARD,
//         (reward) => {
//           console.log('[AdMob] User earned reward:', reward);
//           if (this.rewardCallback) {
//             this.rewardCallback({
//               type: reward.type,
//               amount: reward.amount,
//             });
//             this.rewardCallback = undefined;
//           }
//         },
//       );
//
//       this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
//         console.log('[AdMob] Rewarded ad closed');
//         this.isRewardedReady = false;
//         this.rewardedRetryCount = 0;
//         this.loadRewardedAd();
//       });
//
//       this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
//         console.warn('[AdMob] Rewarded ad error:', error.message || error);
//         this.isRewardedReady = false;
//         if (this.rewardedRetryCount < MAX_RETRY_ATTEMPTS) {
//           const delay = BASE_RETRY_DELAY_MS * Math.pow(2, this.rewardedRetryCount);
//           this.rewardedRetryCount++;
//           console.log(`[AdMob] Rewarded retry ${this.rewardedRetryCount}/${MAX_RETRY_ATTEMPTS} in ${delay / 1000}s`);
//           setTimeout(() => this.loadRewardedAd(), delay);
//         } else {
//           console.log('[AdMob] Rewarded max retries reached');
//         }
//       });
//
//       this.rewardedAd.load();
//       console.log('[AdMob] Loading rewarded ad...');
//     } catch (error) {
//       console.error('[AdMob] Error creating rewarded ad:', error);
//     }
//   }
//
//   // ─── Internal ──────────────────────────────────────────────────────────────
//
//   private preloadAds(): void {
//     console.log('[AdMob] Preloading ads...');
//     this.interstitialRetryCount = 0;
//     this.appOpenRetryCount = 0;
//     this.rewardedRetryCount = 0;
//     this.loadInterstitialAd();
//     this.loadAppOpenAd();
//     this.loadRewardedAd();
//   }
//
//   private destroyAllAds(): void {
//     this.isInterstitialReady = false;
//     this.isAppOpenReady = false;
//     this.isRewardedReady = false;
//     this.interstitialAd = null;
//     this.appOpenAd = null;
//     this.rewardedAd = null;
//     console.log('[AdMob] All ads destroyed (premium/disabled)');
//   }
// }
//
// // Export singleton instance
// export const adMobService = new AdMobService();
// @feature:admob:end
