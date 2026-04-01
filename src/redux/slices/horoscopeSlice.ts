import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {WeeklyHoroscopeBundle} from '../../services/ConversationService';

export interface HoroscopeState {
  bundle: WeeklyHoroscopeBundle | null;
}

const initialState: HoroscopeState = {
  bundle: null,
};

const horoscopeSlice = createSlice({
  name: 'horoscope',
  initialState,
  reducers: {
    setHoroscopeBundle: (state, action: PayloadAction<WeeklyHoroscopeBundle>) => {
      state.bundle = action.payload;
    },
    clearHoroscopeBundle: state => {
      state.bundle = null;
    },
  },
});

export const {setHoroscopeBundle, clearHoroscopeBundle} = horoscopeSlice.actions;
export default horoscopeSlice.reducer;
