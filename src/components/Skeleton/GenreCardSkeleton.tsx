import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

const GenreCardSkeleton: React.FC = memo(() => {
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
          paddingVertical={verticalScale(14)}
          paddingHorizontal={horizontalScale(16)}
        >
          {/* Icon */}
          <SkeletonPlaceholder.Item
            width={moderateScale(32)}
            height={moderateScale(32)}
            borderRadius={moderateScale(16)}
            marginRight={horizontalScale(10)}
          />
          {/* Genre Name */}
          <SkeletonPlaceholder.Item
            width={moderateScale(60)}
            height={moderateScale(18)}
            flex={1}
          />
          {/* Arrow */}
          <SkeletonPlaceholder.Item
            width={moderateScale(24)}
            height={moderateScale(24)}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

GenreCardSkeleton.displayName = 'GenreCardSkeleton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    marginBottom: verticalScale(12),
    width: '48%',
  },
});

export default GenreCardSkeleton;
