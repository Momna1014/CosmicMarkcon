import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../rootReducer';

/**
 * Partners Slice
 * 
 * Stores partner data for Deep Bond compatibility readings
 * Partners can be added/removed and are persisted
 */

export interface Partner {
  id: string;
  name: string;
  birthday: string; // ISO string
  zodiacSign: string;
  city?: string;
  country?: string;
  createdAt: string;
}

export interface PartnersState {
  partners: Partner[];
}

const initialState: PartnersState = {
  partners: [],
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    addPartner: (state, action: PayloadAction<Omit<Partner, 'id' | 'createdAt'>>) => {
      const newPartner: Partner = {
        ...action.payload,
        id: `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      state.partners.push(newPartner);
      console.log('💕 [Redux] Partner added:', newPartner.name);
    },
    
    removePartner: (state, action: PayloadAction<string>) => {
      const index = state.partners.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        const removed = state.partners[index];
        state.partners.splice(index, 1);
        console.log('💔 [Redux] Partner removed:', removed.name);
      }
    },
    
    clearAllPartners: (state) => {
      state.partners = [];
      console.log('🗑️ [Redux] All partners cleared');
    },
  },
});

export const {addPartner, removePartner, clearAllPartners} = partnersSlice.actions;

// Selectors
export const selectPartners = (state: RootState) => state.partners.partners;
export const selectPartnersCount = (state: RootState) => state.partners.partners.length;

export default partnersSlice.reducer;
