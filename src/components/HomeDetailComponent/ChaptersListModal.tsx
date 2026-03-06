import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path } from 'react-native-svg';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import CrossIcon from '../../assets/icons/svgicons/HomeSvgIcons/cross.svg';

// Arrow Right Icon
const ArrowRightIcon: React.FC<{ width?: number; height?: number }> = ({ width = moderateScale(24), height = moderateScale(24) }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13.1716 12.0007L8.2218 16.9504L9.636 18.3646L16 12.0007L9.636 5.63672L8.2218 7.05093L13.1716 12.0007Z"
      fill={Colors.inactive}
    />
  </Svg>
);

// Arrow Back Icon
const ArrowBackIcon: React.FC<{ width?: number; height?: number }> = ({ width = moderateScale(24), height = moderateScale(24) }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.8284 12.0007L15.7782 7.05093L14.364 5.63672L8 12.0007L14.364 18.3646L15.7782 16.9504L10.8284 12.0007Z"
      fill={Colors.text}
    />
  </Svg>
);

export interface Chapter {
  id: string;
  number: number;
  title: string;
}

export interface SeasonEpisode {
  id: string;
  number: number;
  title: string;
  pdfUrl?: string;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodeCount: number;
  episodes: SeasonEpisode[];
}

interface ChaptersListModalProps {
  visible: boolean;
  onClose: () => void;
  /** Legacy chapters array (for backward compatibility) */
  chapters?: Chapter[];
  /** New seasons array with episodes */
  seasons?: Season[];
  onChapterSelect?: (chapter: Chapter) => void;
  /** Called when a season is selected - closes modal and shows episodes in main screen */
  onSeasonSelect?: (season: Season) => void;
  selectedChapter?: number;
  /** Active season number (for highlighting current season) */
  activeSeasonNumber?: number;
}

const ChaptersListModal: React.FC<ChaptersListModalProps> = memo(({
  visible,
  onClose,
  chapters = [],
  seasons = [],
  onChapterSelect,
  onSeasonSelect,
  selectedChapter = 1,
  activeSeasonNumber,
}) => {
  // Handle season press - close modal and show episodes in main screen
  const handleSeasonPress = useCallback((season: Season) => {
    onSeasonSelect?.(season);
    onClose();
  }, [onSeasonSelect, onClose]);

  // Legacy chapter press handler
  const handleChapterPress = useCallback((chapter: Chapter) => {
    onChapterSelect?.(chapter);
    onClose();
  }, [onChapterSelect, onClose]);

  // Render a season item
  const renderSeason = (season: Season) => {
    const isActive = activeSeasonNumber === season.number;
    return (
      <TouchableOpacity
        key={season.id}
        style={styles.chapterItem}
        onPress={() => handleSeasonPress(season)}
        activeOpacity={0.7}
      >
        <View style={styles.seasonInfo}>
          <Text style={[styles.chapterText, isActive && styles.chapterTextSelected]}>
            Chapter {season.number}: {season.title}
          </Text>
          <Text style={styles.episodeCountText}>
            {season.episodeCount} {season.episodeCount === 1 ? 'Episode' : 'Episodes'}
          </Text>
        </View>
        <ArrowRightIcon />
      </TouchableOpacity>
    );
  };

  // Legacy chapter render
  const renderChapter = (item: Chapter) => {
    const isSelected = item.number === selectedChapter;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.chapterItem}
        onPress={() => handleChapterPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chapterText, isSelected && styles.chapterTextSelected]}>
          {item.title}
        </Text>
        <ArrowRightIcon />
      </TouchableOpacity>
    );
  };

  // Determine if we should use seasons or legacy chapters
  const useSeasons = seasons.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Glass Background */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chapters List</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
            </TouchableOpacity>
          </View>

          {/* List Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {useSeasons ? (
              // Show seasons list
              seasons.map(season => renderSeason(season))
            ) : (
              // Legacy: show chapters list
              chapters.map(chapter => renderChapter(chapter))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

ChaptersListModal.displayName = 'ChaptersListModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(80),
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.93)',
  },
  content: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(16),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    marginRight: moderateScale(-5),
  },
  scrollView: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: verticalScale(20),
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  seasonInfo: {
    flex: 1,
  },
  chapterText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.inactive,
    fontWeight: '700',
  },
  chapterTextSelected: {
    fontFamily: FontFamilies.sfProDisplayBold,
    color: Colors.text,
    fontWeight: '700',
  },
  episodeCountText: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(12),
    color: Colors.inactive,
    marginTop: verticalScale(2),
  },
});

export default ChaptersListModal;