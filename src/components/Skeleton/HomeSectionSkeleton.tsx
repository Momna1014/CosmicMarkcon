import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import MangaCardSkeleton from './MangaCardSkeleton';

interface HomeSectionSkeletonProps {
  showSubtitle?: boolean;
  showRating?: boolean;
  variant?: 'trending' | 'recommended';
  cardCount?: number;
}

const HomeSectionSkeleton: React.FC<HomeSectionSkeletonProps> = memo(({
  showSubtitle = false,
  showRating = false,
  variant = 'recommended',
  cardCount = 5,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonPlaceholder
          backgroundColor={Colors.cardBackground}
          highlightColor="#2A2A2E"
          speed={1200}
        >
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Title */}
            <SkeletonPlaceholder.Item
              width={moderateScale(150)}
              height={moderateScale(20)}
            />
            {/* Subtitle with icon */}
            {showSubtitle && (
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={moderateScale(24)}
                  height={moderateScale(24)}
                  borderRadius={moderateScale(12)}
                />
                <SkeletonPlaceholder.Item
                  width={moderateScale(80)}
                  height={moderateScale(14)}
                  marginLeft={horizontalScale(6)}
                />
              </SkeletonPlaceholder.Item>
            )}
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>

      {/* Horizontal List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      >
        {Array.from({ length: cardCount }).map((_, index) => (
          <MangaCardSkeleton
            key={index}
            showRating={showRating}
            variant={variant}
          />
        ))}
      </ScrollView>
    </View>
  );
});

HomeSectionSkeleton.displayName = 'HomeSectionSkeleton';

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
  },
});

export default HomeSectionSkeleton;
