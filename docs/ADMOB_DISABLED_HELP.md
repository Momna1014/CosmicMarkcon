# AdMob Disabled — Help Doc

> **Status:** AdMob is fully **commented out** in source code. **No code was deleted.**
> The `react-native-google-mobile-ads` npm dependency was moved out of the
> active `dependencies` block, and the iOS pods + Xcode build phase were
> cleaned up via `pod install`.
>
> Every disabled AdMob block is wrapped in paired markers:
>
> ```
> // @feature:admob:start [disabled]
> // ... commented code ...
> // @feature:admob:end
> ```
>
> Native config files use the equivalent style for that file format
> (`<!-- -->` for XML, `# ` for env / shell, JSON-key-rename for JSON).

---

## TL;DR — How to RE-ENABLE AdMob

The fastest path:

```bash
# 1. Toggle script reverses every [disabled] marker + restores package.json:
bash src/scripts/toggle-ads-sdk.sh admob

# 2. Refresh node_modules + iOS pods (THIS STEP IS NOT OPTIONAL — see "iOS pod state" section below):
yarn install        # postinstall runs `pod install` automatically

# 3. Clean Android caches (so stale codegen doesn't break the build):
yarn android:clean

# 4. Reset Metro cache and run:
yarn start --reset-cache
```

That's it. Skip to **"What to do if Xcode crashes with GADApplicationIdentifier"**
below if you hit a runtime error after re-enabling.

If you'd rather re-enable **manually** (without the toggle script), follow
the per-file checklist in section **K. Manual re-enable checklist**.

---

## ⚠️ Critical: iOS pod state (READ BEFORE BUILDING)

The runtime error
```
The Google Mobile Ads SDK was initialized without an application ID.
```
**will happen** if any of these is true:
- `ios/Pods/Google-Mobile-Ads-SDK` is present but `GADApplicationIdentifier`
  is missing/commented in `Info.plist`. The framework auto-initializes on
  app launch via Objective-C `+load`, finds no app ID, crashes Thread 5.
- The Xcode project still has the build phase `[CP-User] [RNGoogleMobileAds] Configuration`.

**Both are leftovers from a previous `pod install` and won't disappear on
their own** — even if you delete the source code. They are managed by
CocoaPods and only updated when `pod install` is run.

### What `pod install` does for AdMob

| `package.json` state | After `pod install` |
|---|---|
| AdMob in **`dependencies`** | RN autolinking adds `RNGoogleMobileAds` pod → which transitively adds `Google-Mobile-Ads-SDK` → which adds the `[RNGoogleMobileAds] Configuration` build phase to `Cosmiq.xcodeproj` |
| AdMob in **`disabledDependencies`** (current) | Autolinking ignores it → both pods absent → build phase removed |

**Always rerun `pod install` after toggling AdMob.** The `postinstall`
hook in `package.json` does this for you when you run `yarn install`.

---

## What to do if Xcode crashes with `GADApplicationIdentifier`

Symptoms: app crashes at launch on Thread 5 with the AdMob SDK error.

Root cause: stale iOS pod state from a previous AdMob install. Fix:

```bash
rm -rf ios/Pods ios/Podfile.lock ios/build
yarn install   # postinstall regenerates pods cleanly
```

Then in Xcode: **Product → Clean Build Folder** (⇧⌘K) → build & run.

**This is exactly how the original Xcode error you saw was fixed.**

---

## Verification snapshot (current state)

After the most recent `yarn install`:

| Check | Expected | Actual |
|---|---|---|
| `node_modules/react-native-google-mobile-ads` | absent | ✓ absent |
| `ios/Pods/Google-Mobile-Ads-SDK` | absent | ✓ absent |
| `ios/Pods/RNGoogleMobileAds` | absent | ✓ absent |
| `Podfile.lock` AdMob references | 0 | ✓ 0 |
| `Cosmiq.xcodeproj/project.pbxproj` `RNGoogleMobileAds` build phase | 0 | ✓ 0 |
| `yarn.lock` `react-native-google-mobile-ads@` | 0 | ✓ 0 |
| `npx tsc --noEmit` AdMob errors | 0 | ✓ 0 |
| Active (non-commented) AdMob refs in `src/` | 0 | ✓ 0 |

