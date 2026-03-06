# SDK Initialization Architecture

> Privacy-compliant, deterministic SDK initialization for React Native

## Overview

This module implements a **single-source-of-truth** initialization system for all SDKs in the app. It ensures:

- **Privacy compliance**: No tracking before consent
- **Deterministic flow**: State machine with explicit transitions
- **Non-personalized ads**: If consent denied, ads still show but non-personalized
- **Graceful degradation**: App works even if SDKs fail

## Boot Flow

```
┌─────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│    IDLE     │───▶│  CHECKING_CONSENT   │───▶│ SHOWING_CONSENT │
└─────────────┘    └─────────────────────┘    └─────────────────┘
                                                       │
                        ┌──────────────────────────────┘
                        ▼
              ┌─────────────────────┐    ┌─────────────────────┐
              │  CONSENT_RESOLVED   │───▶│ INITIALIZING_SDKS   │
              └─────────────────────┘    └─────────────────────┘
                                                   │
                        ┌──────────────────────────┘
                        ▼
              ┌─────────────────────┐    ┌─────────────────────┐
              │ AWAITING_ONBOARDING │───▶│    SHOWING_ATT      │ (iOS)
              └─────────────────────┘    └─────────────────────┘
                                                   │
                        ┌──────────────────────────┘
                        ▼
              ┌─────────────────────┐
              │       ACTIVE        │
              └─────────────────────┘
```

## Key Rules

### Rule 1: Consent DENIED ≠ No Ads
- Ads **MUST** still show when consent is denied
- They are simply **NON-PERSONALIZED**
- `AdsModeResolver` enforces this via decision matrix

### Rule 2: ATT Cannot Override Consent
- If Usercentrics consent is DENIED, ATT result is irrelevant
- ATT only enhances personalization when consent is GRANTED

### Rule 3: No Tracking Before Consent
- Firebase Analytics, AppsFlyer tracking disabled until consent
- Crash reporting (Sentry/Crashlytics) works without consent

## SDK Categories

| Category | SDKs | Requires Consent |
|----------|------|-----------------|
| Core | Sentry, Crashlytics | No |
| Tracking | Firebase Analytics, AppsFlyer | Yes |
| Ads | AppLovin MAX | No (but mode depends on consent) |
| Purchases | RevenueCat | No (Phase 1) / Yes (Phase 2) |

## Directory Structure

```
src/initialization/
├── core/                    # Core utilities
│   ├── utils/
│   │   ├── AsyncLock.ts     # Mutex for race conditions
│   │   └── withTimeout.ts   # Promise timeout wrapper
│   └── errors/
│       └── InitializationErrors.ts
│
├── state-machine/           # Deterministic state machine
│   ├── types.ts             # States, events, context
│   ├── transitions.ts       # Transition table
│   ├── guards.ts            # Guard functions
│   └── InitStateMachine.ts  # State machine implementation
│
├── consent/                 # Consent management
│   ├── types.ts             # ConsentStatus, ConsentGrants
│   ├── ConsentStorage.ts    # MMKV persistence
│   ├── UsercentricsAdapter.ts
│   └── ConsentGate.ts
│
├── att/                     # iOS App Tracking Transparency
│   ├── types.ts             # ATTStatus enum
│   └── ATTController.ts
│
├── ads/                     # Ads mode resolution
│   ├── types.ts             # AdsMode enum
│   └── AdsModeResolver.ts   # Decision matrix
│
├── sdk/                     # SDK adapters
│   ├── types.ts             # ISdkAdapter interface
│   ├── FirebaseAdapter.ts
│   ├── AppsFlyerAdapter.ts
│   ├── SentryAdapter.ts
│   ├── AppLovinAdapter.ts
│   └── RevenueCatAdapter.ts
│
├── bootstrapper/            # SDK orchestration
│   └── SDKBootstrapper.ts
│
├── services/                # Support services
│   ├── SplashService.ts
│   └── NavigationService.ts
│
├── orchestrator/            # Main controller
│   └── InitializationOrchestrator.ts
│
├── presentation/            # React integration
│   ├── InitializationGate.tsx
│   └── useInitialization.ts
│
├── config/                  # Configuration
│   └── initConfig.ts
│
└── index.ts                 # Public exports
```

## Usage

### Basic Integration (App.tsx)

```tsx
import { getOrchestrator, InitState } from './src/initialization';

function App() {
  useEffect(() => {
    // Start boot process
    getOrchestrator().boot();
  }, []);

  return <RootNavigator />;
}
```

### Navigation Ready (RootNavigator.tsx)

