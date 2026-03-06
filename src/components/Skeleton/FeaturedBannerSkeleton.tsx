import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Banner dimensions - matching FeaturedBanner
const HORIZONTAL_PADDING = horizontalScale(16);
const BANNER_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const BANNER_HEIGHT = verticalScale(284);

const FeaturedBannerSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.wrapper}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item>
          {/* Banner container */}
          <SkeletonPlaceholder.Item
            width={BANNER_WIDTH}
            height={BANNER_HEIGHT}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>

      {/* Overlay elements for more detail */}
      <View style={styles.overlay}>
        {/* Top Section - Genre tag */}
        <View style={styles.topSection}>
          <View style={styles.spacer} />
          <SkeletonPlaceholder
            backgroundColor="rgba(255, 255, 255, 0.1)"
            highlightColor="rgba(255, 255, 255, 0.2)"
            speed={1200}
          >
            <SkeletonPlaceholder.Item
              width={moderateScale(70)}
              height={moderateScale(28)}
            />
          </SkeletonPlaceholder>
        </View>

        {/* Bottom Section - Badge, Rating, and Title */}
        <View style={styles.bottomSection}>
          <SkeletonPlaceholder
            backgroundColor="rgba(255, 255, 255, 0.1)"
            highlightColor="rgba(255, 255, 255, 0.2)"
            speed={1200}
          >
            <SkeletonPlaceholder.Item>
              {/* Badge Row */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
                marginBottom={verticalScale(8)}
              >
                {/* Featured Badge */}
                <SkeletonPlaceholder.Item
                  width={moderateScale(80)}
                  height={moderateScale(28)}
                />
                {/* Rating */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                  marginLeft={horizontalScale(12)}
                >
                  <SkeletonPlaceholder.Item
                    width={moderateScale(16)}
                    height={moderateScale(16)}
                    borderRadius={moderateScale(8)}
                  />
                  <SkeletonPlaceholder.Item
                    width={moderateScale(30)}
                    height={moderateScale(16)}
                    marginLeft={horizontalScale(6)}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Main Title */}
              <SkeletonPlaceholder.Item
                width={BANNER_WIDTH * 0.6}
                height={moderateScale(32)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      </View>
    </View>
  );
});

FeaturedBannerSkeleton.displayName = 'FeaturedBannerSkeleton';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: verticalScale(24),
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
    bottom: verticalScale(24),
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(16),
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: verticalScale(16),
    left: 0,
    right: 0,
  },
});

export default FeaturedBannerSkeleton;
