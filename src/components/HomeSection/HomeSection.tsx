import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
  ImageSourcePropType,
} from 'react-native';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import MangaCard from '../MangaCard/MangaCard';
import FireIcon from '../../assets/icons/svgicons/HomeSvgIcons/fire.svg';

// MangaItem interface - supports both local and remote images
export interface MangaItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
  rating?: number;
  description?: string;
}

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  showFireIcon?: boolean;
  showNumbering?: boolean;
  showRating?: boolean;
  variant?: 'trending' | 'recommended';
  data: MangaItem[];
  onSeeAll?: () => void;
  onItemPress?: (item: MangaItem) => void;
}

const HomeSection: React.FC<HomeSectionProps> = memo(({
  title,
  subtitle,
  showFireIcon = false,
  showNumbering = false,
  showRating = false,
  variant = 'recommended',
  data,
  onSeeAll,
  onItemPress,
}) => {
  const renderItem: ListRenderItem<MangaItem> = useCallback(({ item, index }) => (
    <MangaCard
      image={item.image}
      title={item.title}
      rating={item.rating}
      index={index}
      showNumbering={showNumbering}
      showRating={showRating}
      variant={variant}
      onPress={() => onItemPress?.(item)}
    />
  ), [showNumbering, showRating, variant, onItemPress]);

  const keyExtractor = useCallback((item: MangaItem) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <View style={styles.subtitleContainer} onPress={onSeeAll}>
            {showFireIcon && (
              <FireIcon
                width={moderateScale(24)}
                height={moderateScale(24)}
              />
            )}
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        )}
      </View>

      {/* Horizontal List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

HomeSection.displayName = 'HomeSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.text,
    // lineHeight:30
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: Colors.border,
    marginLeft: horizontalScale(6),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
  },
});

export default HomeSection;
