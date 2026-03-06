/**
 * Consent Flow Integration
 *
 * Phase 2: Handles Usercentrics integration and consent collection.
 * Determines if consent is required based on geolocation and manages
 * the consent flow.
 *
 * @module ConsentFlowIntegration
 */

import {
  Usercentrics,
  UsercentricsUserInteraction,
} from '@usercentrics/react-native-sdk';

import { sdkOrchestrator } from './SDKInitializationOrchestrator';
import { ConsentFlowConfig, ConsentDecision } from './types';

const LOG_PREFIX = '[ConsentFlow]';

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelayMs: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`${LOG_PREFIX} Retry ${i + 1}/${maxRetries} failed:`, error);
      if (i < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, i);
        await new Promise<void>(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Run the complete consent flow
 * This is Phase 2 of the SDK initialization
 */
export async function runConsentFlow(config: ConsentFlowConfig): Promise<void> {
  const debug = config.debugLogging ?? __DEV__;
  const retryCount = config.retryCount ?? 3;
  const retryDelayMs = config.retryDelayMs ?? 1000;

  if (debug) console.log(`${LOG_PREFIX} 🚀 Starting consent flow`);

  try {
    // Step 1: Configure Usercentrics SDK
    if (debug) console.log(`${LOG_PREFIX} Configuring Usercentrics with ruleSetId: ${config.ruleSetId}`);
    
    Usercentrics.configure({
      ruleSetId: config.ruleSetId,
    });

    // Step 2: Get Usercentrics status with retry logic
    if (debug) console.log(`${LOG_PREFIX} Fetching Usercentrics status...`);

    const status = await retryWithBackoff(
      () => Usercentrics.status(),
      retryCount,
      retryDelayMs,
    );

    if (debug) {
      console.log(`${LOG_PREFIX} Usercentrics status:`, {
        shouldCollectConsent: status?.shouldCollectConsent,
        geolocationRuleset: status?.geolocationRuleset,
      });
    }

    // Step 3: Check if banner is required at this location (EU/GDPR region)
    const bannerRequired = status?.geolocationRuleset?.bannerRequiredAtLocation !== false;

    if (debug) {
      console.log(`${LOG_PREFIX} Banner required at location: ${bannerRequired}`);
    }

    // Step 4: Route based on requirements
    if (!bannerRequired) {
      // Outside EU/GDPR region - auto accept
      if (debug) console.log(`${LOG_PREFIX} Region does not require consent banner`);
      await sdkOrchestrator.handleConsentDecision('region-not-required', 'region-not-required');
      return;
    }

    // Step 5: Check for returning user with cached consent from EXPLICIT user decision
    // IMPORTANT: Only use cached consent if user explicitly accepted/denied via Usercentrics
    // Do NOT use cached consent that was auto-accepted due to region
    const isReturningUser = await sdkOrchestrator.handleReturningUser();
    const cachedSource = sdkOrchestrator.getState().consentSource;
    const isExplicitUserDecision = cachedSource === 'usercentrics-accepted' || 
                                    cachedSource === 'usercentrics-denied' || 
                                    cachedSource === 'usercentrics-granular';
    
    if (isReturningUser && isExplicitUserDecision) {
      if (debug) console.log(`${LOG_PREFIX} Returning user with cached consent from explicit decision`);
      return;
    }

    // Step 6: EU/GDPR region requires explicit user consent - ALWAYS show banner
    // Do NOT rely on shouldCollectConsent as it becomes false after banner is shown once,
    // even if user killed app without making a decision
    if (debug) console.log(`${LOG_PREFIX} Showing consent banner (EU/GDPR region requires explicit consent)...`);

    // Keep showing banner until user makes an explicit decision (acceptAll, denyAll, or granular)
    // This prevents users from dismissing the banner via Android back button without consent
    let userMadeDecision = false;
    let decision: ConsentDecision = 'dismissed';
    let source: string = 'dismissed';

    while (!userMadeDecision) {
      const response = await Usercentrics.showFirstLayer();

      if (debug) {
        console.log(`${LOG_PREFIX} User response:`, {
          userInteraction: response?.userInteraction,
          consentsCount: response?.consents?.length,
        });
      }

      // Step 7: Handle user response
      switch (response?.userInteraction) {
        case UsercentricsUserInteraction.acceptAll:
          decision = 'accepted';
          source = 'usercentrics-accepted';
          userMadeDecision = true;
          if (debug) console.log(`${LOG_PREFIX} ✅ User accepted all`);
          break;

        case UsercentricsUserInteraction.denyAll:
          decision = 'denied';
          source = 'usercentrics-denied';
          userMadeDecision = true;
          if (debug) console.log(`${LOG_PREFIX} ❌ User denied all`);
          break;

        case UsercentricsUserInteraction.granular:
          // Check if user gave any consents
          const hasConsents = response.consents?.some(c => c.status);
          decision = hasConsents ? 'accepted' : 'denied';
          source = 'usercentrics-granular';
          userMadeDecision = true;
          if (debug) console.log(`${LOG_PREFIX} 🔧 Granular consent: ${decision}`);
          break;

        default:
          // User dismissed via back button or no interaction
          // Re-show the banner - user MUST make a decision in EU regions
          if (debug) console.log(`${LOG_PREFIX} ⚠️ User dismissed without decision - re-showing banner...`);
          userMadeDecision = false;
          break;
      }
    }

    await sdkOrchestrator.handleConsentDecision(decision, source as any);
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Consent flow failed:`, error);

    // On error, don't initialize tracking SDKs (safer)
    await sdkOrchestrator.handleConsentDecision('denied', 'error');
  }
}

/**
 * Show privacy settings (for users who want to change their consent)
 */
export async function showPrivacySettings(): Promise<void> {
  try {
    console.log(`${LOG_PREFIX} Showing privacy settings...`);

    const response = await Usercentrics.showSecondLayer();

    console.log(`${LOG_PREFIX} Privacy settings response:`, {
      userInteraction: response?.userInteraction,
    });

    // Handle updated consent
    if (response?.userInteraction === UsercentricsUserInteraction.acceptAll) {
      await sdkOrchestrator.handleConsentDecision('accepted', 'usercentrics-accepted');
    } else if (response?.userInteraction === UsercentricsUserInteraction.denyAll) {
      await sdkOrchestrator.handleConsentRevoked();
    } else if (response?.userInteraction === UsercentricsUserInteraction.granular) {
      const hasConsents = response.consents?.some(c => c.status);
      if (hasConsents) {
        await sdkOrchestrator.handleConsentDecision('accepted', 'usercentrics-granular');
      } else {
        await sdkOrchestrator.handleConsentRevoked();
      }
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error showing privacy settings:`, error);
    throw error;
  }
}

/**
 * Get current consent status from Usercentrics
 */
export async function getConsentStatus(): Promise<{
  shouldCollectConsent: boolean;
  bannerRequired: boolean;
  consents: Array<{ id: string; status: boolean }>;
}> {
  try {
    const status = await Usercentrics.status();
    const consents = await Usercentrics.getConsents();

    return {
      shouldCollectConsent: status?.shouldCollectConsent ?? true,
      bannerRequired: status?.geolocationRuleset?.bannerRequiredAtLocation !== false,
      consents: consents?.map(c => ({ id: c.dataProcessor || c.templateId || '', status: c.status })) ?? [],
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error getting consent status:`, error);
    return {
      shouldCollectConsent: true,
      bannerRequired: true,
      consents: [],
    };
  }
}

/**
 * Reset Usercentrics consent (for testing)
 */
export async function resetConsent(): Promise<void> {
  try {
    console.log(`${LOG_PREFIX} Resetting consent...`);
    await Usercentrics.clearUserSession();
    await sdkOrchestrator.reset();
    console.log(`${LOG_PREFIX} Consent reset complete`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error resetting consent:`, error);
  }
}
