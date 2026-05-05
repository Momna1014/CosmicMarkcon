// @feature:admob:start [disabled]
// /**
//  * DetailNativeAd
//  *
//  * Compact native ad for the SurahAyahsDetail screen.
//  * Rendered below the AyahLessonCard inside the ScrollView.
//  * Uses the Duolingo-style color palette of that screen.
//  */
//
// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
// } from 'react-native';
// import { NativeAd, NativeAsset, NativeAssetType } from 'react-native-google-mobile-ads';
// import NativeAdComponent from './NativeAdComponent';
// import { useTheme } from '../../theme/ThemeProvider';
// import { fontScale, verticalScale, horizontalScale, moderateScale } from '../../theme';
//
// const DetailNativeAd: React.FC = () => {
//   const theme = useTheme();
//
//   return (
//     <NativeAdComponent
//       renderAd={(ad: NativeAd) => (
//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: theme.dark ? '#1E293B' : '#FFFFFF',
//               borderColor: theme.dark ? '#334155' : '#E2E8F0',
//             },
//           ]}
//         >
//           {/* Top row: icon + headline + CTA */}
//           <View style={styles.topRow}>
//             {ad.icon && (
//               <NativeAsset assetType={NativeAssetType.ICON}>
//                 <Image
//                   source={{ uri: ad.icon.url }}
//                   style={styles.icon}
//                   resizeMode="cover"
//                 />
//               </NativeAsset>
//             )}
//
//             <View style={styles.textContainer}>
//               <NativeAsset assetType={NativeAssetType.HEADLINE}>
//                 <Text
//                   style={[
//                     styles.headline,
//                     { color: theme.dark ? '#F1F5F9' : '#1F2937' },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {ad.headline}
//                 </Text>
//               </NativeAsset>
//
//               <NativeAsset assetType={NativeAssetType.BODY}>
//                 <Text
//                   style={[
//                     styles.body,
//                     { color: theme.dark ? '#94A3B8' : '#6B7280' },
//                   ]}
//                   numberOfLines={2}
//                 >
//                   {ad.body}
//                 </Text>
//               </NativeAsset>
//             </View>
//
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
//   card: {
//     marginHorizontal: horizontalScale(16),
//     marginTop: verticalScale(12),
//     marginBottom: verticalScale(4),
//     borderRadius: moderateScale(16),
//     borderWidth: 1,
//     paddingHorizontal: horizontalScale(14),
//     paddingVertical: verticalScale(12),
//   },
//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   icon: {
//     width: moderateScale(40),
//     height: moderateScale(40),
//     borderRadius: moderateScale(10),
//     marginRight: horizontalScale(10),
//   },
//   textContainer: {
//     flex: 1,
//   },
//   headline: {
//     fontSize: fontScale(14),
//     fontWeight: '700',
//     marginBottom: verticalScale(2),
//   },
//   body: {
//     fontSize: fontScale(12),
//     lineHeight: fontScale(16),
//   },
//   ctaButton: {
//     backgroundColor: '#58CC02',
//     paddingHorizontal: horizontalScale(14),
//     paddingVertical: verticalScale(7),
//     borderRadius: moderateScale(14),
//     marginLeft: horizontalScale(8),
//   },
//   ctaText: {
//     color: '#FFFFFF',
//     fontSize: fontScale(12),
//     fontWeight: '700',
//   },
//   adBadge: {
//     position: 'absolute',
//     top: verticalScale(4),
//     left: horizontalScale(18),
//     backgroundColor: 'rgba(0,0,0,0.25)',
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
// export default DetailNativeAd;
// @feature:admob:end
