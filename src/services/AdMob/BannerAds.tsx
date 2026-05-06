// @feature:admob:start [disabled]
// /**
//  * AdMob Banner Component
//  *
//  * Reusable banner ad component using react-native-google-mobile-ads.
//  * Respects isPremium and adsEnabled flags — returns null when ads hidden.
//  *
//  * Usage:
//  *   <AdMobBannerComponent visible={true} />
//  */
//
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
// import { adMobService } from './AdMobService';
//
// export interface AdMobBannerProps {
//   size?: BannerAdSize;
//   visible?: boolean;
//   onAdLoaded?: () => void;
//   onAdFailedToLoad?: (error: any) => void;
// }
//
// const AdMobBannerComponent: React.FC<AdMobBannerProps> = ({
//   size = BannerAdSize.BANNER,
//   visible = true,
//   onAdLoaded,
//   onAdFailedToLoad,
// }) => {
//   const unitId = adMobService.getBannerAdUnitId();
//
//   if (!visible || !adMobService.shouldShowAds() || !unitId) {
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
//           console.log('[AdMob] Banner ad loaded');
//           onAdLoaded?.();
//         }}
//         onAdFailedToLoad={(error) => {
//           console.warn('[AdMob] Banner ad failed to load:', error);
//           onAdFailedToLoad?.(error);
//         }}
//       />
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     width:'100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
//
// export { BannerAdSize };
// export default AdMobBannerComponent;
// @feature:admob:end
