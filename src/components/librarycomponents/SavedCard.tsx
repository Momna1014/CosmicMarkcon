import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';
import StarIcon from '../../assets/icons/svgicons/HomeSvgIcons/star.svg';
import SaveIcon from '../../assets/icons/svgicons/MeSvgIcons/saved.svg';

export interface SavedItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
  rating: number;
}

interface SavedCardProps {
  item: SavedItem;
  onPress?: (item: SavedItem) => void;
  onSavePress?: (item: SavedItem) => void;
  showSaveIcon?: boolean;
}

const CARD_WIDTH = (Dimensions.get('window').width - horizontalScale(40)) / 2;
const CARD_HEIGHT = verticalScale(264.66);

const SavedCard: React.FC<SavedCardProps> = memo(({ 
  item, 
  onPress, 
  onSavePress,
  showSaveIcon = true,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const handleSavePress = () => {
    onSavePress?.(item);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
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
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Save Icon */}
        {showSaveIcon && (
          <TouchableOpacity
            style={styles.saveIconContainer}
            onPress={handleSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SaveIcon width={moderateScale(32)} height={moderateScale(32)} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title and Rating */}
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <View style={styles.ratingContainer}>
        <StarIcon width={14} height={14} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
});

SavedCard.displayName = 'SavedCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(25),
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    // borderRadius: BorderRadius.base,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saveIconContainer: {
    position: 'absolute',
    top: horizontalScale(0),
    right: horizontalScale(0),
    backgroundColor: 'rgba(255, 255, 255, 0.47)',
  },
  title: {
    fontFamily: FontFamilies.outfitSemiBold,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.text,
    marginTop: verticalScale(8),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(7),
  },
  ratingText: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.ratingText,
    marginLeft: horizontalScale(6),
    // lineHeight:16
  },
});

export default SavedCard;