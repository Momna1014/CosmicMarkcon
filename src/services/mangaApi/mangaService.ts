/**
 * Manga Service
 *
 * Handles all manga-related API calls for the Manga API
 */

import {MANGA_API_ENDPOINTS} from '../../api/apiEndpoints';
import {mangaApi} from './mangaAxiosInstance';
import {
  MangaByCategoryResponse,
  GetMangaByCategoryParams,
  MangaDetailResponse,
  GetMangaDetailParams,
  RecordViewParams,
  RecordViewResponse,
} from './types';

/**
 * Manga Service
 * Provides methods for fetching manga data
 */
export const MangaService = {
  /**
   * Fetch manga list by category ID
   * @param params - Contains category_id
   * @returns Promise<MangaByCategoryResponse> - List of mangas for the category
   */
  getMangaByCategory: async (
    params: GetMangaByCategoryParams,
  ): Promise<MangaByCategoryResponse> => {
    return mangaApi.post<MangaByCategoryResponse>(
      MANGA_API_ENDPOINTS.MANGA.BY_CATEGORY,
      params,
    );
  },

  /**
   * Fetch manga detail by ID
   * @param params - Contains manga_id
   * @returns Promise<MangaDetailResponse> - Full manga detail with seasons and episodes
   */
  getMangaDetail: async (
    params: GetMangaDetailParams,
  ): Promise<MangaDetailResponse> => {
    return mangaApi.post<MangaDetailResponse>(
      MANGA_API_ENDPOINTS.MANGA.DETAIL,
      params,
    );
  },

  /**
   * Record a view for a manga (for analytics)
   * @param params - Contains manga_id and user_id
   * @returns Promise<RecordViewResponse>
   */
  recordView: async (
    params: RecordViewParams,
  ): Promise<RecordViewResponse> => {
    return mangaApi.post<RecordViewResponse>(
      MANGA_API_ENDPOINTS.MANGA.RECORD_VIEW,
      params,
    );
  },
};

export default MangaService;
