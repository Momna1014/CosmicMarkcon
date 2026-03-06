/**
 * Manga API Type Definitions
 *
 * Centralized TypeScript interfaces for Manga API responses
 */

/**
 * Category entity from the Manga API
 */
export interface MangaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  manga_count: number;
}

/**
 * Base API response structure
 */
export interface MangaApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Record view request params
 */
export interface RecordViewParams {
  manga_id: number;
  user_id: string;
}

/**
 * Record view response data
 */
export interface RecordViewData {
  id: number;
  manga_id: string;
  season_id: string | null;
  recorded_at: string;
}

/**
 * Record view response
 */
export interface RecordViewResponse extends MangaApiResponse<RecordViewData> {}

/**
 * Category list response
 */
export interface CategoryListResponse extends MangaApiResponse<MangaCategory[]> {
  count: number;
}

/**
 * Manga item from the API
 */
export interface Manga {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  status: string;
  rating: number;
  age_rating: string;
  total_seasons: number;
  total_episodes: number;
}

/**
 * Category info in manga by category response
 */
export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

/**
 * Manga by category data structure
 */
export interface MangaByCategoryData {
  category: CategoryInfo;
  mangas: Manga[];
  total_mangas: number;
}

/**
 * Manga by category response
 */
export interface MangaByCategoryResponse extends MangaApiResponse<MangaByCategoryData> {}

/**
 * Request params for get manga by category
 */
export interface GetMangaByCategoryParams {
  category_id: number;
}

/**
 * Episode in manga detail
 */
export interface MangaEpisode {
  id: number;
  episode_number: number;
  title: string;
  description: string;
  image: string;
  pdf_file: string;
  age_rating: string;
  published_date: string;
}

/**
 * Season in manga detail
 */
export interface MangaSeason {
  id: number;
  season_number: number;
  title: string;
  description: string;
  total_episodes: number;
  episodes: MangaEpisode[];
}

/**
 * Category in manga detail (simplified)
 */
export interface MangaDetailCategory {
  id: number;
  name: string;
  slug: string;
}

/**
 * Full manga detail from API
 */
export interface MangaDetail {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  status: string;
  rating: number;
  age_rating: string;
  total_seasons: number;
  total_episodes: number;
  total_views?: string;
  categories: MangaDetailCategory[];
  seasons: MangaSeason[];
  comments?: MangaComment[];
}

/**
 * Manga detail response
 */
export interface MangaDetailResponse extends MangaApiResponse<MangaDetail> {}

/**
 * Request params for get manga detail by ID
 */
export interface GetMangaDetailParams {
  manga_id: number;
  user_id?: string; // Optional: pass to get user_liked status in comments
}

/**
 * Comment entity from the API
 */
export interface MangaComment {
  id: number;
  user_name: string;
  user_id?: string;
  comment: string;
  likes: number;
  status: string;
  created_at: string;
  user_liked?: boolean;  // Whether the requesting user has liked this comment
}

/**
 * Add comment request params
 */
export interface AddCommentParams {
  manga_id: number;
  user_name: string;
  user_id: string;
  comment: string;
}

/**
 * Add comment response data
 */
export interface AddCommentData {
  id: number;
  user_name: string;
  user_id: string;
  comment: string;
  likes: number | null;
  dislikes: number | null;
  status: string;
}

/**
 * Add comment response
 */
export interface AddCommentResponse extends MangaApiResponse<AddCommentData> {}

/**
 * Get manga comments request params
 */
export interface GetMangaCommentsParams {
  manga_id: number;
  user_id?: string;  // Pass user_id to get user_liked status for each comment
}

/**
 * Get manga comments response
 */
export interface GetMangaCommentsResponse extends MangaApiResponse<MangaComment[]> {
  total: number;
}

/**
 * Like comment request params
 */
export interface LikeCommentParams {
  comment_id: number;
  user_id: string;
}

/**
 * Like comment response data
 */
export interface LikeCommentData {
  comment_id: number;
  likes: number;
  user_like: 'like' | null;
}

/**
 * Like comment response
 */
export interface LikeCommentResponse extends MangaApiResponse<LikeCommentData> {}

/**
 * Delete comment request params
 */
export interface DeleteCommentParams {
  comment_id: number;
  manga_id: number;
  user_id: string;
}

/**
 * Delete comment response
 */
export interface DeleteCommentResponse extends MangaApiResponse<null> {}

// ============== Dashboard Types ==============

/**
 * Trending manga item in dashboard
 */
export interface DashboardTrendingItem {
  id: number;
  title: string;
  image: string;
  rating: number;
  views_count: number;
}

/**
 * Rising star manga item in dashboard
 */
export interface DashboardRisingStarItem {
  id: number;
  title: string;
  image: string;
  rating: number;
  views_count: number;
}

/**
 * Category inside recommended item
 */
export interface DashboardCategory {
  id: number;
  name: string;
}

/**
 * Recommended manga item in dashboard
 */
export interface DashboardRecommendedItem {
  id: number;
  title: string;
  image: string;
  rating: number;
  categories: DashboardCategory[];
}

/**
 * Completed manga item in dashboard
 */
export interface DashboardCompletedItem {
  id: number;
  title: string;
  image: string;
  rating: number;
}

/**
 * Newly on app manga item in dashboard
 */
export interface DashboardNewlyOnAppItem {
  id: number;
  title: string;
  image: string;
}

/**
 * Genre item in dashboard
 */
export interface DashboardGenreItem {
  id: number;
  name: string;
}

/**
 * Featured item in dashboard (can be null)
 */
export interface DashboardFeaturedItem {
  id: number;
  title: string;
  image: string;
  rating: number;
  genres?: string[];
  categories?: { id: number; name: string }[];
}

/**
 * Dashboard data structure
 */
export interface DashboardData {
  featured: DashboardFeaturedItem | null;
  trending_now: DashboardTrendingItem[];
  rising_stars: DashboardRisingStarItem[];
  recommended_for_you: DashboardRecommendedItem[];
  completed: DashboardCompletedItem[];
  newly_on_app: DashboardNewlyOnAppItem[];
  genres: DashboardGenreItem[];
}

/**
 * Dashboard API response
 */
export interface DashboardResponse extends MangaApiResponse<DashboardData> {}

/**
 * Dashboard request params
 */
export interface GetDashboardParams {
  user_id: string;
}
