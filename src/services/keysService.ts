import axios from 'axios';
import {GPT_KEYS_BASE_URL} from '@env';
import {GPT_KEYS_ENDPOINTS} from '../api/apiEndpoints';
import {KeysConfig} from '../redux/slices/keysSlice';

export const keysService = {
  getGptKeys: async (): Promise<KeysConfig | null> => {
    try {
      console.log('🔑 [KeysService] Fetching GPT keys...');

      const response = await axios.get(
        `${GPT_KEYS_BASE_URL}${GPT_KEYS_ENDPOINTS.GET_KEY}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('✅ [KeysService] GPT Keys API Response:', JSON.stringify(response.data, null, 2));
      return response.data?.open_ai_key ?? null;
    } catch (error: any) {
      console.warn('⚠️ [KeysService] GPT Keys API Error:', error.message || error);
      return null;
    }
  },
};
