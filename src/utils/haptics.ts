/**
 * Haptic Feedback Utility
 *
 * Provides cross-platform haptic feedback for iOS and Android
 * using react-native-haptic-feedback for proper Taptic Engine support
 */

import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error';

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Map our types to react-native-haptic-feedback types
const hapticTypeMap: Record<HapticType, keyof typeof HapticFeedbackTypes> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  selection: 'selection',
  success: 'notificationSuccess',
  error: 'notificationError',
};

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback
 */
export const triggerHaptic = (type: HapticType = 'light'): void => {
  const feedbackType = hapticTypeMap[type] || 'impactLight';
  ReactNativeHapticFeedback.trigger(feedbackType, hapticOptions);
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
