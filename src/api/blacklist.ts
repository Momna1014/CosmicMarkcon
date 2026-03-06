/**
 * API Blacklist - Endpoints that should NOT have Authorization tokens attached
 * 
 * Use Case:
 * - Authentication endpoints (login, register, forgot-password)
 * - Public endpoints that don't require authentication
 * - Token refresh endpoint (uses refresh token in body, not header)
 */

export const API_BLACKLIST: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/public/health',
];

/**
 * Check if an endpoint is blacklisted
 * @param url - The API endpoint URL
 * @returns true if the endpoint should skip token attachment
 */
export const isBlacklisted = (url: string): boolean => {
  return API_BLACKLIST.some(endpoint => url.includes(endpoint));
};
