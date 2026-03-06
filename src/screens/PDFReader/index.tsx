/**
 * PDFReaderScreen
 * 
 * Full screen PDF reader for manga/comic viewing
 * Features:
 * - PDF viewing from URL
 * - Fixed bottom tab (Chapters, Comments, Preference)
 * - Header with title, chapter info, and progress
 * - Panel sheets for each tab
 * - Reading progress tracking with Redux persistence
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  Text,
  TouchableOpacity,
  Animated,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Analytics imports
import { useScreenView } from '../../hooks/useFacebookAnalytics';
import { trackContentView } from '../../analytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  logEpisodeOpened,
  logEpisodeCompleted,
} from '../../utils/mangaAnalytics';
import {
  PDFViewer,
  ReaderHeader,
  ReaderBottomTab,
  ChaptersPanel,
  CommentsPanel,
  PreferencesPanel,
  PDFChapter,
  MangaInfo,
  ReaderComment,
  ReaderPreferences,
  ReaderBottomTabType,
} from '../../components/ComicReader';
import ChaptersListModal from '../../components/HomeDetailComponent/ChaptersListModal';
import { Colors, horizontalScale, moderateScale, radiusScale, verticalScale } from '../../theme';
import { RootState, AppDispatch } from '../../redux/store';
import { updateReadingProgress, saveProgressOnExit } from '../../redux/slices/readingProgressSlice';
import { useDownload } from '../../hooks/useDownload';

// Default preferences
const DEFAULT_PREFERENCES: ReaderPreferences = {
  scrollDirection: 'vertical',
  brightness: 100,
  enableDoubleTapZoom: true,
  showPageNumber: true,
  backgroundColor: Colors.background,
  keepScreenOn: true,
  cacheEnabled: true,
  autoNextChapter: true,
  readingMode: 'normal',
  fontSize: 'medium',
};

// Mock comments data
const MOCK_COMMENTS: ReaderComment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'MangaFan123',
    userAvatar: 'https://i.pravatar.cc/100?img=1',
    text: 'This chapter is amazing! The artwork is incredible.',
    likes: 24,
    timestamp: new Date(Date.now() - 3600000),
    isLiked: false,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'ComicLover',
    userAvatar: 'https://i.pravatar.cc/100?img=2',
    text: 'I love this story so much! Can\'t wait for the next chapter.',
    likes: 18,
    timestamp: new Date(Date.now() - 7200000),
    isLiked: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'ReaderPro',
    userAvatar: 'https://i.pravatar.cc/100?img=3',
    text: 'The plot twist at the end was unexpected!',
    likes: 42,
    timestamp: new Date(Date.now() - 86400000),
    isLiked: false,
  },
];

interface Props {
  navigation: any;
  route: {
    params: {
      manga: MangaInfo;
      chapter: PDFChapter;
      chapters?: PDFChapter[];
      seasonNumber?: number;
    };
  };
}

const PDFReaderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { manga, chapter, chapters = manga?.chapters || [], seasonNumber } = route.params || {};

  // ===== Analytics: Track screen view =====
  useScreenView('PDFReaderScreen', {
    screen_category: 'reader',
    manga_id: manga?.id?.toString() || 'unknown',
    chapter_id: chapter?.id?.toString() || 'unknown',
    chapter_number: chapter?.number?.toString() || 'unknown',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    console.log(`📊 [PDFReaderScreen] Firebase Event: ${eventName}`, params);
    firebaseService.logEvent(eventName, params);
  }, []);

  // Log screen view and reading start to Firebase on mount
  useEffect(() => {
    console.log('📱 [PDFReaderScreen] Screen mounted - logging Firebase screen view');
    firebaseService.logScreenView('PDFReaderScreen', 'PDFReaderScreen');
    logFirebaseEvent('pdf_reader_opened', {
      manga_id: manga?.id?.toString() || 'unknown',
      manga_title: manga?.title || 'unknown',
      chapter_id: chapter?.id?.toString() || 'unknown',
      chapter_number: chapter?.number || 0,
      chapter_title: chapter?.title || 'unknown',
      season_number: seasonNumber || 1,
      timestamp: Date.now(),
    });
    // Log episode name-based event: ep{number}_{manga_name}_opened
    if (manga?.title && chapter?.number) {
      logEpisodeOpened(manga.title, manga.id || '', chapter.number, chapter.id || '', {
        screen: 'PDFReaderScreen',
        episode_title: chapter.title,
        season_number: seasonNumber,
      });
    }
    // Track Facebook content view for reading
    trackContentView('article', chapter?.id?.toString() || '', `${manga?.title} - ${chapter?.title}`, 'reading');
  }, [logFirebaseEvent, manga, chapter, seasonNumber]);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.auth.userId);
  
  // Download hook for offline reading
  const { getLocalFilePath } = useDownload(userId);

  // Get all saved progress for the current manga to determine initial page
  const mangaProgress = useSelector((state: RootState) => {
    if (!userId || !manga?.id) return null;
    return state.readingProgress?.users?.[userId]?.[String(manga.id)] || null;
  });

  // Get saved progress for the initial chapter
  const savedProgress = mangaProgress?.episodes?.[chapter?.id] || null;

  // Determine initial page ONCE (resume from saved progress or start from 1)
  // Use useMemo to ensure this only computes once on mount
  const initialPageRef = useRef(savedProgress?.currentPage || 1);

  // State - only for things that need to trigger re-render
  const [currentChapter, setCurrentChapter] = useState<PDFChapter>(chapter);
  const [totalPages, setTotalPages] = useState(savedProgress?.totalPages || 0);
  const [activePanel, setActivePanel] = useState<ReaderBottomTabType | null>(null);
  const [chaptersModalVisible, setChaptersModalVisible] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [comments, setComments] = useState<ReaderComment[]>(MOCK_COMMENTS);
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [pdfKey, setPdfKey] = useState(0); // Key to force PDF re-render on direction change
  const [isAtBottom, setIsAtBottom] = useState(false);
  // Display page for header - only updates on significant changes
  const [displayPage, setDisplayPage] = useState(initialPageRef.current);
  
  // Refs for tracking position without causing re-renders
  const isAtTopRef = useRef(true);
  const showUIRef = useRef(true);
  
  // Refs for reading progress tracking (to avoid stale closures and re-renders)
  const currentPageRef = useRef(initialPageRef.current);
  const totalPagesRef = useRef(totalPages);
  const currentChapterRef = useRef(currentChapter);
  const mangaProgressRef = useRef(mangaProgress);
  const lastUpdateTimeRef = useRef(0);
  // Initialize to Date.now() to prevent immediate overwrite of initial displayPage
  const lastDisplayUpdateRef = useRef(Date.now());
  const THROTTLE_MS = 500; // Throttle updates to every 500ms
  const DISPLAY_UPDATE_MS = 1000; // Update display less frequently
  
  // Ref to track bottom state without re-renders
  const isAtBottomRef = useRef(false);
  
  // Animation for next chapter button
  const nextChapterOpacity = useRef(new Animated.Value(0)).current;
  
  const insets = useSafeAreaInsets();

  // Keep refs in sync (only for non-page refs to avoid loops)
  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  useEffect(() => {
    currentChapterRef.current = currentChapter;
  }, [currentChapter]);

  useEffect(() => {
    mangaProgressRef.current = mangaProgress;
  }, [mangaProgress]);

  /**
   * Save reading progress to Redux
   */
  const saveReadingProgress = useCallback((page: number, total: number, chapterData: PDFChapter, shouldLog = false) => {
    if (!userId || !manga?.id) return;

    const payload = {
      userId,
      mangaId: String(manga.id),
      mangaTitle: manga.title || 'Unknown',
      coverImage: manga.coverImage || '',
      rating: manga.rating,
      episodeId: String(chapterData.id),
      episodeNumber: chapterData.number,
      episodeTitle: chapterData.title || `Chapter ${chapterData.number}`,
      currentPage: page,
      totalPages: total,
      // Season info (defaults to season 1 if not provided)
      seasonId: seasonNumber ? String(seasonNumber) : '1',
      seasonNumber: seasonNumber || 1,
      seasonTitle: `Season ${seasonNumber || 1}`,
    };

    if (shouldLog) {
      dispatch(saveProgressOnExit(payload));
    } else {
      dispatch(updateReadingProgress(payload));
    }
  }, [userId, manga, seasonNumber, dispatch]);

  /**
   * Log Continue Reading navigation
   */
  useEffect(() => {
    if (savedProgress && savedProgress.currentPage > 1) {
      console.log(`[ContinueReading] Opening episode ${chapter?.id} at page ${savedProgress.currentPage}`);
    }
  }, []); // Only on mount

  /**
   * Handle app state changes - save progress when backgrounded
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Save progress on app background
        saveReadingProgress(
          currentPageRef.current,
          totalPagesRef.current,
          currentChapterRef.current,
          true
        );
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [saveReadingProgress]);

  /**
   * Save progress on screen blur (navigation away)
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup - save progress when leaving screen
        saveReadingProgress(
          currentPageRef.current,
          totalPagesRef.current,
          currentChapterRef.current,
          true
        );
      };
    }, [saveReadingProgress])
  );

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (totalPages === 0) return '0%';
    return `${Math.round((displayPage / totalPages) * 100)}%`;
  }, [displayPage, totalPages]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activePanel) {
        setActivePanel(null);
        return true;
      }
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [activePanel, navigation]);

  // Handlers
  const handleBack = useCallback(() => {
    // Save progress before going back
    saveReadingProgress(currentPageRef.current, totalPagesRef.current, currentChapterRef.current, true);
    navigation.goBack();
  }, [navigation, saveReadingProgress]);

  const handlePageChange = useCallback((page: number, total: number) => {
    // Update ref immediately (no re-render)
    currentPageRef.current = page;
    totalPagesRef.current = total;
    
    // Track if we're at the top of the PDF
    const atTop = page === 1;
    const wasAtTop = isAtTopRef.current;
    isAtTopRef.current = atTop;
    
    // If we just scrolled to top and UI is hidden, show it
    if (atTop && !wasAtTop && !showUIRef.current) {
      setShowUI(true);
      showUIRef.current = true;
    }
    
    // Track if we're at the bottom of the PDF (only update state if changed)
    const atBottom = total > 0 && page === total;
    if (atBottom !== isAtBottomRef.current) {
      isAtBottomRef.current = atBottom;
      setIsAtBottom(atBottom);
    }

    // Update display page less frequently to avoid UI jank
    const now = Date.now();
    if (now - lastDisplayUpdateRef.current >= DISPLAY_UPDATE_MS) {
      lastDisplayUpdateRef.current = now;
      setDisplayPage(page);
    }

    // Update reading progress with throttling
    if (now - lastUpdateTimeRef.current >= THROTTLE_MS) {
      lastUpdateTimeRef.current = now;
      saveReadingProgress(page, total, currentChapterRef.current, false);
    }
  }, [saveReadingProgress]);

  const handleLoadComplete = useCallback((total: number) => {
    setTotalPages(total);
    // Save initial progress with total pages
    if (total > 0) {
      saveReadingProgress(currentPageRef.current, total, currentChapterRef.current, false);
    }
  }, [saveReadingProgress]);

  const handlePDFError = useCallback((error: Error) => {
    console.error('PDF Error:', error);
  }, []);

  const handleTabPress = useCallback((tab: ReaderBottomTabType) => {
    if (tab === 'chapters') {
      setChaptersModalVisible(true);
    } else if (tab === 'comments') {
      // Pass mangaId (convert to number if it's a string)
      const mangaId = manga?.id ? (typeof manga.id === 'string' ? parseInt(manga.id, 10) : manga.id) : undefined;
      navigation.navigate('ReviewsDetail', {
        mangaId: mangaId,
        mangaTitle: manga?.title || 'Unknown Title',
      });
    } else {
      setActivePanel((prev) => (prev === tab ? null : tab));
    }
  }, [navigation, manga?.id, manga?.title]);

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  /**
   * Get saved page for a specific chapter using the mangaProgress ref
   */
  const getSavedPageForChapter = useCallback((chapterId: string): number => {
    const progress = mangaProgressRef.current;
    if (!progress) return 1;
    return progress.episodes?.[chapterId]?.currentPage || 1;
  }, []);

  const handleChapterSelect = useCallback((selectedChapter: PDFChapter) => {
    // Save current chapter progress before switching
    saveReadingProgress(currentPageRef.current, totalPagesRef.current, currentChapterRef.current, true);
    
    // Get saved page for the new chapter
    const savedPage = getSavedPageForChapter(String(selectedChapter.id));
    
    // Update refs and trigger PDF remount
    currentPageRef.current = savedPage;
    initialPageRef.current = savedPage;
    setDisplayPage(savedPage);
    setCurrentChapter(selectedChapter);
    setTotalPages(0);
    setActivePanel(null);
    setPdfKey(prev => prev + 1); // Force PDF remount with new initial page
    
    console.log(`[ContinueReading] Opening episode ${selectedChapter.id} at page ${savedPage}`);
  }, [saveReadingProgress, getSavedPageForChapter]);

  const handleModalChapterSelect = useCallback((chapter: { id: string; number: number; title: string }) => {
    const selectedChapter = chapters.find(c => String(c.id) === chapter.id);
    if (selectedChapter) {
      // Save current chapter progress before switching
      saveReadingProgress(currentPageRef.current, totalPagesRef.current, currentChapterRef.current, true);
      
      // Get saved page for the new chapter
      const savedPage = getSavedPageForChapter(String(selectedChapter.id));
      
      // Update refs and trigger PDF remount
      currentPageRef.current = savedPage;
      initialPageRef.current = savedPage;
      setDisplayPage(savedPage);
      setCurrentChapter(selectedChapter);
      setTotalPages(0);
      setPdfKey(prev => prev + 1); // Force PDF remount with new initial page
      
      console.log(`[ContinueReading] Opening episode ${selectedChapter.id} at page ${savedPage}`);
    }
    setChaptersModalVisible(false);
  }, [chapters, saveReadingProgress, getSavedPageForChapter]);

  const handleLikeComment = useCallback((commentId: string | number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  }, []);

  const handleAddComment = useCallback((text: string) => {
    const newComment: ReaderComment = {
      id: `new_${Date.now()}`,
      userId: 'currentUser',
      userName: 'You',
      text,
      likes: 0,
      timestamp: new Date(),
      isLiked: false,
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  const handlePreferenceChange = useCallback(
    (key: keyof ReaderPreferences, value: any) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      // Force PDF re-render when scroll direction changes
      if (key === 'scrollDirection') {
        setPdfKey((prev) => prev + 1);
      }
    },
    []
  );

  const handlePDFPress = useCallback(() => {
    // Toggle UI visibility when tapping on PDF
    if (!activePanel) {
      setShowUI((prev) => {
        const newValue = !prev;
        showUIRef.current = newValue;
        return newValue;
      });
    }
  }, [activePanel]);

  // Calculate brightness overlay opacity (inverted: 100 brightness = 0 opacity)
  const brightnessOverlayOpacity = useMemo(() => {
    return (100 - preferences.brightness) / 100;
  }, [preferences.brightness]);

  // Find next chapter
  const nextChapter = useMemo(() => {
    const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
    // Chapters are typically in descending order (newest first), so next chapter is index - 1
    // Or if in ascending order, it's index + 1. Let's check the order:
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      const nextCh = chapters[currentIndex + 1];
      // Return next chapter if it exists and has a lower chapter number (reading order)
      if (nextCh && nextCh.number > currentChapter.number) {
        return nextCh;
      }
    }
    // Try the other direction if chapters are in descending order
    if (currentIndex > 0) {
      const nextCh = chapters[currentIndex - 1];
      if (nextCh && nextCh.number > currentChapter.number) {
        return nextCh;
      }
    }
    // Fallback: just get the next in array order
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1];
    }
    return null;
  }, [chapters, currentChapter.id, currentChapter.number]);

  // Animate next chapter button visibility
  useEffect(() => {
    Animated.timing(nextChapterOpacity, {
      toValue: isAtBottom && nextChapter ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isAtBottom, nextChapter, nextChapterOpacity]);

  // Handle next chapter navigation
  const handleNextChapter = useCallback(() => {
    if (nextChapter) {
      // Log chapter change event
      console.log('📖 [PDFReaderScreen] Moving to next chapter:', nextChapter.number);
      logFirebaseEvent('pdf_reader_chapter_changed', {
        manga_id: manga?.id?.toString() || 'unknown',
        manga_title: manga?.title || 'unknown',
        from_chapter: currentChapter.number,
        to_chapter: nextChapter.number,
        action: 'next_chapter',
      });
      // Log episode completed for current chapter: ep{number}_{manga_name}_completed
      if (manga?.title) {
        logEpisodeCompleted(manga.title, manga.id || '', currentChapter.number, currentChapter.id || '', {
          screen: 'PDFReaderScreen',
          episode_title: currentChapter.title,
        });
        // Log episode opened for next chapter: ep{number}_{manga_name}_opened
        logEpisodeOpened(manga.title, manga.id || '', nextChapter.number, nextChapter.id || '', {
          screen: 'PDFReaderScreen',
          episode_title: nextChapter.title,
        });
      }
      // Track Facebook content view for new chapter
      trackContentView('article', nextChapter.id?.toString() || '', `${manga?.title} - ${nextChapter.title}`, 'reading');
      
      // Reset to page 1 for next chapter
      currentPageRef.current = 1;
      initialPageRef.current = 1;
      setDisplayPage(1);
      setCurrentChapter(nextChapter);
      setTotalPages(0);
      setIsAtBottom(false);
      isAtTopRef.current = true;
      setPdfKey(prev => prev + 1); // Force PDF remount
    }
  }, [nextChapter, manga, currentChapter.number, logFirebaseEvent]);

  // Get PDF URL - use local file if downloaded, otherwise use remote URL
  const effectivePdfUrl = useMemo(() => {
    const localPath = getLocalFilePath(String(manga?.id), String(currentChapter.id));
    if (localPath) {
      console.log('[OfflineOpen] Opening local PDF');
      return localPath;
    }
    return currentChapter.pdfUrl;
  }, [manga?.id, currentChapter.id, currentChapter.pdfUrl, getLocalFilePath]);

  return (
    <View style={[styles.container, { backgroundColor: preferences.backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* PDF Viewer */}
      <PDFViewer
        key={`pdf-${currentChapter.id}-${pdfKey}-${preferences.scrollDirection}`}
        pdfUrl={effectivePdfUrl}
        initialPage={initialPageRef.current}
        onPageChange={handlePageChange}
        onLoadComplete={handleLoadComplete}
        onError={handlePDFError}
        onPress={handlePDFPress}
        horizontal={preferences.scrollDirection === 'horizontal'}
        enablePaging={preferences.scrollDirection === 'horizontal'}
        fitPolicy={0}
        backgroundColor={preferences.backgroundColor}
        showPageNumber={preferences.showPageNumber && showUI}
        style={styles.pdfViewer}
      />

      {/* Brightness Overlay */}
      {brightnessOverlayOpacity > 0 && (
        <View
          style={[
            styles.brightnessOverlay,
            { opacity: brightnessOverlayOpacity }
          ]}
          pointerEvents="none"
        />
      )}

      {/* Header */}
      <ReaderHeader
        title={manga?.title || 'Unknown Title'}
        chapterTitle={`Ch. ${currentChapter.number} • ${currentChapter.title}`}
        progress={progress}
        onBack={handleBack}
        visible={showUI}
      />

      {/* Bottom Tab */}
      {showUI && (
        <ReaderBottomTab
          activeTab={activePanel}
          onTabPress={handleTabPress}
        />
      )}

      {/* Chapters Panel */}
      <ChaptersPanel
        chapters={chapters}
        currentChapterId={currentChapter.id}
        onChapterSelect={handleChapterSelect}
        onClose={handleClosePanel}
        visible={activePanel === 'chapters'}
      />

      {/* Comments Panel */}
      <CommentsPanel
        comments={comments}
        onLikeComment={handleLikeComment}
        onAddComment={handleAddComment}
        onClose={handleClosePanel}
        visible={activePanel === 'comments'}
      />

      {/* Preferences Panel */}
      <PreferencesPanel
        preferences={preferences}
        onPreferenceChange={handlePreferenceChange}
        onClose={handleClosePanel}
        visible={activePanel === 'preference'}
      />

      {/* Chapters List Modal */}
      <ChaptersListModal
        visible={chaptersModalVisible}
        onClose={() => setChaptersModalVisible(false)}
        chapters={chapters.map(c => ({
          id: String(c.id),
          number: c.number,
          title: `Chapter ${c.number}`,
        }))}
        onChapterSelect={handleModalChapterSelect}
        selectedChapter={currentChapter.number}
      />

      {/* Next Chapter Button - Shows at bottom of PDF */}
      {nextChapter && (
        <Animated.View
          style={[
            styles.nextChapterContainer,
            {
              opacity: nextChapterOpacity,
              bottom: insets.bottom + 100,
            },
          ]}
          pointerEvents={isAtBottom ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.nextChapterButton}
            onPress={handleNextChapter}
            activeOpacity={0.8}
          >
            <Text style={styles.nextChapterText}>
              Read Next: Chapter {nextChapter.number}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden', // Prevent horizontal overflow on iOS
  },
  pdfViewer: {
    flex: 1,
  },
  brightnessOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 5,
  },
  nextChapterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    // bottom:0
    // bottom:-100
  },
  nextChapterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: horizontalScale (24),
    paddingVertical:verticalScale(14),
    borderRadius: radiusScale(100),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    top:moderateScale(10)
  },
  nextChapterText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PDFReaderScreen;
