/**
 * Widget Configuration for React Native Project
 * 
 * This file controls whether widgets are enabled in your project.
 * Set ENABLE_WIDGETS to false if you want to create a new project without widgets.
 * 
 * Usage:
 * 1. For new projects without widgets:
 *    - Set ENABLE_WIDGETS = false
 *    - Run: bash rename-widget.sh --disable
 * 
 * 2. For projects with widgets:
 *    - Set ENABLE_WIDGETS = true (default)
 *    - Widgets will be included in the build
 */

module.exports = {
  // Enable or disable widgets in the project
  ENABLE_WIDGETS: true,
  
  // Widget configuration (only used if ENABLE_WIDGETS is true)
  widgetConfig: {
    // Widget provider class name
    providerClass: 'TodoWidgetProvider',
    
    // Widget package name (relative to app package)
    packageName: 'widget',
    
    // Widget display name
    displayName: 'Todo Widget',
    
    // Widget description
    description: 'Quick access to your todo list',
    
    // Widget size constraints (in dp)
    minWidth: 280,
    minHeight: 202,
    maxWidth: 482,
    maxHeight: 340,
    
    // Update frequency (in milliseconds)
    updatePeriod: 1800000, // 30 minutes
    
    // Widget preview image
    previewImage: 'widget_preview',
    
    // Max number of items to display
    maxItems: 5,
    
    // Widget files that will be removed if disabled
    files: {
      kotlin: [
        'android/app/src/main/java/{package}/widget/TodoWidgetProvider.kt',
        'android/app/src/main/java/{package}/widget/WidgetBridge.kt',
        'android/app/src/main/java/{package}/widget/WidgetPackage.kt'
      ],
      resources: [
        'android/app/src/main/res/layout/widget_todo_list.xml',
        'android/app/src/main/res/xml/widget_todo_list_info.xml',
        'android/app/src/main/res/drawable/widget_background.xml'
      ],
      typescript: [
        'src/services/WidgetService.ts',
        'src/screens/WidgetTestScreen.tsx'
      ]
    }
  }
};
