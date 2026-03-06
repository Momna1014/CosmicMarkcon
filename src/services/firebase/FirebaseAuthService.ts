/**
 * Firebase Auth Service
 * Simple service for anonymous authentication
 */

import auth from '@react-native-firebase/auth';

/**
 * Sign in anonymously and return user ID
 * @returns Promise<string> - The Firebase user ID
 */
export const signInAnonymously = async (): Promise<string> => {
  try {
    // Check if already signed in
    const currentUser = auth().currentUser;
    if (currentUser) {
      console.log('✅ Already signed in:', currentUser.uid);
      return currentUser.uid;
    }

    // Sign in anonymously
    const userCredential = await auth().signInAnonymously();
    console.log('✅ Anonymous sign-in successful:', userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error: any) {
    console.error('❌ Anonymous sign-in failed:', error);
    throw error;
  }
};

/**
 * Get current user ID if signed in
 * @returns string | null
 */
export const getCurrentUserId = (): string | null => {
  return auth().currentUser?.uid || null;
};

/**
 * Check if user is signed in
 */
export const isSignedIn = (): boolean => {
  return auth().currentUser !== null;
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  await auth().signOut();
};
