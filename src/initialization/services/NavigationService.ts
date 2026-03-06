/**
 * Navigation Service
 *
 * Programmatic navigation for initialization flow.
 */

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

/**
 * Navigation container ref (must be set by RootNavigator)
 */
export const navigationRef = createNavigationContainerRef();

/**
 * Navigation Service Implementation
 */
export class NavigationService {
  private isReady = false;

  /**
   * Mark navigation as ready
   */
  setReady(): void {
    this.isReady = true;
    console.log('[Navigation] Ready');
  }

  /**
   * Check if navigation is ready
   */
  checkReady(): boolean {
    return this.isReady && navigationRef.isReady();
  }

  /**
   * Navigate to onboarding screen
   */
  async navigateToOnboarding(): Promise<void> {
    if (!this.checkReady()) {
      console.warn('[Navigation] Not ready, cannot navigate to onboarding');
      return;
    }

    try {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        }),
      );
      console.log('[Navigation] Navigated to Onboarding');
    } catch (error) {
      console.error('[Navigation] Error navigating to onboarding:', error);
    }
  }

  /**
   * Navigate to main app
   */
  async navigateToMainApp(): Promise<void> {
    if (!this.checkReady()) {
      console.warn('[Navigation] Not ready, cannot navigate to main app');
      return;
    }

    try {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
      console.log('[Navigation] Navigated to Main');
    } catch (error) {
      console.error('[Navigation] Error navigating to main:', error);
    }
  }

  /**
   * Navigate to error screen
   */
  async navigateToErrorScreen(error: unknown): Promise<void> {
    console.error('[Navigation] Navigating to error screen:', error);
    // For now, just log - in production you'd show an error screen
  }

  /**
   * Navigate to minimal fallback
   */
  async navigateToMinimalFallback(): Promise<void> {
    console.warn('[Navigation] Navigating to minimal fallback');
    // Navigate to main app with degraded experience
    await this.navigateToMainApp();
  }

  /**
   * Get current route name
   */
  getCurrentRouteName(): string | undefined {
    if (!this.checkReady()) {
      return undefined;
    }
    return navigationRef.getCurrentRoute()?.name;
  }

  /**
   * Reset service state (for testing)
   */
  reset(): void {
    this.isReady = false;
  }
}

export default NavigationService;
