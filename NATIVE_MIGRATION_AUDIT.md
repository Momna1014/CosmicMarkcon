# Native Configuration Audit and Migration Document

## Scope of this audit

This audit is for the active app in:
- `/Users/macmini/Desktop/CosmicMarkcon`

It does **not** treat `react-native-boiler-plate/` as the active runtime app unless you explicitly migrate from that folder too.

## Executive summary

You have meaningful native-side customization on **both iOS and Android**.  
This project is **not** “JS-only autolink defaults”.

The biggest native custom areas are:
- iOS: Firebase + push handling in AppDelegate, custom Podfile conflict handling (AppLovin vs react-native-video), Info.plist ad/tracking/social setup, Sentry/RNFB build phases.
- Android: explicit Gradle dependencies/plugins (AppLovin adapters, Firebase/Crashlytics, Adjust helpers), rich manifest declarations, and a custom native Android home-screen widget bridge/package.

If you move to a new project, you must migrate both:
- package dependencies
- native file changes and platform secrets/config files

## Files that contain native customizations

### iOS
- `/Users/macmini/Desktop/CosmicMarkcon/ios/Podfile`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/AppDelegate.swift`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/Info.plist`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/CosmicMarkcon.entitlements`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/PrivacyInfo.xcprivacy`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon.xcodeproj/project.pbxproj`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/GoogleService-Info.plist`
- `/Users/macmini/Desktop/CosmicMarkcon/ios/sentry.properties`

### Android
- `/Users/macmini/Desktop/CosmicMarkcon/android/build.gradle`
- `/Users/macmini/Desktop/CosmicMarkcon/android/settings.gradle`
- `/Users/macmini/Desktop/CosmicMarkcon/android/gradle.properties`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/build.gradle`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/AndroidManifest.xml`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/res/values/strings.xml`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/res/values/styles.xml`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/google-services.json`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/MainApplication.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/MainActivity.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/WidgetPackage.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/WidgetBridge.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/TodoWidgetProvider.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/res/xml/widget_todo_list_info.xml`

### Cross-platform runtime config affecting native SDK behavior
- `/Users/macmini/Desktop/CosmicMarkcon/firebase.json`
- `/Users/macmini/Desktop/CosmicMarkcon/react-native.config.js`
- `/Users/macmini/Desktop/CosmicMarkcon/.env`

## iOS deep analysis

### 1) CocoaPods and build system behavior

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/Podfile`

- Static frameworks are explicitly enabled (`use_frameworks! :linkage => :static`) and RNFirebase is forced static (`$RNFirebaseAsStaticFramework = true`) at lines 12-13.
- `react-native-permissions` setup script is invoked and only `Camera` + `PhotoLibrary` are enabled at lines 25-30.
- Firebase pods are manually forced with modular headers at lines 36-46.
- AppLovin mediation pods are explicitly pinned in Podfile (Google + Unity only) at lines 59-60.
- Post-install modifies pod build settings globally:
  - Excludes simulator `x86_64` at line 89.
  - Forces dSYM generation at lines 92-93.
  - Adds module-related flags for AppLovin and react-native-video and custom macro `RN_VIDEO_HAS_PRIORITY=1` at lines 95-110.
  - Applies Swift runtime/linker tweaks for FB Audience/FBSDK targets at lines 125-129.

Migration impact:
- This is not default RN Podfile behavior. Copy these custom sections carefully, or re-test AppLovin/video/Facebook runtime behavior after fresh setup.

### 2) AppDelegate native logic

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/AppDelegate.swift`

- Firebase init in native startup (`FirebaseApp.configure()`) at line 21.
- UNUserNotificationCenter delegate + Firebase Messaging delegate at lines 24 and 27.
- APNs registration at line 30.
- APNs token passthrough to Firebase at line 72 plus token type selection at lines 75-80.
- FCM token callback handling in native and event bridge via NotificationCenter at lines 99-111.
- Foreground notification presentation behavior customized at lines 121-135.
- Notification tap callback implemented at lines 139-152.
- Silent/background push handler implemented at lines 157-169.
- BootSplash visual smoothing via background color on window/root view at lines 41-48 and 185-193.

Migration impact:
- You must copy this AppDelegate behavior if you need identical push delivery/presentation/token behavior.

