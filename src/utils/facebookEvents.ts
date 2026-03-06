/**
 * Facebook Analytics Event Templates
 * 
 * Pre-built, reusable event tracking functions for common app scenarios
 * Import and use these throughout your app for consistent event tracking
 */

import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';

/**
 * ====================
 * AUTHENTICATION EVENTS
 * ====================
 */

/**
 * Track user login
 */
export const trackLogin = async (method: 'email' | 'google' | 'apple' | 'facebook') => {
  await facebookAnalytics.logCustomEvent('user_login', {
    login_method: method,
    platform: Platform.OS,
    timestamp: Date.now(),
  });
};

/**
 * Track user signup/registration
 */
export const trackSignup = async (method: 'email' | 'google' | 'apple' | 'facebook') => {
  await facebookAnalytics.logCompleteRegistration(method, {
    platform: Platform.OS,
    timestamp: Date.now(),
  });
};

/**
 * Track user logout
 */
export const trackLogout = async () => {
  await facebookAnalytics.logCustomEvent('user_logout', {
    platform: Platform.OS,
    timestamp: Date.now(),
  });
};

/**
 * Track password reset
 */
export const trackPasswordReset = async (method: 'email' | 'sms') => {
  await facebookAnalytics.logCustomEvent('password_reset', {
    reset_method: method,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * E-COMMERCE EVENTS
 * ====================
 */

/**
 * Track product view
 */
export const trackProductView = async (
  productId: string,
  productName: string,
  category: string,
  price: number,
  currency: string = 'USD'
) => {
  await facebookAnalytics.logViewContent('product', productId, {
    product_name: productName,
    category,
    price,
    currency,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = async (
  productId: string,
  productName: string,
  price: number,
  quantity: number = 1,
  currency: string = 'USD'
) => {
  await facebookAnalytics.logAddToCart('product', productId, currency, price, {
    product_name: productName,
    quantity,
    total_price: price * quantity,
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = async (
  productId: string,
  productName: string,
  price: number
) => {
  await facebookAnalytics.logCustomEvent('remove_from_cart', {
    product_id: productId,
    product_name: productName,
    price,
  });
};

/**
 * Track add to wishlist
 */
export const trackAddToWishlist = async (
  productId: string,
  productName: string,
  price: number
) => {
  await facebookAnalytics.logAddToWishlist('product', productId, {
    product_name: productName,
    price,
  });
};

/**
 * Track checkout started
 */
export const trackCheckoutStarted = async (
  items: number,
  totalValue: number,
  currency: string = 'USD'
) => {
  await facebookAnalytics.logInitiatedCheckout(items, currency, totalValue, {
    checkout_step: 1,
  });
};

/**
 * Track purchase completed
 */
export const trackPurchase = async (
  orderId: string,
  totalAmount: number,
  currency: string = 'USD',
  items: number,
  paymentMethod?: string
) => {
  await facebookAnalytics.logPurchase({
    amount: totalAmount,
    currency,
    contentType: 'product',
    contentId: orderId,
    numItems: items,
    parameters: {
      order_id: orderId,
      payment_method: paymentMethod || 'unknown',
      platform: Platform.OS,
    },
  });
};

/**
 * Track refund
 */
export const trackRefund = async (
  orderId: string,
  refundAmount: number,
  reason?: string
) => {
  await facebookAnalytics.logCustomEvent('refund', {
    order_id: orderId,
    refund_amount: refundAmount,
    reason: reason || 'not_specified',
  });
};

/**
 * ====================
 * SUBSCRIPTION EVENTS
 * ====================
 */

/**
 * Track subscription view
 */
export const trackSubscriptionView = async (
  planId: string,
  planName: string,
  price: number,
  interval: 'monthly' | 'yearly'
) => {
  await facebookAnalytics.logViewContent('subscription', planId, {
    plan_name: planName,
    price,
    billing_interval: interval,
  });
};

/**
 * Track subscription started
 */
export const trackSubscriptionStarted = async (
  planId: string,
  planName: string,
  price: number,
  interval: 'monthly' | 'yearly'
) => {
  await facebookAnalytics.logCustomEvent('subscription_started', {
    plan_id: planId,
    plan_name: planName,
    price,
    billing_interval: interval,
    platform: Platform.OS,
  });
};

/**
 * Track subscription cancelled
 */
export const trackSubscriptionCancelled = async (
  planId: string,
  reason?: string
) => {
  await facebookAnalytics.logCustomEvent('subscription_cancelled', {
    plan_id: planId,
    cancellation_reason: reason || 'not_specified',
    platform: Platform.OS,
  });
};

/**
 * Track subscription renewed
 */
export const trackSubscriptionRenewed = async (
  planId: string,
  planName: string,
  price: number
) => {
  await facebookAnalytics.logCustomEvent('subscription_renewed', {
    plan_id: planId,
    plan_name: planName,
    price,
    platform: Platform.OS,
  });
};

/**
 * Track trial started
 */
export const trackTrialStarted = async (
  planId: string,
  trialDays: number
) => {
  await facebookAnalytics.logCustomEvent('trial_started', {
    plan_id: planId,
    trial_duration_days: trialDays,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * CONTENT EVENTS
 * ====================
 */

/**
 * Track content view (articles, videos, etc.)
 */
export const trackContentView = async (
  contentType: 'article' | 'video' | 'image' | 'podcast',
  contentId: string,
  contentTitle: string,
  category?: string
) => {
  await facebookAnalytics.logViewContent(contentType, contentId, {
    content_title: contentTitle,
    category: category || 'uncategorized',
    platform: Platform.OS,
  });
};

/**
 * Track content share
 */
export const trackContentShare = async (
  contentId: string,
  contentType: string,
  shareMethod: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link'
) => {
  await facebookAnalytics.logCustomEvent('content_share', {
    content_id: contentId,
    content_type: contentType,
    share_method: shareMethod,
    platform: Platform.OS,
  });
};

/**
 * Track content like/favorite
 */
export const trackContentLike = async (
  contentId: string,
  contentType: string
) => {
  await facebookAnalytics.logCustomEvent('content_like', {
    content_id: contentId,
    content_type: contentType,
    platform: Platform.OS,
  });
};

/**
 * Track content download
 */
export const trackContentDownload = async (
  contentId: string,
  contentType: string,
  fileSize?: number
) => {
  await facebookAnalytics.logCustomEvent('content_download', {
    content_id: contentId,
    content_type: contentType,
    file_size_kb: fileSize || 0,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * SEARCH EVENTS
 * ====================
 */

/**
 * Track search query
 */
export const trackSearch = async (
  query: string,
  resultsCount: number,
  category?: string
) => {
  await facebookAnalytics.logSearch(query, {
    results_count: resultsCount,
    search_category: category || 'all',
    platform: Platform.OS,
  });
};

/**
 * Track search result clicked
 */
export const trackSearchResultClick = async (
  query: string,
  resultId: string,
  resultPosition: number
) => {
  await facebookAnalytics.logCustomEvent('search_result_click', {
    search_query: query,
    result_id: resultId,
    result_position: resultPosition,
  });
};

/**
 * ====================
 * SOCIAL EVENTS
 * ====================
 */

/**
 * Track follow/unfollow user
 */
export const trackFollowUser = async (
  userId: string,
  action: 'follow' | 'unfollow'
) => {
  await facebookAnalytics.logCustomEvent(`user_${action}`, {
    target_user_id: userId,
    platform: Platform.OS,
  });
};

/**
 * Track comment posted
 */
export const trackComment = async (
  contentId: string,
  contentType: string,
  commentLength: number
) => {
  await facebookAnalytics.logCustomEvent('comment_posted', {
    content_id: contentId,
    content_type: contentType,
    comment_length: commentLength,
  });
};

/**
 * Track message sent
 */
export const trackMessageSent = async (
  recipientId?: string,
  messageType: 'text' | 'image' | 'video' = 'text'
) => {
  await facebookAnalytics.logCustomEvent('message_sent', {
    recipient_id: recipientId || 'unknown',
    message_type: messageType,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * ONBOARDING EVENTS
 * ====================
 */

/**
 * Track onboarding started
 */
export const trackOnboardingStarted = async () => {
  await facebookAnalytics.logCustomEvent('onboarding_started', {
    platform: Platform.OS,
    timestamp: Date.now(),
  });
};

/**
 * Track onboarding step completed
 */
export const trackOnboardingStep = async (
  stepNumber: number,
  stepName: string
) => {
  await facebookAnalytics.logCustomEvent('onboarding_step_completed', {
    step_number: stepNumber,
    step_name: stepName,
    platform: Platform.OS,
  });
};

/**
 * Track onboarding completed
 */
export const trackOnboardingCompleted = async (totalSteps: number) => {
  await facebookAnalytics.logCustomEvent('onboarding_completed', {
    total_steps: totalSteps,
    platform: Platform.OS,
    timestamp: Date.now(),
  });
};

/**
 * Track tutorial completion
 */
export const trackTutorialCompleted = async (
  tutorialName: string,
  success: boolean = true
) => {
  await facebookAnalytics.logTutorialCompletion(success, {
    tutorial_name: tutorialName,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * SETTINGS EVENTS
 * ====================
 */

/**
 * Track settings changed
 */
export const trackSettingsChanged = async (
  settingName: string,
  newValue: string | number | boolean
) => {
  await facebookAnalytics.logCustomEvent('settings_changed', {
    setting_name: settingName,
    new_value: String(newValue),
    platform: Platform.OS,
  });
};

/**
 * Track notification preferences
 */
export const trackNotificationToggle = async (
  notificationType: string,
  enabled: boolean
) => {
  await facebookAnalytics.logCustomEvent('notification_preference_changed', {
    notification_type: notificationType,
    enabled: enabled ? 1 : 0,
    platform: Platform.OS,
  });
};

/**
 * Track theme changed
 */
export const trackThemeChanged = async (theme: 'light' | 'dark' | 'auto') => {
  await facebookAnalytics.logCustomEvent('theme_changed', {
    theme_mode: theme,
    platform: Platform.OS,
  });
};

/**
 * Track language changed
 */
export const trackLanguageChanged = async (
  oldLanguage: string,
  newLanguage: string
) => {
  await facebookAnalytics.logCustomEvent('language_changed', {
    old_language: oldLanguage,
    new_language: newLanguage,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * ENGAGEMENT EVENTS
 * ====================
 */

/**
 * Track app rating
 */
export const trackAppRating = async (rating: number, reviewed: boolean = false) => {
  await facebookAnalytics.logCustomEvent('app_rated', {
    rating_value: rating,
    left_review: reviewed ? 1 : 0,
    platform: Platform.OS,
  });
};

/**
 * Track feedback submitted
 */
export const trackFeedbackSubmitted = async (
  feedbackType: 'bug' | 'feature' | 'general',
  hasScreenshot: boolean = false
) => {
  await facebookAnalytics.logCustomEvent('feedback_submitted', {
    feedback_type: feedbackType,
    has_screenshot: hasScreenshot ? 1 : 0,
    platform: Platform.OS,
  });
};

/**
 * Track help/support accessed
 */
export const trackHelpAccessed = async (helpSection: string) => {
  await facebookAnalytics.logCustomEvent('help_accessed', {
    help_section: helpSection,
    platform: Platform.OS,
  });
};

/**
 * Track contact support
 */
export const trackContactSupport = async (
  method: 'email' | 'chat' | 'phone'
) => {
  await facebookAnalytics.logCustomEvent('contact_support', {
    contact_method: method,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * GAMIFICATION EVENTS
 * ====================
 */

/**
 * Track level achieved
 */
export const trackLevelAchieved = async (level: number, score?: number) => {
  await facebookAnalytics.logAchievedLevel(level, {
    score: score || 0,
    platform: Platform.OS,
  });
};

/**
 * Track achievement unlocked
 */
export const trackAchievementUnlocked = async (
  achievementId: string,
  achievementName: string
) => {
  await facebookAnalytics.logCustomEvent('achievement_unlocked', {
    achievement_id: achievementId,
    achievement_name: achievementName,
    platform: Platform.OS,
  });
};

/**
 * Track points earned
 */
export const trackPointsEarned = async (
  points: number,
  source: string
) => {
  await facebookAnalytics.logCustomEvent('points_earned', {
    points_amount: points,
    points_source: source,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * AD EVENTS
 * ====================
 */

/**
 * Track ad impression
 */
export const trackAdImpression = async (
  adId: string,
  adType: string,
  placement: string
) => {
  await facebookAnalytics.logCustomEvent('ad_impression', {
    ad_id: adId,
    ad_type: adType,
    ad_placement: placement,
    platform: Platform.OS,
  });
};

/**
 * Track ad clicked
 */
export const trackAdClicked = async (
  adId: string,
  adType: string,
  placement: string
) => {
  await facebookAnalytics.logCustomEvent('ad_clicked', {
    ad_id: adId,
    ad_type: adType,
    ad_placement: placement,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * ERROR EVENTS
 * ====================
 */

/**
 * Track app crash
 */
export const trackAppCrash = async (
  errorMessage: string,
  errorStack?: string
) => {
  await facebookAnalytics.logError('app_crash', errorMessage, {
    error_stack: errorStack || 'unavailable',
    platform: Platform.OS,
  });
};

/**
 * Track API error
 */
export const trackAPIError = async (
  endpoint: string,
  statusCode: number,
  errorMessage: string
) => {
  await facebookAnalytics.logError('api_error', errorMessage, {
    api_endpoint: endpoint,
    status_code: statusCode,
    platform: Platform.OS,
  });
};

/**
 * Track payment error
 */
export const trackPaymentError = async (
  errorCode: string,
  errorMessage: string,
  amount?: number
) => {
  await facebookAnalytics.logError('payment_error', errorMessage, {
    error_code: errorCode,
    attempted_amount: amount || 0,
    platform: Platform.OS,
  });
};

/**
 * ====================
 * NAVIGATION EVENTS
 * ====================
 */

/**
 * Track deep link opened
 */
export const trackDeepLinkOpened = async (
  url: string,
  source: string
) => {
  await facebookAnalytics.logCustomEvent('deep_link_opened', {
    url,
    source,
    platform: Platform.OS,
  });
};

/**
 * Track external link clicked
 */
export const trackExternalLinkClicked = async (
  url: string,
  context: string
) => {
  await facebookAnalytics.logCustomEvent('external_link_clicked', {
    url,
    context,
    platform: Platform.OS,
  });
};

// Export all tracking functions
export default {
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
};
