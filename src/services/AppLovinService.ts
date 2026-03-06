import { Platform } from 'react-native';
import AppLovinMAX, { InterstitialAd, RewardedAd } from 'react-native-applovin-max';
import env from '../config/env';

/**
 * AppLovin MAX Service
 * Provides a unified interface for displaying banner, interstitial, and rewarded ads
 * 
 * Features:
 * - Banner ads with auto-refresh
 * - Interstitial ads for content transitions
 * - Rewarded ads for user rewards
 * - Test ad units for development
 * - Production ad units configuration
 */

export interface AppLovinConfig {
  // SDK Key (required)
  sdkKey?: string;
  
  // Production ad unit IDs
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  rewardedAdUnitId?: string;
  
  // Privacy settings
  hasUserConsent?: boolean;
  isAgeRestrictedUser?: boolean;
  doNotSell?: boolean;
  
  // Test mode
  testMode?: boolean;
  verboseLogging?: boolean;
}

/**
 * Banner Ad Sizes for AppLovin
 */
export enum BannerAdSize {
  BANNER = 'BANNER', // 320x50
  LEADER = 'LEADER', // 728x90
  MREC = 'MREC', // 300x250
}

class AppLovinService {
  private isInitialized = false;
  private config: AppLovinConfig = {};
  
  // Ad loading states
  private isInterstitialLoaded = false;
  private isRewardedLoaded = false;
  
  // Reward callback storage
  private rewardCallback?: (reward: { label: string; amount: number }) => void;

