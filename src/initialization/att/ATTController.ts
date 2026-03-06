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
import { withTimeout, TimeoutError } from '../core';
import { ATTStatus, IATTController } from './types';

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
   * Request ATT permission from the user
   */
  async requestPermission(): Promise<ATTStatus> {
    // Not applicable on Android
    if (Platform.OS !== 'ios') {
      this.status = ATTStatus.NOT_APPLICABLE;
      console.log('[ATT] Not applicable on Android');
      return this.status;
    }

    // Don't request again if already done
    if (this.hasRequested) {
      console.log('[ATT] Already requested, returning cached status:', this.status);
      return this.status;
    }

    try {
      console.log('[ATT] Requesting tracking permission...');

      const result = await withTimeout(
        requestTrackingPermission(),
        CONFIG.REQUEST_TIMEOUT,
        'ATT request timeout',
      );

      this.status = this.mapTrackingStatus(result);
      this.hasRequested = true;

      console.log('[ATT] Permission result:', this.status);
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
