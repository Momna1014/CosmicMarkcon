# Case 1 — AdMob + Adjust

> **Active SDKs:** AdMob (ads), Adjust (attribution)
> **Disabled SDKs:** AppLovin MAX, AppsFlyer

## How to switch to this case

Run **only** these two commands from the project root. The scripts handle every change listed below automatically — **there are no manual edits required**.

```bash
bash src/scripts/toggle-ads-sdk.sh admob
bash src/scripts/toggle-attribution-sdk.sh adjust
```

The scripts will:

1. Comment-out every `@feature:applovin-max:*` and `@feature:appsflyer:*` block listed in this document and append `[disabled]` to the start marker.
2. Uncomment every `@feature:admob:*` and `@feature:adjust:*` block (idempotent — safe to re-run).
3. Move `react-native-applovin-max` and `react-native-appsflyer` from `dependencies` → `disabledDependencies` in [package.json](../package.json).
4. Run `yarn install` (autolinking sees only AdMob + Adjust now).
5. Run `pod install` for iOS.
6. Deep-clean Android caches (`.cxx`, `app/build`, `build`, `.gradle`) and run `./gradlew clean` so stale codegen paths from the previous case don't break the build.

After the scripts complete, run:

```bash
yarn start --reset-cache
yarn android
npx react-native run-ios --device "iPhone 14 pro"
```

## State token

[src/scripts/.toggle-state.json](../src/scripts/.toggle-state.json):
```json
{ "ads": "admob", "attribution": "adjust" }
```

---

## What is COMMENTED OUT (disabled-side: AppLovin MAX + AppsFlyer)

Each block below is wrapped in `// @feature:<name>:start [disabled]` … `// @feature:<name>:end` markers. The script comments every line inside the block and appends `[disabled]` to the start marker.

### Native — iOS

#### [ios/Podfile](../ios/Podfile)
```ruby
# @feature:applovin-max:start [disabled]
# # ========================================
# # AppLovin Mediation Adapters
# # ========================================
# # Temporarily disabled Facebook adapter due to iOS build issues (FBAudienceNetwork bundle)
# # pod 'AppLovinMediationFacebookAdapter'
# pod 'AppLovinMediationGoogleAdapter'
# pod 'AppLovinMediationUnityAdsAdapter'
# pod 'AppLovinMediationIronSourceAdapter'
# pod 'AppLovinMediationVungleAdapter'
# pod 'AppLovinMediationMintegralAdapter'
# pod 'AppLovinMediationFyberAdapter'
# @feature:applovin-max:end
```

> **Note:** `react-native-applovin-max` is autolinked via `disabledDependencies`, so its main pod entry is removed automatically by `pod install` when the package is moved out of `dependencies`. Only the **manually-listed mediation adapter pods** above need the comment-toggle.

### Native — Android

#### [android/app/build.gradle](../android/app/build.gradle)
```gradle
// @feature:applovin-max:start [disabled]
//     // ========================================
//     // AppLovin MAX SDK - Core SDK
//     // ========================================
//     implementation 'com.applovin:applovin-sdk:+'
//
//     // ========================================
//     // AppLovin Mediation Adapters
//     // ========================================
//     implementation 'com.applovin.mediation:facebook-adapter:+'
//     implementation 'com.applovin.mediation:google-adapter:+'
//     implementation 'com.applovin.mediation:unityads-adapter:+'
//     implementation 'com.applovin.mediation:ironsource-adapter:+'
//     implementation 'com.applovin.mediation:vungle-adapter:+'
//     implementation 'com.applovin.mediation:mintegral-adapter:+'
//     implementation 'com.applovin.mediation:fyber-adapter:+'
//
//     // ========================================
//     // Compose dependencies (required by some adapters)
//     // ========================================
//     implementation platform('androidx.compose:compose-bom:2024.09.03')
//     implementation 'androidx.compose.runtime:runtime'
//     implementation 'androidx.compose.ui:ui'
//     implementation 'androidx.compose.foundation:foundation'
//     implementation 'androidx.compose.material:material'
//
//     // ========================================
//     // WorkManager (required by some adapters)
//     // ========================================
//     def work_version = "2.10.3"
//     implementation "androidx.work:work-runtime:$work_version"
//     implementation "androidx.work:work-runtime-ktx:$work_version"
// @feature:applovin-max:end
```

