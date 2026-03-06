/**
 * Consent Storage
 *
 * Persistent storage for consent state using MMKV.
 */

import { createMMKV } from 'react-native-mmkv';
import {
  StoredConsent,
  IConsentStorage,
  ConsentStatus,
  DEFAULT_CONSENT_GRANTS,
} from './types';

const CONSENT_STORAGE_KEY = '@init_consent_state_v2';
const CONSENT_VERSION = '2.0.0';

/**
 * Consent validity period (365 days)
 */
const CONSENT_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * MMKV storage instance for consent
 */
const storage = createMMKV({ id: 'consent-storage' });

/**
 * Consent Storage Implementation
 */
export class ConsentStorage implements IConsentStorage {
  /**
   * Get stored consent from persistent storage
   */
  async getStoredConsent(): Promise<StoredConsent | null> {
    try {
      const data = storage.getString(CONSENT_STORAGE_KEY);
      if (!data) return null;

      const consent: StoredConsent = JSON.parse(data);

      // Check version compatibility
      if (consent.version !== CONSENT_VERSION) {
        console.log('[ConsentStorage] Consent version mismatch, clearing');
        await this.clearConsent();
        return null;
      }

      // Check if consent has expired
      if (this.isConsentExpired(consent)) {
        console.log('[ConsentStorage] Consent has expired, clearing');
        await this.clearConsent();
        return null;
      }

      return consent;
    } catch (error) {
      console.error('[ConsentStorage] Error reading consent:', error);
      return null;
    }
  }

  /**
   * Store consent to persistent storage
   */
  async storeConsent(consent: StoredConsent): Promise<void> {
    try {
      const data: StoredConsent = {
        ...consent,
        version: CONSENT_VERSION,
        timestamp: consent.timestamp || Date.now(),
      };

      storage.set(CONSENT_STORAGE_KEY, JSON.stringify(data));
      console.log('[ConsentStorage] Consent stored:', consent.status);
    } catch (error) {
      console.error('[ConsentStorage] Error storing consent:', error);
      throw error;
    }
  }

  /**
   * Clear stored consent
   */
  async clearConsent(): Promise<void> {
    try {
      storage.remove(CONSENT_STORAGE_KEY);
      console.log('[ConsentStorage] Consent cleared');
    } catch (error) {
      console.error('[ConsentStorage] Error clearing consent:', error);
      throw error;
    }
  }

  /**
   * Check if consent has expired
   */
  private isConsentExpired(consent: StoredConsent): boolean {
    const age = Date.now() - consent.timestamp;
    return age > CONSENT_VALIDITY_MS;
  }
}

/**
 * Create default stored consent (denied)
 */
export function createDefaultStoredConsent(): StoredConsent {
  return {
    status: ConsentStatus.DENIED,
    grants: DEFAULT_CONSENT_GRANTS,
    source: 'DEFAULT' as any,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
}

export default ConsentStorage;
