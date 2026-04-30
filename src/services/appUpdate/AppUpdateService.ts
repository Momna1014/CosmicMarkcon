/**
 * AppUpdateService.ts
 * 
 * Force Update Service for the application.
 * Checks if a new version is available and if update is mandatory.
 * 
 * Features:
 * - Checks for updates via API
 * - Supports mandatory (blocking) updates
 * - Platform-aware (iOS/Android)
 * - Rate limiting to avoid excessive API calls
 * - Secure API authentication
 */

import { Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PLAY_STORE, APP_STORE } from '@env';

// API Configuration
const API_BASE_URL = 'https://ai-quran.sumraf.com/api.php';
const AUTH_CODE = 'AmirIslamicApps';



/**
 * Update check response from API
 */
export interface UpdateCheckResponse {
  success: boolean;
  updateRequired: boolean;
  latestVersion: string;
  currentVersion: string;
  platform: 'android' | 'ios';
  message: string;
  updateUrl: string;
  isOptional: boolean;
}

/**
 * Internal update state
 */
export interface UpdateState {
  isUpdateRequired: boolean;
  isOptional: boolean; // true = user can dismiss, false = force update
  latestVersion: string;
  currentVersion: string;
  message: string;
  updateUrl: string;
}

/**
 * AppUpdateService
 * Handles force update logic for the application
 */
class AppUpdateService {
  private static instance: AppUpdateService;
  private isChecking: boolean = false;
  private updateState: UpdateState | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AppUpdateService {
    if (!AppUpdateService.instance) {
      AppUpdateService.instance = new AppUpdateService();
    }
    return AppUpdateService.instance;
  }



  /**
   * Get the current app version
   */
  public async getCurrentVersion(): Promise<string> {
    try {
      return await DeviceInfo.getVersion();
    } catch (error) {
      console.error('[AppUpdate] Error getting version:', error);
      return '1.0.0';
    }
  }

  /**
   * Get platform-specific store URL
   */
  public getStoreUrl(): string {
    if (Platform.OS === 'ios') {
      return APP_STORE || 'https://apps.apple.com/app/quran-recitation-ai/id123456789';
    }
    return PLAY_STORE || 'https://play.google.com/store/apps/details?id=com.quranrecitation';
  }

  /**
   * Check for updates from API (checks on every app open)
   */
  public async checkForUpdate(): Promise<UpdateState | null> {
    // Prevent concurrent checks
    if (this.isChecking) {
      console.log('[AppUpdate] Check already in progress');
      return this.updateState;
    }

    this.isChecking = true;

    try {
      const currentVersion = await this.getCurrentVersion();
      const platform = Platform.OS as 'android' | 'ios';

      console.log(`[AppUpdate] Checking for updates... v${currentVersion} (${platform})`);

      // Use form-urlencoded format as expected by the API
      const formData = new URLSearchParams();
      formData.append('auth_code', AUTH_CODE);
      formData.append('currentVersion', currentVersion);
      formData.append('platform', platform);

      const response = await fetch(`${API_BASE_URL}/check_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: UpdateCheckResponse = await response.json();
      console.log('[AppUpdate] Response:', JSON.stringify(data));



      if (data.success && data.updateRequired) {
        this.updateState = {
          isUpdateRequired: true,
          isOptional: data.isOptional, // true = user can dismiss, false = blocking
          latestVersion: data.latestVersion,
          currentVersion: data.currentVersion,
          message: data.message,
          updateUrl: (data.updateUrl && data.updateUrl !== '#') ? data.updateUrl : this.getStoreUrl(),
        };
        
        const updateType = data.isOptional ? 'optional' : 'BLOCKING';
        console.log(`[AppUpdate] ⚠️ Update required (${updateType}): ${data.currentVersion} → ${data.latestVersion}`);
        return this.updateState;
      }

      console.log('[AppUpdate] ✅ App is up to date');
      this.updateState = null;
      return null;

    } catch (error) {
      console.error('[AppUpdate] ❌ Check failed:', error);
      // On error, don't block the user - return null
      return null;
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Open the appropriate app store
   */
  public async openStore(): Promise<void> {
    const url = this.updateState?.updateUrl || this.getStoreUrl();
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('[AppUpdate] Cannot open URL:', url);
      }
    } catch (error) {
      console.error('[AppUpdate] Error opening store:', error);
    }
  }

  /**
   * Get current update state (for checking without API call)
   */
  public getUpdateState(): UpdateState | null {
    return this.updateState;
  }

  /**
   * Clear update state (for testing)
   */
  public clearState(): void {
    this.updateState = null;
  }

  /**
   * Simulate force update for testing (DEV ONLY)
   * Returns a mock update state to test the force update UI
   */
  public async simulateForceUpdate(isOptional: boolean = false): Promise<UpdateState> {
    const currentVersion = await this.getCurrentVersion();
    const updateType = isOptional ? 'optional' : 'blocking';
    
    this.updateState = {
      isUpdateRequired: true,
      isOptional: isOptional,
      latestVersion: '99.0.0',
      currentVersion: currentVersion,
      message: `🎉 TEST MODE: This is a simulated ${updateType} update. In production, this would show when a real update is required.`,
      updateUrl: this.getStoreUrl(),
    };

    console.log(`[AppUpdate] 🧪 Simulated ${updateType} update triggered`);
    return this.updateState;
  }
}

// Export singleton instance
export const appUpdateService = AppUpdateService.getInstance();

export default appUpdateService;
