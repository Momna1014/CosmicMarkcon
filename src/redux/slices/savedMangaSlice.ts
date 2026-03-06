import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Saved Manga Slice
 * 
 * Stores manga saved by users with metadata for display in Library Saved tab
 */

export interface SavedManga {
  mangaId: string;
  title: string;
  coverImage: string;
  rating: number;
  savedAt: number; // timestamp
}

interface SavedMangaState {
  // userId -> { mangaId -> SavedManga }
  users: {
    [userId: string]: {
      [mangaId: string]: SavedManga;
    };
  };
}

const initialState: SavedMangaState = {
  users: {},
};

interface SaveMangaPayload {
  userId: string;
  mangaId: string;
  title: string;
  coverImage: string;
  rating: number;
}

interface RemoveMangaPayload {
  userId: string;
  mangaId: string;
}

const savedMangaSlice = createSlice({
  name: 'savedManga',
  initialState,
  reducers: {
    saveManga: (state, action: PayloadAction<SaveMangaPayload>) => {
      const { userId, mangaId, title, coverImage, rating } = action.payload;

      // Initialize user's saved manga map if doesn't exist
      if (!state.users[userId]) {
        state.users[userId] = {};
      }

      // Save manga with timestamp
      state.users[userId][mangaId] = {
        mangaId,
        title,
        coverImage,
        rating,
        savedAt: Date.now(),
      };

      console.log(`[Saved] Manga ${mangaId} saved by user ${userId}`);
    },

    removeSavedManga: (state, action: PayloadAction<RemoveMangaPayload>) => {
      const { userId, mangaId } = action.payload;

      if (state.users[userId] && state.users[userId][mangaId]) {
        delete state.users[userId][mangaId];
        console.log(`[SavedRemoved] Manga ${mangaId} removed`);
      }
    },

    clearUserSavedManga: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      if (state.users[userId]) {
        delete state.users[userId];
        console.log(`[SavedCleared] All saved manga cleared for user ${userId}`);
      }
    },
  },
});

export const { saveManga, removeSavedManga, clearUserSavedManga } = savedMangaSlice.actions;
export default savedMangaSlice.reducer;
