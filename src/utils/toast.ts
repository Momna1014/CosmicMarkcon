import Toast from 'react-native-toast-message';

/**
 * Toast Utility Functions
 * 
 * Centralized toast notifications using react-native-toast-message
 * Provides consistent UX across the app
 */

/**
 * Show success toast
 * @param message - Success message to display
 * @param title - Optional title (defaults to "Success")
 */
export const showSuccessToast = (message: string, title: string = 'Success') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

/**
 * Show error toast
 * @param message - Error message to display
 * @param title - Optional title (defaults to "Error")
 */
export const showErrorToast = (message: string, title: string = 'Error') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
  });
};

/**
 * Show info toast
 * @param message - Info message to display
 * @param title - Optional title (defaults to "Info")
 */
export const showInfoToast = (message: string, title: string = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

/**
 * Show warning toast
 * @param message - Warning message to display
 * @param title - Optional title (defaults to "Warning")
 */
export const showWarningToast = (message: string, title: string = 'Warning') => {
  Toast.show({
    type: 'info', // react-native-toast-message doesn't have 'warning' type by default
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3500,
    autoHide: true,
    topOffset: 60,
  });
};

/**
 * Hide all toasts
 */
export const hideToast = () => {
  Toast.hide();
};

/**
 * Show loading toast (non-dismissible)
 * @param message - Loading message to display
 */
export const showLoadingToast = (message: string = 'Loading...') => {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
    visibilityTime: 0, // Don't auto-hide
    autoHide: false,
    topOffset: 60,
  });
};
