import { NativeModules, Platform } from 'react-native';

const { WidgetModule } = NativeModules;

/**
 * WidgetService - React Native service for updating Android home screen widgets
 * 
 * This service provides a clean interface to update widget content from JavaScript.
 * Widgets display dynamic data and automatically refresh when updated.
 * 
 * Note: Only works on Android. iOS calls will be ignored safely.
 * 
 * @example
 * ```typescript
 * import WidgetService from './services/WidgetService';
 * 
 * // Update widget with title and items
 * await WidgetService.updateWidget('Shopping List', [
 *   'Milk',
 *   'Eggs',
 *   'Bread',
 *   'Butter',
 *   'Cheese'
 * ]);
 * 
 * // Update only title
 * await WidgetService.updateTitle('My Tasks');
 * 
 * // Update only items
 * await WidgetService.updateItems(['Task 1', 'Task 2']);
 * 
 * // Clear widget
 * await WidgetService.clear();
 * ```
 */
class WidgetService {
  /**
   * Check if widget functionality is available (Android only)
   */
  public isAvailable(): boolean {
    return Platform.OS === 'android' && WidgetModule !== undefined;
  }

  /**
   * Update widget with title and items
   * 
   * @param title Widget title to display
   * @param items Array of todo items (max 5 will be displayed)
   * @returns Promise that resolves when update is complete
   */
  public async updateWidget(title: string, items: string[]): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[WidgetService] Widget functionality is only available on Android');
      return false;
    }

    try {
      await WidgetModule.updateWidget(title, items);
      console.log('[WidgetService] Widget updated successfully');
      return true;
    } catch (error) {
      console.error('[WidgetService] Failed to update widget:', error);
      return false;
    }
  }

  /**
   * Update only the widget title
   * 
   * @param title New title to display
   * @returns Promise that resolves when update is complete
   */
  public async updateTitle(title: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[WidgetService] Widget functionality is only available on Android');
      return false;
    }

    try {
      await WidgetModule.updateWidgetTitle(title);
      console.log('[WidgetService] Widget title updated successfully');
      return true;
    } catch (error) {
      console.error('[WidgetService] Failed to update widget title:', error);
      return false;
    }
  }

  /**
   * Update only the widget items
   * 
   * @param items Array of todo items (max 5 will be displayed)
   * @returns Promise that resolves when update is complete
   */
  public async updateItems(items: string[]): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[WidgetService] Widget functionality is only available on Android');
      return false;
    }

    try {
      await WidgetModule.updateWidgetItems(items);
      console.log('[WidgetService] Widget items updated successfully');
      return true;
    } catch (error) {
      console.error('[WidgetService] Failed to update widget items:', error);
      return false;
    }
  }

  /**
   * Clear widget and reset to default state
   * 
   * @returns Promise that resolves when clear is complete
   */
  public async clear(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('[WidgetService] Widget functionality is only available on Android');
      return false;
    }

    try {
      await WidgetModule.clearWidget();
      console.log('[WidgetService] Widget cleared successfully');
      return true;
    } catch (error) {
      console.error('[WidgetService] Failed to clear widget:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new WidgetService();
