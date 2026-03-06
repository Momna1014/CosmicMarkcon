import { useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import alertService from '../services/alertService';
import {
  startDownload,
  updateDownloadProgress,
  completeDownload,
  downloadFailed,
  removeDownload,
  markFullyDownloaded,
  DownloadedManga,
  DownloadedEpisode,
} from '../redux/slices/downloadSlice';

// Safely import RNFS - may not be available if native module not linked
let RNFS: any = null;
try {
  RNFS = require('react-native-fs');
} catch (e) {
  console.warn('[useDownload] react-native-fs not available:', e);
}

// Store downloads in app sandbox - NOT accessible from device file manager
const DOWNLOADS_DIR = RNFS ? `${RNFS.DocumentDirectoryPath}/manga_downloads` : '';

interface DownloadEpisodeParams {
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating: number;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  pdfUrl: string;
  showAlert?: boolean; // Whether to show alert on completion (default: true)
}

interface UseDownloadResult {
  downloadEpisode: (params: DownloadEpisodeParams) => Promise<boolean>;
  downloadAllEpisodes: (
    mangaId: string,
    mangaTitle: string,
    coverImage: string,
    rating: number,
    episodes: Array<{
      episodeId: string;
      episodeNumber: number;
      episodeTitle: string;
      pdfUrl: string;
    }>
  ) => Promise<boolean>;
  removeEpisodeDownload: (mangaId: string, episodeId: string) => Promise<void>;
  removeMangaDownload: (mangaId: string) => Promise<void>;
  isEpisodeDownloaded: (mangaId: string, episodeId: string) => boolean;
  isMangaDownloaded: (mangaId: string) => boolean;
  getLocalFilePath: (mangaId: string, episodeId: string) => string | null;
  getDownloadedManga: (mangaId: string) => DownloadedManga | null;
  getAllDownloadedManga: () => DownloadedManga[];
  getDownloadedEpisode: (mangaId: string, episodeId: string) => DownloadedEpisode | null;
}

/**
 * Hook for managing manga/episode downloads
 * Files are stored in app sandbox (DocumentDirectoryPath) - secure and not accessible from file manager
 */
// Stable empty object reference to avoid selector re-render issues
const EMPTY_DOWNLOADS: Record<string, any> = {};

export const useDownload = (userId: string | null): UseDownloadResult => {
  const dispatch = useDispatch<AppDispatch>();

  // Get user's downloads from Redux with stable reference
  const userDownloads = useSelector((state: RootState) => {
    if (!userId) return EMPTY_DOWNLOADS;
    return state.downloads?.users?.[userId] || EMPTY_DOWNLOADS;
  }, shallowEqual);

  // Ensure downloads directory exists
  const ensureDownloadsDir = useCallback(async (): Promise<void> => {
    if (!RNFS) {
      console.warn('[useDownload] RNFS not available');
      return;
    }
    const exists = await RNFS.exists(DOWNLOADS_DIR);
    if (!exists) {
      await RNFS.mkdir(DOWNLOADS_DIR);
    }
  }, []);

  // Generate local file path for an episode
  const generateFilePath = useCallback((mangaId: string, episodeId: string): string => {
    if (!DOWNLOADS_DIR) return '';
    return `${DOWNLOADS_DIR}/${mangaId}_${episodeId}.pdf`;
  }, []);

  // Download single episode
  const downloadEpisode = useCallback(async (params: DownloadEpisodeParams): Promise<boolean> => {
    const {
      mangaId,
      mangaTitle,
      coverImage,
      rating,
      episodeId,
      episodeNumber,
      episodeTitle,
      pdfUrl,
      showAlert: shouldShowAlert = true,
    } = params;

    if (!userId || !RNFS) {
      console.warn('[useDownload] Cannot download - userId or RNFS not available');
      return false;
    }

    try {
      // Ensure directory exists
      await ensureDownloadsDir();

      // Start download tracking
      dispatch(startDownload({ userId, mangaId, episodeId }));

      const localFilePath = generateFilePath(mangaId, episodeId);

      // Check if file already exists
      const exists = await RNFS.exists(localFilePath);
      if (exists) {
        // File already downloaded, just update Redux
        const stat = await RNFS.stat(localFilePath);
        dispatch(completeDownload({
          userId,
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodeId,
          episodeNumber,
          episodeTitle,
          localFilePath,
          fileSize: Number(stat.size),
        }));
        return true;
      }

      // Create download key for progress tracking
      const downloadKey = `${userId}-${mangaId}-${episodeId}`;

      // Download file with progress tracking
      const downloadJob = RNFS.downloadFile({
        fromUrl: pdfUrl,
        toFile: localFilePath,
        background: false, // Set to false for faster downloads
        discretionary: false, // Disable discretionary for immediate download
        connectionTimeout: 10000, // 10 second connection timeout
        readTimeout: 30000, // 30 second read timeout
        begin: (res: { contentLength: number; statusCode: number }) => {
          console.log('[DownloadBegin]', { contentLength: res.contentLength, statusCode: res.statusCode });
          // Initialize progress at 0
          dispatch(updateDownloadProgress({ key: downloadKey, progress: 0 }));
        },
        progress: (res: { contentLength: number; bytesWritten: number }) => {
          // Calculate progress percentage
          let progress = 0;
          if (res.contentLength > 0) {
            progress = Math.round((res.bytesWritten / res.contentLength) * 100);
          } else {
            // If content length unknown, show indeterminate progress (pulse between 10-90)
            progress = Math.min(90, Math.round((res.bytesWritten / 1000000) * 100));
          }
          console.log('[DownloadProgress]', { bytesWritten: res.bytesWritten, contentLength: res.contentLength, progress });
          // Update progress in Redux
          dispatch(updateDownloadProgress({ key: downloadKey, progress }));
        },
        progressDivider: 1, // Call progress callback for every change
      });

      const downloadResult = await downloadJob.promise;

      if (downloadResult.statusCode === 200) {
        const stat = await RNFS.stat(localFilePath);
        dispatch(completeDownload({
          userId,
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodeId,
          episodeNumber,
          episodeTitle,
          localFilePath,
          fileSize: Number(stat.size),
        }));
        if (shouldShowAlert) {
          alertService.success('Download Complete', `${episodeTitle} downloaded successfully`);
        }
        return true;
      } else {
        dispatch(downloadFailed({ userId, mangaId, episodeId }));
        return false;
      }
    } catch (error) {
      console.error('[DownloadError]', error);
      dispatch(downloadFailed({ userId, mangaId, episodeId }));
      return false;
    }
  }, [userId, dispatch, ensureDownloadsDir, generateFilePath]);

  // Download all episodes for a manga
  const downloadAllEpisodes = useCallback(async (
    mangaId: string,
    mangaTitle: string,
    coverImage: string,
    rating: number,
    episodes: Array<{
      episodeId: string;
      episodeNumber: number;
      episodeTitle: string;
      pdfUrl: string;
    }>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      let allSuccess = true;

      for (const episode of episodes) {
        const success = await downloadEpisode({
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodeId: episode.episodeId,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.episodeTitle,
          pdfUrl: episode.pdfUrl,
          showAlert: false, // Don't show individual alerts when downloading all
        });

        if (!success) {
          allSuccess = false;
        }
      }

      if (allSuccess) {
        dispatch(markFullyDownloaded({ userId, mangaId }));
        alertService.success('Download Complete', `All ${episodes.length} episodes downloaded successfully`);
      }

      return allSuccess;
    } catch (error) {
      console.error('[DownloadAllError]', error);
      return false;
    }
  }, [userId, dispatch, downloadEpisode]);

  // Remove episode download
  const removeEpisodeDownload = useCallback(async (mangaId: string, episodeId: string): Promise<void> => {
    if (!userId) return;

    const localFilePath = generateFilePath(mangaId, episodeId);
    
    if (RNFS && localFilePath) {
      try {
        const exists = await RNFS.exists(localFilePath);
        if (exists) {
          await RNFS.unlink(localFilePath);
        }
      } catch (error) {
        console.error('[RemoveDownloadError]', error);
      }
    }

    dispatch(removeDownload({ userId, mangaId, episodeId }));
  }, [userId, dispatch, generateFilePath]);

  // Remove all downloads for a manga
  const removeMangaDownload = useCallback(async (mangaId: string): Promise<void> => {
    if (!userId) return;

    const manga = userDownloads[mangaId];
    if (!manga) return;

    // Delete all episode files
    if (RNFS) {
      for (const episodeId of Object.keys(manga.episodes)) {
        const localFilePath = generateFilePath(mangaId, episodeId);
        if (localFilePath) {
          try {
            const exists = await RNFS.exists(localFilePath);
            if (exists) {
              await RNFS.unlink(localFilePath);
            }
          } catch (error) {
            console.error('[RemoveDownloadError]', error);
          }
        }
      }
    }

    dispatch(removeDownload({ userId, mangaId }));
  }, [userId, userDownloads, dispatch, generateFilePath]);

  // Check if episode is downloaded
  const isEpisodeDownloaded = useCallback((mangaId: string, episodeId: string): boolean => {
    return !!userDownloads[mangaId]?.episodes?.[episodeId];
  }, [userDownloads]);

  // Check if manga is fully downloaded
  const isMangaDownloaded = useCallback((mangaId: string): boolean => {
    return !!userDownloads[mangaId]?.isFullyDownloaded;
  }, [userDownloads]);

  // Get local file path for an episode
  const getLocalFilePath = useCallback((mangaId: string, episodeId: string): string | null => {
    return userDownloads[mangaId]?.episodes?.[episodeId]?.localFilePath || null;
  }, [userDownloads]);

  // Get downloaded manga info
  const getDownloadedManga = useCallback((mangaId: string): DownloadedManga | null => {
    return userDownloads[mangaId] || null;
  }, [userDownloads]);

  // Get all downloaded manga for the user
  const getAllDownloadedManga = useCallback((): DownloadedManga[] => {
    return Object.values(userDownloads).sort((a, b) => b.downloadedAt - a.downloadedAt);
  }, [userDownloads]);

  // Get downloaded episode info
  const getDownloadedEpisode = useCallback((mangaId: string, episodeId: string): DownloadedEpisode | null => {
    return userDownloads[mangaId]?.episodes?.[episodeId] || null;
  }, [userDownloads]);

  return {
    downloadEpisode,
    downloadAllEpisodes,
    removeEpisodeDownload,
    removeMangaDownload,
    isEpisodeDownloaded,
    isMangaDownloaded,
    getLocalFilePath,
    getDownloadedManga,
    getAllDownloadedManga,
    getDownloadedEpisode,
  };
};

export default useDownload;