### 3) Info.plist native declarations

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/Info.plist`

- AppLovin SDK key: line 5.
- Facebook URL scheme + app IDs/tokens: lines 27, 38-43.
- AdMob app ID: line 44.
- Social app query schemes for Facebook: line 46.
- Camera / photo / notifications / tracking prompts: lines 62, 68, 70, 72.
- SKAdNetwork list: starts line 76.
- UIAppFonts declaration: line 723.
- Background modes (`fetch`, `remote-notification`): line 801.

Migration impact:
- These keys are required for ads/social/push/tracking flows to work exactly the same.

### 4) Entitlements and capabilities

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/CosmicMarkcon.entitlements`

- APNs entitlement is present (`aps-environment`) at lines 5-6.

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon.xcodeproj/project.pbxproj`

- Entitlements file wired into build settings at lines 557 and 592.
- Bundle id is fixed as `com.cosmic.markcon` at lines 573 and 607.

Migration impact:
- If bundle id/team changes, update entitlements/signing/profiles together.

### 5) Xcode build phases and embedded resources

Source: `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon.xcodeproj/project.pbxproj`

- `GoogleService-Info.plist` is included in resources (lines 13, 357).
- `BootSplash.storyboard` included in resources (lines 71, 359).
- Sentry scripts are present:
  - wrapped bundle step references `sentry-xcode.sh` at line 437.
  - Upload Debug Symbols phase at lines 439-452.
- RNFirebase user script phases are present:
  - Core Configuration at lines 509-517.
  - Crashlytics Configuration at lines 522-534.

Migration impact:
- If these build phases are missing in new project, Sentry/RNFB behavior will diverge.

## Android deep analysis

### 1) Root Gradle and repositories

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/build.gradle`

- Firebase/Google plugins configured in buildscript:
  - `com.google.gms:google-services` at line 21.
  - `com.google.firebase:firebase-crashlytics-gradle` at line 23.
- AppLovin Maven repo added at line 13.

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/settings.gradle`

- AppLovin and Mintegral repositories configured in dependency resolution at lines 10-11.

Migration impact:
- Missing repos/plugins will break builds or prevent mediation adapters from resolving.

### 2) App module Gradle customizations

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/app/build.gradle`

- Crashlytics plugin applied at line 5.
- Sentry Gradle script is applied via `sentry.gradle` at line 79.
- Explicit native dependency additions:
  - Adjust helper deps (`installreferrer`, `ads-identifier`) lines 146-147.
  - AppLovin core and mediation adapters lines 152, 157-163.
  - Compose BOM/runtime/ui/foundation/material lines 168-172.
  - WorkManager runtime/ktx lines 178-179.
  - Firebase BoM and modules lines 184, 187, 190, 193, 196.
- Google services plugin applied at line 200.

Migration impact:
- These are manual, non-default additions. Recreate intentionally in any new app.

### 3) AndroidManifest integration

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/AndroidManifest.xml`

- Permissions related to ads, notifications, billing, camera, storage, foreground services:
  - AD_ID line 5, POST_NOTIFICATIONS line 7, BILLING line 11, CAMERA line 16, etc.
- AdMob app id metadata at lines 35-36.
- Facebook metadata and activities at lines 38-58.
- Firebase Messaging service declaration at lines 60-66.
- Notifee foreground/background services at lines 83-88.
- AppLovin SDK key metadata at lines 90-93.
- AppsFlyer receiver present at lines 95-101.
- Custom widget receiver registered at lines 103-112.
- Deep link placeholders:
  - OneLink host `yourapp.onelink-domain.com` line 134.
  - custom scheme `yourapp` line 141.

Migration impact:
- Do not copy placeholder deep links as-is into production.
- If AppsFlyer is not used, validate whether that receiver is still needed.

### 4) MainApplication and MainActivity native code

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/MainApplication.kt`

- Manual package registration for custom widget package at line 23 (`add(WidgetPackage())`).
- Manual `loadReactNative(this)` + background init coroutine at lines 32 and 42-51.

Source: `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/MainActivity.kt`

- BootSplash init before `super.onCreate` at lines 21-23.

Migration impact:
- Without these changes, widget bridge and splash behavior will differ.

### 5) Custom native Android widget module (non-library autolink)

