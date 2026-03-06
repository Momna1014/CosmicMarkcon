import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../../api/axiosInstance';
import {API_ENDPOINTS} from '../../api/apiEndpoints';
import {showSuccessToast} from '../../utils/toast';

/**
 * EXAMPLE USER SLICE
 * 
 * This is a template/example for creating additional Redux slices
 * Demonstrates best practices for:
 * - Async thunks for API calls
 * - Loading states
 * - Error handling
 * - Type safety
 * 
 * TO USE THIS SLICE:
 * 1. Uncomment in rootReducer.ts
 * 2. Update interfaces to match your API
 * 3. Update API endpoints
 * 4. Add more thunks as needed
 */

/**
 * User Data Interface (example)
 */
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Preferences Interface (example)
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

/**
 * User State Interface
 */
export interface UserState {
  profile: UserData | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial State
 */
const initialState: UserState = {
  profile: null,
  preferences: null,
  loading: false,
  error: null,
};

/**
 * ASYNC THUNK: Fetch User Profile
 * 
 * Example protected API call that:
 * - Automatically attaches token
 * - Handles token refresh on 401
 * - Shows error toast on failure
 */
export const fetchUserProfile = createAsyncThunk<UserData, void, {rejectValue: string}>(
  'user/fetchProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response = await api.get<UserData>(API_ENDPOINTS.USERS.PROFILE);

      if (__DEV__) {
        console.log('✅ User profile fetched:', response.email);
      }

      return response;
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch user profile.';
      return rejectWithValue(message);
    }
  },
);

/**
 * ASYNC THUNK: Update User Profile
 */
export const updateUserProfile = createAsyncThunk<
  UserData,
  Partial<UserData>,
  {rejectValue: string}
>('user/updateProfile', async (updates, {rejectWithValue}) => {
  try {
    const response = await api.put<UserData>(API_ENDPOINTS.USERS.UPDATE_PROFILE, updates);

    if (__DEV__) {
      console.log('✅ User profile updated');
    }

    showSuccessToast('Profile updated successfully!');
    return response;
  } catch (error: any) {
    const message = error?.message || 'Failed to update profile.';
    return rejectWithValue(message);
  }
});

/**
 * ASYNC THUNK: Fetch User Preferences
 */
export const fetchUserPreferences = createAsyncThunk<
  UserPreferences,
  void,
  {rejectValue: string}
>('user/fetchPreferences', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES);

    if (__DEV__) {
      console.log('✅ User preferences fetched');
    }

    return response;
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch preferences.';
    return rejectWithValue(message);
  }
});

/**
 * ASYNC THUNK: Update User Preferences
 */
export const updateUserPreferences = createAsyncThunk<
  UserPreferences,
  Partial<UserPreferences>,
  {rejectValue: string}
>('user/updatePreferences', async (updates, {rejectWithValue}) => {
  try {
    const response = await api.put<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES, updates);

    if (__DEV__) {
      console.log('✅ User preferences updated');
    }

    showSuccessToast('Preferences saved!');
    return response;
  } catch (error: any) {
    const message = error?.message || 'Failed to update preferences.';
    return rejectWithValue(message);
  }
});

/**
 * User Slice
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set user profile directly (if needed)
     */
    setProfile: (state, action: PayloadAction<UserData>) => {
      state.profile = action.payload;
    },

    /**
     * Set user preferences directly (if needed)
     */
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },

    /**
     * Clear user data (on logout)
     */
    clearUserData: state => {
      state.profile = null;
      state.preferences = null;
      state.error = null;
      state.loading = false;
    },

    /**
     * Clear error
     */
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      });

    // Fetch User Preferences
    builder
      .addCase(fetchUserPreferences.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch preferences';
      });

    // Update User Preferences
    builder
      .addCase(updateUserPreferences.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update preferences';
      });
  },
});

export const {setProfile, setPreferences, clearUserData, clearError} = userSlice.actions;
export default userSlice.reducer;

/**
 * USAGE EXAMPLE:
 * 
 * import {useAppDispatch, useAppSelector} from '../hooks';
 * import {fetchUserProfile, updateUserProfile} from '../redux/slices/UserSlice';
 * 
 * const ProfileScreen = () => {
 *   const dispatch = useAppDispatch();
 *   const {profile, loading} = useAppSelector(state => state.user);
 * 
 *   useEffect(() => {
 *     dispatch(fetchUserProfile());
 *   }, []);
 * 
 *   const handleUpdate = async () => {
 *     await dispatch(updateUserProfile({ firstName: 'John' })).unwrap();
 *   };
 * 
 *   return <Text>{profile?.firstName}</Text>;
 * };
 */
