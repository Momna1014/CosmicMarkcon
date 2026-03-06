import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import RisingStarCardSkeleton from './RisingStarCardSkeleton';

interface RisingStarsSkeletonProps {
  itemCount?: number;
}

const RisingStarsSkeleton: React.FC<RisingStarsSkeletonProps> = memo(({
  itemCount = 4,
}) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <SkeletonPlaceholder
          backgroundColor={Colors.cardBackground}
          highlightColor="#2A2A2E"
          speed={1200}
        >
          <SkeletonPlaceholder.Item
            width={moderateScale(120)}
            height={moderateScale(20)}
          />
        </SkeletonPlaceholder>
      </View>

      {/* List */}
      <View style={styles.listContent}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <React.Fragment key={index}>
            <RisingStarCardSkeleton />
            {index < itemCount - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
});

RisingStarsSkeleton.displayName = 'RisingStarsSkeleton';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(16),
  },
  titleContainer: {
    marginBottom: verticalScale(16),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
  },
  separator: {
    height: verticalScale(8),
  },
});

export default RisingStarsSkeleton;
