# Consent & Privacy — iOS vs Android Implementation Guide

> Audience: **engineering managers, QA, legal, app reviewers**.
> Scope: how the CosmicMarkcon app handles **GDPR (EU)**, **App Tracking Transparency (iOS)**,
> **Google Play Data Safety (Android)** and per-vendor granular consent.
> Source of truth in code: [src/initialization](src/initialization)

---

## 1. Executive summary (for your manager)

| Area | What we do | Why it matters |
|---|---|---|
| **CMP** | Usercentrics CMP v2 with **settingsId** `2IFGjWbztccDOw`. Second layer (granular toggles) is shown directly. | IAB TCF v2.2 + GDPR Art. 7 compliant. Auditable consent log on Usercentrics dashboard. |
| **Granular consent** | 8 vendors gated independently: Firebase Analytics, Crashlytics, Sentry, Facebook, Adjust, AppLovin, RevenueCat, AppsFlyer. | GDPR Art. 7(2): consent must be **specific** per purpose, not bundled. |
| **Withdrawal** | `Profile → Manage Privacy Preferences` re-opens the second layer **and** live-toggles already-running SDKs (no restart). | GDPR Art. 7(3): withdrawing consent must be **as easy as giving it**. |
| **iOS ATT** | Prompted **once per install**, **independently of GDPR consent** (even if the user denied all). | Apple App Store Review Guideline 5.1.2 — required since iOS 14.5. |
| **Android** | No ATT. GDPR consent + Google UMP-like flow handled entirely by Usercentrics. Play Console Data Safety form must match. | Google Play Developer Program Policy: User Data section. |
| **Storage** | MMKV `@init_consent_state_v3`, 365-day TTL, version-tagged. Legacy v2 dropped on upgrade. | GDPR Art. 5(1)(e): storage limitation. Yearly re-consent also matches IAB TCF guidance. |
| **Failure modes** | Network failure / SDK timeout / dismissal → **fail-closed** to "denied". | GDPR Art. 7(1): controller must be able to **demonstrate** consent. No consent = no tracking. |

---

## 2. Component map

```
src/initialization/
├── consent/
│   ├── UsercentricsAdapter.ts   ← talks to native Usercentrics SDK
│   ├── ConsentGate.ts           ← cache + present + persist
│   ├── ConsentStorage.ts        ← MMKV v3 storage
│   └── types.ts                 ← ConsentStatus / ConsentGrants
├── att/
│   └── ATTController.ts         ← iOS App Tracking Transparency
├── bootstrapper/
│   └── SDKBootstrapper.ts       ← per-vendor SDK init + live toggling
├── state-machine/               ← deterministic boot FSM
└── orchestrator/
    └── InitializationOrchestrator.ts  ← single entry point
```

### Data types

```ts
enum ConsentStatus { UNKNOWN, ACCEPTED, DENIED, GRANULAR }

interface ConsentGrants {            // 8 per-vendor flags + 4 legacy buckets
  firebaseAnalytics: boolean;
  crashlytics: boolean;
  sentry: boolean;
  facebook: boolean;
  adjust: boolean;
  appLovin: boolean;
  revenueCat: boolean;
  appsFlyer: boolean;
  // legacy bundles kept for back-compat
  analytics, advertising, personalization, crashReporting: boolean;
}
```

---

## 3. Side-by-side flows: iOS vs Android

### 3.1 Fresh install — EU user (GDPR applies)

| Step | iOS | Android |
|---|---|---|
| 1 | App launches, splash visible | Same |
| 2 | Minimal SDKs (RevenueCat phase 1) initialized — **no tracking** | Same |
| 3 | Usercentrics initialized with `settingsId=2IFGjWbztccDOw` | Same |
| 4 | `isConsentRequired()` → **true** (EU geolocation) | Same |
| 5 | **Second layer shown** with per-vendor toggles | Same |
| 6 | User picks Accept All / Deny All / Granular | Same |
| 7 | Per-vendor grants persisted to MMKV v3 | Same |
| 8 | Core SDKs (Crashlytics/Sentry) init **only if granted** | Same |
| 9 | **ATT system prompt shown** (independent of consent) | **Skipped** — Android has no ATT |
| 10 | Tracking SDKs init based on `grants × ATT` | Tracking SDKs init based on `grants` only |
| 11 | Splash hidden, navigate to onboarding | Same |

### 3.2 Fresh install — Non-EU user