#### [android/build.gradle](../android/build.gradle)
```gradle
// @feature:applovin-max:start [disabled]
// allprojects {
//     repositories {
//         maven { url 'https://artifact.bytedance.com/repository/pangle' }
//         ...
//     }
// }
// @feature:applovin-max:end
```

### Configuration files

#### [.env](../.env)
```bash
# @feature:applovin-max:start [disabled]
# APPLOVIN_SDK_KEY=...
# APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID=...
# APPLOVIN_INTERSTITIAL_AD_UNIT_IOS=...
# (every APPLOVIN_* key gets commented)
# @feature:applovin-max:end

# @feature:appsflyer:start [disabled]
# APPSFLYER_DEV_KEY=...
# APPSFLYER_APP_ID=...
# @feature:appsflyer:end
```

#### [package.json](../package.json) — handled via JSON object move (not comments)
```jsonc
{
  "dependencies": {
    "react-native-google-mobile-ads": "^16.3.0",  // active
    "react-native-adjust": "^5.5.0"               // active
  },
  "disabledDependencies": {                        // npm/yarn ignore unknown top-level fields
    "react-native-applovin-max": "^9.4.1",
    "react-native-appsflyer": "^6.17.7"
  }
}
```

#### [app.json](../app.json) — handled via key rename
Keys for disabled deps are renamed `<key>` → `_disabled_<key>` (npm-style not used here because app.json has no `dependencies` object).

### TypeScript / JavaScript

The following files contain `@feature:applovin-max` or `@feature:appsflyer` markers. The script comments every line between the start/end markers.

| File | What gets disabled |
|---|---|
| [src/InitializationFlow/parallel/deferredSDKs.ts](../src/InitializationFlow/parallel/deferredSDKs.ts) | `import { setupAppLovin }`, `import { setupAppsFlyer }`, the AppLovin & AppsFlyer task pushers in `buildGroupB` |
| [src/InitializationFlow/sdks/index.ts](../src/InitializationFlow/sdks/index.ts) | `export { setupAppLovin }`, `export { setupAppsFlyer }` |
| [src/InitializationFlow/sdks/setupAppLovin.ts](../src/InitializationFlow/sdks/setupAppLovin.ts) | Whole file (top-to-bottom marker pair) |
| [src/InitializationFlow/sdks/setupAppsFlyer.ts](../src/InitializationFlow/sdks/setupAppsFlyer.ts) | Whole file |
| [src/InitializationFlow/types.ts](../src/InitializationFlow/types.ts) | `applovin?` and `appsflyer?` keys in `VendorGrants` interface |
| [src/InitializationFlow/consent/showConsent.ts](../src/InitializationFlow/consent/showConsent.ts) | AppLovin / AppsFlyer template-id mappings |
| [src/config/env.ts](../src/config/env.ts) | `APPLOVIN_*` and `APPSFLYER_*` config readers |
| [src/types/env.d.ts](../src/types/env.d.ts) | `APPLOVIN_*` and `APPSFLYER_*` type declarations |
| [src/services/AppLovinService.ts](../src/services/AppLovinService.ts) | Whole file |
| [src/services/AppsFlyerService.ts](../src/services/AppsFlyerService.ts) | Whole file |
| [src/services/RevenueCatAttribution.ts](../src/services/RevenueCatAttribution.ts) | `import appsFlyer`, `appsFlyerIdSet` flag, `setAppsFlyerAttribution()` definition + its call from `setRevenueCatAttribution()` |
| [src/navigation/TabNavigator.tsx](../src/navigation/TabNavigator.tsx) | AppLovin native ad-view import (only in applovin block) |

