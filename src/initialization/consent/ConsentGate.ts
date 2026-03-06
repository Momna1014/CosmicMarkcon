/**
 * Consent Gate
 *
 * Controls access to tracking features based on user consent.
 * Acts as a blocking gate during initialization.
 */

import { withTimeout, TimeoutError, AsyncLock } from '../core';
import { ConsentNotResolvedError, ConsentNotAcceptedError } from '../core/errors';
import { UsercentricsAdapter } from './UsercentricsAdapter';
import { ConsentStorage } from './ConsentStorage';
import {
  ConsentStatus,
  ConsentSource,
  ConsentResult,
  ConsentGrants,
  IConsentGate,
  IUsercentricsAdapter,
  IConsentStorage,
  StoredConsent,
  DEFAULT_CONSENT_GRANTS,
} from './types';

/**
 * Configuration constants
 */
const CONFIG = {
  CONSENT_TIMEOUT: 120000, // 2 minutes for entire consent flow
  CACHED_CONSENT_CHECK_TIMEOUT: 1000,
};

/**
 * Consent Gate Implementation
 */
export class ConsentGate implements IConsentGate {
  private readonly usercentricsAdapter: IUsercentricsAdapter;
  private readonly storage: IConsentStorage;
  private readonly lock: AsyncLock;

  private consentStatus: ConsentStatus = ConsentStatus.UNKNOWN;
  private consentGrants: ConsentGrants = DEFAULT_CONSENT_GRANTS;
  private consentResolved = false;
  private consentPromise: Promise<ConsentStatus> | null = null;
  private consentResolver: ((status: ConsentStatus) => void) | null = null;

  constructor(
    usercentricsAdapter?: IUsercentricsAdapter,
    storage?: IConsentStorage,
  ) {
    this.usercentricsAdapter = usercentricsAdapter || new UsercentricsAdapter();
    this.storage = storage || new ConsentStorage();
    this.lock = new AsyncLock();
  }