| Step | iOS | Android |
|---|---|---|
| 1-3 | Same as EU | Same |
| 4 | `bannerRequiredAtLocation === false` → **no banner** | Same |
| 5 | Auto-accept with `source = REGION_NOT_REQUIRED`, all 8 grants ON | Same |
| 6 | All SDKs initialized (consent presumed) | Same |
| 7 | **ATT system prompt still shown** | Skipped |
| 8 | Splash hidden | Same |

> **Why ATT outside EU?** ATT is an **Apple platform requirement**, not a GDPR one. iOS 14.5+ requires it for any IDFA access regardless of region. Skipping it would fail App Store review.

### 3.3 Re-launch (consent already cached)

| Step | iOS | Android |
|---|---|---|
| 1 | Splash visible | Same |
| 2 | `ConsentGate.checkCachedConsent()` → MMKV hit, `source=USERCENTRICS` | Same |
| 3 | **No banner shown**, cached grants applied | Same |
| 4 | Core + tracking SDKs init per cached grants | Same |
| 5 | ATT pre-check: system status ≠ `not-determined` → **no prompt** | N/A |
| 6 | Splash hidden | Same |

### 3.4 User changes preferences from Settings

| Step | iOS | Android |
|---|---|---|
| 1 | Profile → "Manage Privacy Preferences" tap | Same |
| 2 | `Orchestrator.reopenConsent()` called | Same |
| 3 | `UsercentricsAdapter.showSecondLayerForUpdate()` opens second layer (5-min timeout) | Same |
| 4 | User toggles vendors and saves (or dismisses) | Same |
| 5 | If saved: new grants persisted to MMKV | Same |
| 6 | `SDKBootstrapper.applyConsentUpdate(grants, attAuthorized)` runs | `applyConsentUpdate(grants)` |
| 7 | Live SDK toggling: `firebase.disable() / sentry.enable() / facebook.disable() / adjust.disable()` etc. | Same (minus ATT-gated paths) |
| 8 | If user dismisses (timeout / X button) → existing consent kept untouched | Same |

> **GDPR compliance**: this satisfies Art. 7(3) "withdraw consent at any time, as easily as it was given". No app restart, no permission loss for vendors that stay ON.

### 3.5 iOS ATT revisit row

iOS does **not** allow re-prompting ATT once the user has decided. If our app is shown without ATT authorization, Profile shows an extra row:
```
🛡️  App Tracking
    [Open Settings →]
```
Tapping deep-links to `app-settings:` so the user can flip the toggle in iOS Settings → Privacy → Tracking. On next app launch, the new ATT status is detected and tracking SDKs are reconfigured.

Android has **no equivalent** — the row is hidden via `Platform.OS === 'ios'` guard.

---

## 4. The exact decision matrix

| User region | Banner | User decision | iOS ATT | Firebase/Crashlytics | Facebook/Adjust | AppLovin |
|---|---|---|---|---|---|---|
| EU | Shown | Accept All | AUTHORIZED | ✅ ON | ✅ ON | ✅ Personalized |
| EU | Shown | Accept All | DENIED | ✅ ON | ⚠️ Limited (no IDFA) | ⚠️ Non-personalized |
| EU | Shown | Granular (Firebase ON, Facebook OFF) | AUTHORIZED | ✅ ON | Adjust ✅ / Facebook ⏭️ | per granted |
| EU | Shown | Deny All | AUTHORIZED | ❌ OFF | ❌ OFF | ⚠️ Non-personalized |
| EU | Shown | Deny All | DENIED | ❌ OFF | ❌ OFF | ⚠️ Non-personalized |
| Non-EU | Skipped | Auto-accept | AUTHORIZED | ✅ ON | ✅ ON | ✅ Personalized |
| Non-EU | Skipped | Auto-accept | DENIED | ✅ ON | ⚠️ Limited | ⚠️ Non-personalized |
| Android EU | Shown | Accept All | n/a | ✅ ON | ✅ ON | ✅ Personalized |
| Android EU | Shown | Granular | n/a | per granted | per granted | per granted |
| Android EU | Shown | Deny All | n/a | ❌ OFF | ❌ OFF | ⚠️ Non-personalized |
| Android Non-EU | Skipped | Auto-accept | n/a | ✅ ON | ✅ ON | ✅ Personalized |

---

## 5. Console-log signatures (what to look for in logs)

