import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * Cosmic Guides Slice
 * 
 * Manages the state of cosmic guide lesson completions
 * Persisted to AsyncStorage for data retention across app restarts
 */

interface CosmicGuidesState {
  // Map of guideId -> Set of completed lessonIds
  completedLessons: Record<string, string[]>;
}

const initialState: CosmicGuidesState = {
  completedLessons: {},
};

const cosmicGuidesSlice = createSlice({
  name: 'cosmicGuides',
  initialState,
  reducers: {
    /**
     * Mark a lesson as completed
     */
    markLessonCompleted: (
      state,
      action: PayloadAction<{guideId: string; lessonId: string}>,
    ) => {
      const {guideId, lessonId} = action.payload;
      
      if (!state.completedLessons[guideId]) {
        state.completedLessons[guideId] = [];
      }
      
      // Only add if not already completed
      if (!state.completedLessons[guideId].includes(lessonId)) {
        state.completedLessons[guideId].push(lessonId);
        console.log('📊 [Redux] Lesson completed:', {guideId, lessonId});
      }
    },

    /**
     * Mark a lesson as incomplete (undo completion)
     */
    markLessonIncomplete: (
      state,
      action: PayloadAction<{guideId: string; lessonId: string}>,
    ) => {
      const {guideId, lessonId} = action.payload;
      
      if (state.completedLessons[guideId]) {
        state.completedLessons[guideId] = state.completedLessons[guideId].filter(
          id => id !== lessonId,
        );
        console.log('📊 [Redux] Lesson unmarked:', {guideId, lessonId});
      }
    },

    /**
     * Reset all completions for a specific guide
     */
    resetGuideProgress: (state, action: PayloadAction<string>) => {
      const guideId = action.payload;
      delete state.completedLessons[guideId];
      console.log('📊 [Redux] Guide progress reset:', guideId);
    },

    /**
     * Reset all cosmic guide progress
     */
    resetAllProgress: state => {
      state.completedLessons = {};
      console.log('📊 [Redux] All cosmic guide progress reset');
    },
  },
});

// Export actions
export const {
  markLessonCompleted,
  markLessonIncomplete,
  resetGuideProgress,
  resetAllProgress,
} = cosmicGuidesSlice.actions;

// Selectors
export const selectCompletedLessons = (state: {cosmicGuides: CosmicGuidesState}) =>
  state.cosmicGuides.completedLessons;

export const selectCompletedLessonsForGuide = (
  state: {cosmicGuides: CosmicGuidesState},
  guideId: string,
) => state.cosmicGuides.completedLessons[guideId] || [];

export const selectIsLessonCompleted = (
  state: {cosmicGuides: CosmicGuidesState},
  guideId: string,
  lessonId: string,
) => {
  const guideCompletions = state.cosmicGuides.completedLessons[guideId];
  return guideCompletions ? guideCompletions.includes(lessonId) : false;
};

export default cosmicGuidesSlice.reducer;
