/**
 * API Whitelist - Endpoints that should retry after token refresh on 401
 * 
 * Use Case:
 * - Protected endpoints that can benefit from automatic token refresh
 * - User-specific data endpoints
 * - Critical business logic endpoints
 * 
 * Note: Only whitelisted endpoints will trigger token refresh on 401
 * Non-whitelisted endpoints will fail immediately without refresh attempt
 */

export const API_WHITELIST: string[] = [
  '/users',
  '/users/profile',
  '/users/settings',
  '/posts',
  '/posts/comments',
  '/orders',
  '/orders/history',
  '/payments',
  '/subscriptions',
  '/notifications',
  '/dashboard',
  '/analytics',
  '/demo', // Demo endpoints for testing
];

/**
 * Check if an endpoint is whitelisted for token refresh retry
 * @param url - The API endpoint URL
 * @returns true if the endpoint should retry after token refresh
 */
export const isWhitelisted = (url: string): boolean => {
  return API_WHITELIST.some(endpoint => url.includes(endpoint));
};