Each step prints a structured log so QA / support can verify the flow without a debugger.

### Boot — happy path EU iOS, granular consent
```
[Orchestrator] Initialized
[Orchestrator] Starting boot sequence...
[ConsentGate] ════════════════════════════════════════════════
[ConsentGate]  PRESENT CONSENT UI — boot consent flow
[ConsentGate] ════════════════════════════════════════════════
[ConsentGate] Checking for cached consent...
[ConsentGate] No cached consent found
[ConsentGate] No cached consent — initializing Usercentrics SDK…
[Usercentrics] Initializing (attempt 1/3)
[Usercentrics] Configuring with settingsId: 2IFGjWbztccDOw
[Usercentrics] Initialized successfully
[ConsentGate] Checking if consent is required (geolocation lookup)…
[Usercentrics] Status received: {"shouldCollectConsent":true,"bannerRequiredAtLocation":true,…}
[Usercentrics] Consent IS required (shouldCollectConsent is true)
[ConsentGate] Consent required - showing banner...
[Usercentrics] ┌──────────────────────────────────────────────
[Usercentrics] │ SHOWING CONSENT BANNER (first launch / required)
[Usercentrics] │ Loop until user makes explicit decision
[Usercentrics] │ Timeout per attempt: 120000ms
[Usercentrics] └──────────────────────────────────────────────
[Usercentrics] ⏳ Awaiting user decision (attempt #1)…
   …user toggles + Save…
[Usercentrics] Parsing response - userInteraction: granular
[Usercentrics] 🔧 Granular consent (preserved). Grants: {…}
[Usercentrics] ── Parsing per-vendor grants from 8 consent entries ──
[Usercentrics]   ✅  Firebase Analytics → ON
[Usercentrics]   ⏭️  Facebook → OFF
[Usercentrics]   ✅  Adjust → ON
   …
[Usercentrics] ── Final per-vendor grants ──
[Usercentrics]   firebaseAnalytics : true
[Usercentrics]   facebook          : false
[Usercentrics]   adjust            : true
   …
[ConsentGate] Consent resolved: GRANULAR
[ConsentStorage] Consent stored: GRANULAR
[Orchestrator] ✅ Consent ACCEPTED/GRANULAR. Grants: {crashlytics:true, sentry:false}
[Orchestrator] Core SDKs initialized
[Orchestrator] Platform is iOS - proceeding to ATT
[ATT] ════════════════════════════════════════════════
[ATT]  REQUEST TRACKING PERMISSION (independent of consent)
[ATT] ════════════════════════════════════════════════
[ATT] Pre-check: system status = not-determined | persistedShown = false
[ATT] 📲 Showing system ATT prompt now…
[ATT] ✅ Permission decision: AUTHORIZED (raw: authorized)
[ATT] Persisted ATT_PROMPT_SHOWN flag in MMKV
[Orchestrator] ATT AUTHORIZED - proceeding with full tracking
[Bootstrapper] Firebase Analytics → enabled
[Bootstrapper] Facebook → SKIPPED (no grant)
[Bootstrapper] Adjust → enabled
   …
```

### Re-open path (Manage Privacy Preferences)
```
[ConsentGate] ════════════════════════════════════════════════
[ConsentGate]  RE-OPEN CONSENT UI (Manage Privacy Preferences)
[ConsentGate] ════════════════════════════════════════════════
[Usercentrics] ┌──────────────────────────────────────────────
[Usercentrics] │ RE-OPEN SECOND LAYER (Manage Privacy Prefs)
[Usercentrics] │ Timeout: 300000ms (5 min)
[Usercentrics] └──────────────────────────────────────────────
   …user changes Facebook OFF → ON…
[Usercentrics] Second layer returned. Parsing response...
[Usercentrics] ✅ Second layer produced new decision: GRANULAR
[ConsentGate] reopenConsentUI: NEW consent decision → GRANULAR
[ConsentStorage] Consent stored: GRANULAR
[Bootstrapper] applyConsentUpdate: facebook → enable()
```

### Re-open with no change (the timeout case you saw)
```
[Usercentrics] ┌──────────────────────────────────────────────
[Usercentrics] │ RE-OPEN SECOND LAYER (Manage Privacy Prefs)
[Usercentrics] │ Timeout: 300000ms (5 min)
[Usercentrics] └──────────────────────────────────────────────
   …5 minutes pass…
[Usercentrics] ⏱️ Re-open second layer timed out — keeping existing consent (no change)
[ConsentGate] reopenConsentUI: no change — existing consent preserved
```

