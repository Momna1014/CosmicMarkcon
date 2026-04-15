# Video Crash Debugging Plan

## Overview

`react-native-video` crashes with full project but works with Firebase alone.
This document provides a systematic approach to find the conflicting SDK.

## Current State (as of debugging)

- ✅ `$RNFirebaseAsStaticFramework = true` added to Podfile
- ✅ Video + Firebase work together in minimal test
- ❌ Crash returns when full project SDKs are enabled
- 🎯 **Goal**: Find which SDK conflicts with video

## Backup Files

- `App.tsx.backup` - Original 514-line App.tsx with all features
- `package.json.backup` - Original package.json with all dependencies
- `babel.config.js.backup` - Original babel config with reanimated plugin
- `metro.config.js.backup` - Original metro config with Sentry
- `ios/Podfile.backup` - Original Podfile with AppLovin adapters
- `ios/CosmicMarkcon.xcodeproj/project.pbxproj.backup` - Original Xcode project (if created)

---

## How to Restore Everything

```bash
# Restore all files to original state
cp App.tsx.backup App.tsx
cp package.json.backup package.json
cp babel.config.js.backup babel.config.js
cp metro.config.js.backup metro.config.js
cp ios/Podfile.backup ios/Podfile

# For Xcode project - use git or restore backup if exists
git checkout ios/CosmicMarkcon.xcodeproj/project.pbxproj

# Reinstall
yarn install
cd ios && pod install && cd ..
```

---

## PHASE 1: Confirm Baseline (Current State)

### What Was Disabled

| File                                          | What Was Removed/Commented                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                | `@sentry/react-native`, `@usercentrics/react-native-sdk`, `react-native-applovin-max`, `react-native-appsflyer`, `react-native-fbsdk-next`, `react-native-reanimated` |
| `babel.config.js`                             | `react-native-reanimated/plugin`                                                                                                                                      |
| `metro.config.js`                             | `withSentryConfig` wrapper                                                                                                                                            |
| `ios/Podfile`                                 | All AppLovin mediation adapters                                                                                                                                       |
| `ios/CosmicMarkcon.xcodeproj/project.pbxproj` | Sentry build phases (`Upload Debug Symbols to Sentry`, `sentry-xcode.sh` wrapper)                                                                                     |

### Step 1.1: Test Minimal Video App

```bash
# Reinstall without disabled SDKs
yarn install

# Reinstall pods
cd ios && pod install && cd ..

# Run app
yarn ios
```

**Expected**: Video should play without crash

If crashes here:

- The issue is NOT with other SDKs
- Check `$RNFirebaseAsStaticFramework = true` is in Podfile line 13
- Run `pod deintegrate && pod install`

---

## PHASE 2: Re-Enable SDKs One-by-One

### Libraries to Test (Priority Order)

These are the most likely culprits based on native code complexity:

| Order | Library                     | Risk   | Files to Re-enable                |
| ----- | --------------------------- | ------ | --------------------------------- |
| 1     | **Sentry**                  | HIGH   | `package.json`, `metro.config.js` |
| 2     | **AppLovin**                | HIGH   | `package.json`, `Podfile`         |
| 3     | **react-native-reanimated** | MEDIUM | `package.json`, `babel.config.js` |
| 4     | **AppsFlyer**               | LOW    | `package.json`                    |
| 5     | **Facebook SDK**            | LOW    | `package.json`                    |
| 6     | **Usercentrics**            | LOW    | `package.json`                    |

---

### Step 2.1: Test SENTRY

#### Re-enable Sentry

1. Add back to `package.json` dependencies:

```json
"@sentry/react-native": "^8.3.0",
```

2. Update `metro.config.js` - uncomment Sentry:

```js
const { withSentryConfig } = require('@sentry/react-native/metro');
// ... and use withSentryConfig in export
```

3. Run:

```bash
yarn install
cd ios && pod install && cd ..
yarn ios
```

