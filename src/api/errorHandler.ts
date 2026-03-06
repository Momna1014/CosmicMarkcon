import {AxiosError} from 'axios';
import {showErrorToast} from '../utils/toast';

/**
 * Standardized API Error Interface
 */
export interface ApiError {
  status: number;
  message: string;
  data?: any;
  code?: string;
  errors?: Record<string, string[]>; // For validation errors
}

/**
 * HTTP Status Code Categories
 */
const ErrorCategory = {
  CLIENT_ERROR: 'CLIENT_ERROR', // 4xx
  SERVER_ERROR: 'SERVER_ERROR', // 5xx
  NETWORK_ERROR: 'NETWORK_ERROR', // No response
  TIMEOUT_ERROR: 'TIMEOUT_ERROR', // Request timeout
  UNKNOWN_ERROR: 'UNKNOWN_ERROR', // Other
} as const;

/**
 * User-friendly error messages by status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please login again.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'Conflict detected. The resource already exists.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please slow down.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. The server took too long to respond.',
};

/**
 * Extract error message from various error formats
 */
const extractErrorMessage = (error: AxiosError): string => {
  const responseData = error.response?.data as any;

  // Try different common error message fields
  if (responseData?.message) return responseData.message;
  if (responseData?.error) return responseData.error;
  if (responseData?.detail) return responseData.detail;
  if (responseData?.errors && typeof responseData.errors === 'object') {
    // Handle validation errors (e.g., { email: ['Invalid email'], password: ['Too short'] })
    const firstError = Object.values(responseData.errors)[0];
    if (Array.isArray(firstError)) return firstError[0];
    return String(firstError);
  }

  // Fallback to status-based message
  return ERROR_MESSAGES[error.response?.status || 500] || 'An unexpected error occurred.';
};

/**
 * Determine error category
 */
const getErrorCategory = (error: AxiosError): string => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return ErrorCategory.TIMEOUT_ERROR;
    return ErrorCategory.NETWORK_ERROR;
  }

  const status = error.response.status;
  if (status >= 400 && status < 500) return ErrorCategory.CLIENT_ERROR;
  if (status >= 500) return ErrorCategory.SERVER_ERROR;

  return ErrorCategory.UNKNOWN_ERROR;
};

/**
 * Check if error should show toast notification
 * Some errors are handled silently (e.g., 401 during token refresh)
 */
const shouldShowToast = (error: AxiosError, silent: boolean = false): boolean => {
  if (silent) return false;

  const status = error.response?.status;

  // Don't show toast for certain status codes
  const silentStatuses = [401]; // 401 is handled by token refresh
  if (status && silentStatuses.includes(status)) return false;

  return true;
};

/**
 * Main Error Handler
 * 
 * Converts Axios errors to standardized ApiError format
 * Shows toast notifications for user-facing errors
 * Logs errors in development mode
 * 
 * @param error - Axios error object
 * @param silent - If true, suppresses toast notifications
 * @returns Standardized ApiError object
 */
export const handleApiError = (error: AxiosError, silent: boolean = false): ApiError => {
  const category = getErrorCategory(error);
  const message = extractErrorMessage(error);
  const status = error.response?.status || 0;
  const data = error.response?.data;
  const code = error.code;

  // Log error in development
  if (__DEV__) {
    console.error('🔴 API Error:', {
      category,
      status,
      message,
      code,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data,
    });
  }

  // Show toast notification
  if (shouldShowToast(error, silent)) {
    showErrorToast(message);
  }

  // Return standardized error
  const apiError: ApiError = {
    status,
    message,
    code,
    data,
  };

  // Add validation errors if present
  if (data && typeof data === 'object' && 'errors' in data) {
    apiError.errors = data.errors as Record<string, string[]>;
  }

  return apiError;
};

/**
 * Type guard to check if an error is an Axios error
 */
export const isAxiosError = (error: any): error is AxiosError => {
  return error?.isAxiosError === true;
};

/**
 * Check if error is a network error (no response received)
 */
export const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && error.message === 'Network Error';
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: AxiosError): boolean => {
  return error.code === 'ECONNABORTED';
};

/**
 * Check if error is a client error (4xx)
 */
export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (status: number): boolean => {
  return status >= 500;
};