> **This is now treated as a normal "no-op" instead of an error**, which is what you want — the user simply walked away.

---

## 6. About the timeout error you reported

```
UsercentricsAdapter.ts:189 [Usercentrics] Re-open second layer failed:
TimeoutError: Consent banner timeout
```

### Why it happened
- `showSecondLayerForUpdate()` was wrapped in `withTimeout(120_000ms)`.
- The promise returned by `Usercentrics.showSecondLayer()` only resolves when the user **dismisses** the second layer (Save / X / back button).
- If the user opened "Manage Privacy Preferences" and then **switched away** from the app or just left it open, the 2-minute window expired and we threw a `TimeoutError`.

### What we changed
1. Re-open path now uses **5 min** timeout (`REOPEN_BANNER_TIMEOUT = 300000`) — boot path stays at 2 min.
2. A `TimeoutError` in re-open is **no longer logged as an error**. It's logged as `⏱️ kept existing consent (no change)` and returns `null`. Your `Orchestrator.reopenConsent()` already handles `null` correctly.
3. Boot-path `showConsentBanner()` keeps its loop-until-explicit-decision behaviour (GDPR demands an explicit choice on first launch).

### What you'll see now
- Tap "Manage Privacy Preferences" → wait 5 min → no error in console, no app crash, original consent preserved.
- Tap "Manage Privacy Preferences" → save changes within 5 min → live SDK toggling, persisted.

---

## 7. GDPR / privacy-law mapping

| Requirement | Article | How we comply |
|---|---|---|
| Lawfulness of processing | Art. 6 | Consent (Art. 6(1)(a)) — captured via Usercentrics CMP for every non-strictly-necessary vendor. |
| Conditions for consent | Art. 7 | Free, specific, informed, unambiguous. Pre-ticked boxes are forbidden — Usercentrics second layer ships all toggles **OFF by default** in the granular view. |
| Right to withdraw | Art. 7(3) | "Manage Privacy Preferences" in Profile → second layer → live SDK toggling. No restart. |
| Demonstrate consent | Art. 7(1) | MMKV stores `{status, grants, source, timestamp, version}`. Usercentrics dashboard keeps an immutable audit log keyed by user UUID. |
| Storage limitation | Art. 5(1)(e) | 365-day TTL on consent record. After expiry the banner re-appears. |
| Children's data | Art. 8 | App is rated 17+ (iOS) / Mature (Android). No special children's flow needed. |
| Data minimisation | Art. 5(1)(c) | Vendors disabled by default; only enabled SDKs collect data. |
| Right of access / erasure | Art. 15 / 17 | Out-of-band via support email (documented in PRIVACY_POLICY.md). |

### Apple-specific
- **App Tracking Transparency** is required since iOS 14.5 for any cross-app tracking using IDFA. Our flow shows it once per install in the splash sequence.
- **Privacy Manifest (PrivacyInfo.xcprivacy)** declares all required-reason APIs and SDK data collection categories. Auto-aggregated by CocoaPods at build time — see the `[Privacy Manifest Aggregation]` line in `pod install` output.

### Google-specific
- **Play Console Data Safety form** must list every category of data each enabled SDK collects. Update if you add/remove a vendor in Usercentrics.
- **Google Play Families Policy** does not apply (app is not in Families program).

---

## 8. Per-platform "what does the user see"

### iOS — first launch in EU
1. Splash logo (animated)
2. **Usercentrics second layer** modal (toggleable rows for each vendor, "Save" + "Accept All" + "Deny All" buttons)
3. **iOS system ATT prompt** ("Allow CosmicMarkcon to track your activity across other companies' apps and websites?" — Allow / Ask App Not To Track)
4. Onboarding screens

### iOS — first launch outside EU
1. Splash logo
2. *(no consent banner)*
3. **iOS system ATT prompt**
4. Onboarding

### iOS — every subsequent launch
1. Splash logo
2. Onboarding (or home if already onboarded)

### Android — first launch in EU
1. Splash logo
2. **Usercentrics second layer** modal
3. *(no ATT)*
4. Onboarding

### Android — first launch outside EU
1. Splash logo
2. *(no banner, no ATT)*
3. Onboarding

