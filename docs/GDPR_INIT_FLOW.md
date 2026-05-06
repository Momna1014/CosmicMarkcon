# GDPR Initialization Flow and Consent Gating

## Overview
This document describes the GDPR-compliant initialization flow, the consent-driven SDK configuration, and the native hardening that prevents data collection before user consent.

Goals:
- No analytics, advertising, or attribution data is collected before consent.
- Consent choices from Usercentrics drive runtime SDK configuration.
- If a vendor SDK cannot be guaranteed to run anonymously pre-consent, it remains disabled until consent.

## Flow Summary
1. App starts and keeps the splash screen visible.
2. Usercentrics is initialized and region is detected (EU or non-EU).
3. EU users see the consent banner and must choose; non-EU auto-accepts.
4. If consent allows ads, ATT prompt is shown on iOS (no timeouts).
5. SDKs are initialized in parallel based on consent and ATT status.
6. Splash is hidden only after consent and SDK configuration completes.

Entry point: src/InitializationFlow/startApp.ts

## Consent Grants and SDK Mapping
Consent grants are derived from Usercentrics and stored in a cached ConsentResult.

Grants:
- analytics
- advertising
- personalization
- crashReporting

Mapping:
- analytics: Firebase Analytics, Adjust
- advertising: AdMob, AppLovin, Facebook SDK
- personalization: RevenueCat attribution and identifiers
- crashReporting: Firebase Crashlytics, Sentry

## SDK Behavior Matrix

Pre-consent:
- Firebase Analytics: disabled
- Firebase Crashlytics: disabled
- Sentry: not initialized (explicitly closed)
- Facebook SDK: not initialized, autolog disabled
- Adjust: not initialized
- AdMob: not initialized
- AppLovin: not initialized
- RevenueCat attribution: disabled
- Remote Config: not initialized

Consent accepted:
- Firebase Analytics: enabled
- Firebase Crashlytics: enabled
- Sentry: initialized (no PII), enabled
- Facebook SDK: initialized, autolog enabled
- Adjust: initialized, third-party sharing based on ATT and granular consent
- AdMob: initialized, personalized or non-personalized based on ATT
- AppLovin: initialized with privacy flags based on consent and ads mode
- RevenueCat attribution: enabled if ATT authorized
- Remote Config: initialized

Consent denied:
- Firebase Analytics: disabled
- Firebase Crashlytics: disabled
- Sentry: closed/disabled
- Facebook SDK: disabled
- Adjust: third-party sharing disabled
- AdMob: initialized in non-personalized mode only
- AppLovin: initialized in non-personalized mode only
- RevenueCat attribution: disabled
- Remote Config: not initialized

## Key JS Consent Gates

- FirebaseService initializes with analytics and crashlytics disabled by default.
- setupFirebaseCrashlytics is called only after crashReporting consent.
- setupFirebaseAnalytics is called only after analytics consent.
- FacebookAnalyticsService requires explicit consent before initialize/log.
- Adjust SDK third-party sharing is gated on advertising/analytics consent.
- paywallAnalytics logs are gated by firebaseService.isAnalyticsEnabled() and facebookAnalytics.canLog().
- AppContext only sets Firebase user properties when analytics is enabled.

Relevant files:
- src/InitializationFlow/startApp.ts
- src/InitializationFlow/parallel/initEssentials.ts
- src/InitializationFlow/parallel/initFullSDKs.ts
- src/InitializationFlow/parallel/initGranularSDKs.ts
- src/InitializationFlow/parallel/initDeniedMode.ts
- src/InitializationFlow/sdks/setupFirebase.ts
- src/InitializationFlow/sdks/setupSentry.ts
- src/InitializationFlow/sdks/setupAdjust.ts
- src/InitializationFlow/sdks/setupFacebook.ts
- src/InitializationFlow/sdks/setupAdMob.ts
- src/InitializationFlow/sdks/setupAppLovin.ts
- src/services/firebase/FirebaseService.ts
- src/services/FacebookAnalyticsService.ts
- src/utils/paywallAnalytics.ts

