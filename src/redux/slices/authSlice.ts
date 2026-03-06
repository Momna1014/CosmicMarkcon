import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * Auth State Interface
 * Simple state to store Firebase anonymous user ID
 */
export interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
}

/**
 * Initial State
 */
const initialState: AuthState = {
  userId: null,
  isAuthenticated: false,
};

/**
 * Auth Slice
 * Simple slice to store Firebase user ID
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user ID after anonymous login
     */
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
      state.isAuthenticated = true;
    },

    /**
     * Clear user ID on logout
     */
    clearUserId: (state) => {
      state.userId = null;
      state.isAuthenticated = false;
    },
  },
});

export const {setUserId, clearUserId} = authSlice.actions;
export default authSlice.reducer;
