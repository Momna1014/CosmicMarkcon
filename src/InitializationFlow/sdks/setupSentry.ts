import * as Sentry from '@sentry/react-native';
import env from '../../config/env';

let sentryInitialized = false;

function hasValidDsn(): boolean {
  return Boolean(env.SENTRY_DSN);
}

export async function setupSentryAnonymous(): Promise<void> {
  try {
    if (sentryInitialized) {
      Sentry.setTag('gdpr_consent', 'false');
      Sentry.setUser(null);
      await Sentry.close();
      sentryInitialized = false;
    }
  } catch (error) {
    console.warn('[InitializationFlow] Failed to disable Sentry:', error);
  }
}

export async function enableSentryFullTracking(): Promise<void> {
  if (!hasValidDsn()) {
    console.warn('[InitializationFlow] Sentry DSN missing, skipping init');
    return;
  }

  if (!sentryInitialized) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      enabled: true,
      sendDefaultPii: false,
      enableLogs: __DEV__,
      enableAutoSessionTracking: false,
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
    sentryInitialized = true;
  }

  Sentry.setTag('gdpr_consent', 'true');
}
