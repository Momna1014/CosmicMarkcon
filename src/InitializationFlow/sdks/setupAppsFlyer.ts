// @feature:appsflyer:start [disabled]
// import env from '../../config/env';
// import { appsFlyerService } from '../../services/AppsFlyerService';

// export async function setupAppsFlyer(
  // trackingAllowed: boolean,
  // consentGranted: boolean,
// ): Promise<void> {
  // appsFlyerService.setConsentGranted(consentGranted);

  // if (!consentGranted) {
    // return;
  // }

  // if (!env.APPSFLYER_DEV_KEY || !env.APPSFLYER_APP_ID) {
    // console.warn('[InitializationFlow] AppsFlyer keys missing, skipping');
    // return;
  // }

  // await appsFlyerService.initialize({
    // devKey: env.APPSFLYER_DEV_KEY,
    // appId: env.APPSFLYER_APP_ID,
    // isDebug: __DEV__,
    // timeToWaitForATTUserAuthorization: 10,
  // });

  // appsFlyerService.setOptOut(!trackingAllowed);
  // appsFlyerService.stop(false);
// }
// @feature:appsflyer:end
