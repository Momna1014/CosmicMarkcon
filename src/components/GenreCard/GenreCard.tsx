import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';
import FireIcon from '../../assets/icons/svgicons/HomeSvgIcons/fire.svg';
import RomanceIcon from '../../assets/icons/svgicons/HomeSvgIcons/Romance.svg';
import ComedyIcon from '../../assets/icons/svgicons/HomeSvgIcons/Comedy.svg';
import ActionIcon from '../../assets/icons/svgicons/HomeSvgIcons/Action.svg';
import HorrorIcon from '../../assets/icons/svgicons/HomeSvgIcons/Horror.svg';
import LeftArrowIcon from '../../assets/icons/svgicons/HomeSvgIcons/leftarrow.svg';

export interface GenreItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface GenreCardProps {
  genre: GenreItem;
  onPress?: (genre: GenreItem) => void;
}

// Map genre names to their icons
const GENRE_ICONS: Record<string, React.FC<{ width: number; height: number }>> = {
  Romance: RomanceIcon,
  Comedy: ComedyIcon,
  Action: ActionIcon,
  Horror: HorrorIcon,
};

const GenreCard: React.FC<GenreCardProps> = memo(({ genre, onPress }) => {
  const handlePress = () => {
    onPress?.(genre);
  };

  const IconComponent = useMemo(() => {
    return GENRE_ICONS[genre.name] || FireIcon;
  }, [genre.name]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {genre.icon || <IconComponent width={moderateScale(32)} height={moderateScale(32)} />}
      </View>
      <Text style={styles.genreName}>{genre.name}</Text>
      <View style={styles.arrowContainer}>
        <LeftArrowIcon width={moderateScale(24)} height={moderateScale(24)} />
      </View>
    </TouchableOpacity>
  );
});

GenreCard.displayName = 'GenreCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    // borderRadius: BorderRadius.base,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(12),
    width: '48%',
  },
  iconContainer: {
    marginRight: horizontalScale(10),
  },
  genreName: {
    flex: 1,
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: Colors.text,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(18),
    color: Colors.inactive,
  },
});

export default GenreCard;
