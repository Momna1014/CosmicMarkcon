import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import SaveIcon from '../../assets/icons/svgicons/HomeSvgIcons/save.svg';
import SavedIcon from '../../assets/icons/svgicons/MeSvgIcons/saved.svg';
import ImagePlaceholder from '../common/ImagePlaceholder';

export interface RisingStarItem {
  id: string;
  title: string;
  genre: string;
  image: ImageSourcePropType;
  isBookmarked?: boolean;
  rating?: number;
  coverImage?: string;
}

interface RisingStarCardProps {
  item: RisingStarItem;
  onPress?: (item: RisingStarItem) => void;
  onBookmarkPress?: (item: RisingStarItem) => void;
}

const RisingStarCard: React.FC<RisingStarCardProps> = memo(({
  item,
  onPress,
  onBookmarkPress,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const handleBookmarkPress = () => {
    onBookmarkPress?.(item);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Thumbnail Image */}
      <ImagePlaceholder
        source={
          typeof item.image === 'number'
            ? item.image
            : {
                uri: (item.image as any).uri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }
        }
        style={styles.thumbnail}
        resizeMode={FastImage.resizeMode.cover}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.genre}>{item.genre}</Text>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      </View>

      {/* Save Icon - shows different icon when bookmarked */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={handleBookmarkPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 , }}
      >
        {item.isBookmarked ? (
          <SavedIcon width={moderateScale(35)} height={moderateScale(35)} />
        ) : (
          <SaveIcon width={moderateScale(35)} height={moderateScale(35)} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

RisingStarCard.displayName = 'RisingStarCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  thumbnail: {
    width: moderateScale(75),
    height: moderateScale(75),
    // borderRadius: moderateScale(4),
  },
  content: {
    flex: 1,
    marginLeft: horizontalScale(16),
    justifyContent: 'center',
  },
  genre: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.inactive,
    marginBottom: verticalScale(4),
  },
  title: {
    fontFamily: FontFamilies.montserratSemiBold,
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.text,
    lineHeight:25
  },
  bookmarkButton: {
    // padding: horizontalScale(2),
  },
});

export default RisingStarCard;