```tsx
import { getOrchestrator } from '../initialization';

function RootNavigator() {
  return (
    <NavigationContainer
      onReady={() => getOrchestrator().setNavigationReady()}
    >
      <StackNavigator />
    </NavigationContainer>
  );
}
```

### Onboarding Complete

```tsx
import { getOrchestrator } from '../../initialization';

function handleOnboardingComplete() {
  // Notify orchestrator - triggers ATT on iOS
  getOrchestrator().onboardingCompleted();
}
```

### Using InitializationGate

```tsx
import { InitializationGate } from '../initialization';

function App() {
  return (
    <InitializationGate
      loadingComponent={<SplashScreen />}
      errorComponent={<ErrorScreen />}
    >
      <MainApp />
    </InitializationGate>
  );
}
```

### Checking Initialization State

```tsx
import { useInitialization } from '../initialization';

function MyComponent() {
  const { state, isReady, context, retryInit } = useInitialization();

  if (!isReady) {
    return <Loading />;
  }

  return <Content />;
}
```

## State Machine

### States (InitState)

| State | Description |
|-------|-------------|
| IDLE | Initial state |
| BOOTING | Boot process started |
| CHECKING_CONSENT | Checking stored consent |
| SHOWING_CONSENT | Usercentrics UI visible |
| CONSENT_RESOLVED | Consent decision made |
| INITIALIZING_CORE_SDKS | Sentry, Crashlytics |
| INITIALIZING_TRACKING_SDKS | Firebase, AppsFlyer |
| INITIALIZING_ADS | AppLovin MAX |
| INITIALIZING_PURCHASES | RevenueCat |
| AWAITING_ONBOARDING | Waiting for onboarding |
| SHOWING_ATT | ATT prompt visible |
| ATT_RESOLVED | ATT decision made |
| FINALIZING | Final setup |
| READY | Fully initialized |
| ACTIVE | App in use |

### Events (InitEvent)

| Event | Trigger |
|-------|---------|
| BOOT_REQUESTED | App starts |
| CONSENT_FOUND | Stored consent valid |
| CONSENT_NOT_FOUND | No stored consent |
| CONSENT_GRANTED | User accepts |
| CONSENT_DENIED | User denies |
| SDK_INIT_COMPLETE | SDK ready |
| NAVIGATION_READY | NavigationContainer ready |
| ONBOARDING_COMPLETE | User finishes onboarding |
| ATT_AUTHORIZED | User allows tracking |
| ATT_DENIED | User denies tracking |

## Ads Mode Decision Matrix

| Consent | ATT | Platform | Mode |
|---------|-----|----------|------|
| GRANTED | AUTHORIZED | iOS | PERSONALIZED |
| GRANTED | DENIED | iOS | PERSONALIZED (consent-based) |
| DENIED | * | * | NON_PERSONALIZED |
| GRANTED | N/A | Android | PERSONALIZED |
| PENDING | * | * | NON_PERSONALIZED |

## Error Handling

### Timeout Handling
- Each SDK has configurable timeout
- On timeout, SDK is marked as failed but app continues
- Timeouts are logged for debugging

### Retry Logic
- Consent has 3 retries with exponential backoff
- SDK init has 2 retries
- Manual retry available via `retryInit()`

### Graceful Degradation
- App launches even if all SDKs fail
- Core features work without tracking
- Ads show non-personalized on any error

## Debugging

Enable verbose logging in development:

```ts
// src/initialization/config/initConfig.ts
export const FEATURES = {
  verboseLogging: __DEV__,
};
```

Console output shows:
- State transitions
- Event dispatches
- SDK initialization progress
- Timing information

## Testing

### Manual Testing Checklist

1. **Fresh Install (no consent)**
   - [ ] Consent UI appears
   - [ ] SDKs init after consent
   - [ ] ATT shown after onboarding (iOS)

2. **Returning User (consent stored)**
   - [ ] No consent UI
   - [ ] SDKs init with stored consent
   - [ ] Correct ads mode

3. **Consent Denied**
   - [ ] No tracking SDKs enabled
   - [ ] Ads still show (non-personalized)
   - [ ] App fully functional

4. **Network Offline**
   - [ ] Uses cached consent
   - [ ] Graceful SDK failures
   - [ ] App still launches

## Migration from Legacy

The legacy `StartupOrchestrator` is deprecated. This new system:

1. Uses explicit state machine (vs implicit async)
2. Separates consent from SDK init
3. Has proper ATT handling
4. Supports retry and timeout
5. Provides React hooks for state

To migrate:
1. Remove `startupOrchestrator.start()` from App.tsx ✅
2. Add `getOrchestrator().boot()` ✅
3. Update onboarding to call `onboardingCompleted()` ✅
4. Update RootNavigator to call `setNavigationReady()` ✅
