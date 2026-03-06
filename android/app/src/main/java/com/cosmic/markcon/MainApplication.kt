package com.cosmic.markcon

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.cosmic.markcon.widget.WidgetPackage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(WidgetPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    
    // Load React Native on main thread (required)
    loadReactNative(this)
    
    // Initialize heavy services in background to avoid blocking splash screen
    initializeBackgroundServices()
  }
  
  /**
   * Initialize heavy services in background thread
   * This prevents blocking the main thread and speeds up splash screen display
   */
  private fun initializeBackgroundServices() {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        // Add any heavy initialization here that doesn't need to run on main thread
        // For example: Analytics SDKs, Crash Reporting, etc.
        // Note: Firebase and other auto-init libraries will initialize themselves
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }
  }
}