---

## What is ACTIVE (Case 1 enabled side: AdMob + Adjust)

The script removes `[disabled]` from these markers and uncomments every line inside.

### Native — Android

#### [android/app/src/main/AndroidManifest.xml](../android/app/src/main/AndroidManifest.xml) — **PERMANENT** (not toggled)
```xml
<!-- Required by Google Mobile Ads SDK whenever play-services-ads is on the classpath
     (used by AdMob directly, and transitively by AppLovinMediationGoogleAdapter).
     MobileAdsInitProvider runs on process start and crashes if APPLICATION_ID is missing. -->
<meta-data
  android:name="com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT"
  android:value="true" />

<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3781511156022357~2699873695" />
```

> ⚠️ These two `<meta-data>` entries are **permanent** in both cases. Removing them in Case 2 caused the runtime crash `java.lang.RuntimeException: Unable to get provider com.google.android.gms.ads.MobileAdsInitProvider`, because AppLovin's Google adapter transitively pulls in `play-services-ads`.

### Native — iOS

#### [ios/Project_Structure/Info.plist](../ios/Project_Structure/Info.plist) — **PERMANENT** (not toggled)
```xml
<!-- Required by Google Mobile Ads SDK whenever Google-Mobile-Ads-SDK is linked
     (used by AdMob directly, and transitively by AppLovinMediationGoogleAdapter). -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
<key>GADDelayAppMeasurementInit</key>
<true/>
```

### Configuration files

#### [.env](../.env)
```bash
# @feature:admob:start
ADMOB_BANNER_ANDROID=ca-app-pub-...
ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-...
ADMOB_APP_OPEN_ANDROID=ca-app-pub-...
# (all ADMOB_* uncommented)
# @feature:admob:end

# @feature:adjust:start
ADJUST_APP_TOKEN_ANDROID=8ry54hntwsu8
ADJUST_APP_TOKEN_IOS=cz3rxh38tyww
ADJUST_ENVIRONMENT=sandbox
# @feature:adjust:end
```

### TypeScript / JavaScript

