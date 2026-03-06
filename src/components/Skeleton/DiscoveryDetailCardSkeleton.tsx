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
const CARD_SPACING = horizontalScale(8);
const CARD_WIDTH = (SCREEN_WIDTH - horizontalScale(30) - (CARD_SPACING * 2)) / 3;
const CARD_IMAGE_HEIGHT = verticalScale(180);

const DiscoveryDetailCardSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item>
          {/* Image */}
          <SkeletonPlaceholder.Item
            width={CARD_WIDTH}
            height={CARD_IMAGE_HEIGHT}
          />

          {/* Title */}
          <SkeletonPlaceholder.Item
            width={CARD_WIDTH * 0.85}
            height={moderateScale(16)}
            marginTop={verticalScale(8)}
          />

          {/* Rating */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            marginTop={verticalScale(4)}
          >
            <SkeletonPlaceholder.Item
              width={moderateScale(14)}
              height={moderateScale(14)}
              borderRadius={moderateScale(7)}
            />
            <SkeletonPlaceholder.Item
              width={moderateScale(28)}
              height={moderateScale(12)}
              marginLeft={horizontalScale(4)}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

DiscoveryDetailCardSkeleton.displayName = 'DiscoveryDetailCardSkeleton';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
});

export default DiscoveryDetailCardSkeleton;
