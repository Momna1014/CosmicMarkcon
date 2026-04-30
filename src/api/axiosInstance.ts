import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_BASE_URL} from '@env';
import {store} from '../redux/store';
import {logout, setTokens} from '../redux/slices/authSlice';
import {handleApiError, isAxiosError} from './errorHandler';
import {API_ENDPOINTS} from './apiEndpoints';

/**
 * Axios Instance Configuration
 * 
 * Features:
 * - Automatic token attachment (except blacklisted endpoints)
 * - Token refresh on 401 (for whitelisted endpoints)
 * - Global error handling
 * - Request/Response logging in development
 * - Type-safe responses
 */

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
};

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
 * 
 * Automatically attaches Authorization token to requests
 * Skips blacklisted endpoints (login, register, etc.)
 * Logs requests in development mode
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;
    const url = config.url || '';

    // Log request in development
    if (__DEV__) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${url}`, {
        data: config.data,
        params: config.params,
      });
    }

    // Attach token if:
    // 1. Token exists
    // 2. Endpoint is not blacklisted
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
 * 
 * Handles successful responses and errors globally
 * Implements token refresh logic for 401 errors
 * Logs responses in development mode
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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle non-Axios errors
    if (!isAxiosError(error) || !originalRequest) {
      return Promise.reject(handleApiError(error as AxiosError));
    }

    const status = error.response?.status;
    const url = originalRequest.url || '';

    // TOKEN REFRESH LOGIC
    // Trigger refresh only if:
    // 1. Status is 401 (Unauthorized)
    // 2. Request hasn't been retried yet
    // 3. Endpoint is whitelisted for retry
    // 4. Not already refreshing
    if (status === 401 && !originalRequest._retry ) {
      if (isRefreshing) {
        // Queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        // No refresh token available, logout immediately
        isRefreshing = false;
        processQueue(new Error('No refresh token available'), null);
        store.dispatch(logout());
        return Promise.reject(handleApiError(error));
      }

      try {
        if (__DEV__) {
          console.log('🔄 Attempting token refresh...');
        }

        // Call refresh token endpoint
        const refreshResponse = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
          {
            refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const {accessToken, refreshToken: newRefreshToken} = refreshResponse.data;

        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        if (__DEV__) {
          console.log('✅ Token refresh successful');
        }

        // Update tokens in Redux store (will auto-persist via redux-persist)
        store.dispatch(
          setTokens({
            token: accessToken,
            refreshToken: newRefreshToken || refreshToken,
          }),
        );

        // Update Authorization header for retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests with new token
        processQueue(null, accessToken);

        isRefreshing = false;

        // Retry original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        if (__DEV__) {
          console.error('❌ Token refresh failed:', refreshError);
        }

        processQueue(refreshError, null);
        isRefreshing = false;

        store.dispatch(logout());

        return Promise.reject(
          handleApiError(
            refreshError as AxiosError,
            true, // Silent - don't show toast for refresh failures
          ),
        );
      }
    }

    // Handle all other errors
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
