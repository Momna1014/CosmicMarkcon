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
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User Management
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_ACCOUNT: '/users/account',
    SETTINGS: '/users/settings',
    PREFERENCES: '/users/preferences',
  },

  // Content
  POSTS: {
    LIST: '/posts',
    DETAIL: (id: string) => `/posts/${id}`, 
    CREATE: '/posts',
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
  },

  // Orders & Payments
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    HISTORY: '/orders/history',
  },

  PAYMENTS: {
    METHODS: '/payments/methods',
    PROCESS: '/payments/process',
    HISTORY: '/payments/history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Public Endpoints
  PUBLIC: {
    HEALTH: '/public/health',
    CONFIG: '/public/config',
  },

  // Demo Endpoints (for testing)
  DEMO: {
    LIST: '/demo',
    CREATE: '/demo',
    DETAIL: (id: string) => `/demo/${id}`,
    UPDATE: (id: string) => `/demo/${id}`,
    DELETE: (id: string) => `/demo/${id}`,
  },
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
