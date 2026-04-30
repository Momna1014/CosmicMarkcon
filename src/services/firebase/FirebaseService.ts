/**
 * Firebase Service (functional module)
 *
 * IMPORTANT — IMPORT-TIME SAFETY:
 *   The native Firebase JS bridges (`@react-native-firebase/analytics`,
 *   `@react-native-firebase/crashlytics`) call the native default app on
 *   first access. Auto-init is disabled in this app, so calling them before
 *   `FirebaseConsentModule.initializeFirebase()` resolves crashes with:
 *     "No Firebase App '[DEFAULT]' has been created"
 *
 *   To prevent that, this module:
 *     1. Has NO top-level `import` of analytics/crashlytics.
 *     2. Lazily `require()`s them inside each function, only after the
 *        native bootstrap has succeeded (`nativeReady === true`).
 *
 * @module FirebaseService
 */

import { NativeModules, Platform } from 'react-native';

// ==================== TYPE DEFINITIONS ====================

export interface FirebaseEventParams {
  [key: string]: string | number | boolean | undefined;
}

export interface UserProperties {
  [key: string]: string;
}

export interface CrashAttributes {
  [key: string]: string;
}

interface FirebaseConsentNativeModule {
  initializeFirebase: () => Promise<boolean>;
}

// ==================== MODULE STATE ====================

let nativeReady = false;
let analyticsEnabled = false;
let crashlyticsEnabled = false;
let bootstrapPromise: Promise<boolean> | null = null;

// ==================== LAZY NATIVE BRIDGES ====================
// Loaded ONLY after native bootstrap succeeds. Never at module-eval time.

function getAnalytics(): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-firebase/analytics').default();
}

function getCrashlytics(): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-firebase/crashlytics').default();
}

function getFirebaseConsentModule(): FirebaseConsentNativeModule | null {
  const mod = NativeModules.FirebaseConsentModule as
    | FirebaseConsentNativeModule
    | undefined;
  if (!mod || typeof mod.initializeFirebase !== 'function') {
    return null;
  }
  return mod;
}

// ==================== BOOTSTRAP ====================

async function ensureNativeBootstrap(): Promise<boolean> {
  if (nativeReady) return true;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const consentModule = getFirebaseConsentModule();
    if (!consentModule) {
      console.error('❌ FirebaseConsentModule unavailable');
      return false;
    }
    try {
      await consentModule.initializeFirebase();
      nativeReady = true;
      console.log('✅ Firebase native bootstrap completed');
      return true;
    } catch (error) {
      console.error('❌ Firebase native bootstrap failed:', error);
      return false;
    }
  })();

  try {
    return await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}

// ==================== STATE ACCESSORS ====================

export function isAnalyticsEnabled(): boolean {
  return analyticsEnabled;
}

export function isCrashlyticsEnabled(): boolean {
  return crashlyticsEnabled;
}

export function isNativeReady(): boolean {
  return nativeReady;
}

// ==================== ANALYTICS ====================

export async function logEvent(
  eventName: string,
  params?: FirebaseEventParams,
): Promise<void> {
  if (!analyticsEnabled || !nativeReady) {
    console.log(`📊 Analytics disabled, skipping event: ${eventName}`);
    return;
  }
  try {
    await getAnalytics().logEvent(eventName, params);
    console.log(`📊 Analytics Event: ${eventName}`, params);
  } catch (error) {
    console.error(`Failed to log event ${eventName}:`, error);
  }
}

export async function logScreenView(
  screenName: string,
  screenClass?: string,
): Promise<void> {
  if (!analyticsEnabled || !nativeReady) {
    console.log(`📱 Analytics disabled, skipping screen: ${screenName}`);
    return;
  }
  try {
    await getAnalytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`📱 Screen View: ${screenName}`);
  } catch (error) {
    console.error(`Failed to log screen view ${screenName}:`, error);
  }
}

