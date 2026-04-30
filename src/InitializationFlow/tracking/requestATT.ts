import { Platform } from 'react-native';
import {
  getTrackingStatus,
  requestTrackingPermission,
  type TrackingStatus,
} from 'react-native-tracking-transparency';
import type { ATTStatus } from '../types';

export async function requestATT(): Promise<ATTStatus> {
  if (Platform.OS !== 'ios') {
    return 'not-applicable';
  }

  const currentStatus = await getTrackingStatus();
  if (currentStatus === 'not-determined') {
    await delay(200);
    const requested = await requestTrackingPermission();
    return mapStatus(requested);
  }

  return mapStatus(currentStatus);
}

function mapStatus(status: TrackingStatus): ATTStatus {
  if (status === 'authorized') return 'authorized';
  if (status === 'denied') return 'denied';
  if (status === 'restricted') return 'restricted';
  if (status === 'not-determined') return 'not-determined';
  return 'not-applicable';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
