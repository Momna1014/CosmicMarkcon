import { Usercentrics } from '@usercentrics/react-native-sdk';
import { getCountry } from 'react-native-localize';
import type { Region } from '../types';
import { resolveUsercentricsIdentity } from './usercentricsIdentity';

/**
 * EU/EEA + UK ISO-3166 alpha-2 country codes. Used as a SettingsId-mode
 * fallback for region detection (Usercentrics does not expose geolocation
 * data unless a RuleSet is configured).
 */
const EU_EEA_UK_COUNTRIES = new Set<string>([
  // EU-27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA (non-EU)
  'IS', 'LI', 'NO',
  // UK (still under UK GDPR)
  'GB',
]);

/**
 * Detect whether the user is in a "non-EU" region.
 *
 * Two paths:
 *
 *   1. RuleSet mode — `geolocationRuleset.bannerRequiredAtLocation` is
 *      authoritative. Returns 'non-eu' iff the SDK says the banner is not
 *      required at the user's location.
 *
 *   2. SettingsId mode — the SDK does not expose geolocation, so
 *      `bannerRequiredAtLocation` is undefined/false even for EU users.
 *      We fall back to the device country reported by the OS via
 *      `react-native-localize`. EU/EEA/UK → 'eu'; everything else →
 *      'non-eu'. This is intentionally a soft hint (not a substitute for
 *      a RuleSet) but it lets us hide the "Manage Preferences" entry
 *      point for users who are clearly outside the EEA/UK.
 */
export async function checkRegion(): Promise<Region> {
  try {
    const identity = resolveUsercentricsIdentity();

    if (identity?.type === 'ruleset') {
      const status = await Usercentrics.status();
      const bannerRequired = status?.geolocationRuleset?.bannerRequiredAtLocation;
      return bannerRequired === false ? 'non-eu' : 'eu';
    }

    // SettingsId mode (or unknown identity): use device country as a hint.
    const country = (getCountry() || '').toUpperCase();
    if (country && !EU_EEA_UK_COUNTRIES.has(country)) {
      return 'non-eu';
    }
    return 'eu';
  } catch (error) {
    console.warn('[InitializationFlow] Failed to check region:', error);
    // Privacy-safe default — treat unknown as EU so we never accidentally
    // hide the consent UI from a real EU user.
    return 'eu';
  }
}
