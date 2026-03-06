package com.cosmic.markcon.widget

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise

/**
 * WidgetBridge - React Native module for widget communication
 * 
 * Provides methods to update widget content from JavaScript.
 * This enables dynamic data flow from React Native to Android widgets.
 * 
 * Usage from React Native:
 * ```typescript
 * import { NativeModules } from 'react-native';
 * const { WidgetModule } = NativeModules;
 * 
 * await WidgetModule.updateWidget('Shopping List', ['Milk', 'Eggs', 'Bread']);
 * ```
 */
class WidgetBridge(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetModule"
    }

    /**
     * Update widget with new title and items
     * 
     * @param title Widget title to display
     * @param items Array of todo items (max 5 will be displayed)
     * @param promise Promise to resolve when update is complete
     */
    @ReactMethod
    fun updateWidget(title: String?, items: ReadableArray?, promise: Promise) {
        try {
            val itemsList = items?.let { readableArray ->
                (0 until readableArray.size()).map { i ->
                    readableArray.getString(i) ?: ""
                }.filter { it.isNotEmpty() }
            }

            // Update widget directly (doesn't need UI thread)
            TodoWidgetProvider.updateWidgets(
                reactApplicationContext,
                title,
                itemsList
            )

            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("WidgetBridge", "Error updating widget", e)
            promise.reject("WIDGET_UPDATE_ERROR", "Failed to update widget: ${e.message}", e)
        }
    }

    /**
     * Update only the widget title
     * 
     * @param title New title to display
     * @param promise Promise to resolve when update is complete
     */
    @ReactMethod
    fun updateWidgetTitle(title: String, promise: Promise) {
        try {
            TodoWidgetProvider.updateWidgets(
                reactApplicationContext,
                title,
                null
            )
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("WidgetBridge", "Error updating widget title", e)
            promise.reject("WIDGET_UPDATE_ERROR", "Failed to update widget title: ${e.message}", e)
        }
    }

    /**
     * Update only the widget items
     * 
     * @param items Array of todo items
     * @param promise Promise to resolve when update is complete
     */
    @ReactMethod
    fun updateWidgetItems(items: ReadableArray, promise: Promise) {
        try {
            val itemsList = (0 until items.size()).map { i ->
                items.getString(i) ?: ""
            }.filter { it.isNotEmpty() }

            TodoWidgetProvider.updateWidgets(
                reactApplicationContext,
                null,
                itemsList
            )
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("WidgetBridge", "Error updating widget items", e)
            promise.reject("WIDGET_UPDATE_ERROR", "Failed to update widget items: ${e.message}", e)
        }
    }

    /**
     * Clear widget data
     * 
     * @param promise Promise to resolve when clear is complete
     */
    @ReactMethod
    fun clearWidget(promise: Promise) {
        try {
            TodoWidgetProvider.updateWidgets(
                reactApplicationContext,
                "My Todo List",
                listOf("No items yet", "Add items from the app")
            )
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("WidgetBridge", "Error clearing widget", e)
            promise.reject("WIDGET_CLEAR_ERROR", "Failed to clear widget: ${e.message}", e)
        }
    }
}
