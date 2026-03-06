# SDK Initialization Module

## Overview

This module implements a comprehensive SDK initialization flow following a three-phase approach for proper privacy compliance and SDK lifecycle management.

## Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        APP LAUNCH TIMELINE                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 PHASE 1: Critical Services (Parallel)               │ │
│  │                        ~500-1000ms total                            │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │ │
│  │  │  Sentry    │ │Crashlytics │ │ RevenueCat │ │  Remote Config   │ │ │
│  │  │  (Errors)  │ │ (Crashes)  │ │ (Payments) │ │     (Flags)      │ │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   PHASE 2: Consent Collection                       │ │
│  │                                                                     │ │
│  │   1. Configure Usercentrics SDK                                     │ │
│  │   2. Check geolocation (EU/GDPR region?)                            │ │
│  │   3. Check if returning user (cached consent?)                      │ │
│  │   4. Show consent banner if needed                                  │ │
│  │                                                                     │ │
│  │   Possible Outcomes:                                                │ │
│  │   • accepted          - User accepted all tracking                  │ │
│  │   • denied            - User denied tracking                        │ │
│  │   • region-not-required - Outside EU/GDPR (auto-accept)             │ │
│  │   • dismissed         - User dismissed without choice               │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                   │                                       │
│                   ┌───────────────┴───────────────┐                      │
│                   │                               │                      │
│                   ▼                               ▼                      │
│  ┌────────────────────────────┐  ┌────────────────────────────┐         │
│  │     CONSENT ACCEPTED       │  │      CONSENT DENIED        │         │
│  ├────────────────────────────┤  ├────────────────────────────┤         │
│  │ 1. Request ATT (iOS only)  │  │ 1. Skip ATT                │         │
│  │ 2. Init Facebook SDK       │  │ 2. Skip Facebook           │         │
│  │ 3. Enable Firebase Analytics│ │ 3. Disable Analytics       │         │
│  │ 4. Init AppsFlyer (full)   │  │ 4. Init AppsFlyer (opted-out)│       │
│  │ 5. Init AppLovin (ads on)  │  │ 5. Init AppLovin (no personalized)│  │
│  └────────────────────────────┘  └────────────────────────────┘         │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## SDK Categories

| Category | SDKs | When Initialized | Consent Required |
|----------|------|------------------|------------------|
| **Critical** | Sentry, Crashlytics, RevenueCat, Remote Config | App Launch (Phase 1) | ❌ No |
| **Consent Popup** | Usercentrics | After Phase 1 (Phase 2) | N/A (Collects consent) |
| **Tracking** | Facebook, Firebase Analytics, AppsFlyer, AppLovin, ATT | After Consent (Phase 3) | ✅ Yes |

## File Structure

```
src/services/initialization/
├── index.ts                          # Public API exports
├── types.ts                          # TypeScript types and interfaces
├── SDKInitializationOrchestrator.ts  # Main orchestrator singleton
├── CriticalServicesInitializer.ts    # Phase 1: Critical services
├── ConsentFlowIntegration.ts         # Phase 2: Usercentrics integration
├── ConsentDependentInitializer.ts    # Phase 3: Consent-dependent SDKs
├── useSDKInitialization.ts           # React hook
└── README.md                         # This file
```

## Usage

### Basic Usage in App.tsx

```tsx
import { useSDKInitialization, runConsentFlow } from './src/services/initialization';
import env from './src/config/env';

const AppContent = () => {
  const {
    phase1Complete,
    isFullyInitialized,
    consentDecision,
    getDebugInfo,
  } = useSDKInitialization({
    debugLogging: __DEV__,
    remoteConfigDefaults: {
      feature_ads_enabled: true,
      feature_premium_enabled: true,
      maintenance_mode: false,
    },
    onPhase1Complete: () => {
      console.log('Phase 1 complete');
    },
    onFullyInitialized: () => {
      console.log('All SDKs initialized');
    },
  });

  // Run consent flow after Phase 1 completes
  useEffect(() => {
    if (!phase1Complete || consentDecision !== 'not-determined') return;

    runConsentFlow({
      ruleSetId: env.USER_CENTRIC,
      debugLogging: __DEV__,
    });
  }, [phase1Complete, consentDecision]);

  return <YourApp />;
};
```

### Lightweight Hooks

For components that only need specific state:

```tsx
import {
  usePhase1Complete,
  useInitializationComplete,
  useTrackingEnabled,
  useConsentDecision,
} from './src/services/initialization';

// Just check if Phase 1 is done
const phase1Done = usePhase1Complete();

// Just check if fully initialized
const isReady = useInitializationComplete();

// Just check tracking status
const canTrack = useTrackingEnabled();

// Just get consent decision
const consent = useConsentDecision();
```

### Privacy Settings

Allow users to change their consent:

```tsx
import { showPrivacySettings } from './src/services/initialization';

const SettingsScreen = () => {
  return (
    <Button
      title="Privacy Settings"
      onPress={() => showPrivacySettings()}
    />
  );
};
```

### Remote Config

Get feature flags:

```tsx
import { getRemoteConfigValue, isFeatureEnabled } from './src/services/initialization';

// Check if ads are enabled
if (isFeatureEnabled('feature_ads_enabled')) {
  showAds();
}

// Get a config value
const maintenanceMode = getRemoteConfigValue('maintenance_mode');
```

### Debug Information

Get detailed SDK status:

```tsx
import { sdkOrchestrator } from './src/services/initialization';

const debugInfo = sdkOrchestrator.getDebugInfo();
console.log(debugInfo);
// {
//   currentPhase: 'complete',
//   consentDecision: 'accepted',
//   attStatus: 'authorized',
//   trackingEnabled: true,
//   sdkStatus: { sentry: 'initialized', ... },
//   duration: 1234,
// }
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Usercentrics
USER_CENTRIC=your_ruleset_id

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# RevenueCat
REVENUECAT_IOS_KEY=appl_xxx
REVENUECAT_ANDROID_KEY=goog_xxx

# AppLovin
APPLOVIN_SDK_KEY=your_sdk_key

# Facebook
FACEBOOK_APP_ID=xxx
FACEBOOK_CLIENT_TOKEN=xxx

# AppsFlyer
APPSFLYER_DEV_KEY=xxx
APPSFLYER_APP_ID=id1234567890
```

## Key Principles

1. **Non-blocking UI** - Phase 1 runs during splash screen
2. **Privacy-first** - Tracking SDKs only initialize after explicit consent
3. **No race conditions** - Proper sequencing via orchestrator pattern
4. **Idempotent** - Safe to call initialization multiple times
5. **Observable** - Events emitted at each initialization step
6. **Persistent** - Consent state cached for returning users

## Troubleshooting

### SDKs Not Initializing

1. Check that Phase 1 completed successfully
2. Verify consent was accepted
3. Check ATT status on iOS
4. Review debug logs with `getDebugInfo()`

### Consent Banner Not Showing

1. Verify `USER_CENTRIC` ruleset ID in `.env`
2. Check if user is in a region requiring consent
3. Ensure this is a first launch (or reset consent for testing)

### Testing

```tsx
import { resetConsent } from './src/services/initialization';

// Reset all consent state for testing
await resetConsent();
// Restart app to see fresh consent flow
```
