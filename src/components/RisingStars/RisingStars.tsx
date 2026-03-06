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
import RisingStarCard, { RisingStarItem } from './RisingStarCard';

interface RisingStarsProps {
  title: string;
  data: RisingStarItem[];
  onItemPress?: (item: RisingStarItem) => void;
  onBookmarkPress?: (item: RisingStarItem) => void;
}

const RisingStars: React.FC<RisingStarsProps> = memo(({
  title,
  data,
  onItemPress,
  onBookmarkPress,
}) => {
  const renderItem: ListRenderItem<RisingStarItem> = useCallback(({ item }) => (
    <RisingStarCard
      item={item}
      onPress={onItemPress}
      onBookmarkPress={onBookmarkPress}
    />
  ), [onItemPress, onBookmarkPress]);

  const keyExtractor = useCallback((item: RisingStarItem) => item.id, []);

  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

RisingStars.displayName = 'RisingStars';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(16),

  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.text,
    // paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
  },
  separator: {
    height: verticalScale(8),
  },
});

export default RisingStars;
