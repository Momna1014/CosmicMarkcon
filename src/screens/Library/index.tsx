import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { useStyles } from './styles';
import { ReadingCard, SavedCard, ReadingItem, SavedItem, DownloadedEpisodeCard, DownloadedEpisodeItem } from '../../components/librarycomponents';
import { LibraryContentSkeleton } from '../../components/Skeleton';
import { RootState, AppDispatch } from '../../redux/store';
import { useContinueReadingList, ContinueReadingItem } from '../../hooks/useReadingProgress';
import { removeSavedManga, SavedManga } from '../../redux/slices/savedMangaSlice';
import { DownloadedManga, DownloadedEpisode, removeDownload } from '../../redux/slices/downloadSlice';
import { useAlert } from '../../contexts/AlertContext';

// Analytics
import firebaseService from '../../services/firebase/FirebaseService';
import {
  logMangaPressed,
  logMangaUnsaved,
  logEpisodeContinued,
  logEpisodeOpened,
} from '../../utils/mangaAnalytics';

type TabType = 'reading' | 'saved' | 'download';

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = memo(({ title, isActive, onPress }) => {
  const styles = useStyles();
  
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
});

TabButton.displayName = 'TabButton';

type Props = {
  navigation: any;
  route?: any;
};

// Extended ReadingItem with navigation data
interface ContinueReadingCardItem extends ReadingItem {
  mangaId: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  currentPage: number;
  totalPages: number;
  seasonId: string;
  seasonNumber: number;
  seasonTitle: string;
}

