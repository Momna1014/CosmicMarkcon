import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackContentView } from '../../analytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  logMangaViewed,
  logMangaSaved,
  logMangaUnsaved,
  logMangaShared,
  logMangaReadingStarted,
  logEpisodeOpened,
  logEpisodeDownloaded,
  logMangaAllDownloaded,
} from '../../utils/mangaAnalytics';
import Share from 'react-native-share';
import { useStyles } from './styles';
import { ChaptersTab, AboutTab, ReviewsTab, ChaptersListModal, Episode, Review, Chapter, Season } from '../../components/HomeDetailComponent';
import { MangaService, MangaDetail, MangaDetailResponse, MangaEpisode, MangaSeason, MangaComment, CommentService } from '../../services/mangaApi';
import { getRelativeTime } from '../../utils/timeUtils';
import { UserStorage } from '../../utils/userStorage';
import { RootState, AppDispatch } from '../../redux/store';
import { useCompletedEpisodes, useEpisodesProgressMap } from '../../hooks/useReadingProgress';
import { saveManga, removeSavedManga } from '../../redux/slices/savedMangaSlice';
import { useDownload } from '../../hooks/useDownload';
import { useAlert } from '../../contexts/AlertContext';

// Import SVG Icons
import BackIcon from '../../assets/icons/svgicons/MeSvgIcons/right_arrow.svg';
import ShareIcon from '../../assets/icons/svgicons/HomeSvgIcons/share.svg';
import SaveIcon from '../../assets/icons/svgicons/HomeSvgIcons/save.svg';
import SavedIcon from '../../assets/icons/svgicons/MeSvgIcons/saved.svg';
import StarIcon from '../../assets/icons/svgicons/HomeSvgIcons/star.svg';
import WatchIcon from '../../assets/icons/svgicons/HomeSvgIcons/watch.svg';
import EyeIcon from '../../assets/icons/svgicons/HomeSvgIcons/eye.svg';
import { moderateScale, verticalScale, horizontalScale, Colors, FontFamilies } from '../../theme';

// Header height constant
const HEADER_HEIGHT = verticalScale(56);
// Scroll threshold to show header (after cover image)
const SCROLL_THRESHOLD = verticalScale(300);

type TabType = 'chapters' | 'about' | 'reviews';

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  styles: ReturnType<typeof useStyles>;
}

