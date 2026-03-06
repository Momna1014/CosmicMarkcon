import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

// Card size constants - matching MangaCard
const CARD_SIZES = {
  trending: {
    width: moderateScale(140),
    height: moderateScale(192),
  },
  recommended: {
    width: moderateScale(120),
    height: moderateScale(168),
  },
};

interface MangaCardSkeletonProps {
  showRating?: boolean;
  variant?: 'trending' | 'recommended';
}

const MangaCardSkeleton: React.FC<MangaCardSkeletonProps> = memo(({
  showRating = false,
  variant = 'recommended',
}) => {
  const { width, height } = CARD_SIZES[variant];

  return (
    <View style={[styles.container, { width }]}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item>
          {/* Image placeholder */}
          <SkeletonPlaceholder.Item
            width={width}
            height={height}
          />

          {/* Title and Rating Section - only show if showRating is true */}
          {showRating && (
            <SkeletonPlaceholder.Item marginTop={verticalScale(8)}>
              {/* Title */}
              <SkeletonPlaceholder.Item
                width={width * 0.9}
                height={moderateScale(14)}
                marginBottom={verticalScale(4)}
              />
              {/* Rating */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
                marginTop={verticalScale(4)}
              >
                <SkeletonPlaceholder.Item
                  width={moderateScale(12)}
                  height={moderateScale(12)}
                  borderRadius={moderateScale(6)}
                />
                <SkeletonPlaceholder.Item
                  width={moderateScale(30)}
                  height={moderateScale(12)}
                  marginLeft={horizontalScale(4)}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          )}
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

MangaCardSkeleton.displayName = 'MangaCardSkeleton';

const styles = StyleSheet.create({
  container: {
    marginRight: horizontalScale(12),
  },
});

export default MangaCardSkeleton;
