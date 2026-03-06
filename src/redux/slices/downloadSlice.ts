import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Download Slice
 * 
 * Manages downloaded manga episodes for offline reading
 * Files are stored in app sandbox (DocumentDirectoryPath) - not accessible from device file manager
 */

export interface DownloadedEpisode {
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  chapterNumber?: number;
  localFilePath: string;
  downloadedAt: number;
  fileSize?: number;
}

export interface DownloadedManga {
  mangaId: string;
  title: string;
  coverImage: string;
  rating: number;
  episodes: {
    [episodeId: string]: DownloadedEpisode;
  };
  isFullyDownloaded: boolean;
  downloadedAt: number;
}

interface DownloadState {
  // userId -> { mangaId -> DownloadedManga }
  users: {
    [userId: string]: {
      [mangaId: string]: DownloadedManga;
    };
  };
  // Track active downloads
  activeDownloads: {
    [key: string]: {
      progress: number;
      status: 'downloading' | 'failed' | 'completed';
    };
  };
}

const initialState: DownloadState = {
  users: {},
  activeDownloads: {},
};

interface StartDownloadPayload {
  userId: string;
  mangaId: string;
  episodeId: string;
}

interface CompleteDownloadPayload {
  userId: string;
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating: number;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  chapterNumber?: number;
  localFilePath: string;
  fileSize?: number;
}

interface RemoveDownloadPayload {
  userId: string;
  mangaId: string;
  episodeId?: string; // If not provided, remove entire manga
}

interface MarkFullyDownloadedPayload {
  userId: string;
  mangaId: string;
}

interface UpdateDownloadProgressPayload {
  key: string;
  progress: number;
}

const downloadSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    startDownload: (state, action: PayloadAction<StartDownloadPayload>) => {
      const { userId, mangaId, episodeId } = action.payload;
      const key = `${userId}-${mangaId}-${episodeId}`;
      
      state.activeDownloads[key] = {
        progress: 0,
        status: 'downloading',
      };
      
      console.log(`[DownloadStarted] Episode ${episodeId} downloading`);
    },

    updateDownloadProgress: (state, action: PayloadAction<UpdateDownloadProgressPayload>) => {
      const { key, progress } = action.payload;
      if (state.activeDownloads[key]) {
        state.activeDownloads[key].progress = progress;
      }
    },

    completeDownload: (state, action: PayloadAction<CompleteDownloadPayload>) => {
      const {
        userId,
        mangaId,
        mangaTitle,
        coverImage,
        rating,
        episodeId,
        episodeNumber,
        episodeTitle,
        chapterNumber,
        localFilePath,
        fileSize,
      } = action.payload;

      // Initialize user's downloads if doesn't exist
      if (!state.users[userId]) {
        state.users[userId] = {};
      }

      // Initialize manga entry if doesn't exist
      if (!state.users[userId][mangaId]) {
        state.users[userId][mangaId] = {
          mangaId,
          title: mangaTitle,
          coverImage,
          rating,
          episodes: {},
          isFullyDownloaded: false,
          downloadedAt: Date.now(),
        };
      }

      // Add episode
      state.users[userId][mangaId].episodes[episodeId] = {
        episodeId,
        episodeNumber,
        episodeTitle,
        chapterNumber,
        localFilePath,
        downloadedAt: Date.now(),
        fileSize,
      };

      // Update active download status
      const key = `${userId}-${mangaId}-${episodeId}`;
      if (state.activeDownloads[key]) {
        state.activeDownloads[key].status = 'completed';
        state.activeDownloads[key].progress = 100;
      }

      console.log(`[DownloadComplete] Saved at ${localFilePath}`);
    },

    markFullyDownloaded: (state, action: PayloadAction<MarkFullyDownloadedPayload>) => {
      const { userId, mangaId } = action.payload;
      
      if (state.users[userId]?.[mangaId]) {
        state.users[userId][mangaId].isFullyDownloaded = true;
        state.users[userId][mangaId].downloadedAt = Date.now();
        console.log(`[DownloadAllComplete] Manga fully downloaded`);
      }
    },

    downloadFailed: (state, action: PayloadAction<StartDownloadPayload>) => {
      const { userId, mangaId, episodeId } = action.payload;
      const key = `${userId}-${mangaId}-${episodeId}`;
      
      if (state.activeDownloads[key]) {
        state.activeDownloads[key].status = 'failed';
      }
      
      console.log(`[DownloadFailed] Episode ${episodeId} failed to download`);
    },

    removeDownload: (state, action: PayloadAction<RemoveDownloadPayload>) => {
      const { userId, mangaId, episodeId } = action.payload;

      if (!state.users[userId]?.[mangaId]) return;

      if (episodeId) {
        // Remove specific episode
        delete state.users[userId][mangaId].episodes[episodeId];
        
        // Check if manga has no more episodes
        if (Object.keys(state.users[userId][mangaId].episodes).length === 0) {
          delete state.users[userId][mangaId];
        } else {
          state.users[userId][mangaId].isFullyDownloaded = false;
        }
        
        console.log(`[DownloadRemoved] Episode ${episodeId} removed`);
      } else {
        // Remove entire manga
        delete state.users[userId][mangaId];
        console.log(`[DownloadRemoved] Manga ${mangaId} removed`);
      }
    },

    clearActiveDownload: (state, action: PayloadAction<{ key: string }>) => {
      delete state.activeDownloads[action.payload.key];
    },

    clearUserDownloads: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      if (state.users[userId]) {
        delete state.users[userId];
        console.log(`[DownloadsCleared] All downloads cleared for user ${userId}`);
      }
    },
  },
});

export const {
  startDownload,
  updateDownloadProgress,
  completeDownload,
  markFullyDownloaded,
  downloadFailed,
  removeDownload,
  clearActiveDownload,
  clearUserDownloads,
} = downloadSlice.actions;

export default downloadSlice.reducer;
