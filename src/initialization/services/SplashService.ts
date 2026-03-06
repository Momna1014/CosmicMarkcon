/**
 * Splash Service
 *
 * Manages splash screen visibility with timeout protection.
 */

import RNBootSplash from 'react-native-bootsplash';

/**
 * Configuration
 */
const CONFIG = {
  MAX_SPLASH_TIME: 45000, // 45 seconds absolute maximum
  FADE_DURATION: 250,
};

/**
 * Splash Service Implementation
 */
export class SplashService {
  private splashStartTime = 0;
  private forceHideTimeout: ReturnType<typeof setTimeout> | null = null;
  private isHidden = false;

  /**
   * Ensure splash is visible and start timeout guard
   */
  async ensureVisible(): Promise<void> {
    this.splashStartTime = Date.now();
    console.log('[Splash] Splash visible, timeout guard started');
  }

  /**
   * Start the timeout guard
   */
  startTimeoutGuard(): void {
    // Clear any existing timeout
    if (this.forceHideTimeout) {
      clearTimeout(this.forceHideTimeout);
    }

    // Set absolute maximum splash time
    this.forceHideTimeout = setTimeout(() => {
      this.forceHide();
    }, CONFIG.MAX_SPLASH_TIME);

    console.log('[Splash] Timeout guard active:', CONFIG.MAX_SPLASH_TIME, 'ms');
  }

  /**
   * Hide splash screen normally
   */
  async hide(): Promise<void> {
    if (this.isHidden) {
      return;
    }

    // Clear timeout guard
    if (this.forceHideTimeout) {
      clearTimeout(this.forceHideTimeout);
      this.forceHideTimeout = null;
    }

    const elapsed = Date.now() - this.splashStartTime;

    try {
      await RNBootSplash.hide({ fade: true });
      this.isHidden = true;
      console.log(`[Splash] Hidden after ${elapsed}ms`);
    } catch (error) {
      console.error('[Splash] Error hiding:', error);
      // Force hide without animation
      try {
        await RNBootSplash.hide({ fade: false });
        this.isHidden = true;
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Force hide splash (timeout exceeded)
   */
  async forceHide(): Promise<void> {
    if (this.isHidden) {
      return;
    }

    const elapsed = Date.now() - this.splashStartTime;
    console.error(`[Splash] FORCE HIDE - Maximum time exceeded (${elapsed}ms)`);

    // Clear timeout guard
    if (this.forceHideTimeout) {
      clearTimeout(this.forceHideTimeout);
      this.forceHideTimeout = null;
    }

    try {
      await RNBootSplash.hide({ fade: false });
      this.isHidden = true;
    } catch (error) {
      console.error('[Splash] Force hide error:', error);
    }
  }

  /**
   * Get elapsed time since splash started
   */
  getElapsedTime(): number {
    return Date.now() - this.splashStartTime;
  }

  /**
   * Check if splash is still visible
   */
  isVisible(): boolean {
    return !this.isHidden;
  }

  /**
   * Reset service state (for testing)
   */
  reset(): void {
    if (this.forceHideTimeout) {
      clearTimeout(this.forceHideTimeout);
      this.forceHideTimeout = null;
    }
    this.isHidden = false;
    this.splashStartTime = 0;
  }
}

export default SplashService;
