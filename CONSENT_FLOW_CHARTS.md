# GDPR User-Centric Granular Consent Flow Charts

## Overview
This document details all consent and ATT flow scenarios after the GDPR user-centric granular implementation.

**Key Changes:**
- Usercentrics uses `settingsId='2IFGjWbztccDOw'` (second layer)
- `ConsentStatus.GRANULAR` preserved (not collapsed to ACCEPTED/DENIED)
- ATT is **independent** of consent — always shown once per install on iOS
- Per-vendor grants drive SDK initialization
- Storage v3 (`@init_consent_state_v3`)

---

## Flow 1: Fresh Install — EU User (Consent Required), Accept All

```
┌─────────────────────────────────────────────────────────────────┐
│ APP LAUNCHED                                                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: IDLE → BOOTING                                            │
│ Effect: showSplash                                               │
│ • SplashService.ensureVisible()                                  │
│ • Start 45s timeout guard                                        │
│ Event: SPLASH_READY                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: SPLASH_VISIBLE                                            │
│ Effect: initializeMinimalBootstrap                               │
│ • SDKBootstrapper.initializeMinimal()                            │
│   └─ RevenueCat Phase 1 (anonymous, no device IDs)              │
│ Event: CONSENT_REQUIRED                                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ Effect: presentConsentUI                                         │
│ • ConsentGate.presentConsentUI()                                 │
│   ├─ Check MMKV cache (@init_consent_state_v3)                  │
│   │  └─ MISS (fresh install)                                    │
│   ├─ UsercentricsAdapter.initialize()                            │
│   │  └─ Usercentrics.configure({ settingsId: '2IFGjWbztccDOw' })│
│   ├─ isConsentRequired() → TRUE                                 │
│   │  └─ status.shouldCollectConsent = true (EU)                 │
│   └─ showConsentBanner()                                         │
│      └─ Usercentrics.showSecondLayer() (OVER SPLASH)            │
│                                                                   │
│ 🧑 USER SEES: Usercentrics second layer with vendor list         │
│ 🧑 USER ACTION: Taps "Accept All"                                │
│                                                                   │
│ • Response: UsercentricsUserInteraction.acceptAll                │
│ • parseConsentResponse() → ConsentStatus.ACCEPTED                │
│ • parseConsentGrants() → ALL vendor flags = true                 │
│ • persistConsent() → MMKV v3 storage                             │
│ Event: CONSENT_ACCEPTED                                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_ACCEPTED                                          │
│ Effect: storeConsentAccepted                                     │
│ • grants = consentGate.getConsentGrants()                        │
│   └─ All vendor flags: true                                     │
│ • SDKBootstrapper.initializeCore({ crashlytics: true, sentry: true }) │
│   ├─ Firebase init (analytics OFF, crashlytics ON, fullMode)    │
│   └─ Sentry init (fullMode)                                     │
│ • Platform check: iOS → Event: CORE_INIT_COMPLETE               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_PENDING                                               │
│ Effect: presentATTDialog                                         │
│ • ATT is INDEPENDENT — runs regardless of consent status         │
│ • ATTController.requestPermission()                              │
│   ├─ Check MMKV flag (@att_prompt_shown_v1) → NOT SET           │
│   ├─ Check getTrackingStatus() → 'not-determined'               │
│   └─ requestTrackingPermission() (SYSTEM PROMPT, OVER SPLASH)   │
│                                                                   │
│ 🧑 USER SEES: iOS ATT system alert                               │
│ 🧑 USER ACTION: Taps "Allow" or "Ask App Not to Track"           │
│                                                                   │
│ • MMKV flag set: @att_prompt_shown_v1 = true                    │
│ • Result: "authorized" or "denied"                               │
│ Event: ATT_AUTHORIZED (or ATT_DENIED)                            │
└────────────┬────────────────────────────────────────────────────┘
             │ (assuming AUTHORIZED)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_RESOLVED                                              │
│ Effect: storeATTAuthorized                                       │
│ • SDKBootstrapper.setATTAuthorized(true)                         │
│ Event: ADS_MODE_FINALIZED                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_TRACKING                                     │
│ Effect: initializeTrackingSDKs                                   │
│ • grants = consentGate.getConsentGrants()                        │
│ • SDKBootstrapper.initializeTracking(grants)                     │
│   ├─ firebaseAnalytics: true → firebase.enableAnalytics()       │
│   ├─ sentry: true → sentry.enableFullTracking()                 │
│   ├─ facebook: true → facebook.initialize({ attAuthorized: true })│
│   ├─ adjust: true → adjust.initialize()                          │
│   ├─ remote-config → firebase.initializeRemoteConfig()          │
│   └─ revenueCat: true → revenueCat.upgradeToPhase2()            │
│ Event: TRACKING_INIT_COMPLETE                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_ADS_PERSONALIZED                             │
│ Effect: initializePersonalizedAds                                │
│ • SDKBootstrapper.initializeAds() (currently skipped — no SDK key)│
│ Event: ADS_INIT_COMPLETE                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: NAVIGATING_TO_ONBOARDING                                  │
│ Effect: hideSplashAndNavigate                                    │
│ • SplashService.hide() — SPLASH FINALLY HIDDEN                   │
│ • NavigationService.navigateToOnboarding()                       │
│ Event: ONBOARDING_STARTED                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ONBOARDING_ACTIVE                                         │
│ 🧑 USER COMPLETES ONBOARDING                                     │
│ • orchestrator.onboardingCompleted()                             │
│ Event: ONBOARDING_COMPLETED                                      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: FINALIZING_ADS_MODE                                       │
│ Effect: applyFinalAdsConfiguration                               │
│ • AdsModeResolver.resolve(ACCEPTED, AUTHORIZED)                  │
│ • SDKBootstrapper.updateAdsConfiguration()                       │
│   └─ adjust.updateTrackingStatus(true)                          │
│   └─ revenueCatService.setupAttribution()                       │
│ Event: ACTIVATION_COMPLETE                                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: READY → ACTIVE                                            │
│ ✅ APP FULLY OPERATIONAL                                         │
│ • All tracking SDKs enabled                                      │
│ • ATT authorized                                                 │
│ • Full analytics + attribution                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Persisted to MMKV:**
- `@init_consent_state_v3`: `{ status: ACCEPTED, grants: { all true }, source: USERCENTRICS, timestamp, version: '3.0.0' }`
- `@att_prompt_shown_v1`: `true`

---

## Flow 2: Fresh Install — EU User, Granular Selection

```
[Same as Flow 1 until Usercentrics second layer is shown]

┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ • Usercentrics.showSecondLayer() displayed                       │
│                                                                   │
│ 🧑 USER SEES: Vendor list with toggles                           │
│ 🧑 USER ACTION: Toggles individual vendors:                      │
│    ✅ Firebase Analytics                                         │
│    ✅ Crashlytics                                                │
│    ❌ Facebook SDK                                               │
│    ✅ Adjust                                                     │
│    ❌ Sentry                                                     │
│    ✅ RevenueCat                                                 │
│    [Taps "Save"]                                                 │
│                                                                   │
│ • Response: UsercentricsUserInteraction.granular                 │
│ • parseConsentResponse() → ConsentStatus.GRANULAR ⭐             │
│ • parseConsentGrants():                                          │
│   ├─ firebaseAnalytics: true                                    │
│   ├─ crashlytics: true                                          │
│   ├─ sentry: false                                              │
│   ├─ facebook: false                                            │
│   ├─ adjust: true                                               │
│   ├─ appLovin: false                                            │
│   ├─ revenueCat: true                                           │
│   └─ appsFlyer: false                                           │
│ Event: CONSENT_ACCEPTED (GRANULAR treated as ACCEPTED for routing)│
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_ACCEPTED                                          │
│ Effect: storeConsentAccepted                                     │
│ • grants = consentGate.getConsentGrants()                        │
│ • SDKBootstrapper.initializeCore({                               │
│     crashlytics: { enabled: true, fullMode: true },              │
│     sentry: { enabled: false, fullMode: false }  ⭐             │
│   })                                                             │
│   ├─ Firebase init (crashlytics ON)                             │
│   └─ Sentry SKIPPED (no grant)                                  │
│ Event: CORE_INIT_COMPLETE                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_PENDING → ATT_RESOLVED                                │
│ • ATT prompt shown (independent of granular selection)           │
│ • User authorizes → attAuthorized = true                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_TRACKING                                     │
│ Effect: initializeTrackingSDKs                                   │
│ • SDKBootstrapper.initializeTracking(grants)                     │
│   ├─ firebaseAnalytics: true → ✅ firebase.enableAnalytics()    │
│   ├─ sentry: false → ⏭️  SKIPPED                                │
│   ├─ facebook: false → ⏭️  SKIPPED                              │
│   ├─ adjust: true → ✅ adjust.initialize()                       │
│   ├─ remote-config → ✅ (piggybacks on Firebase)                │
│   └─ revenueCat: true → ✅ revenueCat.upgradeToPhase2()         │
│                                                                   │
│ 📋 Console logs:                                                 │
│   [Bootstrapper] firebase-analytics initialized                  │
│   [Bootstrapper] sentry-full-tracking SKIPPED (no grant)         │
│   [Bootstrapper] facebook SKIPPED (no grant)                     │
│   [Bootstrapper] adjust initialized                              │
│   [Bootstrapper] revenuecat-phase2 initialized                   │
│ Event: TRACKING_INIT_COMPLETE                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
[Continue to NAVIGATING_TO_ONBOARDING → ONBOARDING → READY]

