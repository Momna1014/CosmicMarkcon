import { Platform } from 'react-native';
import type { ATTStatus, AdsModeResult, ConsentResult } from '../types';
import { isAdvertisingAllowed } from '../consent/consentPolicy';

export function resolveAdsMode(
  consent: ConsentResult,
  attStatus: ATTStatus,
): AdsModeResult {
  if (consent.status === 'denied' || !isAdvertisingAllowed(consent)) {
    return {
      mode: 'non-personalized',
      idfaEnabled: false,
      trackingAllowed: false,
      reason: 'consent-denied',
    };
  }

  if (Platform.OS === 'android') {
    return {
      mode: 'personalized',
      idfaEnabled: false,
      trackingAllowed: true,
      reason: 'android-no-att',
    };
  }

  if (attStatus === 'authorized') {
    return {
      mode: 'personalized',
      idfaEnabled: true,
      trackingAllowed: true,
      reason: 'att-authorized',
    };
  }

  return {
    mode: 'non-personalized',
    idfaEnabled: false,
    trackingAllowed: false,
    reason: 'att-not-authorized',
  };
}
