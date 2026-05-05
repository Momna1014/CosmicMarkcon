import { setupSentryAnonymous } from '../sdks/setupSentry';
import { setupFirebaseNative } from '../sdks/setupFirebase';

/**
 * Essentials run regardless of the user's consent decision. Firebase Auth is
 * categorised as Functional/Essential, so the native Firebase default app must
 * exist before `auth()` is touched — otherwise anonymous sign-in (and the GPT
 * keys fetch that depends on it) crashes when the user denies all consent or
 * disables the analytics/crashlytics granular toggles.
 */
export async function initEssentials(): Promise<void> {
  await Promise.allSettled([
    setupFirebaseNative(),
    setupSentryAnonymous(),
  ]);
}