  /**
   * Initialize AppLovin MAX SDK
   */
  async initialize(config: AppLovinConfig = {}): Promise<void> {
    if (this.isInitialized) {
      console.log('[AppLovin] Already initialized');
      return;
    }

    try {
      this.config = config;

      // Get SDK Key from environment or config
      const sdkKey = config.sdkKey || env.APPLOVIN_SDK_KEY;

      if (!sdkKey || sdkKey === 'YOUR_SDK_KEY_HERE') {
        console.warn('[AppLovin] No SDK key found. Please add APPLOVIN_SDK_KEY to your .env file.');
        throw new Error('AppLovin SDK key is required');
      }

      // Set verbose logging if enabled
      if (config.verboseLogging !== false) {
        AppLovinMAX.setVerboseLogging(true);
      }

      // Set test mode if enabled
      if (config.testMode || __DEV__) {
        AppLovinMAX.setTestDeviceAdvertisingIds(['YOUR_TEST_DEVICE_ID']);
      }

      // Initialize SDK
      await AppLovinMAX.initialize(sdkKey);
      console.log('[AppLovin] SDK initialized successfully');

      // Configure privacy settings using Privacy module
      // Note: These should be set based on user consent
      // if (config.hasUserConsent !== undefined) {
      //   await Privacy.setHasUserConsent(config.hasUserConsent);
      // }
      
      // if (config.isAgeRestrictedUser !== undefined) {
      //   await Privacy.setIsAgeRestrictedUser(config.isAgeRestrictedUser);
      // }
      
      // if (config.doNotSell !== undefined) {
      //   await Privacy.setDoNotSell(config.doNotSell);
      // }

      this.isInitialized = true;

      // Set up interstitial ad listeners
      this.setupInterstitialListeners();

      // Set up rewarded ad listeners
      this.setupRewardedListeners();

      // Pre-load ads
      this.preloadAds();

      console.log('[AppLovin] Initialized successfully');
    } catch (error) {
      console.error('[AppLovin] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get banner ad unit ID
   */
  getBannerAdUnitId(): string {
    // Use config first, then env vars, then fallback to empty (will show test ads)
    return this.config.bannerAdUnitId || 
      (Platform.OS === 'ios' ? env.APPLOVIN_BANNER_AD_UNIT_IOS : env.APPLOVIN_BANNER_AD_UNIT_ANDROID) ||
      ''; // Empty string will use AppLovin test ads in dev mode
  }

  /**
   * Get interstitial ad unit ID
   */
  getInterstitialAdUnitId(): string {
    // Use config first, then env vars, then fallback to empty (will show test ads)
    return this.config.interstitialAdUnitId || 
      (Platform.OS === 'ios' ? env.APPLOVIN_INTERSTITIAL_AD_UNIT_IOS : env.APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID) ||
      ''; // Empty string will use AppLovin test ads in dev mode
  }

  /**
   * Get rewarded ad unit ID
   */
  getRewardedAdUnitId(): string {
    // Use config first, then env vars, then fallback to empty (will show test ads)
    return this.config.rewardedAdUnitId || 
      (Platform.OS === 'ios' ? env.APPLOVIN_REWARDED_AD_UNIT_IOS : env.APPLOVIN_REWARDED_AD_UNIT_ANDROID) ||
      ''; // Empty string will use AppLovin test ads in dev mode
  }

  /**
   * Get app open ad unit ID
   */
  getAppOpenAdUnitId(): string {
    // Use env vars, then fallback to empty (will show test ads)
    return (Platform.OS === 'ios' ? env.APPLOVIN_APP_OPEN_AD_UNIT_IOS : env.APPLOVIN_APP_OPEN_AD_UNIT_ANDROID) ||
      ''; // Empty string will use AppLovin test ads in dev mode
  }

  /**
   * Setup interstitial ad listeners
   */
  private setupInterstitialListeners(): void {
    InterstitialAd.addAdLoadedEventListener((adInfo: any) => {
      console.log('[AppLovin] Interstitial ad loaded', adInfo);
    });

    InterstitialAd.addAdLoadFailedEventListener((errorInfo: any) => {
      console.error('[AppLovin] Interstitial ad failed to load', errorInfo);
      // Retry loading after 3 seconds
      setTimeout(() => this.loadInterstitialAd(), 3000);
    });

    InterstitialAd.addAdClickedEventListener((adInfo: any) => {
      console.log('[AppLovin] Interstitial ad clicked', adInfo);
    });

    InterstitialAd.addAdDisplayedEventListener((adInfo: any) => {
      console.log('[AppLovin] Interstitial ad displayed', adInfo);
    });

    InterstitialAd.addAdFailedToDisplayEventListener((errorInfo: any) => {
      console.error('[AppLovin] Interstitial ad failed to display', errorInfo);
      this.loadInterstitialAd();
    });

    InterstitialAd.addAdHiddenEventListener((adInfo: any) => {
      console.log('[AppLovin] Interstitial ad hidden', adInfo);
      // Load next ad
      this.loadInterstitialAd();
    });
  }

  /**
   * Setup rewarded ad listeners
   */
  private setupRewardedListeners(): void {
    RewardedAd.addAdLoadedEventListener((adInfo: any) => {
      console.log('[AppLovin] Rewarded ad loaded', adInfo);
    });

    RewardedAd.addAdLoadFailedEventListener((errorInfo: any) => {
      console.error('[AppLovin] Rewarded ad failed to load', errorInfo);
      // Retry loading after 3 seconds
      setTimeout(() => this.loadRewardedAd(), 3000);
    });

    RewardedAd.addAdClickedEventListener((adInfo: any) => {
      console.log('[AppLovin] Rewarded ad clicked', adInfo);
    });

    RewardedAd.addAdDisplayedEventListener((adInfo: any) => {
      console.log('[AppLovin] Rewarded ad displayed', adInfo);
    });

    RewardedAd.addAdFailedToDisplayEventListener((errorInfo: any) => {
      console.error('[AppLovin] Rewarded ad failed to display', errorInfo);
      this.loadRewardedAd();
    });

    RewardedAd.addAdHiddenEventListener((adInfo: any) => {
      console.log('[AppLovin] Rewarded ad hidden', adInfo);
      // Load next ad
      this.loadRewardedAd();
    });

    RewardedAd.addAdReceivedRewardEventListener((adInfo: any) => {
      console.log('[AppLovin] User earned reward', adInfo);
      if (this.rewardCallback) {
        this.rewardCallback({
          label: adInfo.reward?.label || 'reward',
          amount: adInfo.reward?.amount || 1,
        });
        this.rewardCallback = undefined;
      }
    });
  }

  /**
   * Load interstitial ad
   */
  private loadInterstitialAd(): void {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      const adUnitId = this.getInterstitialAdUnitId();
      InterstitialAd.loadAd(adUnitId);
      console.log('[AppLovin] Loading interstitial ad...');
    } catch (error) {
      console.error('[AppLovin] Error loading interstitial ad:', error);
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return false;
    }

    try {
      const adUnitId = this.getInterstitialAdUnitId();
      const isReady = await InterstitialAd.isAdReady(adUnitId);

      if (!isReady) {
        console.warn('[AppLovin] Interstitial ad not ready yet');
        this.loadInterstitialAd();
        return false;
      }

      InterstitialAd.showAd(adUnitId);
      return true;
    } catch (error) {
      console.error('[AppLovin] Error showing interstitial ad:', error);
      return false;
    }
  }

  /**
   * Check if interstitial ad is loaded
   */
  async isInterstitialAdLoaded(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const adUnitId = this.getInterstitialAdUnitId();
      return await InterstitialAd.isAdReady(adUnitId);
    } catch (error) {
      console.error('[AppLovin] Error checking interstitial ad status:', error);
      return false;
    }
  }

  /**
   * Load rewarded ad
   */
  private loadRewardedAd(): void {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      const adUnitId = this.getRewardedAdUnitId();
      RewardedAd.loadAd(adUnitId);
      console.log('[AppLovin] Loading rewarded ad...');
    } catch (error) {
      console.error('[AppLovin] Error loading rewarded ad:', error);
    }
  }