Sources:
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/WidgetPackage.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/WidgetBridge.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/java/com/cosmic/markcon/widget/TodoWidgetProvider.kt`
- `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/res/xml/widget_todo_list_info.xml`

What exists:
- A custom `ReactPackage` registering `WidgetBridge` (WidgetPackage lines 13-16).
- A native module named `WidgetModule` with update methods (WidgetBridge lines 26-28, 37-124).
- Android home-screen AppWidget provider storing content in SharedPreferences and rendering RemoteViews (TodoWidgetProvider lines 16-178).
- AppWidget XML metadata (widget_todo_list_info.xml lines 2-12).

Migration impact:
- This is fully custom native code. If you want widget feature in new project, this entire subtree and manifest registration must be migrated.

## Runtime config that changes native SDK behavior

### firebase.json

Source: `/Users/macmini/Desktop/CosmicMarkcon/firebase.json`

- Disables analytics/crashlytics auto collection by default and configures messaging/remote config behavior (lines 3-15).
- This file is used by RNFirebase build scripts in iOS project phase.

### react-native.config.js

Source: `/Users/macmini/Desktop/CosmicMarkcon/react-native.config.js`

- Fonts assets are explicitly linked from two folders (lines 6-9).

## Sensitive/secret data found in native-related files

These should be rotated and moved to secure secret management before migration:

- Sentry auth token in:
  - `/Users/macmini/Desktop/CosmicMarkcon/.env` line 12
  - `/Users/macmini/Desktop/CosmicMarkcon/ios/sentry.properties` line 2
- RevenueCat keys in `/Users/macmini/Desktop/CosmicMarkcon/.env` lines 19-20
- AdMob app IDs, Facebook IDs/tokens in:
  - `/Users/macmini/Desktop/CosmicMarkcon/.env` lines 39-45
  - `/Users/macmini/Desktop/CosmicMarkcon/android/app/src/main/res/values/strings.xml` lines 5-7
  - `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/Info.plist` lines 38-45
- Firebase keys in:
  - `/Users/macmini/Desktop/CosmicMarkcon/ios/CosmicMarkcon/GoogleService-Info.plist` lines 5-28
  - `/Users/macmini/Desktop/CosmicMarkcon/android/app/google-services.json` lines 16-19
- Android release keystore passwords in:
  - `/Users/macmini/Desktop/CosmicMarkcon/android/gradle.properties` lines 52-55

## Migration checklist (to recreate native setup in another project)

1. Install matching npm dependencies from `package.json`.
2. iOS: merge custom Podfile sections (permissions setup, Firebase modular headers, AppLovin/video conflict handling, post_install build setting overrides).
3. iOS: copy/merge `AppDelegate.swift` push + Firebase + notification delegate logic.
4. iOS: merge required `Info.plist` keys (AppLovin, Facebook, AdMob, permission descriptions, SKAdNetwork, background modes, fonts).
5. iOS: ensure entitlements include `aps-environment` and target wiring is intact.
6. iOS: ensure Xcode build phases for Sentry and RNFirebase exist.
7. Android: merge root/app Gradle plugin and repository setup.
8. Android: re-add manual app dependencies (AppLovin adapters, Adjust helper deps, Firebase BoM modules, Compose, WorkManager if still needed).
9. Android: merge manifest permissions, metadata, services, receivers, and deep link entries.
10. Android: migrate custom widget native code (`widget/` package), `MainApplication` package registration, and widget resources.
11. Copy `google-services.json` and `GoogleService-Info.plist` for the new bundle/application IDs.
12. Re-create signing configs and replace secrets with environment/CI secrets.
13. Validate `firebase.json` behavior matches your desired collection policy.
14. Re-link and verify fonts (`react-native.config.js`, Info.plist `UIAppFonts`, Android assets).

## Inconsistencies to verify before/after migration

- Script path mismatch:
  - `package.json` references `toggle-widget.sh` at project root (line 21), but your widget script exists under `src/scripts/toggle-widget.sh`.
- Manifest has AppsFlyer install receiver declaration but AppsFlyer dependency is not obvious from `package.json`; verify if this is still required.
- Deep link host/scheme placeholders (`yourapp.onelink-domain.com`, `yourapp`) should be replaced for production.

## Final conclusion

Yes, you have done significant native-side integration work related to multiple libraries and one custom Android native module.

If you switch to another project, you must migrate:
- native build config,
- plist/manifest declarations,
- AppDelegate/MainApplication/MainActivity custom logic,
- custom widget native code,
- platform service files and secrets.

If you skip these, the new project may build but ads, push, attribution, crash reporting, deep links, social login, or widgets can break partially or fully.
