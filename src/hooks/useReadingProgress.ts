import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import { RootState, AppDispatch } from '../redux/store';
import {
  updateReadingProgress,
  saveProgressOnExit,
  markEpisodeCompleted,
  clearReadingProgress,
  MangaProgress,
  EpisodeProgress,
} from '../redux/slices/readingProgressSlice';

/**
 * Custom hook for managing reading progress
 * Handles real-time tracking, persistence, and retrieval
 */

interface UseReadingProgressParams {
  userId: string | null;
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating?: number;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  seasonId?: string;
  seasonNumber?: number;
  seasonTitle?: string;
}

interface UseReadingProgressReturn {
  /** Update progress on page change */
  updateProgress: (currentPage: number, totalPages: number) => void;
  /** Save progress immediately (call on exit) */
  saveProgress: () => void;
  /** Get initial page for resuming */
  getResumePageForEpisode: () => number;
  /** Check if episode is completed */
  isEpisodeCompleted: boolean;
  /** Current progress percentage */
  currentPercentage: number;
  /** Current saved page */
  currentPage: number;
}

/**
 * Hook to track and manage reading progress for a specific episode
 */
export const useReadingProgress = ({
  userId,
  mangaId,
  mangaTitle,
  coverImage,
  rating,
  episodeId,
  episodeNumber,
  episodeTitle,
  seasonId = '1',
  seasonNumber = 1,
  seasonTitle = 'Season 1',
}: UseReadingProgressParams): UseReadingProgressReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Store current progress in refs for access during cleanup
  const currentPageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const hasUnsavedProgressRef = useRef(false);

  // Get existing progress from Redux
  const episodeProgress = useSelector((state: RootState) => {
    if (!userId) return null;
    return state.readingProgress?.users?.[userId]?.[mangaId]?.episodes?.[episodeId] || null;
  });

  const isEpisodeCompleted = episodeProgress?.isCompleted || false;
  const currentPercentage = episodeProgress?.percentageRead || 0;
  const currentPage = episodeProgress?.currentPage || 1;

  /**
   * Update progress - called on page change
   * Uses throttling to prevent excessive dispatches
   */
  const lastUpdateTimeRef = useRef(0);
  const THROTTLE_MS = 500; // Throttle updates to every 500ms

  const updateProgress = useCallback(
    (page: number, total: number) => {
      if (!userId) return;

      currentPageRef.current = page;
      totalPagesRef.current = total;
      hasUnsavedProgressRef.current = true;

      const now = Date.now();
      if (now - lastUpdateTimeRef.current < THROTTLE_MS) {
        return; // Throttle updates
      }
      lastUpdateTimeRef.current = now;

      dispatch(
        updateReadingProgress({
          userId,
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodeId,
          episodeNumber,
          episodeTitle,
          currentPage: page,
          totalPages: total,
          seasonId,
          seasonNumber,
          seasonTitle,
        })
      );
    },
    [userId, mangaId, mangaTitle, coverImage, rating, episodeId, episodeNumber, episodeTitle, seasonId, seasonNumber, seasonTitle, dispatch]
  );

  /**
   * Save progress immediately - call on exit
   */
  const saveProgress = useCallback(() => {
    if (!userId || !hasUnsavedProgressRef.current) return;

    dispatch(
      saveProgressOnExit({
        userId,
        mangaId,
        mangaTitle,
        coverImage,
        rating,
        episodeId,
        episodeNumber,
        episodeTitle,
        currentPage: currentPageRef.current,
        totalPages: totalPagesRef.current,
        seasonId,
        seasonNumber,
        seasonTitle,
      })
    );
    hasUnsavedProgressRef.current = false;
  }, [userId, mangaId, mangaTitle, coverImage, rating, episodeId, episodeNumber, episodeTitle, seasonId, seasonNumber, seasonTitle, dispatch]);

  /**
   * Get the page to resume from
   */
  const getResumePageForEpisode = useCallback(() => {
    return episodeProgress?.currentPage || 1;
  }, [episodeProgress]);

  /**
   * Handle app state changes - save progress when backgrounded
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        saveProgress();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      // Save progress when unmounting
      saveProgress();
    };
  }, [saveProgress]);

  return {
    updateProgress,
    saveProgress,
    getResumePageForEpisode,
    isEpisodeCompleted,
    currentPercentage,
    currentPage,
  };
};

/**
 * Hook to get Continue Reading list
 * Returns mangaId list sorted by lastReadAt DESC
 */
export interface ContinueReadingItem {
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating: number;
  seasonId: string;
  seasonNumber: number;
  seasonTitle: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  percentageRead: number;
  lastReadAt: number;
  currentPage: number;
  totalPages: number;
}

