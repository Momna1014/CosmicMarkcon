import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Colors,
  horizontalScale,
  verticalScale,
} from '../../theme';
import DiscoverCategoryCardSkeleton from './DiscoverCategoryCardSkeleton';

interface DiscoverContentSkeletonProps {
  cardCount?: number;
}

const DiscoverContentSkeleton: React.FC<DiscoverContentSkeletonProps> = memo(({
  cardCount = 8,
}) => {
  // Create pairs for 2-column layout
  const rows = Math.ceil(cardCount / 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <DiscoverCategoryCardSkeleton />
          {rowIndex * 2 + 1 < cardCount && <DiscoverCategoryCardSkeleton />}
        </View>
      ))}
    </ScrollView>
  );
});

DiscoverContentSkeleton.displayName = 'DiscoverContentSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(100),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
});

export default DiscoverContentSkeleton;
