import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
import DeleteIcon from '../../assets/icons/svgicons/HomeSvgIcons/cross.svg';

export interface DownloadedEpisodeItem {
  id: string;
  mangaId: string;
  episodeId: string;
  mangaTitle: string;
  episodeTitle: string;
  episodeNumber: number;
  chapterNumber?: number;
  seasonNumber?: number;
  coverImage: string;
  rating: number;
  localFilePath: string;
  downloadedAt: number;
}

interface DownloadedEpisodeCardProps {
  item: DownloadedEpisodeItem;
  onPress?: (item: DownloadedEpisodeItem) => void;
  onDeletePress?: (item: DownloadedEpisodeItem) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - horizontalScale(40)) / 2;
const CARD_HEIGHT = verticalScale(264.66);

const DownloadedEpisodeCard: React.FC<DownloadedEpisodeCardProps> = memo(({ 
  item, 
  onPress, 
  onDeletePress,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const handleDeletePress = () => {
    onDeletePress?.(item);
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
            item.coverImage
              ? {
                  uri: item.coverImage,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }
              : require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png')
          }
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Delete Icon */}
        <TouchableOpacity
          style={styles.deleteIconContainer}
          onPress={handleDeletePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <DeleteIcon width={moderateScale(32)} height={moderateScale(32)} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{item.mangaTitle}</Text>
      
      {/* Chapter and Episode Info - Row */}
      <View style={styles.episodeInfoContainer}>
        <Text style={styles.chapterText}>Ch {item.chapterNumber || '1'}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.episodeText}>Ep {String(item.episodeNumber).padStart(2, '0')}</Text>
      </View>
      
      {/* Rating */}
      <View style={styles.ratingContainer}>
        <StarIcon width={14} height={14} />
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
});

DownloadedEpisodeCard.displayName = 'DownloadedEpisodeCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(25),
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteIconContainer: {
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
  episodeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    marginTop: verticalScale(4),
  },
  chapterText: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(12),
    color: Colors.primary || '#4CAF50',
    fontWeight: '500',
  },
  separator: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
  },
  episodeText: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  ratingText: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.ratingText,
    marginLeft: horizontalScale(6),
  },
});

export default DownloadedEpisodeCard;
