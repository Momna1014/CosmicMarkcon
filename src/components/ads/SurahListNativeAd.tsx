// @feature:admob:start [disabled]
// /**
//  * SurahListNativeAd
//  *
//  * Native ad styled to match SurahProgressCard in QuranLearningScreen.
//  * Uses the learningProgress color palette and similar card layout.
//  */
//
// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   Image,
// } from 'react-native';
// import { NativeAd, NativeAsset, NativeAssetType } from 'react-native-google-mobile-ads';
// import NativeAdComponent from './NativeAdComponent';
// import { useTheme } from '../../theme/ThemeProvider';
// import { fontScale, verticalScale, horizontalScale, Colors } from '../../theme';
//
// const SurahListNativeAd: React.FC = () => {
//   const theme = useTheme();
//   const progressColors = Colors.learningProgress;
//
//   return (
//     <NativeAdComponent
//       renderAd={(ad: NativeAd) => (
//         <View
//           style={[
//             styles.container,
//             {
//               backgroundColor: theme.dark
//                 ? progressColors.cardBgDark
//                 : progressColors.cardBgLight,
//               borderRadius: theme.borderRadius.xl,
//               ...Platform.select({
//                 ios: {
//                   shadowColor: Colors.black,
//                   shadowOffset: { width: 0, height: verticalScale(2) },
//                   shadowOpacity: 0.08,
//                   shadowRadius: verticalScale(8),
//                 },
//                 android: {
//                   borderWidth: 1,
//                   borderColor: theme.dark ? '#3D3D3D' : '#E8E8E8',
//                 },
//               }),
//             },
//           ]}
//         >
//           {/* Icon */}
//           {ad.icon && (
//             <NativeAsset assetType={NativeAssetType.ICON}>
//               <Image
//                 source={{ uri: ad.icon.url }}
//                 style={styles.icon}
//                 resizeMode="cover"
//               />
//             </NativeAsset>
//           )}
//
//           {/* Content */}
//           <View style={styles.infoContainer}>
//             <NativeAsset assetType={NativeAssetType.HEADLINE}>
//               <Text
//                 style={[
//                   styles.headline,
//                   {
//                     color: theme.dark
//                       ? progressColors.titleDark
//                       : progressColors.titleLight,
//                     fontFamily: theme.fonts.families.fredokaMedium,
//                   },
//                 ]}
//                 numberOfLines={1}
//               >
//                 {ad.headline}
//               </Text>
//             </NativeAsset>
//
//             <View style={styles.subInfoRow}>
//               <NativeAsset assetType={NativeAssetType.BODY}>
//                 <Text
//                   style={[
//                     styles.body,
//                     {
//                       color: theme.dark
//                         ? progressColors.subtitleDark
//                         : progressColors.subtitleLight,
//                       fontFamily: theme.fonts.families.semibold_sf_pro,
//                     },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {ad.body}
//                 </Text>
//               </NativeAsset>
//             </View>
//           </View>
//
//           {/* CTA */}
//           <View style={styles.ctaContainer}>
//             <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
//               <View style={styles.ctaButton}>
//                 <Text style={styles.ctaText}>{ad.callToAction}</Text>
//               </View>
//             </NativeAsset>
//           </View>
//
//           {/* Ad badge */}
//           <View style={styles.adBadge}>
//             <Text style={styles.adBadgeText}>Ad</Text>
//           </View>
//         </View>
//       )}
//     />
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: horizontalScale(16),
//     paddingVertical: verticalScale(12),
//     marginHorizontal: horizontalScale(16),
//     marginBottom: verticalScale(12),
//   },
//   icon: {
//     width: verticalScale(48),
//     height: verticalScale(48),
//     borderRadius: verticalScale(12),
//   },
//   infoContainer: {
//     flex: 1,
//     marginLeft: horizontalScale(14),
//     justifyContent: 'center',
//   },
//   headline: {
//     fontSize: fontScale(17),
//     fontWeight: '500',
//     marginBottom: verticalScale(2),
//   },
//   subInfoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   body: {
//     fontSize: fontScale(13),
//     fontWeight: '600',
//   },
//   ctaContainer: {
//     paddingLeft: horizontalScale(8),
//     justifyContent: 'center',
//   },
//   ctaButton: {
//     backgroundColor: '#C44FD1',
//     paddingHorizontal: horizontalScale(14),
//     paddingVertical: verticalScale(6),
//     borderRadius: verticalScale(16),
//   },
//   ctaText: {
//     color: '#FFFFFF',
//     fontSize: fontScale(12),
//     fontWeight: '700',
//   },
//   adBadge: {
//     position: 'absolute',
//     top: verticalScale(4),
//     left: horizontalScale(20),
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 4,
//     paddingHorizontal: 5,
//     paddingVertical: 1,
//   },
//   adBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 9,
//     fontWeight: '700',
//   },
// });
//
// export default SurahListNativeAd;
// @feature:admob:end
