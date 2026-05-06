// @feature:admob:start [disabled]
// /**
//  * BannerAd Component
//  *
//  * Reusable banner ad using Google AdMob (react-native-google-mobile-ads).
//  * Automatically hides for premium users and when ads are disabled.
//  *
//  * Usage:
//  *   <BannerAdComponent visible={true} />
//  */
//
// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
// import { adMobService } from '../../services/AdMob/AdMobService';
//
// export { BannerAdSize };
//
// export interface BannerAdComponentProps {
//   size?: BannerAdSize;
//   visible?: boolean;
//   onAdLoaded?: () => void;
//   onAdFailedToLoad?: (error: any) => void;
// }
//
// export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
//   size = BannerAdSize.BANNER,
//   visible = true,
//   onAdLoaded,
//   onAdFailedToLoad,
// }) => {
//   const [isSDKReady, setIsSDKReady] = useState(false);
//   const [isAdLoaded, setIsAdLoaded] = useState(false);
//
//   useEffect(() => {
//     if (adMobService.getIsInitialized()) {
//       setIsSDKReady(true);
//     } else {
//       const checkInterval = setInterval(() => {
//         if (adMobService.getIsInitialized()) {
//           setIsSDKReady(true);
//           clearInterval(checkInterval);
//         }
//       }, 200);
//       return () => clearInterval(checkInterval);
//     }
//   }, []);
//
//   const unitId = adMobService.getBannerAdUnitId();
//
//   // Hide when premium, ads disabled, SDK not ready, not visible, or no ad unit configured
//   if (!visible || !isSDKReady || !adMobService.shouldShowAds() || !unitId) {
//     return null;
//   }
//
//   return (
//     <View style={styles.container}>
//       <BannerAd
//         unitId={unitId}
//         size={size}
//         requestOptions={{
//           requestNonPersonalizedAdsOnly: adMobService.getRequestNonPersonalizedAdsOnly(),
//         }}
//         onAdLoaded={() => {
//           console.log('[BannerAd] Ad loaded');
//           setIsAdLoaded(true);
//           onAdLoaded?.();
//         }}
//         onAdFailedToLoad={(error) => {
//           console.warn('[BannerAd] Failed to load:', error);
//           setIsAdLoaded(false);
//           onAdFailedToLoad?.(error);
//         }}
//       />
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
//
// export default BannerAdComponent;
// @feature:admob:end
