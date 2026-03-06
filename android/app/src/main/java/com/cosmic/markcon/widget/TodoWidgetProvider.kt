package com.cosmic.markcon.widget
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.cosmic.markcon.MainActivity
/**
 * TodoWidgetProvider - Main widget provider for displaying todo items
 *
 * This widget displays dynamic data received from React Native through the WidgetBridge.
 * The widget updates automatically when new data is sent from the JS layer.
 */
class TodoWidgetProvider : AppWidgetProvider() {
    companion object {
        private const val ACTION_REFRESH = "com.project_structure.widget.ACTION_REFRESH"
        private const val PREFS_NAME = "TodoWidgetPrefs"
        private const val PREF_TITLE = "widget_title"
        private const val PREF_ITEMS = "widget_items"
        private const val TAG = "TodoWidget"
        /**
         * Update all widget instances with new data
         */
        fun updateWidgets(context: Context, title: String?, items: List<String>?) {
            try {
                // Save data to SharedPreferences
                val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                with(prefs.edit()) {
                    if (title != null) {
                        putString(PREF_TITLE, title)
                        android.util.Log.d(TAG, "Saved title: $title")
                    }
                    if (items != null) {
                        putString(PREF_ITEMS, items.joinToString("||"))
                        android.util.Log.d(TAG, "Saved items: ${items.joinToString(", ")}")
                    }
                    apply()
                }
                // Trigger widget update
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val componentName = ComponentName(context, TodoWidgetProvider::class.java)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
                android.util.Log.d(TAG, "Updating ${appWidgetIds.size} widget(s)")
                val intent = Intent(context, TodoWidgetProvider::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
                }
                context.sendBroadcast(intent)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Error updating widgets", e)
            }
        }
        /**
         * Get saved widget data from SharedPreferences
         */
        private fun getWidgetData(context: Context): Pair<String, List<String>> {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val title = prefs.getString(PREF_TITLE, "My Todo List") ?: "My Todo List"
            val itemsString = prefs.getString(PREF_ITEMS, "")
            val items = if (itemsString.isNullOrEmpty()) {
                listOf("No items yet", "Add items from the app")
            } else {
                itemsString.split("||")
            }
            return Pair(title, items)
        }
    }
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        android.util.Log.d(TAG, "onUpdate called for ${appWidgetIds.size} widget(s)")
        // Update each widget instance
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        android.util.Log.d(TAG, "onReceive: ${intent.action}")
        if (intent.action == ACTION_REFRESH) {
            // Handle refresh button click
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, TodoWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }
    override fun onEnabled(context: Context) {
        // Called when the first widget is added
        super.onEnabled(context)
        android.util.Log.d(TAG, "Widget enabled - first instance added")
    }
    override fun onDisabled(context: Context) {
        // Called when the last widget is removed
        super.onDisabled(context)
        android.util.Log.d(TAG, "Widget disabled - last instance removed")
        // Clear saved data
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
    }
    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        try {
            android.util.Log.d(TAG, "Updating widget ID: $appWidgetId")
            // Get widget data
            val (title, items) = getWidgetData(context)
            android.util.Log.d(TAG, "Title: $title, Items: ${items.size}")
            // Create RemoteViews with package name
            val packageName = context.packageName
            val layoutId = context.resources.getIdentifier("widget_todo_list", "layout", packageName)
            if (layoutId == 0) {
                android.util.Log.e(TAG, "Layout widget_todo_list not found in package: $packageName")
                return
            }
            android.util.Log.d(TAG, "Using layout ID: $layoutId")
            val views = RemoteViews(packageName, layoutId)
            // Get resource IDs dynamically
            val titleViewId = context.resources.getIdentifier("widget_title", "id", packageName)
            val containerViewId = context.resources.getIdentifier("widget_container", "id", packageName)
            val refreshButtonId = context.resources.getIdentifier("widget_refresh_button", "id", packageName)
            // Set title
            if (titleViewId != 0) {
                views.setTextViewText(titleViewId, title)
                android.util.Log.d(TAG, "Set title: $title")
            } else {
                android.util.Log.w(TAG, "widget_title view not found")
            }
            // Set items (up to 5 items)
            for (i in 1..5) {
                val itemId = context.resources.getIdentifier("widget_item_$i", "id", packageName)
                if (itemId != 0) {
                    if (i - 1 < items.size) {
                        views.setTextViewText(itemId, "• ${items[i - 1]}")
                        views.setViewVisibility(itemId, android.view.View.VISIBLE)
                    } else {
                        views.setViewVisibility(itemId, android.view.View.GONE)
                    }
                }
            }
            // Set click intent to open app
            if (containerViewId != 0) {
                val openAppIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val openAppPendingIntent = PendingIntent.getActivity(
                    context, 0, openAppIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(containerViewId, openAppPendingIntent)
            }
            // Set refresh button intent
            if (refreshButtonId != 0) {
                val refreshIntent = Intent(context, TodoWidgetProvider::class.java).apply {
                    action = ACTION_REFRESH
                }
                val refreshPendingIntent = PendingIntent.getBroadcast(
                    context, 0, refreshIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(refreshButtonId, refreshPendingIntent)
            }
            // Update widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
            android.util.Log.d(TAG, "Widget $appWidgetId updated successfully")
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Error updating widget $appWidgetId", e)
            e.printStackTrace()
        }
    }
}