/**
 * ATT Types
 *
 * Type definitions for App Tracking Transparency.
 */

/**
 * ATT authorization status
 */
export enum ATTStatus {
  NOT_DETERMINED = 'NOT_DETERMINED',
  RESTRICTED = 'RESTRICTED',
  DENIED = 'DENIED',
  AUTHORIZED = 'AUTHORIZED',
  NOT_APPLICABLE = 'NOT_APPLICABLE', // Android
}

/**
 * ATT controller interface
 */
export interface IATTController {
  requestPermission(): Promise<ATTStatus>;
  getStatus(): ATTStatus;
  isAvailable(): boolean;
  canRequestPermission(): Promise<boolean>;
}
