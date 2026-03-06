import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  verticalScale,
} from '../../theme';
import HomeSectionSkeleton from './HomeSectionSkeleton';
import FeaturedBannerSkeleton from './FeaturedBannerSkeleton';
import ExploreByGenreSkeleton from './ExploreByGenreSkeleton';
import RisingStarsSkeleton from './RisingStarsSkeleton';

// Header height constant - matching Home screen
const HEADER_HEIGHT = verticalScale(62);

const HomeScreenSkeleton: React.FC = memo(() => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + HEADER_HEIGHT + verticalScale(0) },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Trending Now Section - with subtitle and fire icon, no rating */}
        <HomeSectionSkeleton
          showSubtitle
          showRating={false}
          variant="trending"
          cardCount={4}
        />

        {/* Recommended For You Section - with rating */}
        <HomeSectionSkeleton
          showSubtitle={false}
          showRating
          variant="recommended"
          cardCount={4}
        />

        {/* Newly On App Section - with rating */}
        <HomeSectionSkeleton
          showSubtitle={false}
          showRating
          variant="recommended"
          cardCount={4}
        />

        {/* Featured Banner */}
        <FeaturedBannerSkeleton />

        {/* Completed Stories Section - with rating */}
        <HomeSectionSkeleton
          showSubtitle={false}
          showRating
          variant="recommended"
          cardCount={4}
        />

        {/* Explore By Genre */}
        <ExploreByGenreSkeleton genreCount={4} />

        {/* Rising Stars */}
        <RisingStarsSkeleton itemCount={4} />
      </ScrollView>
    </View>
  );
});

HomeScreenSkeleton.displayName = 'HomeScreenSkeleton';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: verticalScale(0),
  },
});

export default HomeScreenSkeleton;
