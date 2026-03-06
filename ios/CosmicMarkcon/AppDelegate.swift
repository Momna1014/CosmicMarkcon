import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseMessaging
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Firebase FIRST
    FirebaseApp.configure()
    
    // Set up notification center delegate
    UNUserNotificationCenter.current().delegate = self
    
    // Set up Firebase Messaging delegate
    Messaging.messaging().delegate = self
    
    // Register for remote notifications
    application.registerForRemoteNotifications()
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "CosmicMarkcon",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // MARK: - APNs Token Handling (CRITICAL for FCM on iOS)
  
  /// Called when APNs has assigned the device a unique token
  /// This MUST be passed to Firebase for FCM to work on iOS
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print("[AppDelegate] ✅ APNs token received")
    print("[AppDelegate] 📱 Token length: \(deviceToken.count) bytes")
    
    // Pass the APNs token to Firebase Messaging
    // Firebase will use this to generate an FCM token
    Messaging.messaging().apnsToken = deviceToken
    
    // Also set the token type (for debugging)
    #if DEBUG
    Messaging.messaging().setAPNSToken(deviceToken, type: .sandbox)
    print("[AppDelegate] 🔧 Set APNs token type: SANDBOX (Debug)")
    #else
    Messaging.messaging().setAPNSToken(deviceToken, type: .prod)
    print("[AppDelegate] 🔧 Set APNs token type: PRODUCTION (Release)")
    #endif
  }
  
  /// Called when APNs registration fails
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("[AppDelegate] ❌ Failed to register for remote notifications: \(error.localizedDescription)")
    print("[AppDelegate] ⚠️ Push notifications will NOT work without APNs token")
    print("[AppDelegate] 💡 Check: 1) Push Notifications capability in Xcode")
    print("[AppDelegate] 💡 Check: 2) Valid provisioning profile with push enabled")
    print("[AppDelegate] 💡 Check: 3) APNs key uploaded to Firebase Console")
  }
  
  // MARK: - Firebase Messaging Delegate
  
  /// Called when FCM token is generated or refreshed
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("[AppDelegate] 🔑 FCM token received")
    if let token = fcmToken {
      print("[AppDelegate] 🔑 FCM Token: \(token.prefix(50))...")
      print("[AppDelegate] 🔑 Full token length: \(token.count)")
      
      // Post notification so JS side can be notified
      let dataDict: [String: String] = ["token": token]
      NotificationCenter.default.post(
        name: Notification.Name("FCMToken"),
        object: nil,
        userInfo: dataDict
      )
    } else {
      print("[AppDelegate] ⚠️ FCM token is nil")
    }
  }
  
  // MARK: - UNUserNotificationCenterDelegate
  
  /// Handle notification when app is in FOREGROUND
  /// This allows notifications to be displayed even when the app is open
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let userInfo = notification.request.content.userInfo
    print("[AppDelegate] 📬 Notification received in foreground")
    print("[AppDelegate] 📋 UserInfo: \(userInfo)")
    
    // Show notification banner + sound + badge even when app is in foreground
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .sound, .badge, .list])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
  
  /// Handle notification tap (when user taps on notification)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let userInfo = response.notification.request.content.userInfo
    print("[AppDelegate] 👆 User tapped on notification")
    print("[AppDelegate] 📋 UserInfo: \(userInfo)")
    
    // Handle the notification tap here if needed
    // The JS side will also receive this via messaging().onNotificationOpenedApp()
    
    completionHandler()
  }
  
  // MARK: - Background/Silent Push Handling
  
  /// Handle background/silent push notifications
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("[AppDelegate] 📬 Background remote notification received")
    print("[AppDelegate] 📋 UserInfo: \(userInfo)")
    
    // Let Firebase handle it
    Messaging.messaging().appDidReceiveMessage(userInfo)
    print("[AppDelegate] ✅ Firebase processed the message")
    completionHandler(.newData)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
