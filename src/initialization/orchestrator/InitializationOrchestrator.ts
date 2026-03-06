/**
 * Initialization Orchestrator
 *
 * Single entry point for the entire app initialization flow.
 * Drives the state machine and coordinates all SDK initialization.
 *
 * BOOT FLOW:
 * 1. App Launch → Show Splash
 * 2. Minimal Bootstrap (RevenueCat Phase 1)
 * 3. Consent Flow (Usercentrics)
 * 4. SDK Initialization (based on consent)
 * 5. Hide Splash → Navigate to Onboarding
 * 6. ATT Prompt (iOS, after onboarding)
 * 7. Finalize Ads Mode → App Active
 */

import { Platform } from 'react-native';
import { AsyncLock } from '../core';
import { InitStateMachine, InitState, InitEvent, StateContext } from '../state-machine';
import { ConsentGate, ConsentStatus } from '../consent';
import { ATTController, ATTStatus } from '../att';
import { AdsModeResolver } from '../ads';
import { SDKBootstrapper } from '../bootstrapper';
import { SplashService, NavigationService } from '../services';

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  skipConsent?: boolean;
  skipATT?: boolean;
  debugMode?: boolean;
}

/**
 * Initialization Orchestrator Implementation
 */
export class InitializationOrchestrator {
  // Core components
  private readonly stateMachine: InitStateMachine;
  private readonly consentGate: ConsentGate;
  private readonly attController: ATTController;
  private readonly adsModeResolver: AdsModeResolver;
  private readonly sdkBootstrapper: SDKBootstrapper;
  private readonly splashService: SplashService;
  private readonly navigationService: NavigationService;

  // State
  private readonly bootLock = new AsyncLock();
  private hasBooted = false;
  private config: OrchestratorConfig;

  // Callbacks
  private onOnboardingComplete: (() => void) | null = null;

  constructor(config: OrchestratorConfig = {}) {
    this.config = config;

    // Initialize components
    this.stateMachine = new InitStateMachine();
    this.consentGate = new ConsentGate();
    this.attController = new ATTController();
    this.adsModeResolver = new AdsModeResolver();
    this.sdkBootstrapper = new SDKBootstrapper();
    this.splashService = new SplashService();
    this.navigationService = new NavigationService();

    // Register effect handlers
    this.registerEffectHandlers();

    console.log('[Orchestrator] Initialized');
  }

  /**
   * Start the boot sequence
   * This is the single entry point for app initialization
   */
  async boot(): Promise<void> {
    return this.bootLock.acquire('boot', async () => {
      if (this.hasBooted) {
        console.warn('[Orchestrator] Already booted');
        return;
      }

      console.log('[Orchestrator] Starting boot sequence...');

      try {
        // Start state machine
        this.stateMachine.send(InitEvent.APP_LAUNCHED);

        // Wait for app to be ready or error
        await this.stateMachine.waitForState([
          InitState.ACTIVE,
          InitState.ERROR_FATAL,
        ]);

        this.hasBooted = true;
        console.log('[Orchestrator] Boot sequence complete');
      } catch (error) {
        console.error('[Orchestrator] Boot failed:', error);
        await this.handleFatalError(error);
      }
    });
  }

  /**
   * Notify orchestrator that onboarding is complete
   * Call this from your onboarding screen
   */
  onboardingCompleted(): void {
    console.log('[Orchestrator] Onboarding completed');
    this.stateMachine.send(InitEvent.ONBOARDING_COMPLETED);
  }

  /**
   * Mark navigation as ready
   */
  setNavigationReady(): void {
    this.navigationService.setReady();
  }

  /**
   * Get current state
   */
  getState(): InitState {
    return this.stateMachine.getState();
  }

  /**
   * Get current context
   */
  getContext(): StateContext {
    return this.stateMachine.getContext();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (info: any) => void): () => void {
    return this.stateMachine.subscribe(listener);
  }

  /**
   * Check if initialization is complete
   */
  isComplete(): boolean {
    const state = this.stateMachine.getState();
    return state === InitState.READY || state === InitState.ACTIVE;
  }

