/**
 * User Storage Utility
 *
 * Handles persistent storage of user data like username
 * Uses AsyncStorage to persist data across app launches
 * 
 * Key format: username_{userId} - stores username associated with Firebase userId
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERNAME_PREFIX: 'mangaverse_username_',
} as const;

/**
 * Get the storage key for a user's username
 */
const getUsernameKey = (userId: string): string => {
  return `${STORAGE_KEYS.USERNAME_PREFIX}${userId}`;
};

/**
 * User Storage Service
 */
export const UserStorage = {
  /**
   * Save username for a specific user ID
   * @param userId - Firebase user ID
   * @param username - User's display name
   */
  saveUsername: async (userId: string, username: string): Promise<void> => {
    try {
      const key = getUsernameKey(userId);
      await AsyncStorage.setItem(key, username);
      if (__DEV__) {
        console.log('✅ Username saved:', { userId, username });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to save username:', error);
      }
      throw error;
    }
  },

  /**
   * Get username for a specific user ID
   * @param userId - Firebase user ID
   * @returns Promise<string | null> - Stored username or null if not found
   */
  getUsername: async (userId: string): Promise<string | null> => {
    try {
      const key = getUsernameKey(userId);
      const username = await AsyncStorage.getItem(key);
      if (__DEV__) {
        console.log('📖 Username retrieved:', { userId, username });
      }
      return username;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get username:', error);
      }
      return null;
    }
  },

  /**
   * Check if username exists for a user ID
   * @param userId - Firebase user ID
   * @returns Promise<boolean> - True if username exists
   */
  hasUsername: async (userId: string): Promise<boolean> => {
    const username = await UserStorage.getUsername(userId);
    return username !== null && username.length > 0;
  },

  /**
   * Remove username for a specific user ID
   * @param userId - Firebase user ID
   */
  removeUsername: async (userId: string): Promise<void> => {
    try {
      const key = getUsernameKey(userId);
      await AsyncStorage.removeItem(key);
      if (__DEV__) {
        console.log('🗑️ Username removed:', { userId });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to remove username:', error);
      }
    }
  },

  /**
   * Save liked comment IDs for a user
   * @param userId - Firebase user ID
   * @param commentIds - Set of liked comment IDs
   */
  saveLikedComments: async (userId: string, commentIds: Set<string>): Promise<void> => {
    try {
      const key = `mangaverse_liked_comments_${userId}`;
      const data = JSON.stringify(Array.from(commentIds));
      await AsyncStorage.setItem(key, data);
      if (__DEV__) {
        console.log('✅ Liked comments saved:', { userId, count: commentIds.size });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to save liked comments:', error);
      }
    }
  },

  /**
   * Get liked comment IDs for a user
   * @param userId - Firebase user ID
   * @returns Promise<Set<string>> - Set of liked comment IDs
   */
  getLikedComments: async (userId: string): Promise<Set<string>> => {
    try {
      const key = `mangaverse_liked_comments_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const commentIds = JSON.parse(data) as string[];
        if (__DEV__) {
          console.log('📖 Liked comments retrieved:', { userId, count: commentIds.length });
        }
        return new Set(commentIds);
      }
      return new Set();
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get liked comments:', error);
      }
      return new Set();
    }
  },

  /**
   * Add a liked comment ID for a user
   * @param userId - Firebase user ID
   * @param commentId - Comment ID to add
   */
  addLikedComment: async (userId: string, commentId: string): Promise<void> => {
    const likedComments = await UserStorage.getLikedComments(userId);
    likedComments.add(commentId);
    await UserStorage.saveLikedComments(userId, likedComments);
  },

  /**
   * Remove a liked comment ID for a user
   * @param userId - Firebase user ID
   * @param commentId - Comment ID to remove
   */
  removeLikedComment: async (userId: string, commentId: string): Promise<void> => {
    const likedComments = await UserStorage.getLikedComments(userId);
    likedComments.delete(commentId);
    await UserStorage.saveLikedComments(userId, likedComments);
  },

  /**
   * Save posted (own) comment IDs for a user
   * @param userId - Firebase user ID
   * @param commentIds - Set of posted comment IDs
   */
  savePostedComments: async (userId: string, commentIds: Set<string>): Promise<void> => {
    try {
      const key = `mangaverse_posted_comments_${userId}`;
      const data = JSON.stringify(Array.from(commentIds));
      await AsyncStorage.setItem(key, data);
      if (__DEV__) {
        console.log('✅ Posted comments saved:', { userId, count: commentIds.size });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to save posted comments:', error);
      }
    }
  },

  /**
   * Get posted (own) comment IDs for a user
   * @param userId - Firebase user ID
   * @returns Promise<Set<string>> - Set of posted comment IDs
   */
  getPostedComments: async (userId: string): Promise<Set<string>> => {
    try {
      const key = `mangaverse_posted_comments_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const commentIds = JSON.parse(data) as string[];
        if (__DEV__) {
          console.log('📖 Posted comments retrieved:', { userId, count: commentIds.length });
        }
        return new Set(commentIds);
      }
      return new Set();
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get posted comments:', error);
      }
      return new Set();
    }
  },

  /**
   * Add a posted comment ID for a user
   * @param userId - Firebase user ID
   * @param commentId - Comment ID to add
   */
  addPostedComment: async (userId: string, commentId: string): Promise<void> => {
    const postedComments = await UserStorage.getPostedComments(userId);
    postedComments.add(commentId);
    await UserStorage.savePostedComments(userId, postedComments);
  },

  /**
   * Remove a posted comment ID for a user
   * @param userId - Firebase user ID
   * @param commentId - Comment ID to remove
   */
  removePostedComment: async (userId: string, commentId: string): Promise<void> => {
    const postedComments = await UserStorage.getPostedComments(userId);
    postedComments.delete(commentId);
    await UserStorage.savePostedComments(userId, postedComments);
  },
};

export default UserStorage;
