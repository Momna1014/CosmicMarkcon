import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import StarIcon from '../../assets/icons/svgicons/HomeSvgIcons/star.svg';

// Import the logo for placeholder
const logoPlaceholder = require('../../assets/icons/png/logo.png');

// Banner dimensions - responsive with horizontal padding
const HORIZONTAL_PADDING = horizontalScale(16);
const BANNER_HEIGHT = verticalScale(300);
// const BANNER_RADIUS = BorderRadius.md;

export interface FeaturedItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
  rating: number;
  genres: string[];
}

interface FeaturedBannerProps {
  item: FeaturedItem;
  onPress?: (item: FeaturedItem) => void;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = memo(({ item, onPress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { width: windowWidth } = useWindowDimensions();
  
  // Calculate banner width dynamically for iPad landscape support
  const bannerWidth = windowWidth - (HORIZONTAL_PADDING * 2);

  const handlePress = () => {
    onPress?.(item);
  };

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.container, { width: bannerWidth }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Placeholder - shows while loading */}
        {isLoading && (
          <View style={styles.placeholder}>
            <FastImage
              source={logoPlaceholder}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}
        
        {/* Background Image */}
        <FastImage
          source={
            typeof item.image === 'number'
              ? item.image
              : {
                  uri: (item.image as any).uri,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }
          }
          style={[styles.backgroundImage, isLoading && styles.hiddenImage]}
          resizeMode={FastImage.resizeMode.cover}
          onLoadEnd={handleLoadEnd}
        />

        {/* Top Section - Title and Genre Tags */}
        <View style={styles.topSection}>
          {/* Spacer to push genre to the end */}
          <View style={styles.spacer} />
          {/* Show only first genre at the end */}
          {item.genres.length > 0 && (
            <View style={styles.genreTag}>
              <Text style={styles.genreText}>{item.genres[0]}</Text>
            </View>
          )}
        </View>

        {/* Bottom Section - Featured Badge, Rating, and Title */}
        <View style={styles.bottomSection}>
          <View style={styles.badgeRow}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
            <View style={styles.ratingContainer}>
              <StarIcon width={16} height={16} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

FeaturedBanner.displayName = 'FeaturedBanner';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: verticalScale(24),
  },
  container: {
    height: BANNER_HEIGHT,
    // borderRadius: BANNER_RADIUS,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  logo: {
    width: '25%',
    height: '25%',
    opacity: 0.5,
  },
  hiddenImage: {
    opacity: 0,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(8),
    paddingTop: verticalScale(16),
  },
  spacer: {
    flex: 1,
  },
  topTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
    flex: 1,
  },
  genreTag: {
    backgroundColor: 'rgba(73, 66, 66, 0.89)',
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(7),
    // borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: '#E5E6EC',
  },
  genreText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.white,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(16),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  featuredBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    // borderRadius: BorderRadius.sm,
  },
  featuredText: {
    fontFamily: FontFamilies.outfitSemiBold,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: horizontalScale(12),
  },
  ratingText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: Colors.white,
    marginLeft: horizontalScale(6),
  },
  mainTitle: {
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
});

export default FeaturedBanner;