  /**
   * Check if ATT phase is resolved (user made a choice)
   */
  isATTResolved(): boolean {
    const state = this.stateMachine.getState();
    // ATT is resolved when we're past the ATT states or in final states
    return (
      state === InitState.ATT_RESOLVED ||
      state === InitState.FINALIZING_ADS_MODE ||
      state === InitState.READY ||
      state === InitState.ACTIVE
    );
  }

  /**
   * Wait for ATT to be resolved (user makes a choice)
   * Returns a promise that resolves when ATT is complete
   * @param timeoutMs - Maximum time to wait (default: 60 seconds)
   */
  waitForATTResolved(timeoutMs: number = 60000): Promise<void> {
    return new Promise((resolve) => {
      // Check if already resolved
      if (this.isATTResolved()) {
        console.log('[Orchestrator] ATT already resolved');
        resolve();
        return;
      }

      console.log('[Orchestrator] Waiting for ATT to be resolved...');
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.log('[Orchestrator] ATT wait timeout reached');
        unsubscribe();
        resolve();
      }, timeoutMs);

      // Subscribe to state changes
      const unsubscribe = this.subscribe((_info) => {
        if (this.isATTResolved()) {
          console.log('[Orchestrator] ATT resolved, proceeding');
          clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });
    });
  }

  /**
   * Register all effect handlers for state machine
   */
  private registerEffectHandlers(): void {
    const machine = this.stateMachine;

    // Boot effects
    machine.onEffect('showSplash', async () => {
      await this.splashService.ensureVisible();
      this.splashService.startTimeoutGuard();
      machine.send(InitEvent.SPLASH_READY);
    });

    machine.onEffect('initializeMinimalBootstrap', async () => {
      await this.sdkBootstrapper.initializeMinimal();
      machine.send(InitEvent.CONSENT_REQUIRED);
    });

    // Consent effects
    machine.onEffect('presentConsentUI', async () => {
      try {
        if (this.config.skipConsent) {
          console.log('[Orchestrator] Skipping consent (debug mode)');
          machine.send(InitEvent.CONSENT_ACCEPTED);
          return;
        }

        console.log('[Orchestrator] Presenting consent UI...');
        const result = await this.consentGate.presentConsentUI();
        console.log('[Orchestrator] Consent result received:', result.status);

        if (result.status === ConsentStatus.ACCEPTED) {
          console.log('[Orchestrator] Sending CONSENT_ACCEPTED event');
          machine.send(InitEvent.CONSENT_ACCEPTED);
        } else {
          console.log('[Orchestrator] Sending CONSENT_DENIED event');
          machine.send(InitEvent.CONSENT_DENIED);
        }
      } catch (error) {
        console.error('[Orchestrator] Consent error:', error);
        machine.send(InitEvent.CONSENT_FAILED, error);
      }
    });

    machine.onEffect('storeConsentAccepted', async () => {
      console.log('[Orchestrator] ✅ Consent ACCEPTED');
      
      // Initialize core SDKs first (this is synchronous to the state machine)
      try {
        await this.sdkBootstrapper.initializeCore({
          crashlytics: { enabled: true, fullMode: true },
          sentry: { enabled: true, fullMode: true },
        });
        console.log('[Orchestrator] Core SDKs initialized');
        
        // After core init, decide next step based on platform
        // iOS: Show ATT dialog (send CORE_INIT_COMPLETE to trigger ATT_PENDING)
        // Android: Skip ATT (send ATT_SKIPPED to go directly to tracking)
        if (this.config.skipATT || Platform.OS !== 'ios') {
          console.log('[Orchestrator] Platform is Android or skipATT - skipping ATT');
          machine.send(InitEvent.ATT_SKIPPED);
        } else {
          console.log('[Orchestrator] Platform is iOS - proceeding to ATT');
          machine.send(InitEvent.CORE_INIT_COMPLETE);
        }
      } catch (error) {
        console.error('[Orchestrator] Core SDK init error:', error);
        machine.send(InitEvent.CORE_INIT_FAILED, error);
      }
    });

    machine.onEffect('storeConsentDenied', async () => {
      console.log('[Orchestrator] ❌ Consent DENIED - initializing minimal SDKs');
      await this.initializeMinimalSDKs();
    });

    machine.onEffect('logConsentError', async (context) => {
      console.error('[Orchestrator] Consent error logged');
      // Auto-retry or fallback
      if (context.consentRetryCount < 3) {
        machine.send(InitEvent.RETRY_CONSENT);
      } else {
        machine.send(InitEvent.FALLBACK_TO_MINIMAL);
      }
    });

    machine.onEffect('logConsentTimeout', async () => {
      console.warn('[Orchestrator] Consent timeout - treating as denied');
      await this.initializeMinimalSDKs();
    });

    // Tracking effects
    machine.onEffect('initializeTrackingSDKs', async () => {
      try {
        await this.sdkBootstrapper.initializeTracking();
        machine.send(InitEvent.TRACKING_INIT_COMPLETE);
      } catch (error) {
        console.error('[Orchestrator] Tracking init error:', error);
        machine.send(InitEvent.TRACKING_INIT_FAILED, error);
      }
    });

    // Ads effects
    machine.onEffect('initializePersonalizedAds', async () => {
      await this.initializeAds(true);
    });

    machine.onEffect('initializeNonPersonalizedAds', async () => {
      await this.initializeAds(false);
    });

    machine.onEffect('fallbackToNonPersonalizedAds', async () => {
      console.warn('[Orchestrator] Falling back to non-personalized ads');
      await this.initializeAds(false);
    });

    machine.onEffect('fallbackToDegradedMode', async () => {
      console.warn('[Orchestrator] Entering degraded mode');
      await this.initializeAds(false);
    });

    // Navigation effects
    machine.onEffect('hideSplashAndNavigate', async () => {
      await this.splashService.hide();
      await this.navigationService.navigateToOnboarding();
      machine.send(InitEvent.ONBOARDING_STARTED);
    });

    machine.onEffect('hideSplashAndNavigateWithoutAds', async () => {
      console.warn('[Orchestrator] Navigating without ads');
      await this.splashService.hide();
      await this.navigationService.navigateToOnboarding();
      machine.send(InitEvent.ONBOARDING_STARTED);
    });

    machine.onEffect('hideSplashAndNavigateDegraded', async () => {
      console.warn('[Orchestrator] Navigating in degraded mode');
      await this.splashService.hide();
      await this.navigationService.navigateToOnboarding();
      machine.send(InitEvent.ONBOARDING_STARTED);
    });

    // ATT effects
    machine.onEffect('prepareATTRequest', async () => {
      if (this.config.skipATT || Platform.OS !== 'ios') {
        machine.send(InitEvent.ATT_SKIPPED);
        return;
      }

      // Check if consent was denied - skip ATT if so
      const context = machine.getContext();
      if (context.consentStatus === ConsentStatus.DENIED) {
        console.log('[Orchestrator] Skipping ATT - consent was denied');
        machine.send(InitEvent.ATT_SKIPPED);
        return;
      }

      machine.send(InitEvent.ATT_REQUEST);
    });

    machine.onEffect('presentATTDialog', async () => {
      // CRITICAL: Check if consent was denied - skip ATT if so
      // Per privacy rules: ATT cannot override consent denial
      const context = machine.getContext();
      if (context.consentStatus === ConsentStatus.DENIED) {
        console.log('[Orchestrator] Skipping ATT dialog - consent was denied (privacy rule)');
        // Treat as ATT denied to continue the flow
        machine.send(InitEvent.ATT_DENIED);
        return;
      }

      // Also skip if not iOS or skipATT config
      if (this.config.skipATT || Platform.OS !== 'ios') {
        console.log('[Orchestrator] Skipping ATT dialog - not iOS or skipATT enabled');
        machine.send(InitEvent.ATT_DENIED);
        return;
      }

      try {
        const status = await this.attController.requestPermission();

        switch (status) {
          case ATTStatus.AUTHORIZED:
            machine.send(InitEvent.ATT_AUTHORIZED);
            break;
          case ATTStatus.DENIED:
            machine.send(InitEvent.ATT_DENIED);
            break;
          case ATTStatus.RESTRICTED:
            machine.send(InitEvent.ATT_RESTRICTED);
            break;
          default:
            machine.send(InitEvent.ATT_NOT_DETERMINED);
        }
      } catch (error) {
        console.error('[Orchestrator] ATT error:', error);
        machine.send(InitEvent.ATT_DENIED);
      }
    });

    machine.onEffect('storeATTAuthorized', async () => {
      console.log('[Orchestrator] ATT AUTHORIZED - proceeding with full tracking');
      // Store ATT status for tracking SDKs (especially Facebook)
      this.sdkBootstrapper.setATTAuthorized(true);
      // Trigger transition to tracking phase
      machine.send(InitEvent.ADS_MODE_FINALIZED);
    });

    machine.onEffect('storeATTDenied', async () => {
      console.log('[Orchestrator] ATT DENIED - proceeding with limited tracking');
      // Store ATT status for tracking SDKs
      this.sdkBootstrapper.setATTAuthorized(false);
      // Trigger transition to tracking phase
      machine.send(InitEvent.ADS_MODE_FINALIZED);
    });

    machine.onEffect('storeATTRestricted', async () => {
      console.log('[Orchestrator] ATT RESTRICTED - proceeding with limited tracking');
      // Store ATT status for tracking SDKs
      this.sdkBootstrapper.setATTAuthorized(false);
      // Trigger transition to tracking phase
      machine.send(InitEvent.ADS_MODE_FINALIZED);
    });

    machine.onEffect('storeATTNotDetermined', async () => {
      console.log('[Orchestrator] ATT NOT DETERMINED - proceeding with limited tracking');
      // Store ATT status for tracking SDKs
      this.sdkBootstrapper.setATTAuthorized(false);
      // Trigger transition to tracking phase
      machine.send(InitEvent.ADS_MODE_FINALIZED);
    });

    machine.onEffect('skipATT', async () => {
      console.log('[Orchestrator] ATT skipped - proceeding with tracking');
      // For Android, allow full tracking (no ATT restriction)
      // For skipATT debug mode, also allow full tracking
      if (Platform.OS !== 'ios') {
        this.sdkBootstrapper.setATTAuthorized(true);
      } else {
        // iOS with skipATT - treat as not authorized for safety
        this.sdkBootstrapper.setATTAuthorized(false);
      }
    });

    // Finalization effects
    machine.onEffect('applyFinalAdsConfiguration', async () => {
      const context = machine.getContext();
      const resolution = this.adsModeResolver.resolve(
        context.consentStatus,
        context.attStatus,
      );

      console.log('[Orchestrator] Final ads configuration:', resolution);
      await this.sdkBootstrapper.updateAdsConfiguration(resolution);

      machine.send(InitEvent.ACTIVATION_COMPLETE);
    });

    machine.onEffect('markAppReady', async () => {
      console.log('[Orchestrator] App READY');
      machine.send(InitEvent.ACTIVATION_COMPLETE);
    });

    machine.onEffect('enableFullAppFunctionality', async () => {
      console.log('[Orchestrator] App ACTIVE - Full functionality enabled');
      // Note: setPermissionsComplete is called after notification permission completes
      // in userCentric.tsx to ensure paywall shows AFTER all permissions
    });

    // Recovery effects
    machine.onEffect('resetConsentState', async () => {
      console.log('[Orchestrator] Resetting consent state for retry');
      machine.send(InitEvent.CONSENT_REQUIRED);
    });

    machine.onEffect('applyMinimalConfiguration', async () => {
      console.log('[Orchestrator] Applying minimal configuration');
      await this.initializeMinimalSDKs();
    });

    machine.onEffect('resetSDKState', async () => {
      console.log('[Orchestrator] Resetting SDK state for retry');
    });

    // Error handling effects
    machine.onEffect('handleConsentError', async () => {
      const context = machine.getContext();
      console.error('[Orchestrator] handleConsentError - retry count:', context.consentRetryCount);
      
      if (context.consentRetryCount < 3) {
        // Retry consent
        machine.send(InitEvent.RETRY_CONSENT);
      } else {
        // Fallback to minimal mode
        machine.send(InitEvent.FALLBACK_TO_MINIMAL);
      }
    });

    machine.onEffect('handleSDKError', async () => {
      const context = machine.getContext();
      console.error('[Orchestrator] handleSDKError - error count:', context.errorCount);
      
      // Continue with degraded mode
      machine.send(InitEvent.FALLBACK_TO_MINIMAL);
    });

    machine.onEffect('showFatalError', async () => {
      console.error('[Orchestrator] FATAL ERROR - showing error to user');
      await this.splashService.forceHide();
      await this.navigationService.navigateToErrorScreen(
        new Error('Fatal initialization error')
      );
    });
  }

  /**
   * Initialize core SDKs with full tracking
   */
  private async initializeCoreSDKs(fullMode: boolean): Promise<void> {
    try {
      await this.sdkBootstrapper.initializeCore({
        crashlytics: { enabled: true, fullMode },
        sentry: { enabled: true, fullMode },
      });
      this.stateMachine.send(InitEvent.CORE_INIT_COMPLETE);
    } catch (error) {
      console.error('[Orchestrator] Core SDK init error:', error);
      this.stateMachine.send(InitEvent.CORE_INIT_FAILED, error);
    }
  }

  /**
   * Initialize minimal SDKs (consent denied)
   * 
   * When consent is denied, we do NOT initialize any tracking/analytics:
   * - Firebase Crashlytics: DISABLED (collects device data)
   * - Sentry: DISABLED (collects error data)
   * - Analytics: DISABLED
   */
  private async initializeMinimalSDKs(): Promise<void> {
    try {
      console.log('[Orchestrator] Consent denied - skipping crash reporting and analytics SDKs');
      
      // Don't initialize Firebase/Crashlytics or Sentry when consent is denied
      // Only proceed without any tracking SDKs
      await this.sdkBootstrapper.initializeCore({
        crashlytics: { enabled: false, fullMode: false },
        sentry: { enabled: false, fullMode: false },
      });
      this.stateMachine.send(InitEvent.CORE_INIT_COMPLETE);
    } catch (error) {
      console.error('[Orchestrator] Minimal SDK init error:', error);
      this.stateMachine.send(InitEvent.CORE_INIT_FAILED, error);
    }
  }

  /**
   * Initialize ads SDK
   * 
   * NOTE: AppLovin initialization temporarily disabled - uncomment when SDK key is configured
   */
  private async initializeAds(_hasConsent: boolean): Promise<void> {
    // TODO: Uncomment when AppLovin SDK key is configured in .env
    // try {
    //   await this.sdkBootstrapper.initializeAds({
    //     mode: hasConsent ? AdsMode.NON_PERSONALIZED : AdsMode.NON_PERSONALIZED,
    //     hasUserConsent: hasConsent,
    //     isAgeRestrictedUser: false,
    //     doNotSell: !hasConsent,
    //     idfaEnabled: false, // Enabled after ATT
    //   });
    //   this.stateMachine.send(InitEvent.ADS_INIT_COMPLETE);
    // } catch (error) {
    //   console.error('[Orchestrator] Ads init error:', error);
    //   this.stateMachine.send(InitEvent.ADS_INIT_FAILED, error);
    // }

    // Temporarily skip ads initialization and send complete event
    console.log('[Orchestrator] Ads initialization skipped (AppLovin SDK key not configured)');
    this.stateMachine.send(InitEvent.ADS_INIT_COMPLETE);
  }

  /**
   * Handle fatal initialization error
   */
  private async handleFatalError(error: unknown): Promise<void> {
    console.error('[Orchestrator] Fatal error:', error);

    // Force hide splash
    await this.splashService.forceHide();

    // Navigate to error or fallback
    await this.navigationService.navigateToMinimalFallback();
  }

  /**
   * Reset orchestrator (for testing)
   */
  reset(): void {
    this.hasBooted = false;
    this.stateMachine.reset();
    this.splashService.reset();
    this.navigationService.reset();
    this.sdkBootstrapper.reset();
  }
}

/**
 * Singleton instance
 */
let orchestratorInstance: InitializationOrchestrator | null = null;

/**
 * Get or create orchestrator instance
 */
export function getOrchestrator(config?: OrchestratorConfig): InitializationOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new InitializationOrchestrator(config);
  }
  return orchestratorInstance;
}

/**
 * Reset orchestrator instance (for testing)
 */
export function resetOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.reset();
    orchestratorInstance = null;
  }
}

export default InitializationOrchestrator;
