import React, { memo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Colors,
  horizontalScale,
  verticalScale,
} from '../../theme';
import DiscoveryDetailCardSkeleton from './DiscoveryDetailCardSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SPACING = horizontalScale(8);
const CARD_WIDTH = (SCREEN_WIDTH - horizontalScale(30) - (CARD_SPACING * 2)) / 3;

interface DiscoveryDetailContentSkeletonProps {
  cardCount?: number;
}

const DiscoveryDetailContentSkeleton: React.FC<DiscoveryDetailContentSkeletonProps> = memo(({
  cardCount = 9,
}) => {
  // Create rows for 3-column layout
  const rows = Math.ceil(cardCount / 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <DiscoveryDetailCardSkeleton />
          {rowIndex * 3 + 1 < cardCount && <DiscoveryDetailCardSkeleton />}
          {rowIndex * 3 + 2 < cardCount && <DiscoveryDetailCardSkeleton />}
        </View>
      ))}
    </ScrollView>
  );
});

DiscoveryDetailContentSkeleton.displayName = 'DiscoveryDetailContentSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(0),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
});

export default DiscoveryDetailContentSkeleton;
