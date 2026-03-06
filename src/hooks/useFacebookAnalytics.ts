/**
 * Facebook Analytics Hooks
 * 
 * Reusable hooks for common Facebook Analytics events
 * Use these hooks in your components for easy event tracking
 */

import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { facebookAnalytics } from '../services/FacebookAnalyticsService';

/**
 * Track screen views automatically
 * Usage: useScreenView('Home Screen', { feature: 'main_tab' });
 */
export const useScreenView = (
  screenName: string,
  params?: Record<string, string | number>
) => {
  useEffect(() => {
    facebookAnalytics.logScreenView(screenName, params);
  }, [screenName]);
};

/**
 * Track button clicks with callback
 * Usage: const handleClick = useButtonClick('Subscribe Button', 'Pricing Screen');
 */
export const useButtonClick = (
  buttonName: string,
  screenName: string,
  params?: Record<string, string | number>
) => {
  return useCallback(async () => {
    await facebookAnalytics.logButtonClick(buttonName, screenName, params);
  }, [buttonName, screenName, params]);
};

/**
 * Track navigation events
 * Usage: useNavigation();
 */
export const useNavigationTracking = () => {
  const trackNavigation = useCallback(
    async (screenName: string, params?: Record<string, string | number>) => {
      await facebookAnalytics.logScreenView(screenName, {
        platform: Platform.OS,
        ...params,
      });
    },
    []
  );

  return { trackNavigation };
};

/**
 * Track feature usage
 * Usage: const trackFeature = useFeatureTracking();
 */
export const useFeatureTracking = () => {
  const trackFeature = useCallback(
    async (featureName: string, params?: Record<string, string | number>) => {
      await facebookAnalytics.logFeatureUsed(featureName, params);
    },
    []
  );

  return { trackFeature };
};

/**
 * Track errors
 * Usage: const trackError = useErrorTracking();
 */
export const useErrorTracking = () => {
  const trackError = useCallback(
    async (
      errorCode: string,
      errorMessage: string,
      params?: Record<string, string | number>
    ) => {
      await facebookAnalytics.logError(errorCode, errorMessage, params);
    },
    []
  );

  return { trackError };
};

/**
 * Track app lifecycle events
 */
export const useAppLifecycle = () => {
  useEffect(() => {
    facebookAnalytics.logAppLaunch();
  }, []);
};

export default {
  useScreenView,
  useButtonClick,
  useNavigationTracking,
  useFeatureTracking,
  useErrorTracking,
  useAppLifecycle,
};
