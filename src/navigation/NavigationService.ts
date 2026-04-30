/**
 * NavigationService
 * 
 * Global navigation reference for navigating from anywhere in the app
 * Useful for: Paywall triggers, deep linking, push notifications, etc.
 */

import {createNavigationContainerRef, StackActions} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen
 */
export function navigate(name: string, params?: any) {
  console.log(`[NavigationService] navigate called: ${name}`, { 
    isReady: navigationRef.isReady(),
    params 
  });
  
  if (navigationRef.isReady()) {
    console.log(`[NavigationService] ✅ Navigating to ${name}`);
    (navigationRef as any).navigate(name, params);
  } else {
    console.warn(`[NavigationService] ⚠️ Navigation ref not ready, will retry...`);
    // Retry after a short delay
    setTimeout(() => {
      if (navigationRef.isReady()) {
        console.log(`[NavigationService] ✅ Retry successful, navigating to ${name}`);
        (navigationRef as any).navigate(name, params);
      } else {
        console.error(`[NavigationService] ❌ Navigation ref still not ready after retry`);
      }
    }, 500);
  }
}

/**
 * Go back to previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Push a new screen onto the stack
 */
export function push(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

/**
 * Replace current screen
 */
export function replace(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

/**
 * Reset navigation state
 */
export function reset(state: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
}

/**
 * Get current route name
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * Check if navigation is ready
 */
export function isReady() {
  return navigationRef.isReady();
}

export default {
  navigationRef,
  navigate,
  goBack,
  push,
  replace,
  reset,
  getCurrentRoute,
  isReady,
};
