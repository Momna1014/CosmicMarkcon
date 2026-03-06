import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

const CARD_WIDTH = (Dimensions.get('window').width - horizontalScale(44)) / 2;
const CARD_HEIGHT = verticalScale(224.66);

const ReadingCardSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item>
          {/* Image Container with Progress Bar */}
          <SkeletonPlaceholder.Item
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
          />

          {/* Title */}
          <SkeletonPlaceholder.Item
            width={CARD_WIDTH * 0.8}
            height={moderateScale(16)}
            marginTop={verticalScale(8)}
          />

          {/* Rating */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            marginTop={verticalScale(7)}
          >
            <SkeletonPlaceholder.Item
              width={moderateScale(14)}
              height={moderateScale(14)}
              borderRadius={moderateScale(7)}
            />
            <SkeletonPlaceholder.Item
              width={moderateScale(30)}
              height={moderateScale(12)}
              marginLeft={horizontalScale(6)}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

ReadingCardSkeleton.displayName = 'ReadingCardSkeleton';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(25),
  },
});

export default ReadingCardSkeleton;
