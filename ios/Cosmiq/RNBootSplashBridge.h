#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNBootSplashBridge : NSObject

+ (void)setupWithStoryboard:(NSString *)storyboardName rootView:(UIView * _Nullable)rootView;

@end

NS_ASSUME_NONNULL_END