### Both platforms — Manage Privacy Preferences
- Profile → Legal section → "Manage Privacy Preferences" row (shows current status: Accepted / Denied / Granular)
- Tap → Usercentrics second layer opens
- Toggle / Save → SDKs enable/disable live; row label updates
- iOS only: extra row "App Tracking" appears below if ATT is denied/restricted, deep-linking to iOS Settings

---

## 9. Test checklist (give this to QA)

### iOS
- [ ] Fresh install in EU sim → second layer shows → Accept All → ATT prompt → all SDKs init logs visible
- [ ] Fresh install in EU sim → Granular (Firebase ON, Facebook OFF) → verify Facebook init log shows `SKIPPED (no grant)`
- [ ] Fresh install in EU sim → Deny All → ATT still shown → all tracking logs show disabled
- [ ] Fresh install with VPN to US → no banner → ATT still shown → auto-accept logs
- [ ] Re-launch (consent cached) → no banner, no ATT → boot < 2 s
- [ ] Profile → Manage Privacy Preferences → toggle Facebook OFF → save → verify `[Bootstrapper] Facebook → disable()` log
- [ ] Profile → Manage Privacy Preferences → open and walk away 6 min → verify `⏱️ kept existing consent` log, no crash
- [ ] iOS Settings → Privacy → Tracking → toggle our app OFF → re-launch → verify Adjust/Facebook in limited mode

### Android
- [ ] Fresh install in EU emulator → second layer shows → Accept All → no ATT prompt → SDK init logs
- [ ] Fresh install in EU emulator → Granular → verify per-vendor gating
- [ ] Fresh install in EU emulator → Deny All → no tracking SDKs init
- [ ] Fresh install with VPN to US → no banner → auto-accept
- [ ] Re-launch → cached consent honoured
- [ ] Profile → Manage Privacy Preferences → verify second layer opens and live updates
- [ ] Verify "App Tracking" row is **NOT** visible in Profile (iOS-only)

### Both
- [ ] Force-kill app during banner → re-launch → banner shown again (no decision was persisted)
- [ ] Wait 366 days (or manipulate timestamp) → verify banner re-appears (TTL expired)
- [ ] Upgrade from a v2 build → verify legacy `@init_consent_state_v2` is dropped, banner re-shown

---

## 10. Where to look in code

| Concern | File |
|---|---|
| Show / dismiss banner | [src/initialization/consent/UsercentricsAdapter.ts](src/initialization/consent/UsercentricsAdapter.ts) |
| Cache + present + persist | [src/initialization/consent/ConsentGate.ts](src/initialization/consent/ConsentGate.ts) |
| MMKV storage v3 | [src/initialization/consent/ConsentStorage.ts](src/initialization/consent/ConsentStorage.ts) |
| iOS ATT (once per install) | [src/initialization/att/ATTController.ts](src/initialization/att/ATTController.ts) |
| Per-vendor SDK init / live toggle | [src/initialization/bootstrapper/SDKBootstrapper.ts](src/initialization/bootstrapper/SDKBootstrapper.ts) |
| State machine transitions | [src/initialization/state-machine/transitions.ts](src/initialization/state-machine/transitions.ts) |
| Boot orchestration | [src/initialization/orchestrator/InitializationOrchestrator.ts](src/initialization/orchestrator/InitializationOrchestrator.ts) |
| Settings UI ("Manage Privacy Preferences") | [src/screens/Profile/index.tsx](src/screens/Profile/index.tsx) |
| Usercentrics settingsId | [.env](.env) line `USERCENTRICS_SETTINGS_ID` |

---

## 11. One-paragraph elevator pitch (for your manager)

> *"The app uses the Usercentrics CMP (settings ID `2IFGjWbztccDOw`) to capture
> GDPR-compliant consent on first launch in the EU, with a granular per-vendor
> second layer covering all 8 tracking SDKs. Decisions are cached in MMKV for
> 365 days. Outside the EU we auto-accept and skip the banner. On iOS we
> additionally show Apple's ATT prompt **once per install regardless of GDPR
> outcome** — required by App Store policy. Users can change their mind any
> time from Profile → Manage Privacy Preferences; SDKs toggle live without an
> app restart, satisfying GDPR Art. 7(3). All decision points emit structured
> console logs prefixed `[ConsentGate]`, `[Usercentrics]`, `[ATT]`,
> `[Bootstrapper]` so QA can audit every flow without a debugger."*
