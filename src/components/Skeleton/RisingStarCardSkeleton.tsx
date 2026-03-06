import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

const RisingStarCardSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor={Colors.cardBackground}
        highlightColor="#2A2A2E"
        speed={1200}
      >
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
        >
          {/* Thumbnail Image */}
          <SkeletonPlaceholder.Item
            width={moderateScale(75)}
            height={moderateScale(75)}
          />

          {/* Content */}
          <SkeletonPlaceholder.Item
            flex={1}
            marginLeft={horizontalScale(16)}
            justifyContent="center"
          >
            {/* Genre */}
            <SkeletonPlaceholder.Item
              width={moderateScale(60)}
              height={moderateScale(14)}
              marginBottom={verticalScale(4)}
            />
            {/* Title */}
            <SkeletonPlaceholder.Item
              width={moderateScale(140)}
              height={moderateScale(17)}
            />
          </SkeletonPlaceholder.Item>

          {/* Save Icon */}
          <SkeletonPlaceholder.Item
            width={moderateScale(35)}
            height={moderateScale(35)}
            borderRadius={moderateScale(17.5)}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

RisingStarCardSkeleton.displayName = 'RisingStarCardSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(12),
  },
});

export default RisingStarCardSkeleton;