## Native Hardening (Pre-Consent Auto-Collection)

### React Native Config Layer
- **firebase.json**: All auto-collection/auto-init flags set to `false`:
  - `analytics_auto_collection_enabled: false`
  - `crashlytics_auto_collection_enabled: false`
  - `messaging_auto_init_enabled: false`
  - `in_app_messaging_auto_collection_enabled: false`
  - `perf_auto_collection_enabled: false`
  - `perf_collection_enabled: false`
  - `remote_config_auto_fetch_enabled: false`
- **app.json**: `delay_app_measurement_init: true` — prevents AdMob/Google SDK early measurement.

### iOS
- Firebase collection disabled on startup in AppDelegate.swift.
- Info.plist disables Firebase Analytics/Crashlytics auto-collection, FCM auto-init, Performance collection, and Remote Config auto-fetch.
- Info.plist disables Facebook auto-init, autolog, and advertiser ID collection.
- AppLovin SDK key removed from Info.plist to prevent auto-initialization.
- **PrivacyInfo.xcprivacy** declares all collected data types (Device ID, Crash Data, Performance Data, Product Interaction, Advertising Data, Purchase History, Diagnostics), tracking domains, and sets `NSPrivacyTracking: true` (ATT-gated).

Files:
- ios/Project_Structure/AppDelegate.swift
- ios/Project_Structure/Info.plist
- ios/Project_Structure/PrivacyInfo.xcprivacy

### Android
- AndroidManifest disables Firebase Analytics/Crashlytics auto-collection, FCM auto-init, Performance collection, Remote Config auto-fetch, InApp Messaging auto-collection, and deferred deep links.
- AndroidManifest disables Facebook auto-init, autolog, and advertiser ID collection.
- AppLovin SDK key removed from AndroidManifest to prevent auto-initialization.

Files:
- android/app/src/main/AndroidManifest.xml

## Remaining Risks and Notes

1. AppLovin SDK key removed
The AppLovin SDK key has been removed from both Info.plist and AndroidManifest.xml. The SDK now initializes only after consent via runtime `AppLovinMAX.initialize()`. If AppLovin is re-enabled in the future, ensure the key is only supplied at runtime.

2. Firebase build scripts
Crashlytics build scripts still run in Xcode/Gradle; they do not collect user data by themselves. Runtime collection is disabled by native config flags and JS-layer gating.

3. Pre-consent network calls
`AppUpdateService.checkForUpdate()` and `OpenAIConfigService.initialize()` make network calls before consent. These send only static auth codes, app version, and platform — no personal data or device identifiers. This is defensible under legitimate interest (force-update safety) and does not constitute personal data processing under GDPR.

4. Apple Privacy Manifest
`PrivacyInfo.xcprivacy` must be kept in sync when SDKs are added/removed. Apple requires this manifest for App Store submission since Spring 2024.

## Verification Checklist

1. Fresh install, EU IP:
   - Usercentrics banner appears before navigation.
   - No Firebase/Facebook/Adjust/AdMob network calls before consent (verify via proxy).

2. Deny consent:
   - Firebase Analytics/Crashlytics remain disabled.
   - Sentry is closed/disabled.
   - Facebook/Adjust third-party sharing remain disabled.
   - Ads are non-personalized only.

3. Accept consent:
   - SDKs initialize in parallel after consent.
   - ATT prompt shown on iOS when advertising consent is granted.
   - Personalized ads only if ATT authorized.

4. Consent change:
   - If consent is changed later, re-run the initialization flow or apply the same grant-based setup functions to reconfigure SDKs.

## Summary
This implementation ensures no consent-dependent SDK collects or logs data before explicit consent. Native configurations explicitly disable auto-collection. SDKs are enabled only after Usercentrics grants, and event logging is gated at the service layer.