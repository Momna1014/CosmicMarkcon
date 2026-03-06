import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
} from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Category card dimensions - matching Discover screen
const CARD_WIDTH = (SCREEN_WIDTH - horizontalScale(32) - horizontalScale(16)) / 2; // 48% of available space
const CARD_HEIGHT = verticalScale(97);

const DiscoverCategoryCardSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
        />
      </SkeletonPlaceholder>
    </View>
  );
});

DiscoverCategoryCardSkeleton.displayName = 'DiscoverCategoryCardSkeleton';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});

export default DiscoverCategoryCardSkeleton;
