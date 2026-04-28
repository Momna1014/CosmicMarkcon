/**
 * AdjustService
 *
 * High-level service for tracking in-app events with the Adjust SDK.
 *
 * IMPORTANT — Adjust uses short opaque event tokens (e.g. "abc123"), NOT
 * human-readable event names. Every event token must first be created in the
 * Adjust dashboard under your app before it can be used here.
 *
 * Usage example:
 *   import { adjustService } from './AdjustService';
 *   adjustService.logPurchase(9.99, 'USD', 'abc123');
 *
 * All methods are safe to call before the SDK is fully initialized — the
 * Adjust SDK queues events internally and flushes them once the session starts.
 */

import { Adjust, AdjustEvent } from 'react-native-adjust';

class AdjustService {
  private initialized = false;

  /**
   * Mark the service as ready.
   * Called by AdjustAdapter after Adjust.initSdk() succeeds.
   */
  markInitialized(): void {
    this.initialized = true;
  }

  // ─── Internal helpers ───────────────────────────────────────────────────────

  private guard(methodName: string): boolean {
    if (!this.initialized) {
      console.warn(`[AdjustService] SDK not yet initialized — ${methodName} queued`);
      // We still proceed: Adjust queues events before the session is established.
    }
    return true;
  }

  private buildEvent(
    eventToken: string,
    params?: Record<string, string>,
  ): AdjustEvent {
    const event = new AdjustEvent(eventToken);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        event.addCallbackParameter(key, value);
        event.addPartnerParameter(key, value);
      });
    }
    return event;
  }

  // ─── Generic event ──────────────────────────────────────────────────────────

  /**
   * Track any custom event by its Adjust dashboard token.
   *
   * @param eventToken - Token created in Adjust dashboard (e.g. "abc123")
   * @param params     - Optional key-value pairs forwarded to callback & partner URLs
   */
  logEvent(eventToken: string, params?: Record<string, string>): void {
    this.guard('logEvent');
    try {
      const event = this.buildEvent(eventToken, params);
      Adjust.trackEvent(event);
      console.log('[AdjustService] Event tracked:', eventToken);
    } catch (error) {
      console.error('[AdjustService] Failed to track event:', eventToken, error);
    }
  }

  // ─── Revenue events ─────────────────────────────────────────────────────────

  /**
   * Track a purchase / revenue event.
   *
   * @param revenue    - Numeric revenue amount (e.g. 9.99)
   * @param currency   - ISO 4217 currency code (e.g. "USD")
   * @param eventToken - Adjust event token for the purchase event
   * @param productId  - Optional product / SKU identifier
   */
  logPurchase(
    revenue: number,
    currency: string,
    eventToken: string,
    productId?: string,
  ): void {
    this.guard('logPurchase');
    try {
      const event = new AdjustEvent(eventToken);
      event.setRevenue(revenue, currency);
      if (productId) {
        event.addCallbackParameter('product_id', productId);
        event.addPartnerParameter('product_id', productId);
      }
      Adjust.trackEvent(event);
      console.log('[AdjustService] Purchase tracked:', revenue, currency);
    } catch (error) {
      console.error('[AdjustService] Failed to track purchase:', error);
    }
  }

  /**
   * Track ad revenue.
   *
   * @param revenue    - Revenue amount
   * @param network    - Ad network name (e.g. "applovin_max")
   * @param adFormat   - Ad format (e.g. "banner", "interstitial", "rewarded")
   * @param eventToken - Adjust event token for the ad_revenue event
   */
  logAdRevenue(
    revenue: number,
    network: string,
    adFormat: string,
    eventToken: string,
  ): void {
    this.guard('logAdRevenue');
    try {
      const event = new AdjustEvent(eventToken);
      event.setRevenue(revenue, 'USD');
      event.addCallbackParameter('ad_network', network);
      event.addCallbackParameter('ad_format', adFormat);
      event.addPartnerParameter('ad_network', network);
      event.addPartnerParameter('ad_format', adFormat);
      Adjust.trackEvent(event);
      console.log('[AdjustService] Ad revenue tracked:', revenue, network);
    } catch (error) {
      console.error('[AdjustService] Failed to track ad revenue:', error);
    }
  }

  // ─── User-lifecycle events ───────────────────────────────────────────────────

  /**
   * Track a completed registration / sign-up.
   *
   * @param eventToken - Adjust event token for registration
   * @param method     - Sign-up method (e.g. "email", "google", "apple")
   */
  logRegistration(eventToken: string, method?: string): void {
    this.guard('logRegistration');
    try {
      const event = this.buildEvent(eventToken, method ? { method } : undefined);
      Adjust.trackEvent(event);
      console.log('[AdjustService] Registration tracked:', method);
    } catch (error) {
      console.error('[AdjustService] Failed to track registration:', error);
    }
  }

  /**
   * Track a user login.
   *
   * @param eventToken - Adjust event token for login
   * @param method     - Login method (e.g. "email", "google", "apple")
   */
  logLogin(eventToken: string, method?: string): void {
    this.guard('logLogin');
    try {
      const event = this.buildEvent(eventToken, method ? { method } : undefined);
      Adjust.trackEvent(event);
      console.log('[AdjustService] Login tracked:', method);
    } catch (error) {
      console.error('[AdjustService] Failed to track login:', error);
    }
  }

  // ─── Onboarding / engagement events ─────────────────────────────────────────

  /**
   * Track tutorial / onboarding completion.
   *
   * @param eventToken - Adjust event token for tutorial completion
   * @param success    - Whether the tutorial completed successfully
   */
  logTutorialCompletion(eventToken: string, success: boolean): void {
    this.guard('logTutorialCompletion');
    try {
      const event = this.buildEvent(eventToken, { success: String(success) });
      Adjust.trackEvent(event);
      console.log('[AdjustService] Tutorial completion tracked:', success);
    } catch (error) {
      console.error('[AdjustService] Failed to track tutorial completion:', error);
    }
  }

  /**
   * Track a level / milestone achieved.
   *
   * @param eventToken - Adjust event token for level achieved
   * @param level      - Level number or name
   * @param score      - Optional score at time of completion
   */
  logLevelAchieved(eventToken: string, level: number | string, score?: number): void {
    this.guard('logLevelAchieved');
    try {
      const params: Record<string, string> = { level: String(level) };
      if (score !== undefined) params.score = String(score);
      const event = this.buildEvent(eventToken, params);
      Adjust.trackEvent(event);
      console.log('[AdjustService] Level achieved tracked:', level);
    } catch (error) {
      console.error('[AdjustService] Failed to track level achieved:', error);
    }
  }

  /**
   * Track a content view.
   *
   * @param eventToken  - Adjust event token for content view
   * @param contentId   - Identifier of the viewed content
   * @param contentType - Type/category of the content
   */
  logContentView(eventToken: string, contentId: string, contentType: string): void {
    this.guard('logContentView');
    try {
      const event = this.buildEvent(eventToken, {
        content_id: contentId,
        content_type: contentType,
      });
      Adjust.trackEvent(event);
      console.log('[AdjustService] Content view tracked:', contentId);
    } catch (error) {
      console.error('[AdjustService] Failed to track content view:', error);
    }
  }
}

// Export a singleton instance
export const adjustService = new AdjustService();
export default adjustService;
