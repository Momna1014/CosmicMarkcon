import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CosmicHomeData} from '../../services/ConversationService';

interface CosmicDataState {
  data: CosmicHomeData | null;
  fetchedDate: string | null;
}

const initialState: CosmicDataState = {
  data: null,
  fetchedDate: null,
};

const cosmicDataSlice = createSlice({
  name: 'cosmicData',
  initialState,
  reducers: {
    setCosmicData: (state, action: PayloadAction<CosmicHomeData>) => {
      state.data = action.payload;
      state.fetchedDate = new Date().toISOString().slice(0, 10);
    },
    clearCosmicData: state => {
      state.data = null;
      state.fetchedDate = null;
    },
  },
});

export const {setCosmicData, clearCosmicData} = cosmicDataSlice.actions;
export default cosmicDataSlice.reducer;
