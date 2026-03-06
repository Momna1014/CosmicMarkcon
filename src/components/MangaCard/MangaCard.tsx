import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  Platform,
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
import ImagePlaceholder from '../common/ImagePlaceholder';

// Card size constants
const CARD_SIZES = {
  trending: {
    width: moderateScale(140),
    height: moderateScale(192),
  },
  recommended: {
    width: moderateScale(120),
    height: moderateScale(168),
  },
};

interface MangaCardProps {
  image: ImageSourcePropType;
  title?: string;
  rating?: number;
  index?: number;
  showNumbering?: boolean;
  showRating?: boolean;
  onPress?: () => void;
  variant?: 'trending' | 'recommended';
}

const MangaCard: React.FC<MangaCardProps> = memo(({
  image,
  title,
  rating,
  index,
  showNumbering = false,
  showRating = false,
  onPress,
  variant = 'recommended',
}) => {
  // Get card dimensions based on variant
  const { width, height } = CARD_SIZES[variant];

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.cardWrapper, { width, height }]}>
        {/* Number Overlay - positioned above image */}
        {showNumbering && index !== undefined && (
          <View style={styles.numberContainer} pointerEvents="none">
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
        )}
        <View style={[styles.imageContainer, { width, height }]}>
          <ImagePlaceholder
            source={
              typeof image === 'number'
                ? image
                : {
                    uri: (image as any).uri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }
            }
            style={[styles.image, { width, height }]}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </View>

      {/* Title and Rating Section - only show if showRating is true */}
      {showRating && (
        <View style={styles.infoContainer}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <StarIcon width={moderateScale(12)} height={moderateScale(12)} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

MangaCard.displayName = 'MangaCard';

const styles = StyleSheet.create({
  container: {
    marginRight: horizontalScale(12),
    // backgroundColor:"red"

  },
  cardWrapper: {
    position: 'relative',
    // backgroundColor:"red"
  },
  imageContainer: {
    overflow: 'hidden',
    // borderRadius: moderateScale(8),
  },
  image: {
    // No border radius as per design
  },
  numberContainer: {
    position: 'absolute',
    top:Platform.OS === 'ios' ? verticalScale(-17) :verticalScale(-10),
    left: horizontalScale(-4),
    zIndex: 10,
    elevation: 10,
  },
  numberText: {
    fontFamily: FontFamilies.poppinsExtraBold,
    fontSize: moderateScale(55),
    fontWeight: '900',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.54)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    // Add stroke effect using multiple shadows
    includeFontPadding: false,
  },
  infoContainer: {
    marginTop: verticalScale(8),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.text,
    lineHeight: moderateScale(16),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  ratingText: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(12),
    fontWeight: '400',
    color: Colors.ratingText,
    marginLeft: horizontalScale(4),
  },
});

export default MangaCard;
