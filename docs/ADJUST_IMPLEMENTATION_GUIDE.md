# Adjust SDK — Implementation Guide (iOS + Android)

> **Audience:** developer integrating Adjust into a fresh React Native app, or onto another developer's machine.
> **Source of truth:** `react-native-adjust` v5 + native Adjust iOS v5 / Adjust Android v5.
> All code in this document is taken verbatim from this repo's `@feature:adjust` markers. To activate everything below in one shot, run:
>
> ```bash
> bash src/scripts/toggle-attribution-sdk.sh adjust
> ```
>
> If implementing manually in a new project, follow the steps in order below.

---

## 1. Environment variables (`.env`)

```bash
# Attribution (Adjust)
ADJUST_APP_TOKEN_ANDROID=8ry54hntwsu8
ADJUST_APP_TOKEN_IOS=cz3rxh38tyww
# ADJUST_ENVIRONMENT is not required at runtime — the SDK switches to
# Sandbox/Production automatically based on __DEV__ (debug vs release build).
```

> Tokens are **per-platform**. Each Adjust dashboard app has separate iOS / Android tokens — never share one.

---

## 2. Package installation

```bash
yarn add react-native-adjust
cd ios && pod install && cd ..
```

Add to `src/types/env.d.ts`:
```ts
declare module '@env' {
  export const ADJUST_APP_TOKEN_ANDROID: string;
  export const ADJUST_APP_TOKEN_IOS: string;
}
```

Add to `src/config/env.ts`:
```ts
import {
  ADJUST_APP_TOKEN_ANDROID,
  ADJUST_APP_TOKEN_IOS,
} from '@env';

export type Env = {
  // ... existing keys
  ADJUST_APP_TOKEN_ANDROID: string;
  ADJUST_APP_TOKEN_IOS: string;
};

const env: Env = {
  // ... existing keys
  ADJUST_APP_TOKEN_ANDROID: ADJUST_APP_TOKEN_ANDROID ?? '',
  ADJUST_APP_TOKEN_IOS: ADJUST_APP_TOKEN_IOS ?? '',
};
```

---

## 3. iOS native side

### 3.1 Podfile

`react-native-adjust` autolinks — **no manual Podfile entry required**.
After `yarn add react-native-adjust && cd ios && pod install`, you should see:

```
Installing Adjust (5.x.x)
Installing AdjustSignature (3.x.x)
```

### 3.2 `Info.plist`

Adjust v5 reads ATT status from the OS automatically — you only need the **standard ATT prompt string** (already required by other SDKs) and the **SKAdNetwork attribution endpoint** so SKAN postbacks reach Adjust.

```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use this identifier to deliver personalized advertising and measure ad performance.</string>

<!-- Routes SKAdNetwork install postbacks to Adjust for iOS attribution -->
<key>NSAdvertisingAttributionReportEndpoint</key>
<string>https://adjust-skadnetwork.com</string>
```

Plus the **complete `SKAdNetworkItems` array** (one `<dict>` per ad network you mediate).
The list is published by Adjust here: <https://github.com/adjust/ios_sdk/blob/master/doc/english/skadnetwork.md>.
The repo already includes ~70 entries under `<key>SKAdNetworkItems</key>` in [ios/Project_Structure/Info.plist](../ios/Project_Structure/Info.plist).

### 3.3 No AppDelegate changes required

Adjust v5 with `react-native-adjust` initialises entirely from JavaScript. **Do not** add `[Adjust appDidLaunch:...]` calls in `AppDelegate.m/.swift` — that is for native-only integrations and would double-initialise.

---

## 4. Android native side

### 4.1 `android/app/build.gradle`

Inside the existing `dependencies { ... }` block, add:

```gradle
// ========================================
// Adjust SDK - Attribution & Analytics
// ========================================
// Google Advertising ID for device identification
implementation 'com.google.android.gms:play-services-ads-identifier:18.1.0'
// Google Play Install Referrer API for attribution (reftag, gclid)
implementation 'com.android.installreferrer:installreferrer:2.2'
```

> The Adjust core library itself (`com.adjust.sdk:adjust-android`) is autolinked through `react-native-adjust`. You only have to add the two helper libraries above; Adjust requires both for accurate device-graph / install-referrer attribution.

