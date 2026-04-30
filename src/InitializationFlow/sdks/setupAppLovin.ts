// @feature:applovin-max:start [disabled]
// import { Platform } from 'react-native';
// import env from '../../config/env';
// import {
  // appLovinService,
  // type AppLovinConfig,
// } from '../../services/AppLovinService';
// import type { ConsentResult, AdsMode } from '../types';
// import { isAdvertisingAllowed } from '../consent/consentPolicy';

// export async function setupAppLovin(
  // consent: ConsentResult,
  // mode: AdsMode,
// ): Promise<void> {
  // const advertisingAllowed = consent.status !== 'denied' && isAdvertisingAllowed(consent);

  // const config: AppLovinConfig = {
    // sdkKey: env.APPLOVIN_SDK_KEY,
    // bannerAdUnitId:
      // Platform.OS === 'ios'
        // ? env.APPLOVIN_BANNER_AD_UNIT_IOS
        // : env.APPLOVIN_BANNER_AD_UNIT_ANDROID,
    // interstitialAdUnitId:
      // Platform.OS === 'ios'
        // ? env.APPLOVIN_INTERSTITIAL_AD_UNIT_IOS
        // : env.APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID,
    // rewardedAdUnitId:
      // Platform.OS === 'ios'
        // ? env.APPLOVIN_REWARDED_AD_UNIT_IOS
        // : env.APPLOVIN_REWARDED_AD_UNIT_ANDROID,
    // hasUserConsent: advertisingAllowed && mode === 'personalized',
    // isAgeRestrictedUser: false,
    // doNotSell: !advertisingAllowed || mode !== 'personalized',
    // testMode: __DEV__,
    // verboseLogging: __DEV__,
  // };

  // await appLovinService.initialize(config);
// }
// @feature:applovin-max:end
