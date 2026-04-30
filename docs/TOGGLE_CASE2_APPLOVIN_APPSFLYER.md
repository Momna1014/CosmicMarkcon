# Case 2 — AppLovin MAX + AppsFlyer

> **Active SDKs:** AppLovin MAX (ads), AppsFlyer (attribution)
> **Disabled SDKs:** AdMob, Adjust

## How to switch to this case

Run **only** these two commands from the project root. The scripts handle every change listed below automatically — **there are no manual edits required**.

```bash
bash src/scripts/toggle-ads-sdk.sh applovin
bash src/scripts/toggle-attribution-sdk.sh appsflyer
```

The scripts will:

1. Comment-out every `@feature:admob:*` and `@feature:adjust:*` block listed in this document and append `[disabled]` to the start marker.
2. Uncomment every `@feature:applovin-max:*` and `@feature:appsflyer:*` block (idempotent — safe to re-run).
3. Move `react-native-google-mobile-ads` and `react-native-adjust` from `dependencies` → `disabledDependencies` in [package.json](../package.json).
4. Run `yarn install` (autolinking sees only AppLovin + AppsFlyer now).
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
{ "ads": "applovin", "attribution": "appsflyer" }
```

---

## What is COMMENTED OUT (disabled-side: AdMob + Adjust)

Each block below is wrapped in `// @feature:<name>:start [disabled]` … `// @feature:<name>:end` markers. The script comments every line inside the block and appends `[disabled]` to the start marker.

### Native — Android

#### [android/app/build.gradle](../android/app/build.gradle)
```gradle
// @feature:adjust:start [disabled]
//     // Adjust SDK requires Google Play Services Ads Identifier on Android
//     implementation 'com.google.android.gms:play-services-ads-identifier:18.2.0'
//     implementation 'com.google.android.gms:play-services-analytics:18.0.4'
// @feature:adjust:end
```

> **Note:** AdMob native dependencies are autolinked from `react-native-google-mobile-ads`. When the package is moved into `disabledDependencies`, the gradle deps drop automatically — no manual block needed in `build.gradle`.

### Native — iOS

#### [ios/Project_Structure/Info.plist](../ios/Project_Structure/Info.plist)
```xml
<!-- No @feature blocks for adjust/admob in Info.plist anymore.
     GADApplicationIdentifier and GADDelayAppMeasurementInit are PERMANENT
     because AppLovinMediationGoogleAdapter (active in this case) transitively
     loads Google-Mobile-Ads-SDK and crashes without them. -->
```

> AdMob and Adjust pods are autolinked from npm packages — moving them to `disabledDependencies` removes them from `pod install` automatically.

### Configuration files

#### [.env](../.env)
```bash
# @feature:admob:start [disabled]
# ADMOB_BANNER_ANDROID=ca-app-pub-...
# ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-...
# ADMOB_APP_OPEN_ANDROID=ca-app-pub-...
# (all ADMOB_* commented)
# @feature:admob:end

# @feature:adjust:start [disabled]
# ADJUST_APP_TOKEN_ANDROID=8ry54hntwsu8
# ADJUST_APP_TOKEN_IOS=cz3rxh38tyww
# ADJUST_ENVIRONMENT=sandbox
# @feature:adjust:end
```

#### [package.json](../package.json) — handled via JSON object move
```jsonc
{
  "dependencies": {
    "react-native-applovin-max": "^9.4.1",       // active
    "react-native-appsflyer": "^6.17.7"           // active
  },
  "disabledDependencies": {                        // npm/yarn ignore unknown top-level fields
    "react-native-google-mobile-ads": "^16.3.0",
    "react-native-adjust": "^5.5.0"
  }
}
```

#### [app.json](../app.json) — handled via key rename
Disabled keys: `<key>` → `_disabled_<key>`.

### TypeScript / JavaScript

