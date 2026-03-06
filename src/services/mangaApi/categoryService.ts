/**
 * Category Service
 *
 * Handles all category-related API calls for the Manga API
 */

import {MANGA_API_ENDPOINTS} from '../../api/apiEndpoints';
import {mangaApi} from './mangaAxiosInstance';
import {CategoryListResponse} from './types';

/**
 * Category Service
 * Provides methods for fetching manga categories
 */
export const CategoryService = {
  /**
   * Fetch all categories
   * @returns Promise<CategoryListResponse> - List of all manga categories
   */
  getCategories: async (): Promise<CategoryListResponse> => {
    return mangaApi.post<CategoryListResponse>(
      MANGA_API_ENDPOINTS.CATEGORIES.LIST,
      {}, // Empty body as per API specification
    );
  },
};

export default CategoryService;
