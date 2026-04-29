/**
 * Usercentrics Adapter
 *
 * Wrapper around Usercentrics SDK for consent management.
 */

import { Platform } from 'react-native';
import { Usercentrics, UsercentricsOptions, UsercentricsUserInteraction } from '@usercentrics/react-native-sdk';
import NetInfo from '@react-native-community/netinfo';
import { withTimeout, TimeoutError, delay } from '../core';
import {
  ConsentResult,
  ConsentStatus,
  ConsentSource,
  ConsentGrants,
  IUsercentricsAdapter,
  UsercentricsStatus,
  DEFAULT_CONSENT_GRANTS,
} from './types';
import env from '../../config/env';

/**
 * Configuration constants
 */
const CONFIG = {
  INIT_TIMEOUT: 10000,
  // Banner shown on FIRST launch — user must decide; 2 min is enough.
  BANNER_TIMEOUT: 120000,
  // Banner re-opened from Settings (Manage Privacy Preferences). The user
  // is intentionally engaging with the granular toggles — they may take a
  // long time reading the per-vendor list. We give them 5 minutes and, on
  // timeout, treat it as "dismiss without change" instead of an error.
  REOPEN_BANNER_TIMEOUT: 300000,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  NETWORK_WAIT_TIMEOUT: 5000,
};

/**
 * Usercentrics Adapter Implementation
 */
export class UsercentricsAdapter implements IUsercentricsAdapter {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize Usercentrics SDK
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Internal initialization with retry logic
   */
  private async doInitialize(): Promise<void> {
    // Wait for network on iOS (often delayed on cold start)
    if (Platform.OS === 'ios') {
      await this.waitForNetwork();
    }

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`[Usercentrics] Initializing (attempt ${attempt}/${CONFIG.MAX_RETRIES})`);

        // Prefer the new CMP v2 settingsId. Fall back to the legacy ruleSetId
        // env value to keep older builds working during the migration window.
        const settingsId = env.USERCENTRICS_SETTINGS_ID || env.USER_CENTRIC;
        const options: UsercentricsOptions = {
          settingsId,
          loggerLevel: __DEV__ ? 1 : 0,
          timeoutMillis: CONFIG.INIT_TIMEOUT,
        };

        console.log('[Usercentrics] Configuring with settingsId:', settingsId);
        Usercentrics.configure(options);

        // Wait for SDK to be ready
        const initDelay = Platform.OS === 'ios' ? 300 : 100;
        await delay(initDelay);

        // Verify SDK is ready
        await Usercentrics.status();

