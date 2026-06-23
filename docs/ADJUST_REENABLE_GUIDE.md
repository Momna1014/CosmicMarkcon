# How to Re-Enable Adjust (Un-comment Guide)

> **Purpose:** Adjust was fully **disabled** (all code commented out, the
> `react-native-adjust` package uninstalled) on **2026-06-23**. Nothing was
> deleted — every line still exists, just commented with the project's
> `// @feature:adjust:start [disabled]` markers. This document is the exact
> reverse: follow it to turn Adjust back on.
>
> **How to use:** Hand this whole file to the assistant and say *"re-enable Adjust
> using this guide"*, or follow the steps manually. Each step shows the exact
> **target (enabled) state** for every block, so it's unambiguous.

---

## The core idea

Disabling did three things; re-enabling reverses each:

1. **Marked blocks** — appended ` [disabled]` to the `@feature:adjust:start`
   marker and put `// ` in front of every line between the markers.
   → **Reverse:** remove ` [disabled]`, strip **one** leading comment prefix
   from each line between the markers.
2. **A few unmarked refs** were wrapped in *new* `@feature:adjust` markers and
   commented. → **Reverse:** uncomment them (you may keep the markers — they're
   inert comments and make future toggling easy).
3. **The library was uninstalled** and **one token string was removed**
   (can't comment a single array item). → **Reverse:** reinstall + add the token back.

> ⚠️ **Double-comment gotcha:** lines that were *already* comments got a second
> prefix (e.g. `// // Adjust …`, `// /**`, `// // ====`). Strip only **one** `// `
> to restore the original comment.

---

## Step 1 — Reinstall the library

```bash
yarn add react-native-adjust@^5.6.0
```

This re-adds it to `package.json` + `yarn.lock` + `node_modules`, and the
`postinstall` hook runs `pod install` (re-adding the `Adjust`, `AdjustSignature`,
and `react-native-adjust` pods to `ios/Podfile.lock`).

> If `pod install` doesn't run automatically, run it manually:
> `pod install --project-directory=ios`

---

## Step 2 — Un-comment the TypeScript source

### 2.1 `src/InitializationFlow/sdks/setupAdjust.ts` — the whole file
The entire 324-line module is commented. Un-comment **every** line between the
start/end markers. Quick mechanical way:

```bash
# from repo root
f=src/InitializationFlow/sdks/setupAdjust.ts
sed -i '' -e '1 s/ \[disabled\]//' -e '2,$ { /@feature:adjust:end/!{ s#^//$##; s#^// ##; } }' "$f"
```
After running, the file should start with `// @feature:adjust:start` (no
`[disabled]`), end with `// @feature:adjust:end`, and contain real code in between
(`import { Adjust, AdjustConfig, … } from 'react-native-adjust';`, `export async
function setupAdjust(…)`, etc.). Spot-check that line 1 is the marker and there
are no stray `// ` left on code lines.

### 2.2 `src/InitializationFlow/sdks/index.ts`
```ts
// @feature:adjust:start
export { setupAdjust, trackAdjustEvent, trackAdjustAdRevenue, setAdjustPushToken, sendAdjustGdprForgetMe } from './setupAdjust';
// @feature:adjust:end
```

### 2.3 `src/InitializationFlow/parallel/deferredSDKs.ts` — three spots

**(a) import:**
```ts
// @feature:adjust:start
import { setupAdjust } from '../sdks/setupAdjust';
// @feature:adjust:end
```

**(b) the `analyticsAllowed` local in `buildGroupB`** (was wrapped during disable):
```ts
  const advertisingAllowed = isAdvertisingAllowed(consent);
  const analyticsAllowed = isAnalyticsAllowed(consent);
```

**(c) the Adjust task block:**
```ts
  // @feature:adjust:start
  // Adjust — analytics-grade attribution. Only runs when advertising allowed.
  if (isPersonalized && (isVendorAllowed(consent, 'adjust') || analyticsAllowed)) {
    tasks.push({ name: 'Adjust', run: () => setupAdjust(consent, trackingAllowed) });
  } else {
    tasks.push({ name: 'AdjustDisable', run: () => setupAdjust(consent, false) });
  }
  // @feature:adjust:end
```

### 2.4 `src/config/env.ts` — three blocks
**(a) import from `@env`:**
```ts
  // @feature:adjust:start
  ADJUST_APP_TOKEN_ANDROID,
  ADJUST_APP_TOKEN_IOS,
  // @feature:adjust:end
```
**(b) `Env` type:**
```ts
  // @feature:adjust:start
  ADJUST_APP_TOKEN_ANDROID: string
  ADJUST_APP_TOKEN_IOS: string
  // @feature:adjust:end
```
**(c) `env` object:**
```ts
  // @feature:adjust:start
  ADJUST_APP_TOKEN_ANDROID: ADJUST_APP_TOKEN_ANDROID ?? '',
  ADJUST_APP_TOKEN_IOS: ADJUST_APP_TOKEN_IOS ?? '',
  // @feature:adjust:end
```

### 2.5 `src/InitializationFlow/types.ts` — three spots
**(a) `ConsentVendorKey` union:**
```ts
  | 'sentry'
  | 'adjust'
```
**(b) `VendorGrants` type:**
```ts
  sentry: boolean;
  adjust?: boolean;
```
**(c) `DEFAULT_VENDOR_GRANTS`:**
```ts
  // @feature:adjust:start
  adjust: false,
  // @feature:adjust:end
```

### 2.6 `src/InitializationFlow/consent/consentPolicy.ts` — two spots
**(a) `VENDOR_TOKEN_MAP`:**
```ts
  adjust: ['adjust', 'attribution'],
```
**(b) `isAnalyticsAllowed`:**
```ts
    isVendorAllowed(consent, 'firebaseAnalytics') ||
    isVendorAllowed(consent, 'adjust') ||
    isVendorAllowed(consent, 'remoteConfig') ||
```

### 2.7 `src/InitializationFlow/consent/parseConsent.ts` — two spots
**(a) advertising token array** — ⚠️ **add `'adjust'` back** and remove the
disabled-note block:
```ts
    // @feature:admob:start [disabled]
    // 'admob' token removed from advertising token list while AdMob is disabled
    // @feature:admob:end
    if (hasAnyToken(text, ['advertising', 'marketing', 'facebook', 'meta', 'adjust', 'ads'])) {
      grants.advertising = true;
    }
```
**(b) `deriveVendorGrants`:**
```ts
  if (!vendorGrants.adjust && (grants.analytics || grants.advertising)) {
    vendorGrants.adjust = true;
  }
```

### 2.8 `src/InitializationFlow/consent/showConsent.ts`
```ts
      // @feature:adjust:start
      adjust: true,
      // @feature:adjust:end
```

### 2.9 `src/types/env.d.ts`
```ts
  // Attribution (Adjust)
  export const ADJUST_APP_TOKEN_ANDROID: string
  export const ADJUST_APP_TOKEN_IOS: string
```

### 2.10 `src/services/RevenueCatAttribution.ts` — four blocks
**(a) import:**
```ts
// @feature:adjust:start
import { Adjust } from 'react-native-adjust';
// @feature:adjust:end
```
**(b) flag:**
```ts
// @feature:adjust:start
let adjustIdSet = false;
// @feature:adjust:end
```
**(c) call inside `setRevenueCatAttribution`:**
```ts
    // Set Adjust ID (only if not already set)
    // @feature:adjust:start
    await setAdjustAttribution();
    // @feature:adjust:end
```
**(d) the `setAdjustAttribution` function** — un-comment the full block between
the `// @feature:adjust:start` / `:end` markers (the JSDoc + the
`const setAdjustAttribution = async (): Promise<void> => { … }`).

---

## Step 3 — Un-comment native / env config

### 3.1 `.env` (and set real values — see Step 4)
```bash
# @feature:adjust:start
ADJUST_APP_TOKEN_ANDROID=
ADJUST_APP_TOKEN_IOS=
# @feature:adjust:end
```

### 3.2 `.env.example`
```bash
# Attribution (Adjust)
ADJUST_APP_TOKEN_ANDROID=
ADJUST_APP_TOKEN_IOS=
```

### 3.3 `android/app/build.gradle`
```gradle
    // @feature:adjust:start
    // ========================================
    // Adjust SDK - Attribution & Analytics
    // ========================================
    // Google Advertising ID for device identification
    implementation 'com.google.android.gms:play-services-ads-identifier:18.1.0'
    // Google Play Install Referrer API for attribution (reftag, gclid)
    implementation 'com.android.installreferrer:installreferrer:2.2'
    // @feature:adjust:end
```

### 3.4 `android/app/proguard-rules.pro`
```proguard
# Adjust SDK — Required when ProGuard/R8 is enabled
-keep class com.adjust.sdk.** { *; }
```

### 3.5 `ios/Cosmiq/Info.plist`
```xml
	<key>NSAdvertisingAttributionReportEndpoint</key>
	<string>https://adjust-skadnetwork.com</string>
```

---

## Step 4 — Set the Adjust app tokens

Put the real tokens (from the Adjust dashboard) in `.env`:
```bash
ADJUST_APP_TOKEN_ANDROID=xxxxxxxxxxxx
ADJUST_APP_TOKEN_IOS=xxxxxxxxxxxx
```
Without these, `setupAdjust()` logs *"Adjust app token missing … skipping"* and
returns early — the SDK won't initialize.

---

## Step 5 — Rebuild & verify

```bash
# JS/TS sanity
npx tsc --noEmit          # the Adjust files should add no new errors
npx eslint src/InitializationFlow/sdks/setupAdjust.ts src/services/RevenueCatAttribution.ts

# Native
pod install --project-directory=ios   # if not already run by postinstall
yarn ios                              # and/or: yarn android
```

**Quick grep checks (should now find live, uncommented code):**
```bash
grep -rn "from 'react-native-adjust'" src        # imports should NOT be commented
grep -n "react-native-adjust" package.json       # dependency present again
grep -ni "adjust" ios/Podfile.lock | head        # Adjust pods back
```

At runtime, look for `[Adjust] Initialized successfully …` in the logs after the
splash hides (Adjust runs in the deferred `buildGroupB` batch, gated by
advertising/analytics consent).

---

## File checklist

| File | Spots |
|---|---|
| `src/InitializationFlow/sdks/setupAdjust.ts` | whole file |
| `src/InitializationFlow/sdks/index.ts` | 1 (export) |
| `src/InitializationFlow/parallel/deferredSDKs.ts` | 3 (import, `analyticsAllowed`, task) |
| `src/config/env.ts` | 3 (import, type, value) |
| `src/InitializationFlow/types.ts` | 3 (union, field, default) |
| `src/InitializationFlow/consent/consentPolicy.ts` | 2 (token map, `isAnalyticsAllowed`) |
| `src/InitializationFlow/consent/parseConsent.ts` | 2 (token array **+restore**, `deriveVendorGrants`) |
| `src/InitializationFlow/consent/showConsent.ts` | 1 |
| `src/types/env.d.ts` | 1 |
| `src/services/RevenueCatAttribution.ts` | 4 |
| `.env` / `.env.example` | token block |
| `android/app/build.gradle` | deps block |
| `android/app/proguard-rules.pro` | keep rule |
| `ios/Cosmiq/Info.plist` | SKAdNetwork endpoint |
| `package.json` / `yarn.lock` / `ios/Podfile.lock` | via `yarn add` (Step 1) |

---

## Notes

- **The only thing deleted** during disable was the `react-native-adjust` package
  (Step 1 restores it) and the single `'adjust'` string in the
  `parseConsent.ts` token array (Step 2.7a restores it). Everything else is just
  commented and is restored by un-commenting.
- **AppLovin is unrelated** to Adjust. It was removed from the codebase separately
  (already committed) and is **not** part of this guide.
- For the deeper integration reference (what each Adjust API does, GDPR/consent
  wiring, event tracking, SKAdNetwork), see
  [`docs/ADJUST_IMPLEMENTATION_GUIDE.md`](./ADJUST_IMPLEMENTATION_GUIDE.md).
