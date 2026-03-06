/**
 * Facebook Analytics - Main Export
 * 
 * Central export file for all Facebook Analytics functionality
 * Import everything you need from this single file
 */

// Core Service
export { facebookAnalytics, FacebookEventName, FacebookEventParam } from '../services/FacebookAnalyticsService';
export type { FacebookEventParams, PurchaseDetails } from '../services/FacebookAnalyticsService';

// Hooks
export {
  useScreenView,
  useButtonClick,
  useNavigationTracking,
  useFeatureTracking,
  useErrorTracking,
  useAppLifecycle,
} from '../hooks/useFacebookAnalytics';

// Pre-built Event Functions
export {
  // Authentication
  trackLogin,
  trackSignup,
  trackLogout,
  trackPasswordReset,
  
  // E-commerce
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackAddToWishlist,
  trackCheckoutStarted,
  trackPurchase,
  trackRefund,
  
  // Subscriptions
  trackSubscriptionView,
  trackSubscriptionStarted,
  trackSubscriptionCancelled,
  trackSubscriptionRenewed,
  trackTrialStarted,
  
  // Content
  trackContentView,
  trackContentShare,
  trackContentLike,
  trackContentDownload,
  
  // Search
  trackSearch,
  trackSearchResultClick,
  
  // Social
  trackFollowUser,
  trackComment,
  trackMessageSent,
  
  // Onboarding
  trackOnboardingStarted,
  trackOnboardingStep,
  trackOnboardingCompleted,
  trackTutorialCompleted,
  
  // Settings
  trackSettingsChanged,
  trackNotificationToggle,
  trackThemeChanged,
  trackLanguageChanged,
  
  // Engagement
  trackAppRating,
  trackFeedbackSubmitted,
  trackHelpAccessed,
  trackContactSupport,
  
  // Gamification
  trackLevelAchieved,
  trackAchievementUnlocked,
  trackPointsEarned,
  
  // Ads
  trackAdImpression,
  trackAdClicked,
  
  // Errors
  trackAppCrash,
  trackAPIError,
  trackPaymentError,
  
  // Navigation
  trackDeepLinkOpened,
  trackExternalLinkClicked,
} from '../utils/facebookEvents';

/**
 * Usage Examples:
 * 
 * // Import specific functions
 * import { trackLogin, trackPurchase, useScreenView } from './src/analytics';
 * 
 * // Use in component
 * const MyScreen = () => {
 *   useScreenView('My Screen');
 *   
 *   const handleLogin = async () => {
 *     await login();
 *     await trackLogin('email');
 *   };
 * };
 */