        console.log('[Usercentrics] Initialized successfully');
        return;
      } catch (error: any) {
        console.warn(`[Usercentrics] Init attempt ${attempt} failed:`, error?.message);

        if (attempt < CONFIG.MAX_RETRIES) {
          const retryDelay = CONFIG.RETRY_DELAY_BASE * attempt;
          console.log(`[Usercentrics] Retrying in ${retryDelay}ms...`);
          await delay(retryDelay);

          // Re-check network on network errors
          if (this.isNetworkError(error)) {
            await this.waitForNetwork();
          }
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Show consent banner and get user decision
   * Keeps showing banner until user makes an explicit decision (acceptAll, denyAll, or granular)
   * This prevents users from dismissing the banner via Android back button without consent
   */
  async showConsentBanner(): Promise<ConsentResult> {
    await this.ensureInitialized();

    try {
      console.log('[Usercentrics] ┌─────────────────────────────────────────────');
      console.log('[Usercentrics] │ SHOWING CONSENT BANNER (first launch / required)');
      console.log('[Usercentrics] │ Loop until user makes explicit decision');
      console.log('[Usercentrics] │ Timeout per attempt: ' + CONFIG.BANNER_TIMEOUT + 'ms');
      console.log('[Usercentrics] └─────────────────────────────────────────────');

      let attempt = 0;
      while (true) {
        attempt++;
        console.log('[Usercentrics] ⏳ Awaiting user decision (attempt #' + attempt + ')…');
        const response = await withTimeout(
          Usercentrics.showSecondLayer(),
          CONFIG.BANNER_TIMEOUT,
          'Consent banner timeout',
        );

        const result = this.parseConsentResponse(response);

        // Check if user made an explicit decision
        if (result.source === ConsentSource.USERCENTRICS) {
          console.log('[Usercentrics] ✅ Explicit decision captured on attempt #' + attempt + ': ' + result.status);
          return result;
        }

        // User dismissed without decision (back button) - re-show banner
        console.log('[Usercentrics] ⚠️ User dismissed without decision - re-showing banner...');
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.warn('[Usercentrics] Banner timeout, treating as denied');
        return {
          status: ConsentStatus.DENIED,
          grants: DEFAULT_CONSENT_GRANTS,
          source: ConsentSource.DEFAULT,
        };
      }

      console.error('[Usercentrics] Banner error:', error);
      throw error;
    }
  }

  /**
   * Re-open the Usercentrics second layer for an already-consented user.
   * Used by the in-app "Manage Privacy Preferences" entry. Single-shot:
   * does NOT loop on dismiss — if the user closes without changing anything
   * we return null and the caller should keep the existing stored consent.
   *
   * GDPR Art. 7(3): the user must be able to WITHDRAW consent at any time and
   * as easily as they gave it. This method backs that requirement.
   *
   * Timeout handling: a long (5 min) timeout is used because the user is
   * intentionally interacting with the granular UI; a TimeoutError here is
   * treated as "user walked away" — we keep existing consent untouched.
   */
  async showSecondLayerForUpdate(): Promise<ConsentResult | null> {
    await this.ensureInitialized();

    console.log('[Usercentrics] ┌─────────────────────────────────────────────');
    console.log('[Usercentrics] │ RE-OPEN SECOND LAYER (Manage Privacy Prefs)');
    console.log('[Usercentrics] │ Timeout: ' + CONFIG.REOPEN_BANNER_TIMEOUT + 'ms (' + (CONFIG.REOPEN_BANNER_TIMEOUT / 60000) + ' min)');
    console.log('[Usercentrics] └─────────────────────────────────────────────');

    try {
      const response = await withTimeout(
        Usercentrics.showSecondLayer(),
        CONFIG.REOPEN_BANNER_TIMEOUT,
        'Consent banner timeout',
      );

      console.log('[Usercentrics] Second layer returned. Parsing response...');
      const result = this.parseConsentResponse(response);

      // Only return a result when the user actually made/changed a decision.
      // ConsentSource.DEFAULT means the banner was dismissed without interaction.
      if (result.source !== ConsentSource.USERCENTRICS) {
        console.log('[Usercentrics] ⚠️ Second layer dismissed without explicit decision — keeping existing consent');
        return null;
      }

      console.log('[Usercentrics] ✅ Second layer produced new decision:', result.status);
      return result;
    } catch (error: any) {
      // Timeout in the re-open path is NOT an error — the user simply walked
      // away from the granular UI. We keep the existing stored consent.
      if (error instanceof TimeoutError) {
        console.warn('[Usercentrics] ⏱️ Re-open second layer timed out — keeping existing consent (no change)');
        return null;
      }
      console.error('[Usercentrics] ❌ Re-open second layer failed:', error?.message || error);
      return null;
    }
  }

  /**
   * Get current Usercentrics status
   */
  async getStatus(): Promise<UsercentricsStatus> {
    await this.ensureInitialized();
    return Usercentrics.status();
  }

  /**
   * Check if user has given explicit consent via Usercentrics
   * Returns true if user has any consent decisions stored in Usercentrics SDK
   */
  async hasExplicitConsents(): Promise<boolean> {
    try {
      const consents = await Usercentrics.getConsents();
      // Check if any consent decision was made (either true or false)
      // Empty array or null means no decisions have been made
      const hasConsents = Array.isArray(consents) && consents.length > 0;
      console.log('[Usercentrics] Has explicit consents:', hasConsents, '(count:', consents?.length || 0, ')');
      return hasConsents;
    } catch (error) {
      console.warn('[Usercentrics] Error checking consents:', error);
      return false;
    }
  }

  /**
   * Check if consent is required in user's region
   * 
   * Logic:
   * 1. bannerRequiredAtLocation === false → Non-EU region, no consent needed
   * 2. bannerRequiredAtLocation === true (or undefined):
   *    - shouldCollectConsent === true → First time EU user, need consent
   *    - shouldCollectConsent === false:
   *      - User has explicit consents in Usercentrics → Already consented, no need
   *      - User has NO consents → Killed app during consent, need to re-show
   */
  async isConsentRequired(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      
      // Detailed logging to debug region-based consent
      console.log('[Usercentrics] Status received:', JSON.stringify({
        shouldCollectConsent: status?.shouldCollectConsent,
        bannerRequiredAtLocation: status?.geolocationRuleset?.bannerRequiredAtLocation,
        hasGeolocationRuleset: !!status?.geolocationRuleset,
      }));
      
      const bannerRequiredAtLocation = status?.geolocationRuleset?.bannerRequiredAtLocation;
      const shouldCollectConsent = status?.shouldCollectConsent;
      
      // Case 1: bannerRequiredAtLocation is explicitly false → Non-EU region
      if (bannerRequiredAtLocation === false) {
        console.log('[Usercentrics] Consent NOT required (bannerRequiredAtLocation is false - non-EU region)');
        return false;
      }
      
      // Case 2: shouldCollectConsent is false
      // This could mean:
      // - Non-EU region where some configs still have bannerRequiredAtLocation=true
      // - EU region where user already consented
      // - EU region where user killed app (banner shown but no decision)
      if (shouldCollectConsent === false) {
        // Check if user has explicit consent decisions in Usercentrics
        const hasConsents = await this.hasExplicitConsents();
        
        if (hasConsents) {
          // User already made a decision → use that
          console.log('[Usercentrics] Consent NOT required (user already has explicit consents)');
          return false;
        }
        
        // No explicit consents AND bannerRequiredAtLocation is true/undefined
        // Could be either: (a) non-EU with bannerRequiredAtLocation misconfigured, or (b) EU killed app
        // For safety in EU: re-show banner
        if (bannerRequiredAtLocation === true) {
          console.log('[Usercentrics] Consent IS required (EU region, shouldCollectConsent=false but no explicit consents - user may have killed app)');
          return true;
        }
        
        // bannerRequiredAtLocation is undefined/null, shouldCollectConsent is false, no consents
        // Likely non-EU or misconfigured - don't require consent
        console.log('[Usercentrics] Consent NOT required (shouldCollectConsent is false, no geolocation info)');
        return false;
      }
      
      // Case 3: shouldCollectConsent is true → First time user or consent expired
      console.log('[Usercentrics] Consent IS required (shouldCollectConsent is true)');
      return true;
    } catch (error) {
      console.warn('[Usercentrics] Failed to check consent requirement:', error);
      // Fail-safe: assume consent IS required
      return true;
    }
  }

  /**
   * Parse Usercentrics consent response
   */
  private parseConsentResponse(response: any): ConsentResult {
    const consents = response?.consents || [];
    const userInteraction = response?.userInteraction;

    console.log('[Usercentrics] Parsing response - userInteraction:', userInteraction);

    let status: ConsentStatus;
    let grants: ConsentGrants;
    let source: ConsentSource;

    switch (userInteraction) {
      case UsercentricsUserInteraction.acceptAll:
        // User explicitly accepted all
        status = ConsentStatus.ACCEPTED;
        grants = this.parseConsentGrants(consents);
        source = ConsentSource.USERCENTRICS;
        console.log('[Usercentrics] ✅ User accepted all');
        break;

      case UsercentricsUserInteraction.denyAll:
        // User explicitly denied all
        status = ConsentStatus.DENIED;
        grants = DEFAULT_CONSENT_GRANTS;
        source = ConsentSource.USERCENTRICS;
        console.log('[Usercentrics] ❌ User denied all');
        break;

      case UsercentricsUserInteraction.granular:
        // User made granular choices via the second layer.
        // Preserve GRANULAR status end-to-end so downstream SDKs can be toggled
        // per-vendor instead of being collapsed to ACCEPTED/DENIED.
        grants = this.parseConsentGrants(consents);
        status = ConsentStatus.GRANULAR;
        source = ConsentSource.USERCENTRICS;
        console.log('[Usercentrics] 🔧 Granular consent (preserved). Grants:', grants);
        break;

      default:
        // No interaction or dismissed (back button pressed)
        // Return DEFAULT source to indicate no explicit user decision
        status = ConsentStatus.DENIED;
        grants = DEFAULT_CONSENT_GRANTS;
        source = ConsentSource.DEFAULT; // NOT USERCENTRICS - indicates dismissal
        console.log('[Usercentrics] ⚠️ No interaction or dismissed - no explicit decision');
        break;
    }

    return {
      status,
      grants,
      source,
    };
  }

  /**
   * Parse individual consent grants from Usercentrics response.
   *
   * Maps each consented vendor/template into BOTH the legacy 4 coarse buckets
   * (analytics/advertising/personalization/crashReporting) AND the new
   * per-vendor flags used by the granular SDK gating.
   */
  private parseConsentGrants(consents: any[]): ConsentGrants {
    const grants: ConsentGrants = { ...DEFAULT_CONSENT_GRANTS };

    console.log('[Usercentrics] ── Parsing per-vendor grants from ' + (consents?.length || 0) + ' consent entries ──');

    for (const consent of consents) {
      if (!consent?.status) {
        // Skip vendors the user explicitly turned OFF in the granular UI.
        if (consent?.dataProcessor || consent?.templateId) {
          console.log('[Usercentrics]   ⏭️  ' + (consent.dataProcessor || consent.templateId) + ' → OFF');
        }
        continue;
      }

      const templateId = (consent.templateId || '').toString().toLowerCase();
      const dataProcessor = (consent.dataProcessor || '').toString().toLowerCase();
      const haystack = `${templateId} ${dataProcessor}`;
      console.log('[Usercentrics]   ✅  ' + (consent.dataProcessor || consent.templateId) + ' → ON');

      // ---- Per-vendor mapping (granular) ----
      if (haystack.includes('firebase analytics') || haystack.includes('firebase-analytics') || haystack.includes('google analytics')) {
        grants.firebaseAnalytics = true;
      }
      if (haystack.includes('crashlytics')) {
        grants.crashlytics = true;
      }
      if (haystack.includes('sentry')) {
        grants.sentry = true;
      }
      if (haystack.includes('facebook') || haystack.includes('meta')) {
        grants.facebook = true;
      }
      if (haystack.includes('adjust')) {
        grants.adjust = true;
      }
      if (haystack.includes('applovin') || haystack.includes('max ')) {
        grants.appLovin = true;
      }
      if (haystack.includes('revenuecat')) {
        grants.revenueCat = true;
      }
      if (haystack.includes('appsflyer')) {
        grants.appsFlyer = true;
      }

      // ---- Coarse bucket mapping (legacy) ----
      if (
        haystack.includes('analytics') ||
        haystack.includes('firebase')
      ) {
        grants.analytics = true;
      }

      if (
        haystack.includes('advertising') ||
        haystack.includes('marketing') ||
        haystack.includes('applovin') ||
        haystack.includes('appsflyer') ||
        haystack.includes('facebook') ||
        haystack.includes('adjust')
      ) {
        grants.advertising = true;
      }

      if (
        haystack.includes('personalization') ||
        haystack.includes('personalisation')
      ) {
        grants.personalization = true;
      }

      if (
        haystack.includes('crash') ||
        haystack.includes('sentry') ||
        haystack.includes('crashlytics')
      ) {
        grants.crashReporting = true;
      }
    }

    console.log('[Usercentrics] ── Final per-vendor grants ──');
    console.log('[Usercentrics]   firebaseAnalytics : ' + grants.firebaseAnalytics);
    console.log('[Usercentrics]   crashlytics       : ' + grants.crashlytics);
    console.log('[Usercentrics]   sentry            : ' + grants.sentry);
    console.log('[Usercentrics]   facebook          : ' + grants.facebook);
    console.log('[Usercentrics]   adjust            : ' + grants.adjust);
    console.log('[Usercentrics]   appLovin          : ' + grants.appLovin);
    console.log('[Usercentrics]   revenueCat        : ' + grants.revenueCat);
    console.log('[Usercentrics]   appsFlyer         : ' + grants.appsFlyer);

    return grants;
  }

  /**
   * Ensure SDK is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Wait for network connectivity
   */
  private async waitForNetwork(): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < CONFIG.NETWORK_WAIT_TIMEOUT) {
      try {
        const netState = await NetInfo.fetch();
        if (netState.isConnected && netState.isInternetReachable !== false) {
          return true;
        }
        await delay(500);
      } catch {
        await delay(500);
      }
    }

    console.warn('[Usercentrics] Network wait timeout');
    return false;
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('internet') ||
      message.includes('network') ||
      message.includes('connection')
    );
  }
}

export default UsercentricsAdapter;
