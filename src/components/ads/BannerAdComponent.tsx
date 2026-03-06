import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AdView, AdFormat } from 'react-native-applovin-max';
import type { AdInfo, AdLoadFailedInfo } from 'react-native-applovin-max';
import { appLovinService, BannerAdSize } from '../../services/AppLovinService';

export interface BannerAdComponentProps {
  /**
   * Size of the banner ad
   * Default: BANNER (320x50)
   */
  size?: BannerAdSize;

  /**
   * Ad unit ID (optional, uses service config if not provided)
   */
  adUnitId?: string;

  /**
   * Whether to show the ad
   * Default: true
   */
  visible?: boolean;

  /**
   * Whether to enable adaptive banner
   * Default: false
   */
  adaptiveBanner?: boolean;

  /**
   * Whether to auto-refresh the ad
   * Default: true
   */
  autoRefresh?: boolean;

  /**
   * Callback when ad loads successfully
   */
  onAdLoaded?: () => void;

  /**
   * Callback when ad fails to load
   */
  onAdFailedToLoad?: (error: any) => void;

  /**
   * Callback when ad is clicked
   */
  onAdClicked?: () => void;

  /**
   * Callback when ad is expanded
   */
  onAdExpanded?: () => void;

  /**
   * Callback when ad is collapsed
   */
  onAdCollapsed?: () => void;
}

/**
 * BannerAd Component
 * 
 * A reusable banner ad component that can be placed anywhere in the app.
 * Automatically handles loading, error states, and respects visibility prop.
 * 
 * Usage:
 * ```tsx
 * <BannerAdComponent 
 *   size={BannerAdSize.MREC}
 *   visible={true}
 *   onAdLoaded={() => console.log('Ad loaded')}
 * />
 * ```
 */
export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  size = BannerAdSize.BANNER,
  adUnitId,
  visible = true,
  adaptiveBanner = false,
  autoRefresh = true,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked,
  onAdExpanded,
  onAdCollapsed,
}) => {
  // Wait for AppLovin SDK to initialize
  const [isSDKReady, setIsSDKReady] = useState(false);

  useEffect(() => {
    // Check if SDK is already initialized
    if (appLovinService.getIsInitialized()) {
      setIsSDKReady(true);
    } else {
      // Poll for initialization (SDK initializes with 1500ms delay)
      const checkInterval = setInterval(() => {
        if (appLovinService.getIsInitialized()) {
          setIsSDKReady(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Use provided adUnitId or get from service
  const unitId = adUnitId || appLovinService.getBannerAdUnitId();

  if (!visible || !isSDKReady) {
    return null;
  }

  // Map our BannerAdSize enum to AppLovin's AdFormat
  const adFormat = size === BannerAdSize.MREC ? AdFormat.MREC : AdFormat.BANNER;

  return (
    <View style={styles.container}>
      <AdView
        adUnitId={unitId}
        adFormat={adFormat}
        adaptiveBannerEnabled={adaptiveBanner}
        autoRefresh={autoRefresh}
        onAdLoaded={(adInfo: AdInfo) => {
          console.log('[BannerAd] Ad loaded successfully', adInfo);
          onAdLoaded?.();
        }}
        onAdLoadFailed={(errorInfo: AdLoadFailedInfo) => {
          console.error('[BannerAd] Ad failed to load:', errorInfo);
          onAdFailedToLoad?.(errorInfo);
        }}
        onAdClicked={(adInfo: AdInfo) => {
          console.log('[BannerAd] Ad clicked', adInfo);
          onAdClicked?.();
        }}
        onAdExpanded={(adInfo: AdInfo) => {
          console.log('[BannerAd] Ad expanded', adInfo);
          onAdExpanded?.();
        }}
        onAdCollapsed={(adInfo: AdInfo) => {
          console.log('[BannerAd] Ad collapsed', adInfo);
          onAdCollapsed?.();
        }}
        onAdRevenuePaid={(adInfo: AdInfo) => {
          console.log('[BannerAd] Revenue paid', adInfo);
        }}
        style={styles.ad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ad: {
    width: '100%',
  },
});

export default BannerAdComponent;
