package com.cosmic.markcon.widget

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.FirebaseApp

/**
 * FirebaseConsentModule
 *
 * Exposes explicit Firebase bootstrap to JS so initialization can happen
 * only after consent has been resolved.
 */
class FirebaseConsentModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        @Volatile
        private var initialized = false
    }

    override fun getName(): String {
        return "FirebaseConsentModule"
    }

    @ReactMethod
    fun initializeFirebase(promise: Promise) {
        try {
            if (!initialized) {
                val appContext = reactApplicationContext.applicationContext
                val existingApps = FirebaseApp.getApps(appContext)

                if (existingApps.isEmpty()) {
                    val app = FirebaseApp.initializeApp(appContext)
                    if (app == null) {
                        throw IllegalStateException("FirebaseApp.initializeApp returned null")
                    }
                }

                initialized = true
            }

            promise.resolve(true)
        } catch (error: Exception) {
            promise.reject(
                "firebase_init_failed",
                "Failed to initialize Firebase after consent",
                error,
            )
        }
    }
}
