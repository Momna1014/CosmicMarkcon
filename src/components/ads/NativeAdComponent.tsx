// @feature:admob:start [disabled]
// /**
//  * NativeAdComponent
//  *
//  * Reusable wrapper that loads a Google AdMob native ad and renders it
//  * using a caller-provided render function for full design flexibility.
//  *
//  * Usage:
//  *   <NativeAdComponent renderAd={(ad) => <MyCustomCard ad={ad} />} />
//  */
//
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { View, StyleSheet } from 'react-native';
// import {
//   NativeAd,
//   NativeAdView,
//   NativeAdEventType,
// } from 'react-native-google-mobile-ads';
// import { adMobService } from '../../services/AdMob/AdMobService';
//
// export interface NativeAdComponentProps {
//   /** Custom render function to display the native ad content */
//   renderAd: (ad: NativeAd) => React.ReactNode;
//   /** Called when the ad is loaded */
//   onAdLoaded?: () => void;
//   /** Called when the ad fails to load */
//   onAdFailedToLoad?: (error: any) => void;
// }
//
// const NativeAdComponent: React.FC<NativeAdComponentProps> = ({
//   renderAd,
//   onAdLoaded,
//   onAdFailedToLoad,
// }) => {
//   const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
//   const adRef = useRef<NativeAd | null>(null);
//
//   const loadAd = useCallback(async () => {
//     const unitId = adMobService.getNativeAdUnitId();
//     if (!unitId || !adMobService.shouldShowAds()) return;
//
//     try {
//       const ad = await NativeAd.createForAdRequest(unitId, {
//         requestNonPersonalizedAdsOnly: adMobService.getRequestNonPersonalizedAdsOnly(),
//       });
//
//       // Destroy previous ad if it exists
//       if (adRef.current) {
//         adRef.current.destroy();
//       }
//
//       adRef.current = ad;
//       setNativeAd(ad);
//       console.log('[NativeAd] Ad loaded successfully');
//       onAdLoaded?.();
//     } catch (error) {
//       console.warn('[NativeAd] Failed to load:', error);
//       onAdFailedToLoad?.(error);
//     }
//   }, [onAdLoaded, onAdFailedToLoad]);
//
//   useEffect(() => {
//     loadAd();
//
//     return () => {
//       if (adRef.current) {
//         adRef.current.destroy();
//         adRef.current = null;
//       }
//     };
//   }, [loadAd]);
//
//   if (!nativeAd || !adMobService.shouldShowAds()) {
//     return null;
//   }
//
//   return (
//     <NativeAdView nativeAd={nativeAd} style={styles.container}>
//       {renderAd(nativeAd)}
//     </NativeAdView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//   },
// });
//
// export default NativeAdComponent;
// @feature:admob:end
