/**
 * OpenAIConfigService.ts
 * 
 * Secure management of OpenAI API configuration.
 * Fetches and caches OpenAI API key securely.
 * 
 * Security Features:
 * - Stores key in encrypted MMKV storage
 * - Caches key to avoid frequent API calls
 * - Only refetches on API errors (invalid key)
 * - Key is never exposed through logs
 * 
 * Usage:
 * - Call initialize() on app startup
 * - Use getConfig() to get the current configuration
 * - Call refreshConfig() if API returns 401/invalid key errors
 */

import { createMMKV } from 'react-native-mmkv';

// API Configuration
const API_BASE_URL = '';
const AUTH_CODE = '';
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

// Create encrypted MMKV instance for secure storage
const secureStorage = createMMKV({
  id: 'openai-secure-storage',
  encryptionKey: 'project-structure-secure-key-2026',
});

// Storage keys
const STORAGE_KEYS = {
  API_KEY: 'openai:api_key',
  MODEL: 'openai:model',
  TEMPERATURE: 'openai:temperature',
  BASE_URL: 'openai:base_url',
  LAST_FETCH: 'openai:last_fetch',
  FETCH_SUCCESS: 'openai:fetch_success',
};

// Cache duration: 24 hours (only refetch if key is invalid or expired)
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * OpenAI configuration from API
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  baseURL: string;
}

/**
 * API Response structure
 */
interface OpenAIConfigResponse {
  success: boolean;
  open_ai_key: {
    model: string;
    temperature: number;
    Api_key: string;
    baseURL: string;
  };
}

/**
 * OpenAIConfigService
 * Manages secure storage and retrieval of OpenAI configuration
 */
class OpenAIConfigService {
  private static instance: OpenAIConfigService;
  private config: OpenAIConfig | null = null;
  private isFetching: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Load cached config on initialization
    this.loadCachedConfig();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OpenAIConfigService {
    if (!OpenAIConfigService.instance) {
      OpenAIConfigService.instance = new OpenAIConfigService();
    }
    return OpenAIConfigService.instance;
  }

  /**
   * Load cached configuration from secure storage
   */
  private loadCachedConfig(): void {
    try {
      const apiKey = secureStorage.getString(STORAGE_KEYS.API_KEY);
      const model = secureStorage.getString(STORAGE_KEYS.MODEL);
      const temperature = secureStorage.getString(STORAGE_KEYS.TEMPERATURE);
      const baseURL = secureStorage.getString(STORAGE_KEYS.BASE_URL);

      if (apiKey && model) {
        this.config = {
          apiKey,
          model,
          temperature: temperature ? parseFloat(temperature) : 0.3,
          baseURL: baseURL || OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
        };
        console.log('[OpenAIConfig] Loaded cached config');
      }
    } catch (error) {
      console.error('[OpenAIConfig] Error loading cached config:', error);
    }
  }

