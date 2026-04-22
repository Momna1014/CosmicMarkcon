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

export type ApiEndpoints = typeof API_ENDPOINTS;