### 4.2 `android/app/src/main/AndroidManifest.xml`

These permissions are already required by other SDKs in this repo — verify they exist; if missing, add inside `<manifest>` (above `<application>`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
<uses-permission android:name="com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE" />
```

> `AD_ID` is **mandatory** since `play-services-ads-identifier:18.0.0+` for Android 13+ targets; without it Adjust gets a zero-GAID and install attribution falls back to fingerprinting.

### 4.3 No `MainApplication` changes required

Same as iOS — `react-native-adjust` initialises from JS via `Adjust.initSdk(...)`. Do not add `Adjust.onCreate(...)` or `Adjust.onResume(...)` in `MainApplication.kt` for the React Native bridge — the JS package handles the lifecycle hooks internally.

---

## 5. JavaScript / TypeScript implementation

### 5.1 SDK init module — `src/InitializationFlow/sdks/setupAdjust.ts`

This is the **single source of truth** for Adjust setup. It is called from `deferredSDKs.ts` after the splash hides (non-blocking path).

```ts
import { Linking, Platform } from 'react-native';
import {
  Adjust,
  AdjustConfig,
  AdjustAdRevenue,
  AdjustDeeplink,
  AdjustEvent,
  AdjustThirdPartySharing,
} from 'react-native-adjust';
import Purchases from 'react-native-purchases';
import env from '../../config/env';
import type { ConsentResult } from '../types';
import {
  isAdvertisingAllowed,
  isAnalyticsAllowed,
} from '../consent/consentPolicy';

/**
 * Initialize the Adjust SDK with consent-aware configuration.
 * Note: Adjust v5 reads ATT status from the OS automatically —
 * no need to pass attStatus explicitly.
 */
export async function setupAdjust(
  consent: ConsentResult,
  trackingAllowed: boolean,
): Promise<void> {
  const appToken = Platform.OS === 'ios'
    ? env.ADJUST_APP_TOKEN_IOS
    : env.ADJUST_APP_TOKEN_ANDROID;

  if (!appToken) {
    console.warn('[Adjust] App token missing for', Platform.OS, ', skipping');
    return;
  }

  // __DEV__ is true in debug builds, false in release builds (Metro)
  const environment = __DEV__
    ? AdjustConfig.EnvironmentSandbox
    : AdjustConfig.EnvironmentProduction;

  const adjustConfig = new AdjustConfig(appToken, environment);

  if (__DEV__) {
    adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
  } else {
    adjustConfig.setLogLevel(AdjustConfig.LogLevelSuppress);
  }

  // CPI / CPA tracking
  adjustConfig.enableCostDataInAttribution();

  // Attribution callback → forward to RevenueCat
  adjustConfig.setAttributionCallback((attribution) => {
    console.log('[Adjust] Attribution changed:', attribution);

    if (!isAnalyticsAllowed(consent) && !isAdvertisingAllowed(consent)) {
      return; // GDPR: don't forward without consent
    }

    Purchases.isConfigured().then((ok) => {
      if (!ok) return;
      Adjust.getAdid((adid) => {
        if (adid) Purchases.setAdjustID(adid);
      });
      Purchases.setAttributes({
        $mediaSource: attribution.network || '',
        $campaign: attribution.campaign || '',
        $adGroup: attribution.adgroup || '',
        $ad: attribution.creative || '',
      });
    });
  });

  // Deferred deep link (install attribution)
  adjustConfig.setDeferredDeeplinkCallback((dl) => {
    console.log('[Adjust] Deferred deep link:', dl.deeplink);
  });

  // SKAdNetwork conversion-value updates (iOS only)
  if (Platform.OS === 'ios') {
    adjustConfig.setSkanUpdatedCallback((skan) => {
      console.log('[Adjust] SKAN updated:', skan);
    });
  }

  Adjust.initSdk(adjustConfig);

  setupDeepLinkForwarding();
  applyConsentSettings(consent, trackingAllowed);
}

/** Forward warm-/cold-start deep links to Adjust for re-engagement attribution. */
function setupDeepLinkForwarding(): void {
  const forward = (url: string | null) => {
    if (url) Adjust.processDeeplink(new AdjustDeeplink(url));
  };
  Linking.getInitialURL().then(forward);
  Linking.addEventListener('url', (e) => forward(e.url));
}

/** Map Usercentrics consent grants to Adjust third-party sharing. */
function applyConsentSettings(
  consent: ConsentResult,
  trackingAllowed: boolean,
): void {
  const advertisingAllowed = isAdvertisingAllowed(consent);
  const analyticsAllowed = isAnalyticsAllowed(consent);

  if (consent.status === 'denied') {
    Adjust.trackThirdPartySharing(new AdjustThirdPartySharing(false));
    return;
  }

  const sharing = new AdjustThirdPartySharing(null);

  // Google DMA (EEA)
  const isEEA = consent.region === 'eu';
  sharing.addGranularOption('google_dma', 'eea', isEEA ? '1' : '0');
  sharing.addGranularOption('google_dma', 'ad_personalization',
    advertisingAllowed && trackingAllowed ? '1' : '0');
  sharing.addGranularOption('google_dma', 'ad_user_data',
    advertisingAllowed && trackingAllowed ? '1' : '0');

  // Facebook Limited Data Use (CCPA)
  if (!advertisingAllowed || !trackingAllowed) {
    sharing.addGranularOption('facebook', 'data_processing_options_country', '1');
    sharing.addGranularOption('facebook', 'data_processing_options_state', '1000');
  }

  if (consent.status === 'granular') {
    if (!analyticsAllowed) {
      sharing.addPartnerSharingSetting('all', 'event', false);
      sharing.addPartnerSharingSetting('all', 'session', false);
    }
    if (!advertisingAllowed) {
      sharing.addPartnerSharingSetting('all', 'ad_revenue', false);
    }
  }

  Adjust.trackThirdPartySharing(sharing);
  Adjust.trackMeasurementConsent(analyticsAllowed || advertisingAllowed);
}

// ── Public API helpers ─────────────────────────────────────────────────

export function trackAdjustEvent(
  eventToken: string,
  revenue?: number,
  currency?: string,
  deduplicationId?: string,
): void {
  const event = new AdjustEvent(eventToken);
  if (revenue != null && currency) event.setRevenue(revenue, currency);
  if (deduplicationId) event.setDeduplicationId(deduplicationId);
  Adjust.trackEvent(event);
}

export function trackAdjustAdRevenue(
  source: string,
  revenue: number,
  currency: string,
  network?: string,
  unit?: string,
  placement?: string,
): void {
  const r = new AdjustAdRevenue(source);
  r.setRevenue(revenue, currency);
  if (network) r.setAdRevenueNetwork(network);
  if (unit) r.setAdRevenueUnit(unit);
  if (placement) r.setAdRevenuePlacement(placement);
  Adjust.trackAdRevenue(r);
}

export function setAdjustPushToken(token: string): void {
  Adjust.setPushToken(token);
}

export function sendAdjustGdprForgetMe(): void {
  Adjust.gdprForgetMe();
}

export { Adjust } from 'react-native-adjust';
```

### 5.2 Wiring into the deferred-init flow — `src/InitializationFlow/parallel/deferredSDKs.ts`

```ts
import { setupAdjust } from '../sdks/setupAdjust';

function buildGroupB(consent: ConsentResult, adsMode: AdsModeResult): DeferredTask[] {
  const tasks: DeferredTask[] = [];
  const trackingAllowed = adsMode.trackingAllowed;
  const advertisingAllowed = isAdvertisingAllowed(consent);
  const analyticsAllowed = isAnalyticsAllowed(consent);
  const isPersonalized = advertisingAllowed && adsMode.mode === 'personalized';

  // Adjust — only fires when advertising allowed; otherwise registers a
  // no-op disable call to ensure no data is sent.
  if (isPersonalized && (isVendorAllowed(consent, 'adjust') || analyticsAllowed)) {
    tasks.push({ name: 'Adjust', run: () => setupAdjust(consent, trackingAllowed) });
  } else {
    tasks.push({ name: 'AdjustDisable', run: () => setupAdjust(consent, false) });
  }

  // ... other Group B SDKs (AdMob/AppLovin/Facebook)
  return tasks;
}
```

### 5.3 Re-export — `src/InitializationFlow/sdks/index.ts`

```ts
export {
  setupAdjust,
  trackAdjustEvent,
  trackAdjustAdRevenue,
  setAdjustPushToken,
  sendAdjustGdprForgetMe,
} from './setupAdjust';
```

### 5.4 Type — `src/InitializationFlow/types.ts`

Add `adjust?: boolean` to the `VendorGrants` interface so the consent layer can gate it:

```ts
export interface VendorGrants {
  // ... other vendors
  adjust?: boolean;
}
```

### 5.5 Consent mapping — `src/InitializationFlow/consent/showConsent.ts`

Inside the cached / fallback grants object:
```ts
vendorGrants: {
  // ... others
  adjust: true,
},
```

And in the **Usercentrics templateId → vendor** mapping (where each Usercentrics service ID is mapped to the internal vendor name), map your Adjust service ID to `adjust`. The exact ID comes from your Usercentrics dashboard.

### 5.6 RevenueCat bridge — `src/services/RevenueCatAttribution.ts`

```ts
import Purchases from 'react-native-purchases';
import { Adjust } from 'react-native-adjust';

let adjustIdSet = false;

const setAdjustAttribution = async (): Promise<void> => {
  if (adjustIdSet) return;
  try {
    const adid = await new Promise<string | null>((resolve) => {
      Adjust.getAdid((id) => resolve(id));
    });
    if (adid) {
      await Purchases.setAdjustID(adid);
      adjustIdSet = true;
      console.log(`✅ [RevenueCat Attribution] Adjust ID set: ${adid}`);
    }
  } catch (err) {
    console.error('❌ [RevenueCat Attribution] Error setting Adjust ID:', err);
  }
};

export const setRevenueCatAttribution = async (): Promise<void> => {
  // ... other attribution
  await setAdjustAttribution();
};
```

> `adid` is not available immediately after `Adjust.initSdk()` — it requires a server round-trip. The primary bridge is the `setAttributionCallback` in `setupAdjust.ts` (5.1). This helper is a fallback for late callers.

---

## 6. Tracking custom events

```ts
import { trackAdjustEvent } from '@/InitializationFlow/sdks';

// Simple event
trackAdjustEvent('abc123');

// Revenue event with deduplication (e.g. on a successful IAP)
trackAdjustEvent('xyz789', 9.99, 'USD', purchase.transactionId);
```

Get the 6-character event tokens from **Adjust Dashboard → All Events → token column**.

## 7. Tracking ad revenue (mediation)

When a banner/interstitial/rewarded ad pays out, forward the revenue to Adjust so LTV/ROAS dashboards include ad revenue:

```ts
import { trackAdjustAdRevenue } from '@/InitializationFlow/sdks';

// AdMob impression-level revenue:
admobAd.addAdEventListener(AdEventType.PAID, ({ value, currency, ...rest }) => {
  trackAdjustAdRevenue('admob_sdk', value, currency, rest.network, rest.adUnitId, rest.placement);
});

// AppLovin MAX impression revenue:
adView.on('onAdRevenuePaid', (ad) => {
  trackAdjustAdRevenue('applovin_max_sdk', ad.revenue, 'USD', ad.networkName, ad.adUnitId);
});
```

## 8. Push notifications

Whenever Firebase Messaging emits a refreshed FCM token (Android) or APNs token (iOS), forward to Adjust:

```ts
import { setAdjustPushToken } from '@/InitializationFlow/sdks';

messaging().onTokenRefresh(setAdjustPushToken);
```

## 9. GDPR erasure

When the user invokes "Delete my data" in your privacy screen:

```ts
import { sendAdjustGdprForgetMe } from '@/InitializationFlow/sdks';

sendAdjustGdprForgetMe();
```

---

## 10. Verification checklist

After integrating, verify in this order:

1. **Build**: `yarn install && cd ios && pod install && cd .. && yarn android` → no link errors.
2. **Logs at boot** (debug build, fresh install):
   ```
   [InitializationFlow][Deferred][groupB-att-dependent] Adjust init start
   [Adjust] [I] === ADJUST SDK INITIALISED ===          ← native log
   [Adjust] Initialized successfully (env=sandbox, token=cz3rxh38tyww)
   [Adjust] Attribution changed: { network, campaign, adgroup, creative, adid }
   ✅ [RevenueCat Attribution] Adjust ID set: <adid>
   ```
3. **Adjust dashboard → Testing Console**: paste your `adid` from the logs → should show one `install` and one `session` event within 60 s.
4. **Deep link**: open `https://app.adjust.com/<your-domain>?deep_link=myapp://test` in Safari/Chrome on a **fresh install** → app should open, attribution should fire with the `tracker` you configured, and `Adjust.processDeeplink` should be called.
5. **RevenueCat dashboard → any test customer → Attributes tab** → verify `Adjust ID`, `$mediaSource`, `$campaign` are populated.

---

## 11. Service / Adapter / native-side summary

| Layer | File | Purpose |
|---|---|---|
| Env | [.env](../.env) | Per-platform app tokens |
| Type | [src/types/env.d.ts](../src/types/env.d.ts) | TS typings for `@env` import |
| Config | [src/config/env.ts](../src/config/env.ts) | Re-exports tokens through validated `env` object |
| **SDK init (service)** | [src/InitializationFlow/sdks/setupAdjust.ts](../src/InitializationFlow/sdks/setupAdjust.ts) | Init + attribution + deep link + consent + ad-revenue + event helpers |
| Init wiring | [src/InitializationFlow/parallel/deferredSDKs.ts](../src/InitializationFlow/parallel/deferredSDKs.ts) | Adds `Adjust` task to deferred Group B (after splash hides) |
| Re-export | [src/InitializationFlow/sdks/index.ts](../src/InitializationFlow/sdks/index.ts) | Public surface for the rest of the app |
| Type | [src/InitializationFlow/types.ts](../src/InitializationFlow/types.ts) | `VendorGrants.adjust?: boolean` |
| Consent | [src/InitializationFlow/consent/showConsent.ts](../src/InitializationFlow/consent/showConsent.ts) | Maps Usercentrics service ID → `adjust` grant |
| **RevenueCat bridge** | [src/services/RevenueCatAttribution.ts](../src/services/RevenueCatAttribution.ts) | Forwards `adid` + campaign metadata to RevenueCat dashboard |
| **iOS native** | [ios/Project_Structure/Info.plist](../ios/Project_Structure/Info.plist) | `NSUserTrackingUsageDescription`, `NSAdvertisingAttributionReportEndpoint`, `SKAdNetworkItems` |
| iOS native | [ios/Podfile](../ios/Podfile) | (no manual pods — autolinked) |
| **Android native** | [android/app/build.gradle](../android/app/build.gradle) | `play-services-ads-identifier`, `installreferrer` |
| Android native | [android/app/src/main/AndroidManifest.xml](../android/app/src/main/AndroidManifest.xml) | `INTERNET`, `ACCESS_NETWORK_STATE`, `AD_ID`, `BIND_GET_INSTALL_REFERRER_SERVICE` permissions |

> **No mediation adapters exist for Adjust.** Adjust is an MMP (Mobile Measurement Partner), not an ad network. "Adapters" only apply to ad-network SDKs (AppLovin MAX → AdMob/Unity/Vungle/etc.). Adjust **receives** mediation ad-revenue data via the `trackAdjustAdRevenue` helper in §7.

---

## 12. Common pitfalls

- **`adid` is `null` on first call** — expected. Use the `setAttributionCallback` (§5.1) to react when Adjust returns the adid asynchronously, **not** a polling loop.
- **iOS install attribution shows "organic"** — your `NSAdvertisingAttributionReportEndpoint` is wrong, or `SKAdNetworkItems` is incomplete. Adjust support can confirm in 24 h via dashboard.
- **Android install attribution missing on Play Store builds** — `installreferrer:2.2` dependency is missing or the `BIND_GET_INSTALL_REFERRER_SERVICE` permission was removed by ProGuard. Add `-keep class com.android.installreferrer.** { *; }` to `proguard-rules.pro`.
- **Sandbox events not arriving** — Adjust Dashboard → Settings → toggle "Allow events from sandbox" ON.
- **GDPR/EEA users see no attribution** — by design; `applyConsentSettings` (§5.1) disables `google_dma` ad data signals when consent is denied. Verify in Usercentrics dashboard that the user actually granted advertising consent before claiming a bug.