  /**
   * Present consent UI and wait for user decision
   */
  async presentConsentUI(): Promise<ConsentResult> {
    return this.lock.acquire('present', async () => {
      // Check for cached consent first
      const cached = await this.checkCachedConsent();
      if (cached) {
        console.log('[ConsentGate] Using cached consent:', cached.status);
        this.resolveConsent(cached);
        return cached;
      }

      try {
        // Initialize and show Usercentrics banner
        await this.usercentricsAdapter.initialize();

        // Check if consent is actually required
        console.log('[ConsentGate] Checking if consent is required...');
        const isRequired = await this.usercentricsAdapter.isConsentRequired();
        console.log('[ConsentGate] isConsentRequired result:', isRequired);
        
        if (!isRequired) {
          console.log('[ConsentGate] ✅ Consent not required in this region - auto-accepting');
          const result: ConsentResult = {
            status: ConsentStatus.ACCEPTED,
            grants: {
              analytics: true,
              advertising: true,
              personalization: true,
              crashReporting: true,
            },
            source: ConsentSource.REGION_NOT_REQUIRED,
          };
          this.resolveConsent(result);
          await this.persistConsent(result);
          return result;
        }

        // Consent IS required - show banner
        console.log('[ConsentGate] Consent required - showing banner...');
        
        // Show banner with timeout
        const result = await withTimeout(
          this.usercentricsAdapter.showConsentBanner(),
          CONFIG.CONSENT_TIMEOUT,
          'Consent flow timeout',
        );

        this.resolveConsent(result);
        await this.persistConsent(result);

        return result;
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.warn('[ConsentGate] Consent timeout, treating as denied');
        } else {
          console.error('[ConsentGate] Consent error:', error);
        }

        // Fail-safe: treat errors/timeouts as denial
        const deniedResult: ConsentResult = {
          status: ConsentStatus.DENIED,
          grants: DEFAULT_CONSENT_GRANTS,
          source: ConsentSource.DEFAULT,
        };

        this.resolveConsent(deniedResult);
        return deniedResult;
      }
    });
  }

  /**
   * Wait for consent to be resolved
   */
  async waitForConsent(): Promise<ConsentStatus> {
    if (this.consentResolved) {
      return this.consentStatus;
    }

    if (!this.consentPromise) {
      this.consentPromise = new Promise<ConsentStatus>(resolve => {
        this.consentResolver = resolve;
      });
    }

    return this.consentPromise;
  }

  /**
   * Get current consent status
   */
  getConsentStatus(): ConsentStatus {
    if (!this.consentResolved) {
      throw new ConsentNotResolvedError();
    }
    return this.consentStatus;
  }

  /**
   * Get consent grants
   */
  getConsentGrants(): ConsentGrants {
    return { ...this.consentGrants };
  }

  /**
   * Check if consent has been resolved
   */
  isConsentResolved(): boolean {
    return this.consentResolved;
  }

  /**
   * Persist consent to storage
   */
  async persistConsent(result: ConsentResult): Promise<void> {
    const stored: StoredConsent = {
      status: result.status,
      grants: result.grants,
      source: result.source,
      timestamp: Date.now(),
      version: '2.0.0',
    };

    await this.storage.storeConsent(stored);
  }

  /**
   * Require that consent has been resolved
   */
  requireConsent(): void {
    if (!this.consentResolved) {
      throw new ConsentNotResolvedError();
    }
  }

  /**
   * Require that consent was accepted
   */
  requireConsentAccepted(): void {
    this.requireConsent();
    if (this.consentStatus !== ConsentStatus.ACCEPTED) {
      throw new ConsentNotAcceptedError();
    }
  }

  /**
   * Check for cached consent
   * 
   * IMPORTANT: Only return cached consent if it was from an EXPLICIT user decision
   * (source = USERCENTRICS). If consent was auto-accepted due to region, we need to
   * re-validate that the region still doesn't require consent.
   */
  private async checkCachedConsent(): Promise<ConsentResult | null> {
    try {
      console.log('[ConsentGate] Checking for cached consent...');
      const stored = await this.storage.getStoredConsent();
      if (!stored) {
        console.log('[ConsentGate] No cached consent found');
        return null;
      }

      console.log('[ConsentGate] Found cached consent:', stored.status, 'source:', stored.source);
      
      // Only use cached consent if it was from an EXPLICIT user decision
      // USERCENTRICS source means user explicitly accepted or denied via the banner
      // REGION_NOT_REQUIRED or DEFAULT should NOT be used as cached consent for EU regions
      // because user may have killed app before making a decision
      const isExplicitUserDecision = stored.source === ConsentSource.USERCENTRICS;
      
      if (!isExplicitUserDecision) {
        console.log('[ConsentGate] Cached consent is NOT from explicit user decision (source:', stored.source, ') - will re-check region requirements');
        return null;
      }
      
      console.log('[ConsentGate] Using cached consent from explicit user decision');
      return {
        status: stored.status,
        grants: stored.grants,
        source: ConsentSource.CACHED,
      };
    } catch (error) {
      console.warn('[ConsentGate] Error checking cached consent:', error);
      return null;
    }
  }

  /**
   * Resolve consent internally
   */
  private resolveConsent(result: ConsentResult): void {
    this.consentStatus = result.status;
    this.consentGrants = result.grants;
    this.consentResolved = true;

    if (this.consentResolver) {
      this.consentResolver(result.status);
      this.consentResolver = null;
    }

    console.log('[ConsentGate] Consent resolved:', result.status);
  }

  /**
   * Reset consent state (for testing)
   */
  reset(): void {
    this.consentStatus = ConsentStatus.UNKNOWN;
    this.consentGrants = DEFAULT_CONSENT_GRANTS;
    this.consentResolved = false;
    this.consentPromise = null;
    this.consentResolver = null;
  }
}

export default ConsentGate;
