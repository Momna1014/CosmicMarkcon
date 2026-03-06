import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import GenreCardSkeleton from './GenreCardSkeleton';

interface ExploreByGenreSkeletonProps {
  genreCount?: number;
}

const ExploreByGenreSkeleton: React.FC<ExploreByGenreSkeletonProps> = memo(({
  genreCount = 4,
}) => {
  // Create pairs for 2-column layout
  const rows = Math.ceil(genreCount / 2);

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
            width={moderateScale(160)}
            height={moderateScale(20)}
          />
        </SkeletonPlaceholder>
      </View>

      {/* Genre Grid */}
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <GenreCardSkeleton />
            {rowIndex * 2 + 1 < genreCount && <GenreCardSkeleton />}
          </View>
        ))}
      </View>
    </View>
  );
});

ExploreByGenreSkeleton.displayName = 'ExploreByGenreSkeleton';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  titleContainer: {
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
  },
  gridContainer: {
    paddingHorizontal: horizontalScale(13),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ExploreByGenreSkeleton;