export async function setUserId(userId: string | null): Promise<void> {
  if (!analyticsEnabled || !nativeReady) {
    console.log('👤 Analytics disabled, skipping user ID');
    return;
  }
  try {
    await getAnalytics().setUserId(userId);
    console.log(`👤 User ID set: ${userId}`);
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

export async function setUserProperty(name: string, value: string): Promise<void> {
  if (!analyticsEnabled || !nativeReady) {
    console.log(`🏷️  Analytics disabled, skipping property: ${name}`);
    return;
  }
  try {
    await getAnalytics().setUserProperty(name, value);
    console.log(`🏷️  User Property: ${name} = ${value}`);
  } catch (error) {
    console.error(`Failed to set user property ${name}:`, error);
  }
}

export async function setUserProperties(properties: UserProperties): Promise<void> {
  if (!analyticsEnabled || !nativeReady) {
    console.log('🏷️  Analytics disabled, skipping user properties');
    return;
  }
  try {
    await Promise.all(
      Object.entries(properties).map(([name, value]) => setUserProperty(name, value)),
    );
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}

async function setDefaultAnalyticsProperties(): Promise<void> {
  await setUserProperty('platform', Platform.OS);
  await setUserProperty('app_version', '1.0.0');
}

export async function setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    const ok = await ensureNativeBootstrap();
    if (!ok) {
      analyticsEnabled = false;
      console.warn('⚠️  Analytics enable skipped: Firebase bootstrap unavailable');
      return;
    }
  } else if (!nativeReady) {
    analyticsEnabled = false;
    console.log('📊 Analytics collection disabled (Firebase not initialized yet)');
    return;
  }

  try {
    await getAnalytics().setAnalyticsCollectionEnabled(enabled);
    analyticsEnabled = enabled;
    if (enabled) await setDefaultAnalyticsProperties();
    console.log(`📊 Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Failed to set analytics collection:', error);
  }
}

// ==================== CRASHLYTICS ====================

export async function recordError(
  error: Error | string,
  jsErrorName?: string,
): Promise<void> {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log('💥 Crashlytics disabled, skipping error record');
    return;
  }
  try {
    if (typeof error === 'string') {
      await getCrashlytics().recordError(new Error(error));
    } else {
      await getCrashlytics().recordError(error, jsErrorName);
    }
    console.log('💥 Error recorded:', error);
  } catch (err) {
    console.error('Failed to record error:', err);
  }
}

export async function log(message: string): Promise<void> {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log('💥 Crashlytics disabled, skipping log message');
    return;
  }
  try {
    await getCrashlytics().log(message);
    console.log(`📝 Crashlytics log: ${message}`);
  } catch (error) {
    console.error('Failed to log to Crashlytics:', error);
  }
}

export async function setCrashlyticsAttribute(
  key: string,
  value: string | number | boolean,
): Promise<void> {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log(`💥 Crashlytics disabled, skipping attribute: ${key}`);
    return;
  }
  try {
    await getCrashlytics().setAttribute(key, String(value));
    console.log(`🔑 Crashlytics attribute: ${key} = ${value}`);
  } catch (error) {
    console.error(`Failed to set crashlytics attribute ${key}:`, error);
  }
}

export async function setCrashlyticsAttributes(attributes: CrashAttributes): Promise<void> {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log('💥 Crashlytics disabled, skipping attributes');
    return;
  }
  try {
    await getCrashlytics().setAttributes(attributes);
    console.log('🔑 Crashlytics attributes set:', attributes);
  } catch (error) {
    console.error('Failed to set crashlytics attributes:', error);
  }
}

export async function setCrashlyticsUserId(userId: string): Promise<void> {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log('💥 Crashlytics disabled, skipping user ID');
    return;
  }
  try {
    await getCrashlytics().setUserId(userId);
    console.log(`👤 Crashlytics User ID: ${userId}`);
  } catch (error) {
    console.error('Failed to set crashlytics user ID:', error);
  }
}

export function crash(): void {
  if (!crashlyticsEnabled || !nativeReady) {
    console.log('💥 Crashlytics disabled, crash() skipped');
    return;
  }
  console.warn('⚠️  Forcing app crash for testing...');
  getCrashlytics().crash();
}

export async function setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    const ok = await ensureNativeBootstrap();
    if (!ok) {
      crashlyticsEnabled = false;
      console.warn('⚠️  Crashlytics enable skipped: Firebase bootstrap unavailable');
      return;
    }
  } else if (!nativeReady) {
    crashlyticsEnabled = false;
    console.log('💥 Crashlytics collection disabled (Firebase not initialized yet)');
    return;
  }

  try {
    await getCrashlytics().setCrashlyticsCollectionEnabled(enabled);
    crashlyticsEnabled = enabled;
    console.log(`💥 Crashlytics collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Failed to set crashlytics collection:', error);
  }
}

export async function isCrashlyticsCollectionEnabled(): Promise<boolean> {
  return crashlyticsEnabled;
}

// ==================== PREDEFINED EVENTS ====================

export async function logAppOpen(): Promise<void> {
  await logEvent('app_open', { timestamp: Date.now(), platform: Platform.OS });
}

export async function logLogin(method: string): Promise<void> {
  await logEvent('login', { method });
}

export async function logSignUp(method: string): Promise<void> {
  await logEvent('sign_up', { method });
}

export async function logButtonClick(buttonName: string, screenName: string): Promise<void> {
  await logEvent('button_click', { button_name: buttonName, screen_name: screenName });
}

export async function logPurchase(
  itemId: string,
  itemName: string,
  price: number,
  currency: string = 'USD',
): Promise<void> {
  await logEvent('purchase', {
    item_id: itemId,
    item_name: itemName,
    value: price,
    currency,
  });
}

export async function logSearch(searchTerm: string): Promise<void> {
  await logEvent('search', { search_term: searchTerm });
}

export async function logShare(
  contentType: string,
  itemId: string,
  method: string,
): Promise<void> {
  await logEvent('share', {
    content_type: contentType,
    item_id: itemId,
    method,
  });
}

// ==================== BACK-COMPAT DEFAULT EXPORT ====================
/**
 * Back-compat shim for existing call sites that imported the singleton.
 * @deprecated Import the named functions directly from this module.
 */
const firebaseService = {
  isAnalyticsEnabled,
  isCrashlyticsEnabled,
  isNativeReady,
  logEvent,
  logScreenView,
  setUserId,
  setUserProperty,
  setUserProperties,
  setAnalyticsCollectionEnabled,
  recordError,
  log,
  setCrashlyticsAttribute,
  setCrashlyticsAttributes,
  setCrashlyticsUserId,
  crash,
  setCrashlyticsCollectionEnabled,
  isCrashlyticsCollectionEnabled,
  logAppOpen,
  logLogin,
  logSignUp,
  logButtonClick,
  logPurchase,
  logSearch,
  logShare,
};

export default firebaseService;
