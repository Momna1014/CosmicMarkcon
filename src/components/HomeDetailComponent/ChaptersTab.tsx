import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ListRenderItem, ActivityIndicator } from 'react-native';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  BorderRadius,
} from '../../theme';
import DownloadIcon from '../../assets/icons/svgicons/HomeSvgIcons/download.svg';
import DownArrowIcon from '../../assets/icons/svgicons/HomeSvgIcons/down_arrow.svg';
import { CircularProgress } from '../common';

export interface Episode {
  id: string;
  episodeNumber: string;
  title: string;
  pdfUrl?: string; // URL to the PDF file
  seasonId?: string; // Season this episode belongs to
  seasonNumber?: number;
  seasonTitle?: string;
}

/** Episode progress data */
export interface EpisodeProgressData {
  percentageRead: number;
  isCompleted: boolean;
  currentPage: number;
  totalPages: number;
}

/** Active download tracking */
export interface ActiveDownloadInfo {
  progress: number;
  status: 'downloading' | 'failed' | 'completed';
}

interface ChaptersTabProps {
  episodes: Episode[];
  selectedChapter: number;
  onEpisodePress?: (episode: Episode) => void;
  onDownloadPress?: (episode: Episode) => void;
  onDownloadAll?: () => void;
  onChapterDropdownPress?: () => void;
  /** Set of episode IDs that have been completed/read */
  completedEpisodeIds?: Set<string>;
  /** Map of episodeId -> progress data (for showing "Reading Now X%") */
  episodesProgressMap?: { [episodeId: string]: EpisodeProgressData };
  /** Set of episode IDs that have been downloaded */
  downloadedEpisodeIds?: Set<string>;
  /** Active downloads with progress */
  activeDownloads?: { [key: string]: ActiveDownloadInfo };
  /** Whether "Download All" is in progress */
  isDownloadingAll?: boolean;
  /** User ID for creating download keys */
  userId?: string | null;
  /** Manga ID for creating download keys */
  mangaId?: string;
}