  /**
   * Show rewarded ad
   */
  async showRewardedAd(
    onReward?: (reward: { label: string; amount: number }) => void
  ): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return false;
    }

    try {
      const adUnitId = this.getRewardedAdUnitId();
      const isReady = await RewardedAd.isAdReady(adUnitId);

      if (!isReady) {
        console.warn('[AppLovin] Rewarded ad not ready yet');
        this.loadRewardedAd();
        return false;
      }

      // Store callback for when reward is received
      if (onReward) {
        this.rewardCallback = onReward;
      }

      RewardedAd.showAd(adUnitId);
      return true;
    } catch (error) {
      console.error('[AppLovin] Error showing rewarded ad:', error);
      return false;
    }
  }

  /**
   * Check if rewarded ad is loaded
   */
  async isRewardedAdLoaded(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const adUnitId = this.getRewardedAdUnitId();
      return await RewardedAd.isAdReady(adUnitId);
    } catch (error) {
      console.error('[AppLovin] Error checking rewarded ad status:', error);
      return false;
    }
  }

  /**
   * Preload ads (call this after initialization or when you want to refresh ads)
   */
  preloadAds(): void {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return;
    }

    console.log('[AppLovin] Preloading ads...');
    this.loadInterstitialAd();
    this.loadRewardedAd();
  }

  /**
   * Show mediation debugger (for debugging)
   */
  async showMediationDebugger(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[AppLovin] SDK not initialized. Call initialize() first.');
      return;
    }

    try {
      await AppLovinMAX.showMediationDebugger();
      console.log('[AppLovin] Mediation Debugger opened');
    } catch (error) {
      console.error('[AppLovin] Error opening Mediation Debugger:', error);
    }
  }

  /**
   * Get SDK configuration
   */
  getSdkConfiguration(): any {
    try {
      // Note: AppLovin SDK doesn't expose getConfiguration in React Native
      // Return basic config info instead
      return {
        isInitialized: this.isInitialized,
        sdkKey: this.config.sdkKey,
      };
    } catch (error) {
      console.error('[AppLovin] Error getting SDK configuration:', error);
      return null;
    }
  }

  /**
   * Check if SDK is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string): void {
    try {
      AppLovinMAX.setUserId(userId);
      console.log('[AppLovin] User ID set:', userId);
    } catch (error) {
      console.error('[AppLovin] Error setting user ID:', error);
    }
  }

  /**
   * Set muted state for ads
   */
  setMuted(muted: boolean): void {
    try {
      AppLovinMAX.setMuted(muted);
      console.log('[AppLovin] Muted state set:', muted);
    } catch (error) {
      console.error('[AppLovin] Error setting muted state:', error);
    }
  }
}

// Export singleton instance
export const appLovinService = new AppLovinService();
