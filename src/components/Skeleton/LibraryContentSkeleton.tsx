import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  Colors,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import ReadingCardSkeleton from './ReadingCardSkeleton';
import SavedCardSkeleton from './SavedCardSkeleton';

type TabType = 'reading' | 'saved' | 'download';

interface LibraryContentSkeletonProps {
  activeTab?: TabType;
  cardCount?: number;
}

const LibraryContentSkeleton: React.FC<LibraryContentSkeletonProps> = memo(({
  activeTab = 'reading',
  cardCount = 4,
}) => {
  // Create pairs for 2-column layout
  const rows = Math.ceil(cardCount / 2);

  const renderReadingContent = () => (
    <View style={styles.tabContent}>
      {/* Section Title - "Continue Reading" */}
      <View style={styles.sectionTitleContainer}>
        <SkeletonPlaceholder
          backgroundColor={Colors.cardBackground}
          highlightColor="#2A2A2E"
          speed={1200}
        >
          <SkeletonPlaceholder.Item
            width={moderateScale(180)}
            height={moderateScale(24)}
          />
        </SkeletonPlaceholder>
      </View>

      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <ReadingCardSkeleton />
            {rowIndex * 2 + 1 < cardCount && <ReadingCardSkeleton />}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSavedContent = () => (
    <View style={styles.tabContent}>
      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <SavedCardSkeleton showSaveIcon={true} />
            {rowIndex * 2 + 1 < cardCount && <SavedCardSkeleton showSaveIcon={true} />}
          </View>
        ))}
      </View>
    </View>
  );

  const renderDownloadContent = () => (
    <View style={styles.tabContent}>
      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <SavedCardSkeleton showSaveIcon={false} />
            {rowIndex * 2 + 1 < cardCount && <SavedCardSkeleton showSaveIcon={false} />}
          </View>
        ))}
      </View>
    </View>
  );

  switch (activeTab) {
    case 'reading':
      return renderReadingContent();
    case 'saved':
      return renderSavedContent();
    case 'download':
      return renderDownloadContent();
    default:
      return renderReadingContent();
  }
});

LibraryContentSkeleton.displayName = 'LibraryContentSkeleton';

const styles = StyleSheet.create({
  tabContent: {
    paddingHorizontal: horizontalScale(16),
  },
  sectionTitleContainer: {
    marginBottom: verticalScale(16),
  },
  gridContainer: {
    // Container for the grid
  },
  row: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
});

export default LibraryContentSkeleton;
