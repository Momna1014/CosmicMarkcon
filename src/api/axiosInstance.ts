import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_BASE_URL} from '@env';
import {handleApiError} from './errorHandler';

/**
 * Axios Instance Configuration
 * 
 * Features:
 * - Global error handling
 * - Request/Response logging in development
 * - Type-safe responses
 */

/**
 * Create configured Axios instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';

    // Log request in development
    if (__DEV__) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('🔴 Request Error:', error);
    }
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 * Handles successful responses and errors globally
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    // Handle all errors
    return Promise.reject(handleApiError(error));
  },
);

/**
 * Type-safe API request wrapper
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.get<T>(url, config).then(response => response.data);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.post<T>(url, data, config).then(response => response.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.put<T>(url, data, config).then(response => response.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.patch<T>(url, data, config).then(response => response.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.delete<T>(url, config).then(response => response.data);
  },
};

export default axiosInstance;