| File | What gets enabled |
|---|---|
| [src/InitializationFlow/parallel/deferredSDKs.ts](../src/InitializationFlow/parallel/deferredSDKs.ts) | `import { setupAdMob }`, `import { setupAdjust }`, the AdMob & Adjust task pushers in `buildGroupB` |
| [src/InitializationFlow/sdks/index.ts](../src/InitializationFlow/sdks/index.ts) | `export { setupAdMob }`, `export { setupAdjust, trackAdjustEvent, trackAdjustAdRevenue, setAdjustPushToken, sendAdjustGdprForgetMe }` |
| [src/InitializationFlow/sdks/setupAdMob.ts](../src/InitializationFlow/sdks/setupAdMob.ts) | Whole file |
| [src/InitializationFlow/sdks/setupAdjust.ts](../src/InitializationFlow/sdks/setupAdjust.ts) | Whole file (uses per-platform tokens: iOS=`cz3rxh38tyww`, Android=`8ry54hntwsu8`) |
| [src/InitializationFlow/types.ts](../src/InitializationFlow/types.ts) | `admob?`, `adjust?` keys in `VendorGrants` |
| [src/InitializationFlow/consent/showConsent.ts](../src/InitializationFlow/consent/showConsent.ts) | AdMob / Adjust template-id mappings |
| [src/config/env.ts](../src/config/env.ts) | `ADMOB_*`, `ADJUST_*` config readers |
| [src/types/env.d.ts](../src/types/env.d.ts) | type declarations |
| [src/services/AdMob/AdMobService.ts](../src/services/AdMob/AdMobService.ts) | Whole file |
| [src/services/AdMob/AppOpenAds.ts](../src/services/AdMob/AppOpenAds.ts) | Whole file |
| [src/services/AdMob/BannerAds.tsx](../src/services/AdMob/BannerAds.tsx) | Whole file |
| [src/services/AdMob/InterstitialAds.ts](../src/services/AdMob/InterstitialAds.ts) | Whole file |
| [src/services/AdMob/RewardedAds.ts](../src/services/AdMob/RewardedAds.ts) | Whole file |
| [src/services/AdMob/interstitial.ts](../src/services/AdMob/interstitial.ts) | Whole file |
| [src/services/RevenueCatAttribution.ts](../src/services/RevenueCatAttribution.ts) | `import { Adjust }`, `adjustIdSet` flag, `setAdjustAttribution()` definition + call from `setRevenueCatAttribution()` |
| [src/navigation/StackNavigator.tsx](../src/navigation/StackNavigator.tsx) | `import { adMobService }`, `adMobService.recordScreenTransition()` call |
| [src/navigation/RootNavigator.tsx](../src/navigation/RootNavigator.tsx) | AdMob banner integration |
| [src/navigation/TabNavigator.tsx](../src/navigation/TabNavigator.tsx) | `import { BannerAdSize } from 'react-native-google-mobile-ads'` + banner placement |
| [src/contexts/AppContext.tsx](../src/contexts/AppContext.tsx) | AdMob app-open hook |
| [src/screens/PaywallScreen/index.tsx](../src/screens/PaywallScreen/index.tsx) | AdMob ad hide on paywall open |
| [src/components/PaywallModal/PaywallModal.tsx](../src/components/PaywallModal/PaywallModal.tsx) | AdMob ad hide on paywall open |
| [src/components/ads/BannerAdComponent.tsx](../src/components/ads/BannerAdComponent.tsx) | Whole file |
| [src/components/ads/DetailNativeAd.tsx](../src/components/ads/DetailNativeAd.tsx) | Whole file |
| [src/components/ads/ListNativeAd.tsx](../src/components/ads/ListNativeAd.tsx) | Whole file |
| [src/components/ads/NativeAdComponent.tsx](../src/components/ads/NativeAdComponent.tsx) | Whole file |
| [src/components/ads/QaidaListNativeAd.tsx](../src/components/ads/QaidaListNativeAd.tsx) | Whole file |
| [src/components/ads/QuranListNativeAd.tsx](../src/components/ads/QuranListNativeAd.tsx) | Whole file |
| [src/components/ads/SurahListNativeAd.tsx](../src/components/ads/SurahListNativeAd.tsx) | Whole file |

---

## Expected runtime logs (Case 1)

```
[InitializationFlow][Deferred][groupB-att-dependent] Adjust init start
[Adjust] Initialized successfully (env=sandbox, token=cz3rxh38tyww)   ← iOS
[Adjust] Initialized successfully (env=sandbox, token=8ry54hntwsu8)   ← Android
[Adjust] Attribution received: { network, campaign, adgroup, creative, adid }
[InitializationFlow][Deferred][groupB-att-dependent] Adjust init success

[InitializationFlow][Deferred][groupB-att-dependent] AdMob init start
[AdMob] Initialized (mode=personalized|non-personalized)
[InitializationFlow][Deferred][groupB-att-dependent] AdMob init success

🔍 [RevenueCat Attribution] Starting attribution setup...
✅ [RevenueCat Attribution] Device identifiers collected
✅ [RevenueCat Attribution] Adjust ID set: <adid>
✅ [RevenueCat Attribution] Attribution setup completed
```

**Must NOT appear:** `[AppsFlyer]`, `[AppLovin]`, `AppsFlyer ID set`.

## RevenueCat dashboard attributes (Case 1)

| Attribute | Value |
|---|---|
| `Adjust ID` | The Adjust `adid` |
| `$mediaSource`, `$campaign`, `$adGroup`, `$ad` | From Adjust attribution callback |
| `$fbAnonId` | Facebook anonymous ID |
| `IDFA` (iOS) / `GAID` (Android) | After ATT granted |
