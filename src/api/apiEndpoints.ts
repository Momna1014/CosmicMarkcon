/**
 * Centralized API Endpoints
 * 
 * Benefits:
 * - Single source of truth for all API routes
 * - Easy to update and maintain
 * - Type-safe endpoint references
 * - Prevents typos in endpoint strings
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // User Management
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
} as const;

/**
 * GPT Keys API Endpoints
 * Base URL: GPT_KEYS_BASE_URL from .env
 */
export const GPT_KEYS_ENDPOINTS = {
  GET_KEY: 'get_gpt_key.php',
} as const;

/**
 * Manga API Endpoints
 * Base URL: MANGA_API_BASE_URL from .env
 */
export const MANGA_API_ENDPOINTS = {
  // Categories
  CATEGORIES: {
    LIST: 'category_list',
  },
  // Dashboard
  DASHBOARD: {
    DATA: 'dashboard_data',
  },
  // Manga
  MANGA: {
    BY_CATEGORY: 'get_manga_by_cat_id',
    DETAIL: 'get_manga_detail_by_id',
    RECORD_VIEW: 'record_view',
  },
  // Comments
  COMMENTS: {
    ADD: 'add_comment',
    GET: 'get_manga_comments',
    LIKE: 'like_comment',
    DELETE: 'delete_comment',
  },
} as const;

export type MangaApiEndpoints = typeof MANGA_API_ENDPOINTS;

export type ApiEndpoints = typeof API_ENDPOINTS;
