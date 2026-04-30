/**
 * Centralized API Endpoints
 * 
 * Benefits:
 * - Single source of truth for all API routes
 * - Easy to update and maintain
 * - Type-safe endpoint references
 * - Prevents typos in endpoint strings
 * 
 * Base URLs are stored in .env file:
 * - API_BASE_URL (main app backend)
 * - ALADHAN_API_BASE_URL (prayer times, Islamic calendar, Qibla)
 * - QURAN_CDN_API_BASE_URL (Quran audio/recitation)
 * - OPENAI_API_BASE_URL (AI services)
 * - BIGDATACLOUD_API_BASE_URL (reverse geocoding)
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
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


  // ============================================================================
  // RECITATION & ANALYSIS (API_BASE_URL)
  // ============================================================================
  RECITATION: {
    ANALYZE: '/analyze',
  },

  // ============================================================================
  // OPENAI API ENDPOINTS (OPENAI_API_BASE_URL)
  // ============================================================================
  OPENAI: {
    CHAT_COMPLETIONS: '/chat/completions',
    TRANSCRIPTIONS: '/audio/transcriptions',
  },

} as const;

export const GPT_KEYS_ENDPOINTS = {
  GET_KEY: 'get_gpt_key.php',
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
