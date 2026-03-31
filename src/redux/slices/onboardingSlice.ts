import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../rootReducer';

/**
 * Onboarding Data Slice
 * 
 * Stores all user data collected during onboarding:
 * - Life alignment selection
 * - Name
 * - Birthday and zodiac sign
 * - Birth time
 * - Birth location (city, country)
 * 
 * This data is persisted and used throughout the app for:
 * - Horoscope calculations
 * - Personalized readings
 * - User profile display
 */

// Alignment options from Screen 1
export type AlignmentOption = 'in-my-flow' | 'figuring-it-out' | 'totally-lost' | null;

/**
 * Onboarding State Interface
 */
export interface OnboardingState {
  // Screen 1: Life alignment
  alignment: AlignmentOption;
  
  // Screen 2: User's name
  name: string;
  
  // Screen 3: Birthday (stored as ISO string for serialization)
  birthday: string | null;
  
  // Derived from birthday
  zodiacSign: string | null;
  
  // Screen 9: Birth time
  birthTime: string;
  
  // Screen 9: Birth location
  city: string;
  country: string;
  
  // Timestamp when onboarding was completed
  completedAt: string | null;
  
  // Is onboarding data saved?
  isDataSaved: boolean;
}

/**
 * Initial State
 */
const initialState: OnboardingState = {
  alignment: null,
  name: '',
  birthday: null,
  zodiacSign: null,
  birthTime: '',
  city: '',
  country: '',
  completedAt: null,
  isDataSaved: false,
};

/**
 * Payload for saving complete onboarding data
 * Note: birthday should be passed as ISO string to avoid non-serializable warning
 */
export interface SaveOnboardingDataPayload {
  alignment: AlignmentOption;
  name: string;
  birthday: string | null; // ISO string format
  birthTime: string;
  city: string;
  country: string;
  zodiacSign?: string;
}

/**
 * Onboarding Slice
 */
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    /**
     * Set life alignment selection (Screen 1)
     */
    setAlignment: (state, action: PayloadAction<AlignmentOption>) => {
      state.alignment = action.payload;
      console.log('📊 [Redux] Alignment set:', action.payload);
    },

    /**
     * Set user's name (Screen 2)
     */
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      console.log('📊 [Redux] Name set:', action.payload);
    },

    /**
     * Set birthday and zodiac sign (Screen 3)
     */
    setBirthday: (state, action: PayloadAction<{birthday: Date; zodiacSign: string}>) => {
      state.birthday = action.payload.birthday.toISOString();
      state.zodiacSign = action.payload.zodiacSign;
      console.log('📊 [Redux] Birthday set:', action.payload.birthday.toISOString());
      console.log('📊 [Redux] Zodiac sign:', action.payload.zodiacSign);
    },

    /**
     * Set birth time (Screen 9)
     */
    setBirthTime: (state, action: PayloadAction<string>) => {
      state.birthTime = action.payload;
      console.log('📊 [Redux] Birth time set:', action.payload);
    },

    /**
     * Set birth location (Screen 9)
     */
    setBirthLocation: (state, action: PayloadAction<{city: string; country: string}>) => {
      state.city = action.payload.city;
      state.country = action.payload.country;
      console.log('📊 [Redux] Birth location set:', action.payload.city, ',', action.payload.country);
    },

    /**
     * Save all onboarding data at once (Screen 10)
     * Called when progress bar completes
     */
    saveOnboardingData: (state, action: PayloadAction<SaveOnboardingDataPayload>) => {
      const {alignment, name, birthday, birthTime, city, country, zodiacSign} = action.payload;
      
      console.log('\n========================================');
      console.log('🎯 [Redux] SAVING COMPLETE ONBOARDING DATA');
      console.log('========================================');
      
      state.alignment = alignment;
      console.log('📊 Alignment:', alignment);
      
      state.name = name;
      console.log('📊 Name:', name);
      
      if (birthday) {
        state.birthday = birthday; // Already an ISO string
        console.log('📊 Birthday:', birthday);
      }
      
      if (zodiacSign) {
        state.zodiacSign = zodiacSign;
        console.log('📊 Zodiac Sign:', zodiacSign);
      }
      
      state.birthTime = birthTime;
      console.log('📊 Birth Time:', birthTime);
      
      state.city = city;
      state.country = country;
      console.log('📊 Birth Location:', city, ',', country);
      
      state.completedAt = new Date().toISOString();
      state.isDataSaved = true;
      
      console.log('📊 Completed At:', state.completedAt);
      console.log('✅ Onboarding data saved to Redux successfully!');
      console.log('========================================\n');
    },

    /**
     * Clear all onboarding data
     * Useful for testing or resetting user
     */
    clearOnboardingData: (state) => {
      console.log('🗑️ [Redux] Clearing onboarding data...');
      Object.assign(state, initialState);
      console.log('✅ [Redux] Onboarding data cleared!');
    },
  },
});

// Export actions
export const {
  setAlignment,
  setName,
  setBirthday,
  setBirthTime,
  setBirthLocation,
  saveOnboardingData,
  clearOnboardingData,
} = onboardingSlice.actions;

// ===== SELECTORS =====

/**
 * Select complete onboarding state
 */
export const selectOnboardingState = (state: RootState) => state.onboarding;

/**
 * Select user's name
 */
export const selectUserName = (state: RootState) => state.onboarding.name;

/**
 * Select user's zodiac sign
 */
export const selectZodiacSign = (state: RootState) => state.onboarding.zodiacSign;

/**
 * Select user's birthday as Date object
 */
export const selectBirthday = (state: RootState) => {
  return state.onboarding.birthday ? new Date(state.onboarding.birthday) : null;
};

/**
 * Select user's birth time
 */
export const selectBirthTime = (state: RootState) => state.onboarding.birthTime;

/**
 * Select user's birth location
 */
export const selectBirthLocation = (state: RootState) => ({
  city: state.onboarding.city,
  country: state.onboarding.country,
});

/**
 * Select user's alignment
 */
export const selectAlignment = (state: RootState) => state.onboarding.alignment;

/**
 * Check if onboarding data is saved
 */
export const selectIsOnboardingDataSaved = (state: RootState) => state.onboarding.isDataSaved;

/**
 * Select when onboarding was completed
 */
export const selectOnboardingCompletedAt = (state: RootState) => state.onboarding.completedAt;

export default onboardingSlice.reducer;
