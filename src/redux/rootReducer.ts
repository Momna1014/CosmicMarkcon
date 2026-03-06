import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import readingProgressReducer from './slices/readingProgressSlice';
import savedMangaReducer from './slices/savedMangaSlice';
import downloadReducer from './slices/downloadSlice';
// Import other reducers here as you create them
// import userReducer from './slices/userSlice';
// import postsReducer from './slices/postsSlice';

/**
 * Root Reducer
 * 
 * Combines all slice reducers into a single root reducer
 * Add new reducers here as you create new slices
 */
const rootReducer = combineReducers({
  auth: authReducer,
  readingProgress: readingProgressReducer,
  savedManga: savedMangaReducer,
  downloads: downloadReducer,
  // Add other reducers here:
  // user: userReducer,
  // posts: postsReducer,
  // notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