| File | What gets disabled |
|---|---|
| [src/InitializationFlow/parallel/deferredSDKs.ts](../src/InitializationFlow/parallel/deferredSDKs.ts) | `import { setupAdMob }`, `import { setupAdjust }`, the AdMob & Adjust task pushers in `buildGroupB` |
| [src/InitializationFlow/sdks/index.ts](../src/InitializationFlow/sdks/index.ts) | `export { setupAdMob }`, `export { setupAdjust, ... }` |
| [src/InitializationFlow/sdks/setupAdMob.ts](../src/InitializationFlow/sdks/setupAdMob.ts) | Whole file |
| [src/InitializationFlow/sdks/setupAdjust.ts](../src/InitializationFlow/sdks/setupAdjust.ts) | Whole file |
| [src/InitializationFlow/types.ts](../src/InitializationFlow/types.ts) | `admob?`, `adjust?` keys in `VendorGrants` |
| [src/InitializationFlow/consent/showConsent.ts](../src/InitializationFlow/consent/showConsent.ts) | AdMob / Adjust template-id mappings |
| [src/config/env.ts](../src/config/env.ts) | `ADMOB_*`, `ADJUST_*` config readers |
| [src/types/env.d.ts](../src/types/env.d.ts) | `ADMOB_*`, `ADJUST_*` type declarations |
| [src/services/AdMob/AdMobService.ts](../src/services/AdMob/AdMobService.ts) | Whole file |
| [src/services/AdMob/AppOpenAds.ts](../src/services/AdMob/AppOpenAds.ts) | Whole file |
| [src/services/AdMob/BannerAds.tsx](../src/services/AdMob/BannerAds.tsx) | Whole file |
| [src/services/AdMob/InterstitialAds.ts](../src/services/AdMob/InterstitialAds.ts) | Whole file |
| [src/services/AdMob/RewardedAds.ts](../src/services/AdMob/RewardedAds.ts) | Whole file |
| [src/services/AdMob/interstitial.ts](../src/services/AdMob/interstitial.ts) | Whole file |
| [src/services/RevenueCatAttribution.ts](../src/services/RevenueCatAttribution.ts) | `import { Adjust }`, `adjustIdSet` flag, `setAdjustAttribution()` definition + its call |
| [src/navigation/StackNavigator.tsx](../src/navigation/StackNavigator.tsx) | `import { adMobService }`, `adMobService.recordScreenTransition()` call |
| [src/navigation/RootNavigator.tsx](../src/navigation/RootNavigator.tsx) | AdMob banner integration |
| [src/navigation/TabNavigator.tsx](../src/navigation/TabNavigator.tsx) | `import { BannerAdSize }` + banner placement |
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

## What is ACTIVE (Case 2 enabled side: AppLovin MAX + AppsFlyer)

The script removes `[disabled]` from these markers and uncomments every line inside.

### Native — iOS

#### [ios/Podfile](../ios/Podfile)
```ruby
# @feature:applovin-max:start
# ========================================
# AppLovin Mediation Adapters
# ========================================
# Temporarily disabled Facebook adapter due to iOS build issues (FBAudienceNetwork bundle)
# pod 'AppLovinMediationFacebookAdapter'
pod 'AppLovinMediationGoogleAdapter'
pod 'AppLovinMediationUnityAdsAdapter'
pod 'AppLovinMediationIronSourceAdapter'
pod 'AppLovinMediationVungleAdapter'
pod 'AppLovinMediationMintegralAdapter'
pod 'AppLovinMediationFyberAdapter'
# @feature:applovin-max:end
```

> The `react-native-applovin-max` main pod itself is autolinked via `dependencies` — only the **mediation adapter pods** above are managed manually here.

### Native — Android

#### [android/app/build.gradle](../android/app/build.gradle)
```gradle
// @feature:applovin-max:start
    // ========================================
    // AppLovin MAX SDK - Core SDK
    // ========================================
    implementation 'com.applovin:applovin-sdk:+'

    // ========================================
    // AppLovin Mediation Adapters
    // ========================================
    implementation 'com.applovin.mediation:facebook-adapter:+'
    implementation 'com.applovin.mediation:google-adapter:+'
    implementation 'com.applovin.mediation:unityads-adapter:+'
    implementation 'com.applovin.mediation:ironsource-adapter:+'
    implementation 'com.applovin.mediation:vungle-adapter:+'
    implementation 'com.applovin.mediation:mintegral-adapter:+'
    implementation 'com.applovin.mediation:fyber-adapter:+'

    // ========================================
    // Compose dependencies (required by some adapters)
    // ========================================
    implementation platform('androidx.compose:compose-bom:2024.09.03')
    implementation 'androidx.compose.runtime:runtime'
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.foundation:foundation'
    implementation 'androidx.compose.material:material'

    // ========================================
    // WorkManager (required by some adapters)
    // ========================================
    def work_version = "2.10.3"
    implementation "androidx.work:work-runtime:$work_version"
    implementation "androidx.work:work-runtime-ktx:$work_version"
// @feature:applovin-max:end
```

#### [android/build.gradle](../android/build.gradle)
```gradle
// @feature:applovin-max:start
allprojects {
    repositories {
        // Pangle/Bytedance maven for AppLovin mediation
        maven { url 'https://artifact.bytedance.com/repository/pangle' }
    }
}
// @feature:applovin-max:end
```

#### [android/app/src/main/AndroidManifest.xml](../android/app/src/main/AndroidManifest.xml) — **PERMANENT**
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

