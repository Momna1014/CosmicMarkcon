#import "RNBootSplashBridge.h"
#import <RNBootSplash/RNBootSplash.h>
#import <FirebaseCore/FirebaseCore.h>
#import <React/RCTBridgeModule.h>

@implementation RNBootSplashBridge

+ (void)setupWithStoryboard:(NSString *)storyboardName rootView:(UIView * _Nullable)rootView {
  [RNBootSplash initWithStoryboard:storyboardName rootView:rootView];
}

@end

@interface FirebaseConsentModule : NSObject <RCTBridgeModule>
@end

@implementation FirebaseConsentModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_REMAP_METHOD(initializeFirebase,
                 initializeFirebaseWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
    resolve(@YES);
  }
  @catch (NSException *exception) {
    NSString *message = exception.reason ?: @"Failed to initialize Firebase";
    NSError *error = [NSError errorWithDomain:@"FirebaseConsentModule"
                                         code:1
                                     userInfo:@{NSLocalizedDescriptionKey: message}];
    reject(@"firebase_init_failed", message, error);
  }
}

@end
