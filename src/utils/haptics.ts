/**
 * Haptic Feedback Utility
 *
 * Provides cross-platform haptic feedback for iOS and Android
 * with different intensity levels for various interactions
 */

import {Platform, Vibration} from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error';

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback
 */
export const triggerHaptic = (type: HapticType = 'light'): void => {
  if (Platform.OS === 'ios') {
    // iOS haptics - uses the Taptic Engine
    // Note: For more refined haptics, consider react-native-haptic-feedback
    switch (type) {
      case 'light':
        Vibration.vibrate(1);
        break;
      case 'medium':
        Vibration.vibrate(2);
        break;
      case 'heavy':
        Vibration.vibrate(3);
        break;
      case 'selection':
        Vibration.vibrate(1);
        break;
      case 'success':
        // Double tap pattern for success
        Vibration.vibrate([0, 1, 50, 1]);
        break;
      case 'error':
        // Triple tap pattern for error
        Vibration.vibrate([0, 2, 30, 2, 30, 2]);
        break;
      default:
        Vibration.vibrate(1);
    }
  } else {
    // Android haptics - vibration in milliseconds
    switch (type) {
      case 'light':
        Vibration.vibrate(10);
        break;
      case 'medium':
        Vibration.vibrate(20);
        break;
      case 'heavy':
        Vibration.vibrate(30);
        break;
      case 'selection':
        Vibration.vibrate(5);
        break;
      case 'success':
        // Double vibration pattern for success
        Vibration.vibrate([0, 15, 50, 15]);
        break;
      case 'error':
        // Triple vibration pattern for error
        Vibration.vibrate([0, 20, 40, 20, 40, 20]);
        break;
      default:
        Vibration.vibrate(10);
    }
  }
};

/**
 * Light haptic - for subtle button taps
 */
export const hapticLight = (): void => triggerHaptic('light');

/**
 * Medium haptic - for confirmations
 */
export const hapticMedium = (): void => triggerHaptic('medium');

/**
 * Heavy haptic - for important actions
 */
export const hapticHeavy = (): void => triggerHaptic('heavy');

/**
 * Selection haptic - for picker/toggle selections
 */
export const hapticSelection = (): void => triggerHaptic('selection');

/**
 * Success haptic - for successful completions
 */
export const hapticSuccess = (): void => triggerHaptic('success');

/**
 * Error haptic - for errors/warnings
 */
export const hapticError = (): void => triggerHaptic('error');

export default {
  trigger: triggerHaptic,
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  selection: hapticSelection,
  success: hapticSuccess,
  error: hapticError,
};