const LibraryScreen: React.FC<Props> = ({ navigation, route }) => {
  const styles = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const { showWarningAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabType>('reading');
  const [isLoading, setIsLoading] = useState(false);

  // Get userId from Redux
  const userId = useSelector((state: RootState) => state.auth.userId);

  // ===== Analytics: Track screen view =====
  useScreenView('LibraryScreen', {
    screen_category: 'library',
    previous_screen: route?.params?.from || 'unknown',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [LibraryScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [LibraryScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('LibraryScreen', 'LibraryScreen');
    logFirebaseEvent('library_screen_viewed', {
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent]);

  // Get saved manga from Redux - use shallowEqual to prevent unnecessary rerenders
  const savedMangaMap = useSelector((state: RootState) => {
    if (!userId) return {};
    return state.savedManga?.users?.[userId] || {};
  }, shallowEqual);

  // Transform saved manga to SavedItem format, sorted by savedAt DESC
  const savedMangaData: (SavedItem & { mangaId: string })[] = useMemo(() => {
    return Object.values(savedMangaMap)
      .sort((a: SavedManga, b: SavedManga) => b.savedAt - a.savedAt)
      .map((manga: SavedManga) => ({
        id: manga.mangaId,
        mangaId: manga.mangaId,
        title: manga.title,
        image: manga.coverImage ? { uri: manga.coverImage } : require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png'),
        rating: manga.rating,
      }));
  }, [savedMangaMap]);

  // Get downloaded manga from Redux - use shallowEqual to prevent unnecessary rerenders
  const downloadsMap = useSelector((state: RootState) => {
    if (!userId) return {};
    return state.downloads?.users?.[userId] || {};
  }, shallowEqual);

  // Transform downloaded manga to flat episode list, sorted by downloadedAt DESC
  const downloadedEpisodesData: DownloadedEpisodeItem[] = useMemo(() => {
    const episodes: DownloadedEpisodeItem[] = [];
    
    Object.values(downloadsMap).forEach((manga: DownloadedManga) => {
      Object.values(manga.episodes).forEach((episode: DownloadedEpisode) => {
        episodes.push({
          id: `${manga.mangaId}-${episode.episodeId}`,
          mangaId: manga.mangaId,
          mangaTitle: manga.title,
          coverImage: manga.coverImage,
          rating: manga.rating,
          episodeId: episode.episodeId,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.episodeTitle,
          chapterNumber: episode.chapterNumber,
          localFilePath: episode.localFilePath,
          downloadedAt: episode.downloadedAt,
        });
      });
    });
    
    // Sort by downloadedAt DESC (most recent first)
    return episodes.sort((a, b) => b.downloadedAt - a.downloadedAt);
  }, [downloadsMap]);

  // Get Continue Reading data from Redux
  const continueReadingList = useContinueReadingList(userId);

  // Transform Continue Reading data to match ReadingItem interface
  const continueReadingData: ContinueReadingCardItem[] = useMemo(() => {
    return continueReadingList.map((item: ContinueReadingItem) => ({
      id: `${item.mangaId}-${item.episodeId}`,
      title: item.mangaTitle,
      image: item.coverImage ? { uri: item.coverImage } : require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png'),
      rating: item.rating,
      progress: item.percentageRead,
      mangaId: item.mangaId,
      episodeId: item.episodeId,
      episodeNumber: item.episodeNumber,
      episodeTitle: item.episodeTitle,
      currentPage: item.currentPage,
      totalPages: item.totalPages,
      seasonId: item.seasonId,
      seasonNumber: item.seasonNumber,
      seasonTitle: item.seasonTitle,
    }));
  }, [continueReadingList]);

  // Simulate loading - remove this in production and use actual loading state
  // React.useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, []);

  // Analytics (moved to top of component)

  const handleTabPress = useCallback((tab: TabType) => {
    console.log(`📌 [LibraryScreen] Tab changed to: ${tab}`);
    logFirebaseEvent('library_tab_changed', {
      tab: tab,
      previous_tab: activeTab,
      screen: 'LibraryScreen',
    });
    setActiveTab(tab);
  }, [activeTab, logFirebaseEvent]);

  /**
   * Handle Continue Reading item press
   * Navigate to HomeDetail with manga ID and active season number
   * The user will then be able to resume reading from the saved progress
   */
  const handleReadingItemPress = useCallback((item: ContinueReadingCardItem) => {
    console.log(`📖 [LibraryScreen] Continue Reading pressed: ${item.title}`);
    logFirebaseEvent('library_reading_card_pressed', {
      manga_id: item.mangaId,
      manga_title: item.title,
      season_number: item.seasonNumber,
      episode_number: item.episodeNumber,
      progress: item.progress,
      screen: 'LibraryScreen',
    });
    // Log episode name-based event: ep{number}_{manga_name}_continued
    logEpisodeContinued(
      item.title,
      item.mangaId,
      item.episodeNumber,
      item.id,
      item.progress || 0,
      {
        screen: 'LibraryScreen',
        season_number: item.seasonNumber,
      }
    );
    
    // Navigate to HomeDetail with activeSeasonNumber for ChaptersListModal
    navigation.navigate('HomeDetail', {
      mangaId: Number(item.mangaId),
      activeSeasonNumber: item.seasonNumber,
    });
  }, [navigation, logFirebaseEvent]);

  const handleSavedItemPress = useCallback((item: SavedItem & { mangaId?: string }) => {
    const mangaId = item.mangaId || item.id;
    console.log(`📚 [LibraryScreen] Saved Card pressed: ${item.title}`);
    logFirebaseEvent('library_saved_card_pressed', {
      manga_id: mangaId,
      manga_title: item.title,
      rating: item.rating,
      screen: 'LibraryScreen',
    });
    // Log manga name-based event: {manga_name}_pressed
    logMangaPressed(item.title, mangaId, {
      screen: 'LibraryScreen',
      section: 'saved',
      rating: item.rating,
    });
    
    // Navigate to HomeDetail with manga ID
    navigation.navigate('HomeDetail', {
      mangaId: Number(mangaId),
    });
  }, [navigation, logFirebaseEvent]);

  const handleSavePress = useCallback((item: SavedItem & { mangaId?: string }) => {
    if (!userId) return;
    const mangaId = item.mangaId || item.id;
    
    console.log(`🗑️ [LibraryScreen] Unsave pressed: ${item.title}`);
    logFirebaseEvent('library_unsave_pressed', {
      manga_id: mangaId,
      manga_title: item.title,
      screen: 'LibraryScreen',
    });
    
    // Show confirmation alert before unsaving
    showWarningAlert(
      'Unsave Manga',
      `Are you sure you want to remove "${item.title}" from your saved list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Remove',
          style: 'destructive',
          onPress: () => {
            // Log manga name-based event: {manga_name}_unsaved
            logMangaUnsaved(item.title, mangaId, {
              screen: 'LibraryScreen',
            });
            dispatch(removeSavedManga({
              userId,
              mangaId: String(mangaId),
            }));
          },
        },
      ]
    );
  }, [userId, dispatch, showWarningAlert, logFirebaseEvent]);

  const handleDownloadedEpisodePress = useCallback((item: DownloadedEpisodeItem) => {
    console.log(`📥 [LibraryScreen] Downloaded Episode pressed: ${item.episodeTitle}`);
    logFirebaseEvent('library_download_card_pressed', {
      manga_id: item.mangaId,
      manga_title: item.mangaTitle,
      episode_id: item.episodeId,
      episode_number: item.episodeNumber,
      episode_title: item.episodeTitle,
      screen: 'LibraryScreen',
    });
    // Log episode name-based event: ep{number}_{manga_name}_opened
    logEpisodeOpened(
      item.mangaTitle,
      item.mangaId,
      item.episodeNumber,
      item.episodeId,
      {
        screen: 'LibraryScreen',
        section: 'downloads',
        episode_title: item.episodeTitle,
      }
    );
    
    // Create manga and chapter objects for PDFReader
    const manga = {
      id: item.mangaId,
      title: item.mangaTitle,
      coverImage: item.coverImage,
      totalChapters: 1,
      chapters: [{
        id: item.episodeId,
        number: item.episodeNumber,
        title: item.episodeTitle,
        pdfUrl: item.localFilePath, // Use local file path
        isDownloaded: true,
      }],
      rating: item.rating,
    };
    
    const chapter = {
      id: item.episodeId,
      number: item.episodeNumber,
      title: item.episodeTitle,
      pdfUrl: item.localFilePath, // Use local file path
      isDownloaded: true,
    };
    
    // Navigate to PDFReader with proper manga/chapter objects
    navigation.navigate('PDFReader', {
      manga,
      chapter,
    });
  }, [navigation, logFirebaseEvent]);

  const handleDeleteDownloadedEpisode = useCallback((item: DownloadedEpisodeItem) => {
    if (!userId) return;
    
    console.log(`🗑️ [LibraryScreen] Delete download pressed: ${item.episodeTitle}`);
    logFirebaseEvent('library_delete_download_pressed', {
      manga_id: item.mangaId,
      manga_title: item.mangaTitle,
      episode_id: item.episodeId,
      episode_title: item.episodeTitle,
      screen: 'LibraryScreen',
    });
    
    // Show confirmation alert before deleting
    showWarningAlert(
      'Delete Download',
      `Are you sure you want to delete "${item.episodeTitle}" from your downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            console.log(`[DownloadDelete] Removing episode ${item.episodeId} from manga ${item.mangaId}`);
            logFirebaseEvent('library_delete_download_confirmed', {
              manga_id: item.mangaId,
              episode_id: item.episodeId,
              screen: 'LibraryScreen',
            });
            
            // Remove single episode download
            dispatch(removeDownload({
              userId,
              mangaId: item.mangaId,
              episodeId: item.episodeId,
            }));
          },
        },
      ]
    );
  }, [userId, dispatch, showWarningAlert, logFirebaseEvent]);

  const renderReadingItem: ListRenderItem<ContinueReadingCardItem> = useCallback(({ item }) => (
    <ReadingCard item={item} onPress={() => handleReadingItemPress(item)} />
  ), [handleReadingItemPress]);

  const renderSavedItem: ListRenderItem<SavedItem> = useCallback(({ item }) => (
    <SavedCard 
      item={item} 
      onPress={handleSavedItemPress} 
      onSavePress={handleSavePress}
      showSaveIcon={true}
    />
  ), [handleSavedItemPress, handleSavePress]);

  const renderDownloadedEpisodeItem: ListRenderItem<DownloadedEpisodeItem> = useCallback(({ item }) => (
    <DownloadedEpisodeCard 
      item={item} 
      onPress={() => handleDownloadedEpisodePress(item)} 
      onDeletePress={() => handleDeleteDownloadedEpisode(item)}
    />
  ), [handleDownloadedEpisodePress, handleDeleteDownloadedEpisode]);

  const keyExtractor = useCallback((item: ContinueReadingCardItem | SavedItem | DownloadedEpisodeItem) => item.id, []);

  const tabs = useMemo(() => [
    { key: 'reading' as TabType, title: 'Reading' },
    { key: 'saved' as TabType, title: 'Saved' },
    { key: 'download' as TabType, title: 'Download' },
  ], []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'reading':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            {continueReadingData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No manga in progress</Text>
                <Text style={styles.emptySubtext}>Start reading to see your progress here</Text>
              </View>
            ) : (
              <FlatList
                key="reading-list"
                data={continueReadingData}
                renderItem={renderReadingItem}
                keyExtractor={keyExtractor}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        );
      case 'saved':
        return (
          <View style={styles.tabContent}>
            {savedMangaData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No saved manga</Text>
                <Text style={styles.emptySubtext}>Save manga to access them here</Text>
              </View>
            ) : (
              <FlatList
                key="saved-list"
                data={savedMangaData}
                renderItem={renderSavedItem}
                keyExtractor={keyExtractor}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        );
      case 'download':
        return (
          <View style={styles.tabContent}>
            {downloadedEpisodesData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No downloads</Text>
                <Text style={styles.emptySubtext}>Download manga for offline reading</Text>
              </View>
            ) : (
              <FlatList
                key="download-list"
                data={downloadedEpisodesData}
                renderItem={renderDownloadedEpisodeItem}
                keyExtractor={keyExtractor}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  }, [activeTab, styles, renderReadingItem, renderSavedItem, renderDownloadedEpisodeItem, keyExtractor, continueReadingData, savedMangaData, downloadedEpisodesData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            title={tab.title}
            isActive={activeTab === tab.key}
            onPress={() => handleTabPress(tab.key)}
          />
        ))}
      </View>

      {/* Content */}
      {/* {isLoading ? (
        <LibraryContentSkeleton activeTab={activeTab} cardCount={4} />
      ) : ( */}
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => renderContent}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
      {/* )} */}
    </SafeAreaView>
  );
};

export default LibraryScreen;
