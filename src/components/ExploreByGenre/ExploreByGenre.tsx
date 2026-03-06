import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import GenreCard, { GenreItem } from '../GenreCard/GenreCard';

interface ExploreByGenreProps {
  title: string;
  genres: GenreItem[];
  onGenrePress?: (genre: GenreItem) => void;
  onSeeMorePress?: () => void;
}

const ExploreByGenre: React.FC<ExploreByGenreProps> = memo(({
  title,
  genres,
  onGenrePress,
  onSeeMorePress,
}) => {
  const renderGenre: ListRenderItem<GenreItem> = useCallback(({ item }) => (
    <GenreCard genre={item} onPress={onGenrePress} />
  ), [onGenrePress]);

  const keyExtractor = useCallback((item: GenreItem) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.seeMoreText} onPress={onSeeMorePress}>See More</Text>
      </View>
      <FlatList
        data={genres}
        renderItem={renderGenre}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

ExploreByGenre.displayName = 'ExploreByGenre';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  headerRow: {
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
  },
  seeMoreText: {
    fontFamily: FontFamilies.jetBrainsMonoRegular,
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: Colors.border,
    marginLeft: horizontalScale(6),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(13),
  },
  listContent: {
    paddingHorizontal: 0,
  },
});

export default ExploreByGenre;