---

## A. Library / package management

### `package.json`
- `"react-native-google-mobile-ads": "^16.3.0"` was **removed** from `dependencies`.
- `"react-native-google-mobile-ads": "^16.3.0"` was **added** to `disabledDependencies`
  (custom field — yarn ignores unknown top-level keys; nothing to autolink, but
  the version is preserved for easy restoration).
- **Effect:** native `pod install` and Android autolink no longer pull AdMob.

### `app.json`
- Top-level key `react-native-google-mobile-ads` renamed to
  `_disabled_react-native-google-mobile-ads`. Value object preserved verbatim:
  ```json
  "_disabled_react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-3781511156022357~2699873695",
    "ios_app_id": "ca-app-pub-3781511156022357~2699873695",
    "delay_app_measurement_init": true
  }
  ```
- The CocoaPods build phase `[RNGoogleMobileAds] Configuration` reads this
  key at build time to inject `GADApplicationIdentifier` into `Info.plist`.
  Renaming the key prevents that injection if the build phase ever runs.

---

## B. Native config

### `ios/Cosmiq/Info.plist`
Around lines 58–63 — `GADApplicationIdentifier` and `GADDelayAppMeasurementInit`:
```xml
<!-- @feature:admob:start [disabled] -->
<!-- <key>GADApplicationIdentifier</key> -->
<!-- <string>ca-app-pub-3940256099942544~1458002511</string> -->
<!-- <key>GADDelayAppMeasurementInit</key> -->
<!-- <true/> -->
<!-- @feature:admob:end -->
```

### `android/app/src/main/AndroidManifest.xml`
Two `<meta-data>` blocks were wrapped in `<!-- @feature:admob:start [disabled] -->`
… `<!-- @feature:admob:end -->` markers:
1. `com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT` (originally lines 107–109).
2. `com.google.android.gms.ads.APPLICATION_ID = ca-app-pub-3781511156022357~2699873695` (originally lines 156–158).

### `ios/Podfile`
**Not modified.** No explicit AdMob pod entries — all pulled via React Native autolinking.

### `android/app/build.gradle`
**Not modified for AdMob.** The line at ≈207
```
implementation 'com.google.android.gms:play-services-ads-identifier:18.1.0'
```
sits inside the `// @feature:adjust:start ... // @feature:adjust:end` block
and is the **Google Advertising ID** library used by **Adjust** for attribution
(GAID lookup). It is NOT used by AdMob ads. Removing it would break Adjust
attribution, so it was deliberately left active.

The `proguard-rules.pro` rules around `com.google.android.gms.ads.identifier.AdvertisingIdClient` (lines 17–20) are part of the same Adjust-required GAID infrastructure — also left intact.

---

## C. Env layer

### `.env`
- Lines ≈47–61 (block headed `# Google AdMob`).
- Start marker changed to `# @feature:admob:start [disabled]` and every
  `ADMOB_*=...` line prefixed with `# `.

### `.env.example`
- Lines ≈68–80 (`ADMOB_*` block).
- Wrapped in new `# @feature:admob:start [disabled]` … `# @feature:admob:end`
  markers with each line prefixed `# `.

### `src/config/env.ts`
Three `@feature:admob:start [disabled]` blocks, every line `// `-prefixed:
1. **`@env` imports** (lines ≈23–36): `ADMOB_APP_ID_IOS`, `ADMOB_APP_ID_ANDROID`,
   `ADMOB_BANNER_AD_UNIT_*`, `ADMOB_INTERSTITIAL_AD_UNIT_*`,
   `ADMOB_REWARDED_AD_UNIT_*`, `ADMOB_APP_OPEN_AD_UNIT_*`,
   `ADMOB_NATIVE_AD_UNIT_*`.
2. **Type fields** in `Env` interface (lines ≈72–85): same 12 string fields.
3. **Runtime values** in default `env` object (lines ≈121–134):
   `ADMOB_*: ADMOB_* ?? ''`.