const TabButton: React.FC<TabButtonProps> = memo(({ title, isActive, onPress, styles }) => (
  <TouchableOpacity
    style={styles.tabButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
    {isActive && <View style={styles.tabIndicator} />}
  </TouchableOpacity>
));

TabButton.displayName = 'TabButton';

type Props = {
  navigation: any;
  route?: any;
};

const HomeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { showWarningAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabType>('chapters');
  const [showChaptersModal, setShowChaptersModal] = useState(false);

  // ===== Analytics: Track screen view =====
  useScreenView('HomeDetailScreen', {
    screen_category: 'manga_detail',
    manga_id: route?.params?.mangaId?.toString() || 'unknown',
    previous_screen: route?.params?.from || 'unknown',
  });

  /**
   * Log Firebase event helper
   * @param eventName - Name of the event
   * @param params - Optional event parameters
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [HomeDetailScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view to Firebase on mount
  useEffect(() => {
    console.log('📱 [HomeDetailScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('HomeDetailScreen', 'HomeDetailScreen');
    logFirebaseEvent('home_detail_screen_viewed', {
      manga_id: route?.params?.mangaId?.toString() || 'unknown',
      timestamp: Date.now(),
    });
  }, [logFirebaseEvent, route?.params?.mangaId]);

  // Scroll tracking for glass header
  const [showGlassHeader, setShowGlassHeader] = useState(false);

  // Get manga ID and active season from route params
  const mangaId = route?.params?.mangaId;
  const activeSeasonNumber = route?.params?.activeSeasonNumber;

  // Initialize selectedChapter from route params (when coming from Library) or default to 1
  const [selectedChapter, setSelectedChapter] = useState(activeSeasonNumber || 1);

  // Get userId from Redux
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Check if manga is saved
  const isSaved = useSelector((state: RootState) => {
    if (!userId || !mangaId) return false;
    return !!state.savedManga?.users?.[userId]?.[String(mangaId)];
  });

  // Get completed episodes for this manga from Redux
  const completedEpisodeIds = useCompletedEpisodes(userId, String(mangaId || ''));

  // Get all episodes progress for this manga (for showing Reading Now X%)
  const episodesProgressMap = useEpisodesProgressMap(userId, String(mangaId || ''));

  // Download functionality
  const { downloadEpisode, downloadAllEpisodes, isEpisodeDownloaded } = useDownload(userId);

  // Get downloaded episodes from Redux
  const downloadedManga = useSelector((state: RootState) => {
    if (!userId || !mangaId) return null;
    return state.downloads?.users?.[userId]?.[String(mangaId)] || null;
  }, shallowEqual);

  // Get active downloads from Redux - use deep comparison via JSON serialization
  // This ensures re-renders when progress values change
  const activeDownloads = useSelector(
    (state: RootState) => state.downloads?.activeDownloads || {},
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  
  // State for Download All loading
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Create set of downloaded episode IDs
  const downloadedEpisodeIds = useMemo(() => {
    if (!downloadedManga?.episodes) return new Set<string>();
    return new Set<string>(Object.keys(downloadedManga.episodes));
  }, [downloadedManga?.episodes]);

  // Get manga reading progress from Redux (to determine last read episode)
  const mangaReadingProgress = useSelector((state: RootState) => {
    if (!userId || !mangaId) return null;
    return state.readingProgress?.users?.[userId]?.[String(mangaId)] || null;
  });

  // State for API data
  const [mangaDetail, setMangaDetail] = useState<MangaDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);

  // Log manga viewed event with manga name when detail is loaded
  useEffect(() => {
    if (mangaDetail) {
      // Log manga name-based event: {manga_name}_viewed
      logMangaViewed(mangaDetail.title, mangaDetail.id, {
        screen: 'HomeDetailScreen',
        rating: mangaDetail.rating,
        category: mangaDetail.categories?.[0]?.name,
      });
    }
  }, [mangaDetail]);

  // State for like/delete functionality
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<MangaComment[]>([]);
  
  // Use ref for liked comment IDs to avoid re-render loops
  const likedCommentIdsRef = useRef<Set<string>>(new Set());

  // View recording timer refs
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewRecordedRef = useRef<boolean>(false);
  const lastMangaIdRef = useRef<string | number | null>(null);

  // Reset view recorded state when manga changes
  useEffect(() => {
    if (mangaId !== lastMangaIdRef.current) {
      lastMangaIdRef.current = mangaId;
      viewRecordedRef.current = false;
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    }
  }, [mangaId]);

  /**
   * Fetch manga detail from API
   */
  const fetchMangaDetail = useCallback(async (showLoading = true) => {
    if (!mangaId) {
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response: MangaDetailResponse = await MangaService.getMangaDetail({
        manga_id: typeof mangaId === 'string' ? parseInt(mangaId, 10) : mangaId,
        user_id: userId || undefined,
      });

      // Log the full response to console
      console.log('📚 Manga Detail API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        setMangaDetail(response.data);
        console.log(`✅ Successfully fetched manga detail: ${response.data.title}`);
      } else {
        setError(response.message);
        console.error('❌ API returned success: false', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch manga detail';
      setError(errorMessage);
      console.error('❌ Failed to fetch manga detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mangaId, userId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMangaDetail();
  }, [fetchMangaDetail]);

  // Record view after 10 seconds of viewing manga detail
  // Only fires once per screen mount, cancels if user navigates back (unmounts)
  useEffect(() => {
    // Only start timer if manga detail loaded and not already recorded
    if (mangaDetail && mangaId && userId && !viewRecordedRef.current) {
      console.log('⏱️ Starting 10 second view timer for manga:', mangaDetail.title);
      
      viewTimerRef.current = setTimeout(async () => {
        if (!viewRecordedRef.current) {
          viewRecordedRef.current = true;
          try {
            const response = await MangaService.recordView({
              manga_id: typeof mangaId === 'string' ? parseInt(mangaId, 10) : mangaId,
              user_id: userId,
            });
            
            if (response.success) {
              console.log('✅ View recorded successfully:', response.data);
            } else {
              console.log('❌ Failed to record view:', response.message);
            }
          } catch (err) {
            console.error('❌ Error recording view:', err);
          }
        }
      }, 10000); // 10 seconds
    }

    // Cleanup - clear timer when component unmounts (user goes back)
    return () => {
      if (viewTimerRef.current) {
        console.log('⏱️ View timer cleared (user left screen)');
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    };
  }, [mangaDetail, mangaId, userId]);

  /**
   * Fetch comments from API with proper user_liked status
   * Similar to ReviewsDetail implementation
   */
  const fetchComments = useCallback(async () => {
    if (!mangaId) return;

    try {
      const response = await CommentService.getComments({
        manga_id: typeof mangaId === 'string' ? parseInt(mangaId, 10) : mangaId,
        user_id: userId || undefined,
      });

      if (__DEV__) {
        console.log('📝 Comments API Response:', JSON.stringify(response, null, 2));
      }

      if (response.success) {
        // Sort by created_at descending (latest first)
        const sortedData = [...response.data].sort((a, b) => {
          const dateA = a.created_at.replace(' ', 'T');
          const dateB = b.created_at.replace(' ', 'T');
          return dateB.localeCompare(dateA);
        });

        // Sync local storage with API's user_liked data
        if (userId) {
          sortedData.forEach((c) => {
            if (c.user_liked !== undefined) {
              const commentId = c.id.toString();
              if (c.user_liked) {
                likedCommentIdsRef.current.add(commentId);
              } else {
                likedCommentIdsRef.current.delete(commentId);
              }
            }
          });
          // Persist synced data to storage
          UserStorage.saveLikedComments(userId, likedCommentIdsRef.current);
        }

        setLocalComments(sortedData);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to fetch comments:', error);
      }
    }
  }, [mangaId, userId]);

  // Load liked comments from storage and fetch comments on mount
  useEffect(() => {
    const initializeComments = async () => {
      if (userId) {
        const storedLikedComments = await UserStorage.getLikedComments(userId);
        likedCommentIdsRef.current = storedLikedComments;
        
        if (__DEV__) {
          console.log('📖 Loaded liked comments from storage:', Array.from(storedLikedComments));
        }
      }
      
      // Fetch comments from API
      await fetchComments();
    };
    
    initializeComments();
  }, [userId, mangaId, fetchComments]);

  // Refresh data when screen comes into focus (returning from ReviewsDetail)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh without showing loading spinner
      if (mangaDetail) {
        fetchMangaDetail(false);
        fetchComments();
      }
    });

    return unsubscribe;
  }, [navigation, fetchMangaDetail, fetchComments, mangaDetail]);

  /**
   * Convert API episodes to Episode format for ChaptersTab
   */
  const episodesData: Episode[] = useMemo(() => {
    if (!mangaDetail?.seasons?.length) return [];
    
    const allEpisodes: Episode[] = [];
    mangaDetail.seasons.forEach((season: MangaSeason) => {
      season.episodes.forEach((ep: MangaEpisode) => {
        allEpisodes.push({
          id: ep.id.toString(),
          episodeNumber: `Episode ${String(ep.episode_number).padStart(2, '0')}`,
          title: ep.title,
          pdfUrl: ep.pdf_file,
          seasonId: season.id.toString(),
          seasonNumber: season.season_number,
          seasonTitle: season.title,
        });
      });
    });
    return allEpisodes;
  }, [mangaDetail]);

  /**
   * Filter episodes by selected chapter (season)
   */
  const filteredEpisodesData: Episode[] = useMemo(() => {
    return episodesData.filter(ep => ep.seasonNumber === selectedChapter);
  }, [episodesData, selectedChapter]);

  /**
   * Convert API seasons to seasons list for modal (seasons = chapters in UI)
   */
  const seasonsListData = useMemo(() => {
    if (!mangaDetail?.seasons?.length) return [];
    
    return mangaDetail.seasons.map((season: MangaSeason) => ({
      id: season.id.toString(),
      number: season.season_number,
      title: season.title,
      episodeCount: season.episodes?.length || season.total_episodes || 0,
      episodes: season.episodes.map((ep: MangaEpisode) => ({
        id: ep.id.toString(),
        number: ep.episode_number,
        title: ep.title,
        pdfUrl: ep.pdf_file,
      })),
    }));
  }, [mangaDetail]);

  /**
   * Convert API data to chapters list for modal (legacy - for older modal format)
   */
  const chaptersListData: Chapter[] = useMemo(() => {
    return episodesData.map((ep, index) => ({
      id: ep.id,
      number: index + 1,
      title: `Chapter ${String(index + 1).padStart(2, '0')}`,
    }));
  }, [episodesData]);

  /**
   * Convert API comments to Review format for ReviewsTab
   * Only show latest 5 comments in the preview
   */
  const reviewsData: Review[] = useMemo(() => {
    if (!localComments?.length) return [];
    
    // Only take the first 5 comments for the preview
    return localComments.slice(0, 5).map((comment: MangaComment) => ({
      id: comment.id.toString(),
      username: comment.user_name,
      timeAgo: getRelativeTime(comment.created_at),
      text: comment.comment,
      likes: comment.likes || 0,
      // Prefer API's user_liked flag, fallback to local storage
      isLiked: comment.user_liked !== undefined 
        ? comment.user_liked 
        : likedCommentIdsRef.current.has(comment.id.toString()),
      isOwn: userId ? comment.user_id === userId : false,
    }));
  }, [localComments, userId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle scroll events to show/hide glass header
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowGlassHeader(offsetY > SCROLL_THRESHOLD);
  }, []);

  const handleShare = useCallback(async () => {
    if (!mangaDetail) return;
    
    // Log share attempt
    console.log('📤 [HomeDetailScreen] Share button pressed for manga:', mangaDetail.title);
    logFirebaseEvent('manga_share_initiated', {
      manga_id: mangaId?.toString() || 'unknown',
      manga_title: mangaDetail.title,
      screen: 'HomeDetailScreen',
    });
    
    try {
      const shareOptions = {
        title: mangaDetail.title,
        message: `Check out "${mangaDetail.title}" by ${mangaDetail.author}!\n\n${mangaDetail.description?.substring(0, 150)}${mangaDetail.description && mangaDetail.description.length > 150 ? '...' : ''}`,
        url: mangaDetail.image,
      };
      
      await Share.open(shareOptions);
      
      // Log successful share with manga name-based event: {manga_name}_shared
      console.log('✅ [HomeDetailScreen] Share completed successfully');
      logMangaShared(mangaDetail.title, mangaId || '', {
        screen: 'HomeDetailScreen',
      });
      // Track Facebook share event
      trackContentView('article', mangaId?.toString() || '', mangaDetail.title, 'share');
    } catch (error: any) {
      // User cancelled sharing or error occurred
      if (error?.message !== 'User did not share') {
        console.log('❌ [HomeDetailScreen] Share error:', error);
        logFirebaseEvent('manga_share_error', {
          manga_id: mangaId?.toString() || 'unknown',
          error: error?.message || 'unknown_error',
        });
      } else {
        console.log('🚫 [HomeDetailScreen] Share cancelled by user');
        logFirebaseEvent('manga_share_cancelled', {
          manga_id: mangaId?.toString() || 'unknown',
        });
      }
    }
  }, [mangaDetail, mangaId, logFirebaseEvent]);

  const handleSave = useCallback(() => {
    if (!userId || !mangaId || !mangaDetail) return;

    if (isSaved) {
      // Remove from saved
      console.log('🗑️ [HomeDetailScreen] Removing manga from saved:', mangaDetail.title);
      // Log manga name-based event: {manga_name}_unsaved
      logMangaUnsaved(mangaDetail.title, mangaId, {
        screen: 'HomeDetailScreen',
      });
      dispatch(removeSavedManga({
        userId,
        mangaId: String(mangaId),
      }));
    } else {
      // Add to saved
      console.log('💾 [HomeDetailScreen] Saving manga:', mangaDetail.title);
      // Log manga name-based event: {manga_name}_saved
      logMangaSaved(mangaDetail.title, mangaId, {
        screen: 'HomeDetailScreen',
        rating: mangaDetail.rating,
      });
      // Track Facebook add to wishlist event
      trackContentView('article', mangaId?.toString() || '', mangaDetail.title, 'saved');
      dispatch(saveManga({
        userId,
        mangaId: String(mangaId),
        title: mangaDetail.title,
        coverImage: mangaDetail.image || '',
        rating: mangaDetail.rating || 0,
      }));
    }
  }, [userId, mangaId, mangaDetail, isSaved, dispatch]);

  /**
   * Get the episode to read (resume from last read, or start from 1)
   */
  const readingButtonInfo = useMemo(() => {
    // If there's reading progress for this manga
    if (mangaReadingProgress?.lastReadEpisodeId) {
      const lastReadEpisode = mangaReadingProgress.episodes[mangaReadingProgress.lastReadEpisodeId];
      if (lastReadEpisode && !lastReadEpisode.isCompleted) {
        // Find the episode in episodesData
        const episodeIndex = episodesData.findIndex(ep => ep.id === lastReadEpisode.episodeId);
        if (episodeIndex !== -1) {
          return {
            text: `Continue Chapter ${lastReadEpisode.episodeNumber}`,
            episodeIndex,
            episodeNumber: lastReadEpisode.episodeNumber,
          };
        }
      }
    }
    // Default to first chapter
    return {
      text: 'Start Reading Chapter 1',
      episodeIndex: 0,
      episodeNumber: 1,
    };
  }, [mangaReadingProgress, episodesData]);

  const handleReadChapter = useCallback(() => {
    if (!mangaDetail) return;
    
    // Log reading event
    console.log('📖 [HomeDetailScreen] Start reading chapter:', readingButtonInfo.episodeNumber);
    logFirebaseEvent('manga_reading_started', {
      manga_id: mangaDetail.id?.toString() || 'unknown',
      manga_title: mangaDetail.title,
      chapter_number: readingButtonInfo.episodeNumber,
      is_continuing: readingButtonInfo.text.includes('Continue'),
      screen: 'HomeDetailScreen',
    });
    // Log manga name-based event: {manga_name}_reading_started
    logMangaReadingStarted(mangaDetail.title, mangaDetail.id, readingButtonInfo.episodeNumber, {
      screen: 'HomeDetailScreen',
      is_continuing: readingButtonInfo.text.includes('Continue'),
    });
    // Track Facebook content view
    trackContentView('article', mangaDetail.id?.toString() || '', mangaDetail.title, 'reading');
    
    // Use the episode from readingButtonInfo (either resume or start fresh)
    const episode = episodesData[readingButtonInfo.episodeIndex];
    if (episode?.pdfUrl) {
      navigation.navigate('PDFReader', {
        manga: {
          id: mangaDetail.id,
          title: mangaDetail.title,
          coverImage: mangaDetail.image,
          totalChapters: episodesData.length,
          chapters: episodesData.map((ep, index) => ({
            id: ep.id,
            number: index + 1,
            title: ep.title,
            pdfUrl: ep.pdfUrl || '',
            isDownloaded: false,
            isLocked: false,
          })),
        },
        chapter: {
          id: episode.id,
          number: readingButtonInfo.episodeNumber,
          title: episode.title,
          pdfUrl: episode.pdfUrl,
          isDownloaded: false,
          isLocked: false,
        },
        seasonNumber: episode.seasonNumber || 1,
      });
    }
  }, [navigation, mangaDetail, episodesData, readingButtonInfo, logFirebaseEvent]);

  const handleTabPress = useCallback((tab: TabType) => {
    console.log('🗂️ [HomeDetailScreen] Tab pressed:', tab);
    logFirebaseEvent('home_detail_tab_changed', {
      tab_name: tab,
      manga_id: mangaId?.toString() || 'unknown',
      screen: 'HomeDetailScreen',
    });
    setActiveTab(tab);
  }, [mangaId, logFirebaseEvent]);

  const handleEpisodePress = useCallback((episode: Episode) => {
    if (!mangaDetail) return;
    
    // Get episode number from episodeNumber string (e.g., 'Episode 01' -> 1)
    const episodeNum = parseInt(episode.episodeNumber.replace(/\D/g, ''), 10) || 1;
    
    // Log episode press event
    console.log('📚 [HomeDetailScreen] Episode pressed:', episode.title);
    logFirebaseEvent('manga_episode_selected', {
      manga_id: mangaDetail.id?.toString() || 'unknown',
      manga_title: mangaDetail.title,
      episode_id: episode.id,
      episode_number: episodeNum,
      episode_title: episode.title,
      screen: 'HomeDetailScreen',
    });
    // Log episode name-based event: ep{number}_{manga_name}_opened
    logEpisodeOpened(mangaDetail.title, mangaDetail.id, episodeNum, episode.id, {
      screen: 'HomeDetailScreen',
      episode_title: episode.title,
      season_number: episode.seasonNumber,
    });
    
    // Navigate to PDF Reader with the episode's PDF
    if (episode.pdfUrl) {
      navigation.navigate('PDFReader', {
        manga: {
          id: mangaDetail.id,
          title: mangaDetail.title,
          coverImage: mangaDetail.image,
          totalChapters: episodesData.length,
          chapters: episodesData.map((ep, index) => ({
            id: ep.id,
            number: index + 1,
            title: ep.title,
            pdfUrl: ep.pdfUrl || '',
            isDownloaded: false,
            isLocked: false,
          })),
        },
        chapter: {
          id: episode.id,
          number: episodeNum,
          title: episode.title,
          pdfUrl: episode.pdfUrl,
          isDownloaded: false,
          isLocked: false,
        },
        seasonNumber: episode.seasonNumber || 1,
      });
    } else {
      console.log('⚠️ [HomeDetailScreen] Episode pressed (no PDF URL):', episode.title);
    }
  }, [navigation, mangaDetail, episodesData, logFirebaseEvent]);

  const handleDownloadPress = useCallback(async (episode: Episode) => {
    if (!mangaDetail || !episode.pdfUrl) {
      console.log('Cannot download - missing data:', episode.title);
      return;
    }

    // Check if already downloaded
    if (isEpisodeDownloaded(String(mangaId), episode.id)) {
      console.log('Episode already downloaded:', episode.title);
      return;
    }

    const episodeNum = parseInt(episode.episodeNumber.replace(/\D/g, ''), 10) || 1;

    const success = await downloadEpisode({
      mangaId: String(mangaId),
      mangaTitle: mangaDetail.title,
      coverImage: mangaDetail.image || '',
      rating: mangaDetail.rating || 0,
      episodeId: episode.id,
      episodeNumber: episodeNum,
      episodeTitle: episode.title,
      pdfUrl: episode.pdfUrl,
    });

    if (success) {
      console.log('Episode downloaded successfully:', episode.title);
      // Log episode name-based event: ep{number}_{manga_name}_downloaded
      logEpisodeDownloaded(mangaDetail.title, mangaId || '', episodeNum, episode.id, {
        screen: 'HomeDetailScreen',
        episode_title: episode.title,
      });
    }
  }, [mangaId, mangaDetail, downloadEpisode, isEpisodeDownloaded]);

  const handleDownloadAll = useCallback(async () => {
    if (!mangaDetail) {
      console.log('Cannot download all - missing manga data');
      return;
    }

    // Convert episodes to download format (using episodesData which includes all episodes from API)
    const episodesToDownload = episodesData
      .filter(episode => episode.pdfUrl)
      .map(episode => ({
        episodeId: episode.id,
        episodeNumber: parseInt(episode.episodeNumber.replace(/\D/g, ''), 10) || 1,
        episodeTitle: episode.title,
        pdfUrl: episode.pdfUrl!,
      }));

    if (episodesToDownload.length === 0) {
      console.log('No episodes with PDF URLs to download');
      return;
    }

    setIsDownloadingAll(true);
    
    const success = await downloadAllEpisodes(
      String(mangaId),
      mangaDetail.title,
      mangaDetail.image || '',
      mangaDetail.rating || 0,
      episodesToDownload
    );

    setIsDownloadingAll(false);

    if (success) {
      console.log('All episodes downloaded successfully');
      // Log manga name-based event: {manga_name}_all_downloaded
      logMangaAllDownloaded(mangaDetail.title, mangaId || '', episodesToDownload.length, {
        screen: 'HomeDetailScreen',
      });
    }
  }, [mangaId, mangaDetail, episodesData, downloadAllEpisodes]);

  const handleChapterDropdownPress = useCallback(() => {
    setShowChaptersModal(true);
  }, []);

  const handleChapterSelect = useCallback((chapter: Chapter) => {
    setSelectedChapter(chapter.number);
    console.log('Chapter selected:', chapter.title);
  }, []);

  /**
   * Handle season selection from ChaptersListModal
   * Sets the selected chapter (season) to filter episodes
   */
  const handleSeasonSelect = useCallback((season: Season) => {
    setSelectedChapter(season.number);
    console.log('Season selected:', season.title);
  }, []);

  const handleCloseChaptersModal = useCallback(() => {
    setShowChaptersModal(false);
  }, []);

  const handleViewAllReviews = useCallback(() => {
    navigation.navigate('ReviewsDetail', { 
      mangaTitle: mangaDetail?.title || 'Manga',
      mangaId: mangaDetail?.id,
    });
  }, [navigation, mangaDetail?.title, mangaDetail?.id]);

  /**
   * Handle like/unlike press
   * API toggles the like state - we wait for response instead of optimistic update
   */
  const handleLikePress = useCallback(async (review: Review) => {
    if (!userId) return;

    setLikingCommentId(review.id);

    try {
      const response = await CommentService.likeComment({
        comment_id: parseInt(review.id, 10),
        user_id: userId,
      });

      if (response.success) {
        const isNowLiked = response.data.user_like === 'like';
        
        // Update local comments with actual state from server
        setLocalComments(prev => prev.map(c => 
          c.id.toString() === review.id 
            ? { ...c, likes: response.data.likes, user_liked: isNowLiked }
            : c
        ));
        
        // Sync local storage with server state
        if (isNowLiked) {
          likedCommentIdsRef.current.add(review.id);
          UserStorage.addLikedComment(userId, review.id);
        } else {
          likedCommentIdsRef.current.delete(review.id);
          UserStorage.removeLikedComment(userId, review.id);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to toggle like:', error);
      }
    } finally {
      setLikingCommentId(null);
    }
  }, [userId]);

  /**
   * Handle delete press - only for own comments
   * Shows confirmation alert before deleting
   */
  const handleDeletePress = useCallback((review: Review) => {
    if (!userId || !mangaId) return;

    showWarningAlert(
      'Delete Comment',
      'Are you sure you want to delete your comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setDeletingCommentId(review.id);

            // Optimistic update - remove comment immediately
            setLocalComments(prev => prev.filter(c => c.id.toString() !== review.id));

            try {
              const response = await CommentService.deleteComment({
                comment_id: parseInt(review.id, 10),
                manga_id: typeof mangaId === 'string' ? parseInt(mangaId, 10) : mangaId,
                user_id: userId,
              });

              if (!response.success) {
                // Refresh to get accurate data on failure
                await fetchComments();
              }
            } catch (error) {
              if (__DEV__) {
                console.error('❌ Failed to delete comment:', error);
              }
              // Rollback on error - refresh 
              await fetchComments();
            } finally {
              setDeletingCommentId(null);
            }
          },
        },
      ]
    );
  }, [userId, mangaId, fetchComments, showWarningAlert]);

  const tabs = useMemo(() => [
    { key: 'chapters' as TabType, title: 'Chapters' },
    { key: 'about' as TabType, title: 'About' },
    { key: 'reviews' as TabType, title: 'Reviews' },
  ], []);

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'chapters':
        return (
          <ChaptersTab
            episodes={filteredEpisodesData}
            selectedChapter={selectedChapter}
            onEpisodePress={handleEpisodePress}
            onDownloadPress={handleDownloadPress}
            onDownloadAll={handleDownloadAll}
            onChapterDropdownPress={handleChapterDropdownPress}
            completedEpisodeIds={completedEpisodeIds}
            episodesProgressMap={episodesProgressMap}
            downloadedEpisodeIds={downloadedEpisodeIds}
            activeDownloads={activeDownloads}
            isDownloadingAll={isDownloadingAll}
            userId={userId}
            mangaId={String(mangaId)}
          />
        );
      case 'about':
        return (
          <AboutTab
            synopsis={mangaDetail?.description || ''}
            views={`${mangaDetail?.total_views || 0} `}
            status={mangaDetail?.status || 'Unknown'}
            language="English"
          />
        );
      case 'reviews':
        return (
          <ReviewsTab
            reviews={reviewsData}
            onViewAll={handleViewAllReviews}
            onLikePress={handleLikePress}
            onDeletePress={handleDeletePress}
            likingCommentId={likingCommentId}
            deletingCommentId={deletingCommentId}
          />
        );
      default:
        return null;
    }
  }, [activeTab, mangaDetail, selectedChapter, filteredEpisodesData, reviewsData, likingCommentId, deletingCommentId, completedEpisodeIds, episodesProgressMap, downloadedEpisodeIds, activeDownloads, isDownloadingAll, userId, mangaId, handleEpisodePress, handleDownloadPress, handleDownloadAll, handleChapterDropdownPress, handleViewAllReviews, handleLikePress, handleDeletePress]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={glassHeaderStyles.mainContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  // Get first category as genre badge
  const genreBadge = mangaDetail?.categories?.[0]?.name || 'Manga';

  return (
    <View style={glassHeaderStyles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Section with Image and Icons */}
        <View style={styles.headerSection}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <BackIcon width={moderateScale(60)} height={moderateScale(60)}/>
          </TouchableOpacity>

          {/* Right Icons - Share & Save */}
          <View style={styles.rightIcons}>
            {/* <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <ShareIcon width={moderateScale(26)} height={moderateScale(26)} />
            </TouchableOpacity> */}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleSave}
              activeOpacity={0.7}
            >
              {isSaved ? (
                <SavedIcon width={moderateScale(40)} height={moderateScale(40)} />
              ) : (
                <SaveIcon width={moderateScale(37)} height={moderateScale(37)} />
              )}
            </TouchableOpacity>
          </View>

          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <FastImage
              source={{
                uri: mangaDetail?.image,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.coverImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            {/* Bottom Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.58)', Colors.background]}
              style={styles.imageOverlay}
            />
          </View>

          {/* Genre Badge - Positioned over the image */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{genreBadge}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{mangaDetail?.title || 'Loading...'}</Text>
        </View>

        {/* Stats Row - Rating, Chapters, Views */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StarIcon width={moderateScale(18)} height={moderateScale(18)} />
            <Text style={styles.statText}>{mangaDetail?.rating?.toFixed(1) || '0.0'}</Text>
          </View>
          <View style={styles.statItem}>
            <WatchIcon width={moderateScale(18)} height={moderateScale(18)} />
            <Text style={styles.statText}>{mangaDetail?.total_seasons || 0} Chapter</Text>
          </View>
          <View style={styles.statItem}>
            <EyeIcon width={moderateScale(18)} height={moderateScale(18)} />
            <Text style={styles.statText}>{mangaDetail?.total_views || 0} Views</Text>
          </View>
        </View>

        {/* Reading Button */}
        <View style={styles.readingButtonContainer}>
          <TouchableOpacity 
            style={styles.readingButton}
            onPress={handleReadChapter}
            activeOpacity={0.8}
          >
            <Text style={styles.readingButtonText}>{readingButtonInfo.text}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              title={tab.title}
              isActive={activeTab === tab.key}
              onPress={() => handleTabPress(tab.key)}
              styles={styles}
            />
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent}
        </View>
      </ScrollView>

      {/* Glass Header - Shows on scroll */}
      {showGlassHeader && (
        <View style={[glassHeaderStyles.glassHeaderContainer, { paddingTop: insets.top }]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={glassHeaderStyles.blurView}
              blurType="dark"
              blurAmount={moderateScale(10)}
              reducedTransparencyFallbackColor={Colors.background}
            />
          ) : (
            <View style={glassHeaderStyles.androidBlurFallback} />
          )}
          <View style={glassHeaderStyles.headerContent}>
            <TouchableOpacity
              style={glassHeaderStyles.backButtonGlass}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <BackIcon width={moderateScale(50)} height={moderateScale(50)} />
            </TouchableOpacity>
            <Text style={glassHeaderStyles.headerTitle} numberOfLines={1}>
              {mangaDetail?.title || 'Loading...'}
            </Text>
            <View style={glassHeaderStyles.headerRightSpacer} />
          </View>
        </View>
      )}

      {/* Chapters List Modal */}
      <ChaptersListModal
        visible={showChaptersModal}
        onClose={handleCloseChaptersModal}
        chapters={chaptersListData}
        onChapterSelect={handleChapterSelect}
        selectedChapter={selectedChapter}
        seasons={seasonsListData}
        onSeasonSelect={handleSeasonSelect}
        activeSeasonNumber={selectedChapter}
      />
    </View>
  );
};

// Glass header styles
const glassHeaderStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glassHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 11, 12, 0.92)',
  },
  headerContent: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(8),
  },
  backButtonGlass: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginHorizontal: horizontalScale(8),
  },
  headerRightSpacer: {
    width: horizontalScale(44),
  },
});

export default HomeDetailScreen;