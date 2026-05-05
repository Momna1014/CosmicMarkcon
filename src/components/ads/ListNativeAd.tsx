// @feature:admob:start [disabled]
// /**
//  * AyahListNativeAd
//  *
//  * Native ad styled to match AyahItem cards in SurahAyahsListScreen.
//  * Uses the qaidaLearning color palette with golden accents.
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
// import { fontScale, verticalScale, horizontalScale, moderateScale } from '../../theme';
//
// const AyahListNativeAd: React.FC = () => {
//   const theme = useTheme();
//
//   return (
//     <NativeAdComponent
//       renderAd={(ad: NativeAd) => (
//         <View style={styles.outerContainer}>
//           <View
//             style={[
//               styles.contentCard,
//               {
//                 borderRadius: theme.borderRadius.lg,
//                 backgroundColor: theme.dark
//                   ? theme.colors.qaidaLearning.cardBgDark
//                   : theme.colors.qaidaLearning.cardBg,
//                 borderWidth: 1.5,
//                 borderColor: theme.colors.qaidaLearning.gold + '30',
//                 ...Platform.select({
//                   ios: {
//                     shadowColor: theme.colors.qaidaLearning.gold,
//                     shadowOffset: { width: 0, height: 4 },
//                     shadowOpacity: 0.2,
//                     shadowRadius: 8,
//                   },
//                   android: {
//                     elevation: 0,
//                   },
//                 }),
//               },
//             ]}
//           >
//             {/* Icon */}
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
//             {/* Content */}
//             <View style={styles.textContainer}>
//               <NativeAsset assetType={NativeAssetType.HEADLINE}>
//                 <Text
//                   style={[
//                     styles.headline,
//                     {
//                       color: theme.dark
//                         ? theme.colors.qaidaLearning.arabicTextDark
//                         : theme.colors.qaidaLearning.arabicText,
//                     },
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
//                     {
//                       color: theme.dark
//                         ? theme.colors.qaidaLearning.arabicTextDark + 'AA'
//                         : theme.colors.qaidaLearning.arabicText + '88',
//                     },
//                   ]}
//                   numberOfLines={2}
//                 >
//                   {ad.body}
//                 </Text>
//               </NativeAsset>
//             </View>
//
//             {/* CTA */}
//             <View style={styles.ctaContainer}>
//               <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
//                 <View
//                   style={[
//                     styles.ctaButton,
//                     { backgroundColor: theme.colors.qaidaLearning.gold },
//                   ]}
//                 >
//                   <Text style={styles.ctaText}>{ad.callToAction}</Text>
//                 </View>
//               </NativeAsset>
//             </View>
//
//             {/* Ad badge top-left */}
//             <View style={styles.adBadge}>
//               <Text style={styles.adBadgeText}>Ad</Text>
//             </View>
//           </View>
//         </View>
//       )}
//     />
//   );
// };
//
// const styles = StyleSheet.create({
//   outerContainer: {
//     marginBottom: verticalScale(12),
//   },
//   contentCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: verticalScale(12),
//     paddingHorizontal: horizontalScale(14),
//   },
//   icon: {
//     width: moderateScale(44),
//     height: moderateScale(44),
//     borderRadius: moderateScale(10),
//     marginRight: horizontalScale(12),
//   },
//   textContainer: {
//     flex: 1,
//   },
//   headline: {
//     fontSize: fontScale(16),
//     fontWeight: '600',
//     marginBottom: verticalScale(2),
//   },
//   body: {
//     fontSize: fontScale(12),
//     lineHeight: fontScale(16),
//   },
//   ctaContainer: {
//     marginLeft: horizontalScale(8),
//   },
//   ctaButton: {
//     paddingHorizontal: horizontalScale(12),
//     paddingVertical: verticalScale(6),
//     borderRadius: moderateScale(14),
//   },
//   ctaText: {
//     color: '#FFFFFF',
//     fontSize: fontScale(11),
//     fontWeight: '700',
//   },
//   adBadge: {
//     position: 'absolute',
//     top: verticalScale(4),
//     left: horizontalScale(18),
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
// export default AyahListNativeAd;
// @feature:admob:end