### `src/types/env.d.ts`
- Lines ≈36–48: 12 `export const ADMOB_*: string` declarations.
- Wrapped in `// @feature:admob:start [disabled]` … `// @feature:admob:end`
  and each line prefixed `// `.

---

## D. InitializationFlow (consent + SDK orchestration)

### `src/InitializationFlow/types.ts`
- `'admob'` member of `ConsentVendorKey` union — wrapped & commented.
- `admob?: boolean;` field of `VendorGrants` type — wrapped & commented.
- `admob: false` entry in `DEFAULT_VENDOR_GRANTS` — wrapped & commented.

### `src/InitializationFlow/sdks/index.ts`
- `export { setupAdMob } from './setupAdMob';` — line 4 commented.

### `src/InitializationFlow/sdks/setupAdMob.ts`
- **Whole file** (15 lines). Marker on line 1 set to `[disabled]`; lines 2–14
  prefixed `// `.
- Disabled exports: `setupAdMob(mode)`, `disableAdMob()`.

### `src/InitializationFlow/parallel/deferredSDKs.ts`
- Top-of-file `import { setupAdMob } from '../sdks/setupAdMob';` — wrapped & commented.
- AdMob task block in `buildGroupB` (the `if (isPersonalized && isVendorAllowed(consent, 'admob')) { tasks.push({ name: 'AdMob', ... }) } else { tasks.push({ name: 'AdMobNPA', ... }) }` block) — wrapped & commented.
- **Effect:** no AdMob task is scheduled in deferred SDK init.

### `src/InitializationFlow/consent/consentPolicy.ts`
- `admob` entry of `VENDOR_TOKEN_MAP` — wrapped & commented.
- Templateid `'r7rvuoyDz'` (AdMob entry of `KNOWN_TEMPLATE_IDS`) — wrapped & commented.
- `isVendorAllowed(consent, 'admob') ||` line inside `isAdvertisingAllowed()` — wrapped & commented.

### `src/InitializationFlow/consent/showConsent.ts`
- `admob: true` line inside `vendorGrants` of the region-not-required path — wrapped & commented.

### `src/InitializationFlow/consent/parseConsent.ts`
- Token list inside `deriveCategoryGrants`: `'admob'` token removed from the
  advertising-token array (a marker note documents this).
- Fallback `if (!vendorGrants.admob && grants.advertising) { vendorGrants.admob = true; }` — wrapped & commented.

---

## E. AdMob services — *whole files commented*

Every file begins with `// @feature:admob:start [disabled]` on line 1 and
ends with `// @feature:admob:end` on the last line. All lines in between
are prefixed with `// `.

| File | Lines (incl. markers) | What it contained |
|---|---:|---|
| `src/services/AdMob/AdMobService.ts` | 615 | Singleton SDK manager: `mobileAds().initialize()`, interstitial / app-open / rewarded loaders, retry logic, `recordScreenTransition()`, `setIsPremium()`, `setAdsEnabled()`, `setPersonalizedAds()`, `showAppOpenAd()`, `showInterstitialNow()`, `showInterstitialAndWait()`, `showRewardedAd()`. Exports `adMobService`. |
| `src/services/AdMob/AppOpenAds.ts` | 14 | Re-export of `adMobService` for app-open ads. |
| `src/services/AdMob/BannerAds.tsx` | 67 | `BannerAd` wrapper (uses `react-native-google-mobile-ads`). |
| `src/services/AdMob/InterstitialAds.ts` | 14 | Re-export of `adMobService` for interstitials. |
| `src/services/AdMob/RewardedAds.ts` | 16 | Re-export of `adMobService` for rewarded. |
| `src/services/AdMob/interstitial.ts` | 14 | Lower-level interstitial helper (legacy). |

---

## F. Native ad components — *whole files commented*

Same convention as section E (start marker `[disabled]`, every line `// `-prefixed).