  /**
   * Save configuration to secure storage
   */
  private saveConfig(config: OpenAIConfig): void {
    try {
      secureStorage.set(STORAGE_KEYS.API_KEY, config.apiKey);
      secureStorage.set(STORAGE_KEYS.MODEL, config.model);
      secureStorage.set(STORAGE_KEYS.TEMPERATURE, config.temperature.toString());
      secureStorage.set(STORAGE_KEYS.BASE_URL, config.baseURL);
      secureStorage.set(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
      secureStorage.set(STORAGE_KEYS.FETCH_SUCCESS, 'true');
      
      this.config = config;
      console.log('[OpenAIConfig] Config saved securely');
    } catch (error) {
      console.error('[OpenAIConfig] Error saving config:', error);
    }
  }

  /**
   * Check if cache is valid (not expired)
   */
  private isCacheValid(): boolean {
    try {
      const lastFetch = secureStorage.getString(STORAGE_KEYS.LAST_FETCH);
      const fetchSuccess = secureStorage.getString(STORAGE_KEYS.FETCH_SUCCESS);
      
      if (!lastFetch || fetchSuccess !== 'true') {
        return false;
      }

      const lastFetchTime = parseInt(lastFetch, 10);
      const now = Date.now();
      
      return (now - lastFetchTime) < CACHE_DURATION_MS;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch configuration from API
   */
  private async fetchConfigFromAPI(): Promise<OpenAIConfig | null> {
    try {
      console.log('[OpenAIConfig] Fetching config from API...');

      // Use form-urlencoded format as expected by the API
      const formData = new URLSearchParams();
      formData.append('auth_code', AUTH_CODE);

      const response = await fetch(`${API_BASE_URL}/get_openai_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: OpenAIConfigResponse = await response.json();

      if (data.success && data.open_ai_key) {
        const config: OpenAIConfig = {
          apiKey: data.open_ai_key.Api_key,
          model: data.open_ai_key.model,
          temperature: data.open_ai_key.temperature,
          baseURL: data.open_ai_key.baseURL || OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
        };

        console.log('[OpenAIConfig] ✅ Config fetched successfully');
        return config;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('[OpenAIConfig] ❌ Fetch failed:', error);
      return null;
    }
  }

  /**
   * Initialize the service - call on app startup
   * This will fetch config if not cached or cache is expired
   */
  public async initialize(): Promise<void> {
    // If already initializing, wait for that to complete
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    // If we have valid cached config, use it
    if (this.config && this.isCacheValid()) {
      console.log('[OpenAIConfig] Using valid cached config');
      return;
    }

    // If we have cached config but it's expired, fetch in background
    // but don't block the app startup
    if (this.config) {
      console.log('[OpenAIConfig] Cache expired, refreshing in background...');
      this.refreshConfig().catch(console.error);
      return;
    }

    // No cached config - need to fetch
    await this.refreshConfig();
  }

  /**
   * Refresh configuration from API
   * Call this when API returns 401 or invalid key errors
   */
  public async refreshConfig(): Promise<OpenAIConfig | null> {
    // Prevent concurrent fetches
    if (this.isFetching) {
      console.log('[OpenAIConfig] Fetch already in progress');
      return this.config;
    }

    this.isFetching = true;

    try {
      const newConfig = await this.fetchConfigFromAPI();
      
      if (newConfig) {
        this.saveConfig(newConfig);
        return newConfig;
      }

      // Mark fetch as failed but keep using old config if available
      secureStorage.set(STORAGE_KEYS.FETCH_SUCCESS, 'false');
      return this.config;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Get the current OpenAI configuration
   * Returns null if not initialized
   */
  public getConfig(): OpenAIConfig | null {
    return this.config;
  }

  /**
   * Get just the API key
   * Returns empty string if not available
   */
  public getApiKey(): string {
    return this.config?.apiKey || '';
  }

  /**
   * Get the model to use
   */
  public getModel(): string {
    return this.config?.model || 'gpt-4o-mini';
  }

  /**
   * Get the temperature setting
   */
  public getTemperature(): number {
    return this.config?.temperature ?? 0.3;
  }

  /**
   * Get the base URL
   */
  public getBaseURL(): string {
    return this.config?.baseURL || OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
  }

  /**
   * Check if configuration is available
   */
  public isConfigured(): boolean {
    return !!this.config?.apiKey;
  }

  /**
   * Clear all stored configuration (for testing/logout)
   */
  public clearConfig(): void {
    this.config = null;
    secureStorage.remove(STORAGE_KEYS.API_KEY);
    secureStorage.remove(STORAGE_KEYS.MODEL);
    secureStorage.remove(STORAGE_KEYS.TEMPERATURE);
    secureStorage.remove(STORAGE_KEYS.BASE_URL);
    secureStorage.remove(STORAGE_KEYS.LAST_FETCH);
    secureStorage.remove(STORAGE_KEYS.FETCH_SUCCESS);
    console.log('[OpenAIConfig] Config cleared');
  }

  /**
   * Handle API error - call this when OpenAI API returns an error
   * This will trigger a config refresh if the error indicates invalid key
   */
  public async handleApiError(error: any): Promise<void> {
    const errorMessage = error?.message || error?.toString() || '';
    const statusCode = error?.status || error?.response?.status;

    // Check if error indicates invalid/expired API key
    if (
      statusCode === 401 ||
      statusCode === 403 ||
      errorMessage.includes('invalid_api_key') ||
      errorMessage.includes('Incorrect API key') ||
      errorMessage.includes('authentication')
    ) {
      console.log('[OpenAIConfig] ⚠️ API key error detected, refreshing config...');
      await this.refreshConfig();
    }
  }

  /**
   * Check if a FastFetchResult status or error string indicates an auth error (401/403).
   * Use this to decide whether to refresh the key and retry.
   */
  public isAuthError(status?: number, errorString?: string): boolean {
    if (status === 401 || status === 403) return true;
    if (errorString) {
      const lower = errorString.toLowerCase();
      if (
        lower.includes('http 401') ||
        lower.includes('http 403') ||
        lower.includes('invalid_api_key') ||
        lower.includes('incorrect api key') ||
        lower.includes('authentication')
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Refresh the API key and return the new key, or null if refresh failed.
   * Convenience wrapper for retry-after-auth-error patterns.
   */
  public async refreshAndGetKey(): Promise<string | null> {
    console.log('[OpenAIConfig] 🔄 Refreshing API key after auth error...');
    await this.refreshConfig();
    const newKey = this.getApiKey();
    if (newKey) {
      console.log('[OpenAIConfig] ✅ Got new API key after refresh');
    } else {
      console.error('[OpenAIConfig] ❌ No key available after refresh');
    }
    return newKey || null;
  }
}

// Export singleton instance
export const openAIConfigService = OpenAIConfigService.getInstance();

export default openAIConfigService;
