import firebaseService from '../../services/firebase/FirebaseService';

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
