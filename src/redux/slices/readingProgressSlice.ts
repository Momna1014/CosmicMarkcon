import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Reading Progress State Interface
 * Tracks reading progress per user, per manga, per episode
 */

export interface EpisodeProgress {
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  seasonId: string; // Season this episode belongs to
  seasonNumber: number;
  seasonTitle: string;
  currentPage: number;
  totalPages: number;
  percentageRead: number;
  lastReadAt: number; // timestamp
  isCompleted: boolean;
}

export interface MangaProgress {
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating?: number;
  episodes: { [episodeId: string]: EpisodeProgress };
  lastReadEpisodeId: string;
  lastReadSeasonId: string; // Last read season (chapter)
  lastReadSeasonNumber: number;
  lastReadAt: number; // timestamp
}

export interface UserReadingProgress {
  [mangaId: string]: MangaProgress;
}

export interface ReadingProgressState {
  users: { [userId: string]: UserReadingProgress };
}

const initialState: ReadingProgressState = {
  users: {},
};

/**
 * Payload types
 */
interface UpdateProgressPayload {
  userId: string;
  mangaId: string;
  mangaTitle: string;
  coverImage: string;
  rating?: number;
  seasonId: string; // Season (Chapter) ID
  seasonNumber: number;
  seasonTitle: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  currentPage: number;
  totalPages: number;
}

interface MarkCompletedPayload {
  userId: string;
  mangaId: string;
  episodeId: string;
}

interface ClearProgressPayload {
  userId: string;
  mangaId?: string;
  episodeId?: string;
}

/**
 * Reading Progress Slice
 * Manages reading progress for manga episodes
 */
const readingProgressSlice = createSlice({
  name: 'readingProgress',
  initialState,
  reducers: {
    /**
     * Update reading progress for an episode
     * Called on page change, scroll, or PDF navigation
     */
    updateReadingProgress: (state, action: PayloadAction<UpdateProgressPayload>) => {
      const {
        userId,
        mangaId,
        mangaTitle,
        coverImage,
        rating,
        seasonId,
        seasonNumber,
        seasonTitle,
        episodeId,
        episodeNumber,
        episodeTitle,
        currentPage,
        totalPages,
      } = action.payload;

      // Calculate percentage
      const percentageRead = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
      const timestamp = Date.now();
      const isCompleted = currentPage >= totalPages && totalPages > 0;

      // Log progress update
      console.log(
        `[ReadingProgress] userId:${userId} mangaId:${mangaId} season:${seasonNumber} episode:${episodeNumber} page:${currentPage} percentage:${percentageRead}%`
      );

      // Initialize user if not exists
      if (!state.users[userId]) {
        state.users[userId] = {};
      }

      // Initialize manga if not exists
      if (!state.users[userId][mangaId]) {
        state.users[userId][mangaId] = {
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodes: {},
          lastReadEpisodeId: episodeId,
          lastReadSeasonId: seasonId,
          lastReadSeasonNumber: seasonNumber,
          lastReadAt: timestamp,
        };
      }

      // Update manga metadata
      state.users[userId][mangaId].mangaTitle = mangaTitle;
      state.users[userId][mangaId].coverImage = coverImage;
      if (rating !== undefined) {
        state.users[userId][mangaId].rating = rating;
      }
      state.users[userId][mangaId].lastReadEpisodeId = episodeId;
      state.users[userId][mangaId].lastReadSeasonId = seasonId;
      state.users[userId][mangaId].lastReadSeasonNumber = seasonNumber;
      state.users[userId][mangaId].lastReadAt = timestamp;

      // Update episode progress
      state.users[userId][mangaId].episodes[episodeId] = {
        episodeId,
        episodeNumber,
        episodeTitle,
        seasonId,
        seasonNumber,
        seasonTitle,
        currentPage,
        totalPages,
        percentageRead,
        lastReadAt: timestamp,
        isCompleted,
      };

      // Log completion if episode is completed
      if (isCompleted) {
        console.log(`[EpisodeCompleted] Season ${seasonNumber} Episode ${episodeNumber} marked as Read`);
      }
    },

    /**
     * Mark an episode as completed manually
     */
    markEpisodeCompleted: (state, action: PayloadAction<MarkCompletedPayload>) => {
      const { userId, mangaId, episodeId } = action.payload;

      if (state.users[userId]?.[mangaId]?.episodes[episodeId]) {
        state.users[userId][mangaId].episodes[episodeId].isCompleted = true;
        state.users[userId][mangaId].episodes[episodeId].percentageRead = 100;
        console.log(`[EpisodeCompleted] Episode ${episodeId} marked as Read`);
      }
    },

    /**
     * Clear reading progress
     * Can clear all progress for a user, specific manga, or specific episode
     */
    clearReadingProgress: (state, action: PayloadAction<ClearProgressPayload>) => {
      const { userId, mangaId, episodeId } = action.payload;

      if (!state.users[userId]) return;

      if (episodeId && mangaId) {
        // Clear specific episode
        if (state.users[userId][mangaId]?.episodes[episodeId]) {
          delete state.users[userId][mangaId].episodes[episodeId];
        }
      } else if (mangaId) {
        // Clear entire manga progress
        delete state.users[userId][mangaId];
      } else {
        // Clear all progress for user
        state.users[userId] = {};
      }
    },

    /**
     * Save progress when user leaves (same as updateReadingProgress but with logging)
     */
    saveProgressOnExit: (state, action: PayloadAction<UpdateProgressPayload>) => {
      const {
        userId,
        mangaId,
        mangaTitle,
        coverImage,
        rating,
        seasonId,
        seasonNumber,
        seasonTitle,
        episodeId,
        episodeNumber,
        episodeTitle,
        currentPage,
        totalPages,
      } = action.payload;

      const percentageRead = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
      const timestamp = Date.now();
      const isCompleted = currentPage >= totalPages && totalPages > 0;

      // Log save action
      console.log(`[ReadingSaved] Saved progress at season ${seasonNumber} episode ${episodeNumber} page ${currentPage} (${percentageRead}%)`);

      // Initialize user if not exists
      if (!state.users[userId]) {
        state.users[userId] = {};
      }

      // Initialize manga if not exists
      if (!state.users[userId][mangaId]) {
        state.users[userId][mangaId] = {
          mangaId,
          mangaTitle,
          coverImage,
          rating,
          episodes: {},
          lastReadEpisodeId: episodeId,
          lastReadSeasonId: seasonId,
          lastReadSeasonNumber: seasonNumber,
          lastReadAt: timestamp,
        };
      }

      // Update manga metadata
      state.users[userId][mangaId].mangaTitle = mangaTitle;
      state.users[userId][mangaId].coverImage = coverImage;
      if (rating !== undefined) {
        state.users[userId][mangaId].rating = rating;
      }
      state.users[userId][mangaId].lastReadEpisodeId = episodeId;
      state.users[userId][mangaId].lastReadSeasonId = seasonId;
      state.users[userId][mangaId].lastReadSeasonNumber = seasonNumber;
      state.users[userId][mangaId].lastReadAt = timestamp;

      // Update episode progress
      state.users[userId][mangaId].episodes[episodeId] = {
        episodeId,
        episodeNumber,
        episodeTitle,
        seasonId,
        seasonNumber,
        seasonTitle,
        currentPage,
        totalPages,
        percentageRead,
        lastReadAt: timestamp,
        isCompleted,
      };
    },
  },
});

export const {
  updateReadingProgress,
  markEpisodeCompleted,
  clearReadingProgress,
  saveProgressOnExit,
} = readingProgressSlice.actions;

export default readingProgressSlice.reducer;
