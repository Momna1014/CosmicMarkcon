import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {api} from '../../api/axiosInstance';
import {API_ENDPOINTS} from '../../api/apiEndpoints';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

/**
 * User Interface
 */
export interface User {
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
 * Auth State Interface
 */
export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Initial State
 */
const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  userId: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

/**
 * Login Request Payload
 */
interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Login Response
 */
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Register Request Payload
 */
interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Token Refresh Response
 */
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * ASYNC THUNK: Login User
 * 
 * Calls POST /auth/login
 * Stores tokens and user data on success
 */
export const loginUser = createAsyncThunk<LoginResponse, LoginPayload, {rejectValue: string}>(
  'auth/loginUser',
  async (credentials, {rejectWithValue}) => {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (__DEV__) {
        console.log('✅ Login successful:', response.user.email);
      }

      showSuccessToast(`Welcome back, ${response.user.firstName}!`);
      return response;
    } catch (error: any) {
      const message = error?.message || 'Login failed. Please try again.';
      showErrorToast(message);
      return rejectWithValue(message);
    }
  },
);

/**
 * ASYNC THUNK: Register User
 * 
 * Calls POST /auth/register
 * Automatically logs in user on successful registration
 */
export const registerUser = createAsyncThunk<LoginResponse, RegisterPayload, {rejectValue: string}>(
  'auth/registerUser',
  async (userData, {rejectWithValue}) => {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (__DEV__) {
        console.log('✅ Registration successful:', response.user.email);
      }

      showSuccessToast('Account created successfully!');
      return response;
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
      showErrorToast(message);
      return rejectWithValue(message);
    }
  },
);

/**
 * ASYNC THUNK: Refresh Access Token
 * 
 * Calls POST /auth/refresh
 * Updates tokens in state
 * Called automatically by axios interceptor on 401
 */
export const refreshAccessToken = createAsyncThunk<
  RefreshTokenResponse,
  string,
  {rejectValue: string}
>('auth/refreshAccessToken', async (refreshToken, {rejectWithValue}) => {
  try {
    const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    if (__DEV__) {
      console.log('✅ Token refresh successful');
    }

    return response;
  } catch (error: any) {
    const message = error?.message || 'Session expired. Please login again.';
    return rejectWithValue(message);
  }
});

/**
 * ASYNC THUNK: Logout User
 * 
 * Calls POST /auth/logout (optional - invalidate refresh token server-side)
 * Clears all auth data from state
 */
export const logoutUser = createAsyncThunk<void, void, {rejectValue: string}>(
  'auth/logoutUser',
  async (_, {rejectWithValue, getState}) => {
    try {
      // Optional: Call logout endpoint to invalidate refresh token
      const state = getState() as {auth: AuthState};
      if (state.auth.refreshToken) {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refreshToken: state.auth.refreshToken,
        });
      }

      if (__DEV__) {
        console.log('✅ Logout successful');
      }

      showSuccessToast('Logged out successfully');
    } catch (error: any) {
      // Don't block logout on API error
      if (__DEV__) {
        console.warn('⚠️ Logout API call failed, proceeding with local logout', error);
      }
    }
  },
);

/**
 * ASYNC THUNK: Fetch User Profile
 * 
 * Calls GET /users/profile
 * Updates user data in state
 */
export const fetchUserProfile = createAsyncThunk<User, void, {rejectValue: string}>(
  'auth/fetchUserProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response = await api.get<User>(API_ENDPOINTS.USERS.PROFILE);

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
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set tokens (used by axios interceptor after refresh)
     */
    setTokens: (state, action: PayloadAction<{token: string; refreshToken: string}>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },

    /**
     * Set user data
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    /**
     * Set user ID (e.g. from anonymous Firebase sign-in)
     */
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },

    /**
     * Logout (clear all auth data)
     */
    logout: state => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
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
    // Login User
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });

    // Register User
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      });

    // Refresh Access Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, state => {
        // Token refresh failed - logout
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Logout User
    builder.addCase(logoutUser.fulfilled, state => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });
  },
});

export const {setTokens, setUser, setUserId, logout, clearError} = authSlice.actions;
export default authSlice.reducer;