> ⚠️ These are **permanent** in both cases. AppLovin's Google adapter transitively pulls in `play-services-ads`, whose `MobileAdsInitProvider` crashes the app on boot if these meta-data entries are missing.

#### [ios/Project_Structure/Info.plist](../ios/Project_Structure/Info.plist) — **PERMANENT**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
<key>GADDelayAppMeasurementInit</key>
<true/>
```

### Configuration files

#### [.env](../.env)
```bash
# @feature:applovin-max:start
APPLOVIN_SDK_KEY=...
APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID=...
APPLOVIN_INTERSTITIAL_AD_UNIT_IOS=...
# @feature:applovin-max:end

# @feature:appsflyer:start
APPSFLYER_DEV_KEY=...
APPSFLYER_APP_ID=...
# @feature:appsflyer:end
```

### TypeScript / JavaScript

| File | What gets enabled |
|---|---|
| [src/InitializationFlow/parallel/deferredSDKs.ts](../src/InitializationFlow/parallel/deferredSDKs.ts) | `import { setupAppLovin }`, `import { setupAppsFlyer }`, the AppLovin & AppsFlyer task pushers in `buildGroupB` |
| [src/InitializationFlow/sdks/index.ts](../src/InitializationFlow/sdks/index.ts) | `export { setupAppLovin }`, `export { setupAppsFlyer }` |
| [src/InitializationFlow/sdks/setupAppLovin.ts](../src/InitializationFlow/sdks/setupAppLovin.ts) | Whole file |
| [src/InitializationFlow/sdks/setupAppsFlyer.ts](../src/InitializationFlow/sdks/setupAppsFlyer.ts) | Whole file |
| [src/InitializationFlow/types.ts](../src/InitializationFlow/types.ts) | `applovin?`, `appsflyer?` keys in `VendorGrants` |
| [src/InitializationFlow/consent/showConsent.ts](../src/InitializationFlow/consent/showConsent.ts) | AppLovin / AppsFlyer template-id mappings |
| [src/config/env.ts](../src/config/env.ts) | `APPLOVIN_*`, `APPSFLYER_*` config readers |
| [src/types/env.d.ts](../src/types/env.d.ts) | `APPLOVIN_*`, `APPSFLYER_*` type declarations |
| [src/services/AppLovinService.ts](../src/services/AppLovinService.ts) | Whole file (currently a stub — logs `"[AppLovin] DISABLED — using AdMob"` until full impl ships) |
| [src/services/AppsFlyerService.ts](../src/services/AppsFlyerService.ts) | Whole file |
| [src/services/RevenueCatAttribution.ts](../src/services/RevenueCatAttribution.ts) | `import appsFlyer`, `appsFlyerIdSet` flag, `setAppsFlyerAttribution()` definition + call from `setRevenueCatAttribution()` |
| [src/navigation/TabNavigator.tsx](../src/navigation/TabNavigator.tsx) | AppLovin banner ad-view (when stub is replaced) |

---

## Expected runtime logs (Case 2)

```
[InitializationFlow][Deferred][groupB-att-dependent] AppsFlyer init start
[AppsFlyer] Initialized successfully
[AppsFlyer] Install conversion data: { media_source: ..., campaign: ..., ... }
[InitializationFlow][Deferred][groupB-att-dependent] AppsFlyer init success

[InitializationFlow][Deferred][groupB-att-dependent] AppLovin init start
[InitializationFlow][Deferred][groupB-att-dependent] AppLovin init success

🔍 [RevenueCat Attribution] Starting attribution setup...
✅ [RevenueCat Attribution] Device identifiers collected
✅ [RevenueCat Attribution] AppsFlyer ID set: <uid>
📊 [RevenueCat Attribution] AppsFlyer conversion data: { ... }
✅ [RevenueCat Attribution] Attribution setup completed
```

**Must NOT appear:** `[AdMob]`, `[Adjust]`, `Adjust ID set`.

> **Tip:** if you see `[InitializationFlow] AppsFlyer keys missing, skipping`, add `APPSFLYER_DEV_KEY` and `APPSFLYER_APP_ID` to `.env` and run `yarn start --reset-cache`. The AppsFlyer UID is still bridged to RevenueCat without these (works in ID-only mode).

## RevenueCat dashboard attributes (Case 2)

| Attribute | Value |
|---|---|
| `$appsflyerId` | The AppsFlyer UID |
| `$mediaSource`, `$campaign`, `$adGroup`, `$ad` | From `appsflyer.onInstallConversionData()` |
| `$fbAnonId` | Facebook anonymous ID |
| `IDFA` (iOS) / `GAID` (Android) | After ATT granted |