const ChaptersTab: React.FC<ChaptersTabProps> = memo(({
  episodes,
  selectedChapter,
  onEpisodePress,
  onDownloadPress,
  onDownloadAll,
  onChapterDropdownPress,
  completedEpisodeIds = new Set(),
  episodesProgressMap = {},
  downloadedEpisodeIds = new Set(),
  activeDownloads = {},
  isDownloadingAll = false,
  userId,
  mangaId,
}) => {
  const handleEpisodePress = useCallback((episode: Episode) => {
    onEpisodePress?.(episode);
  }, [onEpisodePress]);

  const handleDownloadPress = useCallback((episode: Episode) => {
    onDownloadPress?.(episode);
  }, [onDownloadPress]);

  const renderEpisodeItem: ListRenderItem<Episode> = useCallback(({ item }) => {
    const isCompleted = completedEpisodeIds.has(item.id);
    const isDownloaded = downloadedEpisodeIds.has(item.id);
    const progress = episodesProgressMap[item.id];
    const hasProgress = progress && progress.percentageRead > 0 && !isCompleted;
    
    // Check if this episode is currently downloading
    const downloadKey = userId && mangaId ? `${userId}-${mangaId}-${item.id}` : '';
    const activeDownload = downloadKey ? activeDownloads[downloadKey] : null;
    const isDownloading = activeDownload?.status === 'downloading';
    const downloadProgress = activeDownload?.progress || 0;
    
    return (
      <TouchableOpacity
        style={styles.episodeItem}
        onPress={() => handleEpisodePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.episodeInfo}>
          <View style={styles.episodeLabelRow}>
            <Text style={styles.episodeLabel}>{item.episodeNumber}</Text>
            {isCompleted ? (
              <View style={styles.readBadge}>
                <Text style={styles.readBadgeText}>Read</Text>
              </View>
            ) : hasProgress ? (
              <View style={styles.readingNowBadge}>
                <Text style={styles.readingNowBadgeText}>
                  Reading Now ({Math.round(progress.percentageRead)}%)
                </Text>
              </View>
            ) : null}
            {isDownloaded && (
              <View style={styles.downloadedBadge}>
                <Text style={styles.downloadedBadgeText}>Downloaded</Text>
              </View>
            )}
          </View>
          <Text style={styles.episodeTitle}>{item.title}</Text>
        </View>
        {/* Only show download button if not already downloaded */}
        {!isDownloaded && (
          <TouchableOpacity
            onPress={() => handleDownloadPress(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <CircularProgress 
                progress={downloadProgress} 
                size={moderateScale(27)} 
                strokeWidth={moderateScale(3.5)}
                progressColor={Colors.primary || '#4CAF50'}
              />
            ) : (
              <DownloadIcon 
                width={moderateScale(20)} 
                height={moderateScale(20)} 
              />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [handleEpisodePress, handleDownloadPress, completedEpisodeIds, episodesProgressMap, downloadedEpisodeIds, activeDownloads, userId, mangaId]);

  const keyExtractor = useCallback((item: Episode) => item.id, []);

  // Check if all episodes are downloaded
  const allEpisodesDownloaded = episodes.length > 0 && episodes.every(ep => downloadedEpisodeIds.has(ep.id));

  // Empty state check
  if (episodes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.latestChaptersTitle}>Latest Chapters</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No seasons available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.latestChaptersTitle}>Latest Chapters</Text>
      </View>

      {/* Chapter Dropdown and Download All Row */}
      <View style={styles.dropdownRow}>
        <TouchableOpacity style={styles.chapterDropdown} onPress={onChapterDropdownPress}>
          <Text style={styles.chapterDropdownText}>Chapter {selectedChapter}</Text>
          <DownArrowIcon width={moderateScale(16)} height={moderateScale(16)} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onDownloadAll}
          disabled={isDownloadingAll || allEpisodesDownloaded}
          style={styles.downloadAllButton}
        >
          {isDownloadingAll ? (
            <View style={styles.downloadAllLoading}>
              <ActivityIndicator size="small" color={Colors.primary || '#4CAF50'} />
              <Text style={styles.downloadAllTextLoading}>Downloading...</Text>
            </View>
          ) : allEpisodesDownloaded ? (
            <Text style={[styles.downloadAllText, styles.downloadedText]}>Downloaded</Text>
          ) : (
            <Text style={styles.downloadAllText}>Download All</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Episodes List */}
      <FlatList
        data={episodes}
        renderItem={renderEpisodeItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
});

ChaptersTab.displayName = 'ChaptersTab';

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(20),
  },
  header: {
    marginBottom: verticalScale(16),
  },
  emptyContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.inactive,
    textAlign: 'center',
  },
  latestChaptersTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal:horizontalScale(16)
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
        paddingHorizontal:horizontalScale(16)
  },
  chapterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    // borderRadius: BorderRadius.sm,
    gap: horizontalScale(5),
  },
  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadAllText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.light_gray,
  },
  downloadedText: {
    color: Colors.inactive,
    opacity: 0.6,
  },
  downloadAllLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  downloadAllTextLoading: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.primary || '#4CAF50',
  },
  chapterDropdownText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.light_gray,
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.text,
  },
  episodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(12),
    backgroundColor: '#1E1E21',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    marginBottom: verticalScale(2),
  },
  episodeInfo: {
    flex: 1,
  },
  episodeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(4),
  },
  episodeLabel: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(12),
    color: Colors.inactive,
  },
  readBadge: {
    backgroundColor: Colors.primary || '#4CAF50',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  readBadgeText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: Colors.white,
  },
  readingNowBadge: {
    backgroundColor: '#FF8E3C',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  readingNowBadgeText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: Colors.white,
  },
  episodeTitle: {
    fontFamily: FontFamilies.sfProDisplayBold,
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: Colors.text,
  },
  downloadedBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  downloadedBadgeText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: Colors.white,
  },
  downloadedIconContainer: {
    opacity: 0.6,
  },
});

export default ChaptersTab;