✅ RESULT: Only Firebase Analytics, Crashlytics, Adjust, and RevenueCat active
❌ Sentry, Facebook, AppLovin are NOT initialized
```

**Persisted to MMKV:**
- `@init_consent_state_v3`: `{ status: GRANULAR, grants: { firebaseAnalytics: true, crashlytics: true, facebook: false, ... }, source: USERCENTRICS }`

---

## Flow 3: Fresh Install — EU User, Decline All

```
[Same as Flow 1 until Usercentrics second layer]

┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ 🧑 USER ACTION: Taps "Decline All"                               │
│                                                                   │
│ • Response: UsercentricsUserInteraction.denyAll                  │
│ • parseConsentResponse() → ConsentStatus.DENIED                  │
│ • parseConsentGrants() → DEFAULT_CONSENT_GRANTS (all false)     │
│ Event: CONSENT_DENIED                                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_DENIED                                            │
│ Effect: storeConsentDenied                                       │
│ • initializeMinimalSDKs()                                        │
│   └─ SDKBootstrapper.initializeCore({                            │
│         crashlytics: { enabled: false },                         │
│         sentry: { enabled: false }                               │
│       })                                                         │
│       └─ Firebase.initialize({ analyticsEnabled: false,         │
│                                crashlyticsEnabled: false })      │
│       └─ Sentry SKIPPED                                          │
│                                                                   │
│ 📋 Console: [Orchestrator] ❌ Consent DENIED - skipping crash    │
│             reporting and analytics SDKs                         │
│ Event: CORE_INIT_COMPLETE                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_PENDING ⭐ (ATT is INDEPENDENT)                       │
│ Effect: presentATTDialog                                         │
│ • ATT prompt STILL SHOWN even though consent was denied          │
│ • ATTController.requestPermission()                              │
│                                                                   │
│ 🧑 USER SEES: iOS ATT system alert                               │
│ 🧑 USER ACTION: (any choice — doesn't matter for tracking)       │
│                                                                   │
│ Event: ATT_AUTHORIZED or ATT_DENIED                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_RESOLVED                                              │
│ • SDKBootstrapper.setATTAuthorized(true or false)                │
│ Event: ADS_MODE_FINALIZED                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_TRACKING                                     │
│ Effect: initializeTrackingSDKs                                   │
│ • Context check: consentStatus === DENIED                        │
│ • SHORT-CIRCUIT: Skip all tracking SDK init                      │
│ 📋 [Orchestrator] Consent DENIED — skipping tracking SDK init    │
│ Event: TRACKING_INIT_COMPLETE (no-op)                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_ADS_NON_PERSONALIZED                         │
│ • Ads SDK init (currently skipped — no key)                      │
│ Event: ADS_INIT_COMPLETE                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
[NAVIGATING_TO_ONBOARDING → ONBOARDING → READY]

✅ RESULT: ZERO tracking SDKs initialized
❌ Firebase Analytics OFF, Crashlytics OFF, Sentry OFF, Facebook OFF, Adjust OFF
⚠️  ATT was still shown (independence requirement) but has no effect
```

**Persisted to MMKV:**
- `@init_consent_state_v3`: `{ status: DENIED, grants: { all false }, source: USERCENTRICS }`
- `@att_prompt_shown_v1`: `true` (even though it doesn't enable tracking)

---

## Flow 4: Fresh Install — Non-EU User (Consent Not Required)

```
[Same as Flow 1 until presentConsentUI]

┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ Effect: presentConsentUI                                         │
│ • ConsentGate.presentConsentUI()                                 │
│   ├─ UsercentricsAdapter.initialize()                            │
│   ├─ isConsentRequired()                                         │
│   │  ├─ status.shouldCollectConsent = false                     │
│   │  └─ status.geolocationRuleset.bannerRequiredAtLocation = false│
│   │     (Non-EU region detected)                                 │
│   └─ BANNER SKIPPED ⭐                                           │
│                                                                   │
│ 📋 [ConsentGate] ✅ Consent not required in this region - auto-accepting│
│                                                                   │
│ • Auto-granted: ConsentStatus.ACCEPTED                           │
│ • Auto-granted: FULL_CONSENT_GRANTS (all vendors true)          │
│ • Source: REGION_NOT_REQUIRED                                    │
│ • persistConsent() → MMKV v3                                     │
│                                                                   │
│ 🧑 USER SEES: Nothing — no Usercentrics banner                   │
│                                                                   │
│ Event: CONSENT_ACCEPTED                                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_ACCEPTED                                          │
│ • All tracking SDKs will initialize (full grants)                │
│ Event: CORE_INIT_COMPLETE                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_PENDING (iOS only) ⭐                                 │
│ • ATT prompt STILL SHOWN even though banner was skipped          │
│ • Independence requirement: ATT always runs once per install     │
│                                                                   │
│ 🧑 USER SEES: iOS ATT system alert (first UI interaction)        │
│                                                                   │
│ Event: ATT_AUTHORIZED or ATT_DENIED                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
[INITIALIZING_TRACKING → NAVIGATING_TO_ONBOARDING → READY]

✅ RESULT: All tracking SDKs initialized (auto-consent from region)
✅ ATT shown once, result affects IDFA availability for Adjust/Facebook
```

**Persisted to MMKV:**
- `@init_consent_state_v3`: `{ status: ACCEPTED, grants: { all true }, source: REGION_NOT_REQUIRED }`

---

## Flow 5: Re-Launch with Cached Consent

```
┌─────────────────────────────────────────────────────────────────┐
│ APP LAUNCHED (subsequent launch)                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
[IDLE → BOOTING → SPLASH_VISIBLE → initializeMinimalBootstrap]
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ Effect: presentConsentUI                                         │
│ • ConsentGate.presentConsentUI()                                 │
│   ├─ checkCachedConsent()                                        │
│   │  ├─ Read MMKV: @init_consent_state_v3                       │
│   │  ├─ Version check: '3.0.0' ✅                                │
│   │  ├─ TTL check: < 365 days ✅                                 │
│   │  └─ Source check: USERCENTRICS or REGION_NOT_REQUIRED ✅    │
│   │                                                               │
│   │  📋 [ConsentGate] Using cached consent: GRANULAR             │
│   │                                                               │
│   └─ BANNER SKIPPED — return cached result                       │
│                                                                   │
│ 🧑 USER SEES: Nothing — no banner on re-launch                   │
│                                                                   │
│ • resolveConsent(cached)                                         │
│ Event: CONSENT_ACCEPTED (or CONSENT_DENIED if cached was DENIED)│
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_ACCEPTED                                          │
│ • SDKBootstrapper.initializeCore(cached grants)                  │
│ Event: CORE_INIT_COMPLETE                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: ATT_PENDING (iOS)                                         │
│ • ATTController.requestPermission()                              │
│   ├─ Check MMKV: @att_prompt_shown_v1 = true ✅                 │
│   ├─ Check getTrackingStatus(): 'authorized' or 'denied'        │
│   └─ PROMPT SKIPPED (already decided) ⭐                         │
│                                                                   │
│ 🧑 USER SEES: Nothing — no ATT prompt on re-launch               │
│                                                                   │
│ • Return cached status                                           │
│ Event: ATT_AUTHORIZED or ATT_DENIED                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: INITIALIZING_TRACKING                                     │
│ • SDKBootstrapper.initializeTracking(cached grants)              │
│   ├─ Only initialize vendors with grants[vendor] = true         │
│   └─ Skip vendors with grants[vendor] = false                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
[NAVIGATING_TO_ONBOARDING → ONBOARDING → READY]

✅ RESULT: Fast boot, no banners, granular grants honored
```

---

## Flow 6: User Changes Preferences from Settings

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧑 USER: Navigates to Profile → Legal → "Manage Privacy Preferences"│
│ 🧑 ACTION: Taps row                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Profile.handleManagePrivacyPreferences()                         │
│ • getOrchestrator().reopenConsent()                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ InitializationOrchestrator.reopenConsent()                       │
│ • ConsentGate.reopenConsentUI()                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ ConsentGate.reopenConsentUI()                                    │
│ • UsercentricsAdapter.showSecondLayerForUpdate()                 │
│   ├─ Usercentrics.showSecondLayer() (single-shot, no loop)      │
│   └─ Wait for user decision                                      │
│                                                                   │
│ 🧑 USER SEES: Usercentrics second layer with current toggles     │
│ 🧑 SCENARIO A: User changes toggles and taps "Save"              │
│ 🧑 SCENARIO B: User taps back/dismiss without changing           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
       ┌─────┴─────┐
       │           │
    (A) Changed  (B) Dismissed
       │           │
       ▼           ▼
┌──────────────┐ ┌────────────────────────────┐
│ SCENARIO A   │ │ SCENARIO B                 │
│              │ │ • response.userInteraction │
│ • response   │ │   = undefined/null         │
│   .userInt-  │ │ • parseConsentResponse()   │
│   eraction   │ │   → source = DEFAULT       │
│   = granular │ │ • return null              │
│   /acceptAll │ │                            │
│   /denyAll   │ │ 📋 No explicit decision    │
│ • return new │ │    — existing consent      │
│   ConsentRes │ │    preserved               │
│   ult        │ │                            │
└──────┬───────┘ └────────┬───────────────────┘
       │                  │
       │                  └──────────────────────┐
       │                                         │
       ▼                                         ▼
┌─────────────────────────────────────┐ ┌──────────────────────┐
│ • resolveConsent(result)            │ │ • return null to     │
│ • persistConsent(result)            │ │   Profile screen     │
│   └─ MMKV v3 updated                │ │ • Profile: no change │
│ • return result to orchestrator     │ └──────────────────────┘
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ InitializationOrchestrator.reopenConsent() (continued)           │
│ • result = ConsentResult (not null)                              │
│ • attAuthorized = attController.getStatus() === AUTHORIZED       │
│ • SDKBootstrapper.applyConsentUpdate(result.grants, attAuthorized)│
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ SDKBootstrapper.applyConsentUpdate(grants, attAuthorized)        │
│                                                                   │
│ Example: User DISABLED Facebook, ENABLED Sentry                  │
│                                                                   │
│ • firebase: grants.firebaseAnalytics                             │
│   └─ true → firebase.enableAnalytics() (already on, no change)  │
│                                                                   │
│ • sentry: grants.sentry                                          │
│   └─ true → sentry.enable() + sentry.enableFullTracking() ✅    │
│   📋 [Bootstrapper] Sentry enabled                               │
│                                                                   │
│ • facebook: grants.facebook                                      │
│   └─ false → facebook.disable() ✅                               │
│   📋 [Bootstrapper] Facebook disabled                            │
│                                                                   │
│ • adjust: grants.adjust                                          │
│   └─ true → adjust.enable() + updateTrackingStatus(attAuthorized)│
│                                                                   │
│ • appLovin: grants.appLovin                                      │
│   └─ (if initialized) configureForPersonalizedAds() or Non...   │
│                                                                   │
│ 📋 [Bootstrapper] Runtime consent update complete                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ • orchestrator.reopenConsent() returns new status                │
│ • Profile screen: setConsentStatus(newStatus)                    │
│ • UI updates: subtitle shows "Custom selection"                  │
│                                                                   │
│ ✅ LIVE UPDATE COMPLETE — NO APP RESTART NEEDED                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flow 7: iOS ATT Revisit Row (Settings)

```
┌─────────────────────────────────────────────────────────────────┐
│ Profile Screen — Legal Card                                      │
│ • Condition: Platform.OS === 'ios' &&                            │
│              getOrchestrator().getATTStatus() !== AUTHORIZED &&  │
│              getATTStatus() !== NOT_APPLICABLE                   │
│ • showATTRevisitRow = true ✅                                    │
│                                                                   │
│ 🧑 USER SEES: Extra row "App Tracking"                           │
│              "Change tracking permission in iOS Settings"        │
│ 🧑 ACTION: Taps row                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Profile.handleOpenAppSettingsForATT()                            │
│ • showAlert({                                                    │
│     title: 'App Tracking',                                       │
│     message: 'Tracking permission can only be changed in iOS     │
│               Settings. Open Settings now?',                     │
│     buttons: ['Cancel', 'Open Settings']                         │
│   })                                                             │
│                                                                   │
│ 🧑 USER SEES: Alert dialog                                       │
│ 🧑 ACTION: Taps "Open Settings"                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ • Linking.openURL('app-settings:')                               │
│                                                                   │
│ 📱 iOS SYSTEM: Opens Settings app → CosmicMarkcon entry          │
│                                                                   │
│ 🧑 USER: Toggles "Allow App to Request to Track" switch          │
│ 🧑 USER: Returns to app                                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Profile screen: AppState change listener triggers                │
│ • checkPermissionStatus() (for notifications)                    │
│ • ATT status is NOT re-checked automatically (system limitation) │
│                                                                   │
│ ⚠️  User must RESTART the app for ATT change to take effect      │
│ ⚠️  On next launch, ATTController.requestPermission() will:      │
│     ├─ Check @att_prompt_shown_v1 = true                        │
│     ├─ Check getTrackingStatus() → reads new system value       │
│     └─ Return new status WITHOUT re-showing prompt              │
│                                                                   │
│ Next boot → SDKBootstrapper.applyConsentUpdate() will receive    │
│             the updated attAuthorized flag                       │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** iOS does not allow re-prompting ATT. The system prompt appears exactly once per install. After that, users must manually change it in Settings, and the app must be restarted for the new status to propagate.

---

## Flow 8: Storage V2 → V3 Migration (Upgrade Scenario)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER UPGRADES APP (has existing @init_consent_state_v2 in MMKV) │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ ConsentStorage constructor runs (first boot after upgrade)       │
│ • Check for LEGACY_KEYS = ['@init_consent_state_v2']            │
│ • storage.getString('@init_consent_state_v2') exists            │
│ • storage.remove('@init_consent_state_v2') ✅                   │
│                                                                   │
│ 📋 [ConsentStorage] Cleared legacy consent key:                 │
│     @init_consent_state_v2                                       │
│                                                                   │
│ RESULT: v2 cache dropped, fresh v3 consent required             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STATE: CONSENT_PENDING                                           │
│ • ConsentGate.presentConsentUI()                                 │
│   ├─ checkCachedConsent()                                        │
│   │  ├─ Read MMKV: @init_consent_state_v3 → NOT FOUND           │
│   │  └─ return null                                              │
│   └─ Usercentrics.showSecondLayer() ✅                           │
│                                                                   │
│ 🧑 USER SEES: Usercentrics second layer (one-time after upgrade) │
│ 🧑 ACTION: Makes fresh granular decision with per-vendor toggles │
│                                                                   │
│ • New v3 consent persisted with per-vendor grants                │
└─────────────────────────────────────────────────────────────────┘
```

**Rationale:** v2 used coarse 4-bucket grants; v3 uses per-vendor flags. Dropping v2 ensures users make an explicit granular decision aligned with the new schema, avoiding stale/inconsistent grants.

---

## Summary Matrix

| Scenario | Usercentrics Banner | ATT Prompt | Tracking SDKs | Persisted Status |
|----------|-------------------|------------|---------------|------------------|
| **Fresh EU, Accept All** | ✅ Shown (2nd layer) | ✅ Shown (independent) | All enabled | ACCEPTED + all grants true |
| **Fresh EU, Granular** | ✅ Shown (2nd layer) | ✅ Shown (independent) | Per-vendor gated | GRANULAR + per-vendor grants |
| **Fresh EU, Decline All** | ✅ Shown (2nd layer) | ✅ Shown (independent) ⭐ | All disabled | DENIED + all grants false |
| **Fresh Non-EU** | ❌ Auto-accepted | ✅ Shown (independent) ⭐ | All enabled | ACCEPTED + source: REGION_NOT_REQUIRED |
| **Re-launch (cached)** | ❌ Skipped | ❌ Skipped | Per cached grants | [existing] |
| **Settings re-open** | ✅ Shown (on demand) | ❌ Can't re-prompt | Live toggled | Updated in MMKV |
| **Upgrade v2→v3** | ✅ Shown (v2 dropped) | Depends on prior state | Fresh decision | GRANULAR + per-vendor |

---

## Key Implementation Points

### 1. ATT Independence
- **OLD:** ATT skipped when consent denied (privacy short-circuit)
- **NEW:** ATT always runs on iOS, once per install, regardless of consent (ACCEPTED/DENIED/GRANULAR)
- **Why:** User requirement — "ATT will be independent... ATT will be shown in all cases"

### 2. GRANULAR Preservation
- **OLD:** `UsercentricsUserInteraction.granular` → collapsed to ACCEPTED or DENIED based on `grants.analytics || grants.advertising`
- **NEW:** `granular` → `ConsentStatus.GRANULAR` preserved end-to-end
- **Why:** Enables faithful per-vendor SDK gating

### 3. Per-Vendor SDK Gating
- **OLD:** `initializeTracking()` always initialized all SDKs when consent accepted
- **NEW:** `initializeTracking(grants)` skips each SDK whose `grants[vendor]` is false
- **Runtime updates:** `applyConsentUpdate(grants)` toggles live SDKs via `enable()`/`disable()` methods

### 4. Splash Timing
- Usercentrics second layer shown **over splash** (splash stays visible)
- ATT prompt shown **over splash** (right after consent resolves, before tracking init)
- Splash hidden **after tracking init completes**, before navigating to onboarding
- **Total splash duration:** ~5–15 seconds (Usercentrics + ATT + SDK init)

### 5. Storage V3
- Key: `@init_consent_state_v3`, version `3.0.0`
- Schema: `{ status, grants (with 12 flags), source, timestamp, version }`
- Migration: Drop v2 on construction → force fresh consent with per-vendor schema

---

## Console Log Signatures (for debugging)

```typescript
// Consent decision
'[ConsentGate] Using cached consent: GRANULAR'
'[ConsentGate] ✅ Consent not required in this region - auto-accepting'
'[Usercentrics] 🔧 Granular consent (preserved). Grants: {...}'

// ATT independence
'[Orchestrator] Platform is iOS - proceeding to ATT'
'[ATT] Skipping prompt — already decided. Status: authorized'

// Per-vendor gating
'[Bootstrapper] firebase-analytics initialized'
'[Bootstrapper] sentry-full-tracking SKIPPED (no grant)'
'[Bootstrapper] facebook SKIPPED (no grant)'

// Runtime update
'[Bootstrapper] Applying runtime consent update. Grants: {...}'
'[Bootstrapper] Sentry enabled'
'[Bootstrapper] Facebook disabled'
'[Bootstrapper] Runtime consent update complete'
```

---

**End of Flow Charts**