| File | Lines | What it contained |
|---|---:|---|
| `src/components/ads/BannerAdComponent.tsx` | 87 | `<BannerAd />` wrapper component. |
| `src/components/ads/DetailNativeAd.tsx` | 153 | Native ad layout for detail screens. |
| `src/components/ads/ListNativeAd.tsx` | 182 | Native ad row for generic lists. |
| `src/components/ads/NativeAdComponent.tsx` | 91 | Generic Native Ad container. |
| `src/components/ads/QaidaListNativeAd.tsx` | 163 | Native ad styled for Qaida list. |
| `src/components/ads/QuranListNativeAd.tsx` | 141 | Native ad styled for Quran list. |
| `src/components/ads/SurahListNativeAd.tsx` | 185 | Native ad styled for Surah list. |

> Total ~822 lines of ad-component code preserved verbatim under comments.

---

## G. Navigation / contexts / paywall

### `src/contexts/AppContext.tsx`
- Import `import { adMobService } from '../services/AdMob/AdMobService';`
  (lines 15–17) — wrapped & commented.
- `adMobService.setIsPremium(isPremium);` call inside the premium-sync
  `useEffect` (lines 112–114) — wrapped & commented.

### `src/navigation/RootNavigator.tsx`
- Import (lines 22–24) — wrapped & commented.
- `adMobService.skipAppOpenAd();` (lines 41–43, inside the
  `!onboardingCompleted` branch) — wrapped & commented.
- `adMobService.showAppOpenAd();` (lines 47–49) — wrapped & commented.

### `src/navigation/StackNavigator.tsx`
- `adMobService.recordScreenTransition();` (lines 65–67). Was **already**
  `[disabled]` before this round of work; no further change needed.

### `src/navigation/TabNavigator.tsx`
- Imports for `BannerAdComponent` and `BannerAdSize` (lines 13–16)
  wrapped in `// @feature:admob:start [disabled]` … `// @feature:admob:end`.
- JSX banner placement inside `CustomTabBar` (lines 41–46) wrapped in
  `{/* @feature:admob:start [disabled] */}` … `{/* @feature:admob:end */}`.

### `src/components/PaywallModal/PaywallModal.tsx`
- Import (lines 21–23) — wrapped & commented.
- `adMobService.showInterstitialNow();` × 3 call sites (after dismiss,
  after error, default branch) — each wrapped & commented.

---

## H. Toggle script state

### `src/scripts/.toggle-state.json`
- Updated from `{ "ads": "admob" }` to `{ "ads": "disabled" }`.
- The `bash src/scripts/toggle-ads-sdk.sh status` command now reflects
  that no ads SDK is active.

---

## I. What was NOT touched (and why)

| File / area | Reason |
|---|---|
| `ios/Podfile` | No explicit AdMob pod entries — all autolinked. Renaming `package.json` deps + rerunning `pod install` cleans everything. |
| `ios/Cosmiq/AppDelegate.swift`, `Cosmiq-Bridging-Header.h`, `PrivacyInfo.xcprivacy`, `Cosmiq.entitlements` | No AdMob-specific code. SDK init was 100% via the auto-loaded framework. |
| `android/build.gradle` (root) | No AdMob references. |
| `android/app/build.gradle` line 207 (`play-services-ads-identifier`) | Used by **Adjust** for GAID lookup, not AdMob. Removing it would break Adjust attribution. |
| `android/app/proguard-rules.pro` `AdvertisingIdClient` rules | Same — for Adjust, not AdMob. |
| `src/InitializationFlow/sdks/setupAdjust.ts` | Has documentation comments referencing AdMob as a possible `trackAdjustAdRevenue` source (`'admob_sdk'`). Adjust functions without AdMob; these are doc strings. |
| `src/services/AppLovinService.ts` | Already `[disabled]` independently; only a stub. The single string mentioning AdMob is inside an already-commented block. |
| `docs/GDPR_INIT_FLOW.md` | Historical SDK matrix doc. Treated as reference material; not retroactively updated. |

---

## J. Final verification log

Performed at the end of the disable + iOS-pod-cleanup work:

