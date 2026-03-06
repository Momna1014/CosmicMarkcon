/**
 * Firebase Remote Config Service
 * 
 * Provides A/B testing, feature flags, and remote configuration management
 * for both iOS and Android platforms.
 * 
 * Features:
 * - Remote configuration with default values
 * - A/B testing experiments
 * - Feature flags management
 * - Real-time config updates
 * - Type-safe config access
 * 
 * @example
 * ```typescript
 * import {RemoteConfigService} from './services/firebase';
 * 
 * // Initialize with defaults
 * await RemoteConfigService.initialize({
 *   welcome_message: 'Hello!',
 *   feature_enabled: false,
 * });
 * 
 * // Get config values
 * const message = RemoteConfigService.getString('welcome_message');
 * const enabled = RemoteConfigService.getBoolean('feature_enabled');
 * ```
 */

import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

export type ConfigDefaults = {
  [key: string]: string | number | boolean;
};

class RemoteConfigServiceClass {
  private isInitialized: boolean = false;
  private configInstance: FirebaseRemoteConfigTypes.Module;

  constructor() {
    this.configInstance = remoteConfig();
  }

  /**
   * Initialize Remote Config with default values
   * @param defaults Object containing default configuration values
   * @param fetchInterval Minimum fetch interval in seconds (default: 3600 = 1 hour)
   */
  async initialize(
    defaults: ConfigDefaults = {},
    fetchInterval: number = 3600,
  ): Promise<void> {
    try {
      console.log('[RemoteConfigService] Initializing with defaults:', defaults);

      // Set default values
      await this.configInstance.setDefaults(defaults);

      // Set config settings
      await this.configInstance.setConfigSettings({
        minimumFetchIntervalMillis: fetchInterval * 1000, // Convert to milliseconds
      });

      // Fetch and activate
      await this.fetchAndActivate();

      this.isInitialized = true;
      console.log('[RemoteConfigService] Initialized successfully');
    } catch (error) {
      console.error('[RemoteConfigService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Fetch latest config from server and activate it
   * @returns true if new config was activated, false otherwise
   */
  async fetchAndActivate(): Promise<boolean> {
    try {
      console.log('[RemoteConfigService] Fetching and activating config...');
      const activated = await this.configInstance.fetchAndActivate();
      
      if (activated) {
        console.log('[RemoteConfigService] New config activated');
      } else {
        console.log('[RemoteConfigService] No new config available');
      }
      
      return activated;
    } catch (error) {
      console.error('[RemoteConfigService] Fetch and activate error:', error);
      return false;
    }
  }

  /**
   * Fetch config from server without activating
   * Useful for prefetching config in the background
   */
  async fetch(): Promise<void> {
    try {
      console.log('[RemoteConfigService] Fetching config...');
      await this.configInstance.fetch();
      console.log('[RemoteConfigService] Config fetched successfully');
    } catch (error) {
      console.error('[RemoteConfigService] Fetch error:', error);
      throw error;
    }
  }

  /**
   * Activate the last fetched config
   * @returns true if config was activated, false otherwise
   */
  async activate(): Promise<boolean> {
    try {
      console.log('[RemoteConfigService] Activating config...');
      const activated = await this.configInstance.activate();
      
      if (activated) {
        console.log('[RemoteConfigService] Config activated');
      } else {
        console.log('[RemoteConfigService] No config to activate');
      }
      
      return activated;
    } catch (error) {
      console.error('[RemoteConfigService] Activate error:', error);
      return false;
    }
  }

  /**
   * Get a string value from Remote Config
   * @param key Configuration key
   * @returns String value or empty string if not found
   */
  getString(key: string): string {
    try {
      const value = this.configInstance.getValue(key).asString();
      console.log(`[RemoteConfigService] getString('${key}'): ${value}`);
      return value;
    } catch (error) {
      console.error(`[RemoteConfigService] Error getting string '${key}':`, error);
      return '';
    }
  }

  /**
   * Get a boolean value from Remote Config
   * @param key Configuration key
   * @returns Boolean value or false if not found
   */
  getBoolean(key: string): boolean {
    try {
      const value = this.configInstance.getValue(key).asBoolean();
      console.log(`[RemoteConfigService] getBoolean('${key}'): ${value}`);
      return value;
    } catch (error) {
      console.error(`[RemoteConfigService] Error getting boolean '${key}':`, error);
      return false;
    }
  }

  /**
   * Get a number value from Remote Config
   * @param key Configuration key
   * @returns Number value or 0 if not found
   */
  getNumber(key: string): number {
    try {
      const value = this.configInstance.getValue(key).asNumber();
      console.log(`[RemoteConfigService] getNumber('${key}'): ${value}`);
      return value;
    } catch (error) {
      console.error(`[RemoteConfigService] Error getting number '${key}':`, error);
      return 0;
    }
  }

  /**
   * Get a JSON object from Remote Config
   * @param key Configuration key
   * @returns Parsed JSON object or null if parsing fails
   */
  getObject<T = any>(key: string): T | null {
    try {
      const jsonString = this.getString(key);
      if (!jsonString) {
        return null;
      }
      const value = JSON.parse(jsonString) as T;
      console.log(`[RemoteConfigService] getObject('${key}'):`, value);
      return value;
    } catch (error) {
      console.error(`[RemoteConfigService] Error parsing object '${key}':`, error);
      return null;
    }
  }

  /**
   * Get all config values
   * @returns Object containing all config key-value pairs
   */
  getAll(): {[key: string]: FirebaseRemoteConfigTypes.ConfigValue} {
    try {
      const allValues = this.configInstance.getAll();
      console.log('[RemoteConfigService] getAll():', Object.keys(allValues).length, 'keys');
      return allValues;
    } catch (error) {
      console.error('[RemoteConfigService] Error getting all values:', error);
      return {};
    }
  }

  /**
   * Get config value with metadata
   * @param key Configuration key
   * @returns Config value with source information
   */
  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue {
    return this.configInstance.getValue(key);
  }

  /**
   * Get the source of a config value
   * @param key Configuration key
   * @returns 'remote', 'default', or 'static'
   */
  getSource(key: string): 'remote' | 'default' | 'static' {
    const value = this.getValue(key);
    return value.getSource();
  }

  /**
   * Set config settings
   * @param settings Config settings object
   */
  async setConfigSettings(settings: {
    minimumFetchIntervalMillis?: number;
    fetchTimeoutMillis?: number;
  }): Promise<void> {
    try {
      await this.configInstance.setConfigSettings(settings);
      console.log('[RemoteConfigService] Config settings updated:', settings);
    } catch (error) {
      console.error('[RemoteConfigService] Error setting config settings:', error);
      throw error;
    }
  }

  /**
   * Reset Remote Config to default values
   * Useful for testing or resetting state
   */
  async reset(): Promise<void> {
    try {
      console.log('[RemoteConfigService] Resetting to defaults...');
      await this.configInstance.reset();
      this.isInitialized = false;
      console.log('[RemoteConfigService] Reset complete');
    } catch (error) {
      console.error('[RemoteConfigService] Reset error:', error);
      throw error;
    }
  }

  /**
   * Get the last successful fetch timestamp
   * @returns Timestamp in milliseconds or 0 if never fetched
   */
  getLastFetchTime(): number {
    try {
      const settings = this.configInstance.settings;
      const lastFetchTime = (settings as any).lastFetchTime || 0;
      console.log('[RemoteConfigService] Last fetch time:', new Date(lastFetchTime).toISOString());
      return lastFetchTime;
    } catch (error) {
      console.error('[RemoteConfigService] Error getting last fetch time:', error);
      return 0;
    }
  }

  /**
   * Get the last fetch status
   * @returns Fetch status: 'success', 'failure', 'no_fetch_yet', or 'throttled'
   */
  getLastFetchStatus(): string {
    try {
      const settings = this.configInstance.settings;
      const status = (settings as any).lastFetchStatus || 'unknown';
      console.log('[RemoteConfigService] Last fetch status:', status);
      return status;
    } catch (error) {
      console.error('[RemoteConfigService] Error getting last fetch status:', error);
      return 'unknown';
    }
  }

  /**
   * Check if Remote Config has been initialized
   * @returns true if initialized, false otherwise
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Enable developer mode for faster fetch intervals
   * Note: This is automatically handled in debug builds
   */
  async enableDeveloperMode(): Promise<void> {
    try {
      await this.setConfigSettings({
        minimumFetchIntervalMillis: 0, // Fetch immediately
      });
      console.log('[RemoteConfigService] Developer mode enabled');
    } catch (error) {
      console.error('[RemoteConfigService] Error enabling developer mode:', error);
    }
  }

  /**
   * Get the underlying Firebase Remote Config instance
   * For advanced usage only
   */
  getInstance(): FirebaseRemoteConfigTypes.Module {
    return this.configInstance;
  }
}

// Export singleton instance
export const RemoteConfigService = new RemoteConfigServiceClass();

// Export types
export type {FirebaseRemoteConfigTypes};
