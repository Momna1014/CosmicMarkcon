import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface KeysConfig {
  Api_key: string;
  baseURL: string;
  model: string;
  temperature: number;
}

export interface KeysState {
  config: KeysConfig | null;
  isLoaded: boolean;
}

const initialState: KeysState = {
  config: null,
  isLoaded: false,
};

const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    setKeysConfig: (state, action: PayloadAction<KeysConfig>) => {
      state.config = action.payload;
      state.isLoaded = true;
    },
    clearKeysConfig: state => {
      state.config = null;
      state.isLoaded = false;
    },
  },
});

export const {setKeysConfig, clearKeysConfig} = keysSlice.actions;
export default keysSlice.reducer;
