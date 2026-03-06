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
import LinearGradient from 'react-native-linear-gradient';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';
import StarIcon from '../../assets/icons/svgicons/HomeSvgIcons/star.svg';

export interface ReadingItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
  rating: number;
  progress: number; // 0-100
  // Optional season/episode info for display
  seasonNumber?: number;
  episodeNumber?: number;
}

interface ReadingCardProps {
  item: ReadingItem;
  onPress?: (item: ReadingItem) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - horizontalScale(40)) / 2;
const CARD_HEIGHT = verticalScale(264.66);

const ReadingCard: React.FC<ReadingCardProps> = memo(({ item, onPress }) => {
  const handlePress = () => {
    onPress?.(item);
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
        
        {/* Progress Bar at Top */}
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={['#FF3E57', '#FF8E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${item.progress}%` }]}
          />
        </View>

        {/* Shadow Overlay - covers entire image */}
        <View style={styles.shadowOverlay} />

        {/* Percentage Text - centered */}
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{item.progress}%</Text>
        </View>
      </View>

      {/* Title and Rating */}
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      
      {/* Season/Episode Info - shown if available */}
      {(item.seasonNumber || item.episodeNumber) && (
        <Text style={styles.chapterEpisodeText}>
          Ch.{item.seasonNumber || 1} Ep.{item.episodeNumber || 1}
        </Text>
      )}
      
      <View style={styles.ratingContainer}>
        <StarIcon width={moderateScale(14)} height={moderateScale(14)} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
});

ReadingCard.displayName = 'ReadingCard';

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
    // backgroundColor:'red'
  },
  image: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.white,
  },
  title: {
    fontFamily: FontFamilies.outfitSemiBold,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.text,
    marginTop: verticalScale(8),
    
  },
  chapterEpisodeText: {
    fontFamily: FontFamilies.outfitMedium,
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.ratingText,
    marginTop: verticalScale(4),
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

export default ReadingCard;