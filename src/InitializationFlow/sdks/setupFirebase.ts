import firebaseService from '../../services/firebase/FirebaseService';
import { initializeFirebaseNative } from '../../services/firebase/FirebaseService';

/**
 * Bootstrap the native Firebase default app. Must run regardless of consent
 * because Firebase Auth (anonymous sign-in) is essential — without this the
 * `auth()` call in FirebaseAuthService throws "No Firebase App '[DEFAULT]'".
 */
export async function setupFirebaseNative(): Promise<void> {
  await initializeFirebaseNative();
}

export async function disableFirebaseCollection(): Promise<void> {
  await firebaseService.setAnalyticsCollectionEnabled(false);
  await firebaseService.setCrashlyticsCollectionEnabled(false);
}

export async function setupFirebaseCrashlytics(): Promise<void> {
  await firebaseService.setCrashlyticsCollectionEnabled(true);
}

export async function setupFirebaseAnalytics(): Promise<void> {
  await firebaseService.setAnalyticsCollectionEnabled(true);
}

export async function disableFirebaseAnalytics(): Promise<void> {
  await firebaseService.setAnalyticsCollectionEnabled(false);
}

export async function disableFirebaseCrashlytics(): Promise<void> {
  await firebaseService.setCrashlyticsCollectionEnabled(false);
}