**If crashes**: ✅ FOUND! Sentry is the culprit
**If works**: Keep Sentry, add next SDK

---

### Step 2.2: Test APPLOVIN

#### Re-enable AppLovin

1. Add back to `package.json`:

```json
"react-native-applovin-max": "^9.4.1",
```

2. Uncomment in `ios/Podfile`:

```ruby
pod 'AppLovinMediationGoogleAdapter'
pod 'AppLovinMediationUnityAdsAdapter'
# ... etc
```

3. Run:

```bash
yarn install
cd ios && pod install && cd ..
yarn ios
```

**If crashes**: ✅ FOUND! AppLovin is the culprit
**If works**: Keep AppLovin, add next SDK

---

### Step 2.3: Test REANIMATED

#### Re-enable react-native-reanimated

1. Add back to `package.json`:

```json
"react-native-reanimated": "^4.2.1",
```

2. Uncomment in `babel.config.js`:

```js
plugins: [
  // ... other plugins
  'react-native-reanimated/plugin', // MUST be last
],
```

3. Run:

```bash
yarn install
yarn start --reset-cache
yarn ios
```

**If crashes**: ✅ FOUND! Reanimated is the culprit
**If works**: Keep Reanimated, add next SDK

---

### Step 2.4: Test REMAINING SDKs

#### Re-enable AppsFlyer

```json
"react-native-appsflyer": "^6.17.7",
```

#### Re-enable Facebook SDK

```json
"react-native-fbsdk-next": "^13.4.1",
```

#### Re-enable Usercentrics

```json
"@usercentrics/react-native-sdk": "^2.24.0",
```

Run after each: `yarn install && cd ios && pod install && cd .. && yarn ios`

---

### Step 2.5: Test COMBINATIONS

If all SDKs work individually, test combinations:

| Combo                 | Test        |
| --------------------- | ----------- |
| Sentry + AppLovin     | Enable both |
| Sentry + Reanimated   | Enable both |
| AppLovin + Reanimated | Enable both |
| All three             | Enable all  |

---

## PHASE 3: Fix the Culprit

### If Sentry is the issue:

```javascript
// Option A: Disable performance monitoring
Sentry.init({
  dsn: 'YOUR_DSN',
  tracesSampleRate: 0, // Disable tracing
  enableAutoPerformanceTracing: false,
});

// Option B: Don't wrap App
export default App; // Not Sentry.wrap(App)
```

### If AppLovin is the issue:

```ruby
# In Podfile - try static linking for AppLovin
pod 'AppLovinSDK', :modular_headers => true
```

### If Reanimated is the issue:

```js
// In babel.config.js
plugins: [
  ['react-native-reanimated/plugin', { disableInlineStylesWarning: true }],
],
```

---

## Quick Commands

```bash
# Full rebuild
cd ios && pod deintegrate && pod install && cd .. && yarn ios

# Clear caches
watchman watch-del-all
yarn start --reset-cache

# Check Podfile fix is present
grep -n "RNFirebaseAsStaticFramework" ios/Podfile

# Restore original App.tsx
cp App.tsx.backup App.tsx
```

---

## Results Tracker

Record your findings here:

| Date       | SDK Tested            | Result | Notes                   |
| ---------- | --------------------- | ------ | ----------------------- |
| 2026-04-15 | Baseline (Video only) | ✅ OK  | Video plays, no crash   |
| 2026-04-15 | Sentry                | ✅ OK  | Video works with Sentry |
|            | AppLovin              |        |                         |
|            | Reanimated            |        |                         |
|            | AppsFlyer             |        |                         |
|            | Facebook SDK          |        |                         |
|            | Usercentrics          |        |                         |

---

## Found the Culprit?

Once identified, document the fix in `REACT_NATIVE_VIDEO_FIX.md` and restore:

```bash
cp App.tsx.backup App.tsx
# Apply targeted fix for the conflicting SDK
```
