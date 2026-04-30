// @feature:admob:start
/**
 * QaidaListNativeAd
 *
 * Native ad styled to match LessonCard in QaidaLearningScreen.
 * Uses the qaidaLearning gold accent color palette.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { NativeAd, NativeAsset, NativeAssetType } from 'react-native-google-mobile-ads';
import NativeAdComponent from './NativeAdComponent';
import { useTheme } from '../../theme/ThemeProvider';
import { AppTheme, fontScale, verticalScale, horizontalScale, scaleSize } from '../../theme';

const QaidaListNativeAd: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <NativeAdComponent
      renderAd={(ad: NativeAd) => (
        <View style={styles.container}>
          <View style={styles.cardInner}>
            {/* Icon */}
            {ad.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <Image
                  source={{ uri: ad.icon.url }}
                  style={styles.icon}
                  resizeMode="cover"
                />
              </NativeAsset>
            )}

            {/* Content */}
            <View style={styles.infoContainer}>
              <NativeAsset assetType={NativeAssetType.HEADLINE}>
                <Text style={styles.headline} numberOfLines={1}>
                  {ad.headline}
                </Text>
              </NativeAsset>

              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.body} numberOfLines={1}>
                  {ad.body}
                </Text>
              </NativeAsset>
            </View>

            {/* CTA */}
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{ad.callToAction}</Text>
              </View>
            </NativeAsset>

            {/* Ad badge */}
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Ad</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: verticalScale(10),
      marginHorizontal: horizontalScale(16),
    },
    cardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.dark
        ? theme.colors.qaidaLearning.cardBgDark
        : theme.colors.qaidaLearning.cardBg,
      borderRadius: scaleSize(16),
      paddingVertical: verticalScale(16),
      paddingHorizontal: horizontalScale(12),
      borderWidth: 1,
      borderColor: theme.dark
        ? theme.colors.qaidaLearning.cardBorderDark
        : theme.colors.qaidaLearning.cardBorder,
      minHeight: verticalScale(72),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: verticalScale(2) },
          shadowOpacity: 0.06,
          shadowRadius: verticalScale(6),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    icon: {
      width: scaleSize(48),
      height: scaleSize(48),
      borderRadius: scaleSize(12),
      marginRight: horizontalScale(12),
    },
    infoContainer: {
      flex: 1,
      paddingRight: horizontalScale(8),
      justifyContent: 'center',
    },
    headline: {
      fontSize: fontScale(17),
      fontFamily: theme.fonts.families.fredokaMedium,
      fontWeight: '500',
      color: theme.dark
        ? theme.colors.qaidaLearning.titleTextDark
        : theme.colors.qaidaLearning.titleText,
      marginBottom: verticalScale(2),
    },
    body: {
      fontSize: fontScale(13),
      fontFamily: theme.fonts.families.semibold_sf_pro,
      fontWeight: '600',
      color: theme.dark
        ? theme.colors.qaidaLearning.subtitleTextDark
        : theme.colors.qaidaLearning.subtitleText,
    },
    ctaButton: {
      backgroundColor: theme.colors.qaidaLearning.gold,
      paddingHorizontal: horizontalScale(14),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(16),
    },
    ctaText: {
      color: '#FFFFFF',
      fontSize: fontScale(12),
      fontWeight: '700',
    },
    adBadge: {
      position: 'absolute',
      top: verticalScale(4),
      left: horizontalScale(16),
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    adBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
    },
  });

export default QaidaListNativeAd;
// @feature:admob:end