```bash
# 1. Source-level grep — only commented references remain:
grep -rEn "\b(admob|AdMob|adMobService|MobileAds|GoogleMobileAds|InterstitialAd|RewardedAd|BannerAdSize|BannerAdComponent|AppOpenAd|NativeAd)\b" src \
  --include="*.ts" --include="*.tsx" \
  | grep -v "^[^:]*:[0-9]*:[[:space:]]*//"
# → only TabNavigator JSX-comment hits, all inside {/* */} blocks. ✓

# 2. TypeScript clean (zero AdMob-related errors):
npx tsc --noEmit 2>&1 | grep -iE "admob|google-mobile-ads|adMobService|MobileAds"
# → empty. ✓

# 3. iOS native artifacts gone:
ls ios/Pods/Google-Mobile-Ads-SDK ios/Pods/RNGoogleMobileAds 2>/dev/null
# → not present. ✓
grep -c "Google-Mobile-Ads-SDK\|RNGoogleMobileAds" ios/Podfile.lock
# → 0. ✓
grep -c "RNGoogleMobileAds" ios/Cosmiq.xcodeproj/project.pbxproj
# → 0. ✓

# 4. yarn lockfile clean:
grep -c "^react-native-google-mobile-ads@" yarn.lock
# → 0. ✓
```

---

## K. Manual re-enable checklist (for when the toggle script isn't an option)

If you want to re-enable AdMob without using `toggle-ads-sdk.sh`:

### Step 1 — Source code (per-file uncomment)

For every file listed in sections **A–H** above:
1. Find each `@feature:admob:start [disabled]` marker.
2. Remove ` [disabled]` from it (so it reads `@feature:admob:start`).
3. Strip the leading comment prefix from every line inside the block:
   - **TS / TSX / JS** files: remove the leading `// `
   - **`.env*` / shell** files: remove the leading `# `
   - **XML files** (`Info.plist`, `AndroidManifest.xml`): remove the surrounding `<!-- ... -->` from each line
   - **JSX inside TSX** (TabNavigator banner placement): replace `{/* @feature:admob:start [disabled] */}` and `{/* @feature:admob:end */}` with empty lines, and remove the `{/* */}` around the JSX
4. **`package.json`** — move `"react-native-google-mobile-ads": "^16.3.0"`
   from `disabledDependencies` back into `dependencies`.
5. **`app.json`** — rename `_disabled_react-native-google-mobile-ads` →
   `react-native-google-mobile-ads`.
6. **`src/scripts/.toggle-state.json`** — set to `{ "ads": "admob" }`.

### Step 2 — Refresh native builds

This is non-negotiable — see the **iOS pod state** section. Run:

```bash
# Clean iOS pod state (forces a complete regen):
rm -rf ios/Pods ios/Podfile.lock ios/build

# Refresh node_modules + pods (postinstall runs `pod install`):
yarn install

# Clean Android caches:
yarn android:clean

# Reset Metro:
yarn start --reset-cache
```

### Step 3 — Configure your AdMob keys

If you're going live (not just dev), set real ad-unit IDs in `.env`:

```
ADMOB_APP_ID_IOS=ca-app-pub-XXXXX~XXXXX
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXX~XXXXX
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-XXXXX/XXXXX
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-XXXXX/XXXXX
# ... etc — see the full list in `.env.example` once uncommented
```

In `__DEV__` builds, the AdMob service falls back to Google's official test
ad-unit IDs (defined inside `AdMobService.ts`), so debug builds work without
real keys.

### Step 4 — Sanity check after re-enabling

```bash
# Confirm pods are linked:
ls ios/Pods/Google-Mobile-Ads-SDK ios/Pods/RNGoogleMobileAds
# → both directories should exist

# Confirm Xcode build phase regenerated:
grep -c "RNGoogleMobileAds" ios/Cosmiq.xcodeproj/project.pbxproj
# → > 0

# Confirm node_modules has the package:
ls node_modules/react-native-google-mobile-ads
# → directory exists

# Type check:
npx tsc --noEmit
```

### Step 5 — Run

In Xcode: **Product → Clean Build Folder** (⇧⌘K), then build.

For Android: `yarn android` (or run from Android Studio).

If you see the `GADApplicationIdentifier` crash, you skipped Step 2 — go back
and run the pod cleanup, then retry.
