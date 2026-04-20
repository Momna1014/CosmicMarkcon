import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../rootReducer';

/**
 * Onboarding Data Slice
 * 
 * Stores essential user data collected during onboarding:
 * - Gender identity (optional)
 * - Name (optional)
 * - Birthday and zodiac sign (REQUIRED - main field)
 * - Birth location (city, country) (optional)
 * 
 * This data is persisted and used throughout the app for:
 * - Horoscope calculations
 * - Personalized readings
 * - User profile display
 * 
 * Note: Only birthday is required. All other fields are optional.
 */

/**
 * Onboarding State Interface
 */
export interface OnboardingState {
  // Screen 4: Gender identity (optional)
  gender: string | null;
  
  // Screen 5: User's name (optional)
  name: string;
  
  // Screen 7: Birthday (stored as ISO string for serialization) - REQUIRED
  birthday: string | null;
  
  // Derived from birthday
  zodiacSign: string | null;
  
  // Screen 8: Birth location (optional)
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
  gender: null,
  name: '',
  birthday: null,
  zodiacSign: null,
  city: '',
  country: '',
  completedAt: null,
  isDataSaved: false,
};

/**
 * Payload for saving complete onboarding data
 * Note: birthday should be passed as ISO string to avoid non-serializable warning
 * Only birthday is required, all other fields are optional
 */
export interface SaveOnboardingDataPayload {
  gender?: string | null;
  name?: string;
  birthday: string | null; // ISO string format - REQUIRED
  city?: string;
  country?: string;
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
     * Set gender identity (Screen 4) - Optional
     */
    setGender: (state, action: PayloadAction<string | null>) => {
      state.gender = action.payload;
      console.log('📊 [Redux] Gender set:', action.payload);
    },

    /**
     * Set user's name (Screen 5) - Optional
     */
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      console.log('📊 [Redux] Name set:', action.payload);
    },

    /**
     * Set birthday and zodiac sign (Screen 7) - REQUIRED
     * Note: birthday should be passed as ISO string to avoid serialization warnings
     */
    setBirthday: (state, action: PayloadAction<{birthday: string; zodiacSign: string}>) => {
      state.birthday = action.payload.birthday;
      state.zodiacSign = action.payload.zodiacSign;
      console.log('📊 [Redux] Birthday set:', action.payload.birthday);
      console.log('📊 [Redux] Zodiac sign:', action.payload.zodiacSign);
    },

    /**
     * Set birth location (Screen 8) - Optional
     */
    setBirthLocation: (state, action: PayloadAction<{city: string; country: string}>) => {
      state.city = action.payload.city;
      state.country = action.payload.country;
      console.log('📊 [Redux] Birth location set:', action.payload.city, ',', action.payload.country);
    },

    /**
     * Save all onboarding data at once (Screen 9 - "Explore Insights" button)
     * Called when user completes onboarding
     * Only birthday is required, all other fields are optional
     */
    saveOnboardingData: (state, action: PayloadAction<SaveOnboardingDataPayload>) => {
      const {gender, name, birthday, city, country, zodiacSign} = action.payload;
      
      console.log('\n========================================');
      console.log('🎯 [Redux] SAVING ONBOARDING DATA');
      console.log('========================================');
      
      // Birthday is required
      if (birthday) {
        state.birthday = birthday;
        console.log('📊 Birthday (REQUIRED):', birthday);
      }
      
      if (zodiacSign) {
        state.zodiacSign = zodiacSign;
        console.log('📊 Zodiac Sign:', zodiacSign);
      }
      
      // Optional fields
      if (gender !== undefined && gender !== null) {
        state.gender = gender;
        console.log('📊 Gender (optional):', gender);
      }
      
      if (name !== undefined) {
        state.name = name; // empty string clears the name
        console.log('📊 Name (optional):', name || '(cleared)');
      }
      
      if (city) {
        state.city = city;
        console.log('📊 City (optional):', city);
      }
      
      if (country) {
        state.country = country;
        console.log('📊 Country (optional):', country);
      }
      
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
  setGender,
  setName,
  setBirthday,
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
 * Select user's birth location
 */
export const selectBirthLocation = (state: RootState) => ({
  city: state.onboarding.city,
  country: state.onboarding.country,
});

/**
 * Select user's gender identity
 */
export const selectGender = (state: RootState) => state.onboarding.gender;

/**
 * Check if onboarding data is saved
 */
export const selectIsOnboardingDataSaved = (state: RootState) => state.onboarding.isDataSaved;

/**
 * Select when onboarding was completed
 */
export const selectOnboardingCompletedAt = (state: RootState) => state.onboarding.completedAt;

export default onboardingSlice.reducer;
