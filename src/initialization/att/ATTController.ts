/**
 * ATT Controller
 *
 * Handles iOS App Tracking Transparency permission flow.
 * Only active on iOS 14.5+.
 */

import { Platform } from 'react-native';
import {
  requestTrackingPermission,
  getTrackingStatus,
  TrackingStatus,
} from 'react-native-tracking-transparency';
import { createMMKV } from 'react-native-mmkv';
import { withTimeout, TimeoutError } from '../core';
import { ATTStatus, IATTController } from './types';

/**
 * Persistent flag so we never re-prompt ATT on the same install.
 * (iOS itself enforces once-per-install, but this keeps our flow honest
 * across orchestrator resets and from the Settings re-open path.)
 */
const attStorage = createMMKV({ id: 'att-storage' });
const ATT_PROMPT_SHOWN_KEY = '@att_prompt_shown_v1';

/**
 * Configuration constants
 */
const CONFIG = {
  REQUEST_TIMEOUT: 60000, // 1 minute for ATT decision
};

/**
 * ATT Controller Implementation
 */
export class ATTController implements IATTController {
  private status: ATTStatus = ATTStatus.NOT_DETERMINED;
  private hasRequested = false;

  /**
   * Request ATT permission from the user.
   *
   * Idempotent across installs: if the system already has a non-`not-determined`
   * status (or we previously persisted that we showed the prompt), we skip
   * the prompt and just return the current status.
   */
  async requestPermission(): Promise<ATTStatus> {
    console.log('[ATT] ════════════════════════════════════════════════');
    console.log('[ATT]  REQUEST TRACKING PERMISSION (independent of consent)');
    console.log('[ATT] ════════════════════════════════════════════════');

    // Not applicable on Android
    if (Platform.OS !== 'ios') {
      this.status = ATTStatus.NOT_APPLICABLE;
      console.log('[ATT] ⏭️ Android — ATT not applicable, status = NOT_APPLICABLE');
      return this.status;
    }

    // Don't request again if already done in this session
    if (this.hasRequested) {
      console.log('[ATT] ✅ Already requested this session — returning cached:', this.status);
      return this.status;
    }

    // Check current system status — if not `not-determined`, the system
    // will not show the prompt again, so just read & cache the status.
    try {
      const current = await getTrackingStatus();
      const persistedShown = attStorage.getBoolean(ATT_PROMPT_SHOWN_KEY) === true;
      console.log('[ATT] Pre-check: system status =', current, '| persistedShown =', persistedShown);
      if (current !== 'not-determined' || persistedShown) {
        this.status = this.mapTrackingStatus(current);
        this.hasRequested = true;
        console.log('[ATT] ⏭️ Skipping prompt (once-per-install). Final status:', this.status);
        return this.status;
      }
    } catch (e) {
      console.warn('[ATT] Pre-check getTrackingStatus failed, proceeding to prompt:', e);
    }

    try {
      console.log('[ATT] 📲 Showing system ATT prompt now…');

      const result = await withTimeout(
        requestTrackingPermission(),
        CONFIG.REQUEST_TIMEOUT,
        'ATT request timeout',
      );

      this.status = this.mapTrackingStatus(result);
      this.hasRequested = true;
      try {
        attStorage.set(ATT_PROMPT_SHOWN_KEY, true);
        console.log('[ATT] Persisted ATT_PROMPT_SHOWN flag in MMKV');
      } catch {
        // ignore persistence failure — system still enforces once-per-install
      }

      console.log('[ATT] ✅ Permission decision:', this.status, '(raw:', result + ')');
      return this.status;
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.warn('[ATT] Request timeout, treating as denied');
      } else {
        console.error('[ATT] Request error:', error);
      }

      // Fail-safe: treat errors/timeouts as denied
      this.status = ATTStatus.DENIED;
      this.hasRequested = true;
      return this.status;
    }
  }

  /**
   * Get current ATT status
   */
  getStatus(): ATTStatus {
    return this.status;
  }

  /**
   * Check if ATT is available (iOS only)
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Check if we can request permission
   */
  async canRequestPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    if (this.hasRequested) {
      return false;
    }

    try {
      const status = await getTrackingStatus();
      return status === 'not-determined';
    } catch {
      return false;
    }
  }

  /**
   * Get current status without requesting
   */
  async checkCurrentStatus(): Promise<ATTStatus> {
    if (Platform.OS !== 'ios') {
      return ATTStatus.NOT_APPLICABLE;
    }

    try {
      const status = await getTrackingStatus();
      this.status = this.mapTrackingStatus(status);
      return this.status;
    } catch (error) {
      console.error('[ATT] Error checking status:', error);
      return ATTStatus.NOT_DETERMINED;
    }
  }

  /**
   * Map tracking status string to ATTStatus enum
   */
  private mapTrackingStatus(status: TrackingStatus): ATTStatus {
    switch (status) {
      case 'authorized':
        return ATTStatus.AUTHORIZED;
      case 'denied':
        return ATTStatus.DENIED;
      case 'restricted':
        return ATTStatus.RESTRICTED;
      case 'not-determined':
        return ATTStatus.NOT_DETERMINED;
      case 'unavailable':
        return ATTStatus.NOT_APPLICABLE;
      default:
        return ATTStatus.DENIED;
    }
  }

  /**
   * Reset controller state (for testing)
   */
  reset(): void {
    this.status = ATTStatus.NOT_DETERMINED;
    this.hasRequested = false;
  }
}

export default ATTController;