export const useContinueReadingList = (userId: string | null): ContinueReadingItem[] => {
  const readingProgress = useSelector((state: RootState) => {
    if (!userId) return {};
    return state.readingProgress?.users?.[userId] || {};
  }, shallowEqual);

  // Memoize the transformation to prevent unnecessary re-renders
  const continueReadingList = useMemo((): ContinueReadingItem[] => {
    return Object.values(readingProgress as Record<string, MangaProgress>)
      .filter((manga: MangaProgress) => {
        // Get the last read episode
        const lastEpisode = manga.episodes[manga.lastReadEpisodeId];
        // Include if episode exists and is not completed (or percentage < 100)
        return lastEpisode && !lastEpisode.isCompleted && lastEpisode.percentageRead < 100;
      })
      .map((manga: MangaProgress) => {
        const lastEpisode = manga.episodes[manga.lastReadEpisodeId];
        return {
          mangaId: manga.mangaId,
          mangaTitle: manga.mangaTitle,
          coverImage: manga.coverImage,
          rating: manga.rating || 0,
          seasonId: lastEpisode.seasonId || manga.lastReadSeasonId || '',
          seasonNumber: lastEpisode.seasonNumber || manga.lastReadSeasonNumber || 1,
          seasonTitle: lastEpisode.seasonTitle || '',
          episodeId: lastEpisode.episodeId,
          episodeNumber: lastEpisode.episodeNumber,
          episodeTitle: lastEpisode.episodeTitle,
          percentageRead: lastEpisode.percentageRead,
          lastReadAt: manga.lastReadAt,
          currentPage: lastEpisode.currentPage,
          totalPages: lastEpisode.totalPages,
        };
      })
      // Sort by lastReadAt DESC
      .sort((a, b) => b.lastReadAt - a.lastReadAt);
  }, [readingProgress]);

  return continueReadingList;
};

/**
 * Hook to check if specific episode is completed
 */
export const useIsEpisodeCompleted = (
  userId: string | null,
  mangaId: string,
  episodeId: string
): boolean => {
  return useSelector((state: RootState) => {
    if (!userId) return false;
    return (
      state.readingProgress?.users?.[userId]?.[mangaId]?.episodes?.[episodeId]?.isCompleted || false
    );
  });
};

/**
 * Hook to get all completed episodes for a manga
 */
export const useCompletedEpisodes = (
  userId: string | null,
  mangaId: string
): Set<string> => {
  const mangaProgress = useSelector((state: RootState) => {
    if (!userId) return null;
    return state.readingProgress?.users?.[userId]?.[mangaId] || null;
  });

  if (!mangaProgress) return new Set();

  const completedIds = new Set<string>();
  Object.entries(mangaProgress.episodes).forEach(([episodeId, progress]) => {
    if (progress.isCompleted) {
      completedIds.add(episodeId);
    }
  });

  return completedIds;
};

/**
 * Hook to get all episodes progress for a manga
 * Returns a map of episodeId -> EpisodeProgress
 * Uses shallowEqual to prevent unnecessary re-renders
 */
export const useEpisodesProgressMap = (
  userId: string | null,
  mangaId: string
): { [episodeId: string]: EpisodeProgress } => {
  return useSelector(
    (state: RootState) => {
      if (!userId || !mangaId) return EMPTY_EPISODES_MAP;
      return state.readingProgress?.users?.[userId]?.[mangaId]?.episodes || EMPTY_EPISODES_MAP;
    },
    shallowEqual
  );
};

// Constant empty object to avoid creating new references
const EMPTY_EPISODES_MAP: { [episodeId: string]: EpisodeProgress } = {};

/**
 * Hook to get episode progress
 */
export const useEpisodeProgress = (
  userId: string | null,
  mangaId: string,
  episodeId: string
): EpisodeProgress | null => {
  return useSelector((state: RootState) => {
    if (!userId) return null;
    return state.readingProgress?.users?.[userId]?.[mangaId]?.episodes?.[episodeId] || null;
  });
};

/**
 * Hook to clear reading progress
 */
export const useClearReadingProgress = () => {
  const dispatch = useDispatch<AppDispatch>();

  const clearAll = useCallback(
    (userId: string) => {
      dispatch(clearReadingProgress({ userId }));
    },
    [dispatch]
  );

  const clearManga = useCallback(
    (userId: string, mangaId: string) => {
      dispatch(clearReadingProgress({ userId, mangaId }));
    },
    [dispatch]
  );

  const clearEpisode = useCallback(
    (userId: string, mangaId: string, episodeId: string) => {
      dispatch(clearReadingProgress({ userId, mangaId, episodeId }));
    },
    [dispatch]
  );

  return { clearAll, clearManga, clearEpisode };
};

/**
 * Hook to mark an episode as completed
 */
export const useMarkEpisodeCompleted = () => {
  const dispatch = useDispatch<AppDispatch>();

  const markCompleted = useCallback(
    (userId: string, mangaId: string, episodeId: string) => {
      dispatch(markEpisodeCompleted({ userId, mangaId, episodeId }));
    },
    [dispatch]
  );

  return { markCompleted };
};
