/**
 * Consent Testing Utilities
 * 
 * Helper functions for testing consent flow during development.
 * These functions should only be used in development/testing.
 * 
 * @module consentTestingUtils
 */

import { Alert } from 'react-native';
import { resetFirstLaunch, isFirstLaunch } from '../utils/firstLaunchHelper';
import { consentManager } from '../services/ConsentManager';
import { getTrackingPermissionStatus } from '../services/TrackingService';

/**
 * Get current consent and app state
 * Useful for debugging
 */
export const getConsentDebugInfo = async (): Promise<string> => {
  try {
    const firstLaunch = await isFirstLaunch();
    const consentState = consentManager.getConsentState();
    const sdksInitialized = consentManager.areSdksInitialized();
    const attStatus = await getTrackingPermissionStatus();

    const info = `
📊 Consent Debug Info:
━━━━━━━━━━━━━━━━━━━━
First Launch: ${firstLaunch ? '✅ YES' : '❌ NO'}
Consent State: ${consentState}
SDKs Initialized: ${sdksInitialized ? '✅ YES' : '❌ NO'}
ATT Status: ${attStatus}
━━━━━━━━━━━━━━━━━━━━
    `.trim();

    return info;
  } catch (error) {
    return `Error getting debug info: ${error}`;
  }
};

/**
 * Show consent debug info in an alert
 */
export const showConsentDebugInfo = async (): Promise<void> => {
  const info = await getConsentDebugInfo();
  Alert.alert('Consent Debug Info', info);
};

/**
 * Reset all consent-related state
 * Use this to simulate a fresh app install
 * 
 * ⚠️ This will reset:
 * - First launch state
 * - Consent state
 * - You'll need to restart the app to see effects
 */
export const resetConsentState = async (): Promise<void> => {
  try {
    await resetFirstLaunch();
    await consentManager.resetConsent();
    
    Alert.alert(
      'Consent State Reset',
      'All consent state has been reset.\n\nPlease RESTART the app to see the first-launch flow.',
      [{ text: 'OK' }]
    );
  } catch (error) {
    Alert.alert('Error', `Failed to reset consent state: ${error}`);
  }
};

/**
 * Show a dialog with reset and debug options
 */
export const showConsentTestingMenu = (): void => {
  Alert.alert(
    'Consent Testing',
    'Choose an action:',
    [
      {
        text: 'Show Debug Info',
        onPress: showConsentDebugInfo,
      },
      {
        text: 'Reset Consent State',
        onPress: () => {
          Alert.alert(
            'Confirm Reset',
            'This will reset all consent state and simulate a fresh install.\n\nYou must RESTART the app after this.\n\nContinue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetConsentState },
            ]
          );
        },
        style: 'destructive',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

/**
 * Log current consent state to console
 * Useful for debugging without alerts
 */
export const logConsentState = async (): Promise<void> => {
  const info = await getConsentDebugInfo();
  console.log(info);
};

/**
 * Check if consent is properly set up
 * Returns warnings if configuration looks incorrect
 */
export const validateConsentSetup = async (): Promise<string[]> => {
  const warnings: string[] = [];

  try {
    const firstLaunch = await isFirstLaunch();
    const consentState = consentManager.getConsentState();
    const sdksInitialized = consentManager.areSdksInitialized();

    // Check for inconsistent states
    if (!firstLaunch && consentState === 'not-determined') {
      warnings.push('Not first launch but consent state is not-determined');
    }

    if (consentState === 'accepted' && !sdksInitialized) {
      warnings.push('Consent accepted but SDKs not initialized (ATT may be denied)');
    }

    if (consentState === 'denied' && sdksInitialized) {
      warnings.push('⚠️ WARNING: Consent denied but SDKs are initialized!');
    }

    if (warnings.length === 0) {
      warnings.push('✅ Consent setup looks correct');
    }

    return warnings;
  } catch (error) {
    return [`Error validating setup: ${error}`];
  }
};

/**
 * Show validation results
 */
export const showConsentValidation = async (): Promise<void> => {
  const warnings = await validateConsentSetup();
  Alert.alert(
    'Consent Setup Validation',
    warnings.join('\n\n'),
    [{ text: 'OK' }]
  );
};

// Export all utilities
export default {
  getConsentDebugInfo,
  showConsentDebugInfo,
  resetConsentState,
  showConsentTestingMenu,
  logConsentState,
  validateConsentSetup,
  showConsentValidation,
};
