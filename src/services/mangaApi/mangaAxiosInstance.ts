/**
 * Manga API Axios Instance
 *
 * Separate axios instance for Manga API with its own base URL
 * Features:
 * - Dedicated base URL for manga endpoints
 * - Request/Response logging in development
 * - Type-safe responses
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {MANGA_API_BASE_URL} from '@env';

/**
 * Create configured Axios instance for Manga API
 */
const mangaAxiosInstance: AxiosInstance = axios.create({
  baseURL: MANGA_API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Logs requests in development mode
 */
mangaAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      console.log(`🎌 Manga API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('🔴 Manga API Request Error:', error);
    }
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 * Handles successful responses and errors
 * Logs responses in development mode
 */
mangaAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(
        `✅ Manga API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('🔴 Manga API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

/**
 * Type-safe Manga API request wrapper
 */
export const mangaApi = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return mangaAxiosInstance.get<T>(url, config).then(response => response.data);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return mangaAxiosInstance.post<T>(url, data, config).then(response => response.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return mangaAxiosInstance.put<T>(url, data, config).then(response => response.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return mangaAxiosInstance.patch<T>(url, data, config).then(response => response.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return mangaAxiosInstance.delete<T>(url, config).then(response => response.data);
  },
};

export default mangaAxiosInstance;
