/**
 * Available API providers
 */
export type ApiProvider = 'QURANAPI' | 'QURANFOUNDATION';

/**
 * API Provider Configuration Interface
 */
export interface ApiProviderConfig {
  /** Current active provider */
  provider: ApiProvider;
  
  /** Base URLs for each provider */
  baseUrls: {
    QURANAPI: string;
    QURANFOUNDATION: string;
  };
  
  /** Whether to use backend proxy for QURANFOUNDATION */
  useBackendProxy: boolean;
  
  /** Backend proxy URL (if useBackendProxy is true) */
  backendProxyUrl?: string;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Max retry attempts for failed requests */
  maxRetries: number;
  
  /** Retry delay in milliseconds (exponential backoff base) */
  retryDelay: number;
}

/**
 * Default API Provider Configuration
 */
export const API_CONFIG: ApiProviderConfig = {
  // Default to QURANAPI (client-safe, no auth required)
  provider: 'QURANAPI',
  
  baseUrls: {
    QURANAPI: 'https://quranapi.pages.dev/api',
    QURANFOUNDATION: 'https://api.quran.com/api/v4',
  },
  
  // Disable backend proxy by default (will be enabled when backend is ready)
  useBackendProxy: false,
  backendProxyUrl: undefined,
  
  // Network settings
  timeout: 10000,
  maxRetries: 2,
  retryDelay: 500,
};

/**
 * Get the current API base URL
 */
export function getApiBaseUrl(): string {
  const { provider, baseUrls, useBackendProxy, backendProxyUrl } = API_CONFIG;
  
  if (provider === 'QURANFOUNDATION' && useBackendProxy && backendProxyUrl) {
    return backendProxyUrl;
  }
  
  return baseUrls[provider];
}

/**
 * Check if current provider requires backend proxy
 */
export function requiresBackendProxy(): boolean {
  return API_CONFIG.provider === 'QURANFOUNDATION' && API_CONFIG.useBackendProxy;
}

/**
 * Get endpoint URL based on provider
 * 
 * @param endpoint - Endpoint path (e.g., '/surah.json' for QURANAPI or '/chapters' for QURANFOUNDATION)
 */
export function getEndpointUrl(endpoint: string): string {
  return `${getApiBaseUrl()}${endpoint}`;
}

/**
 * Provider-specific endpoint mapping
 * Maps generic feature names to provider-specific endpoints
 */
export const ENDPOINTS = {
  QURANAPI: {
    surahList: '/surah.json',
    ayah: (surahNo: number, ayahNo: number) => `/${surahNo}/${ayahNo}.json`,
    // Note: QuranAPI doesn't have revelation_order, we use static mapping
  },
  QURANFOUNDATION: {
    surahList: '/chapters',
    juzList: '/juzs',
    ayah: (surahNo: number, ayahNo: number) => `/verses/by_key/${surahNo}:${ayahNo}`,
    recitations: '/resources/recitations',
    // Has revelation_order in chapters response
  },
} as const;

export default API_CONFIG;
