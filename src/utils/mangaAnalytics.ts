/**
 * Manga Analytics Utilities
 * 
 * Provides helpers for tracking manga-specific events with manga name-based event names.
 * Event names are sanitized to be Firebase Analytics compatible:
 * - Alphanumeric and underscores only
 * - Max 40 characters
 * - All lowercase
 * - Cannot start with a number
 */

import firebaseService from '../services/firebase/FirebaseService';

// Enable this for detailed Firebase event debugging
const DEBUG_ANALYTICS = __DEV__;

/**
 * Sanitize event parameters to be Firebase Analytics compatible.
 * Firebase parameter requirements:
 * - Max 25 parameters per event
 * - Parameter key: max 40 characters, alphanumeric and underscores
 * - Parameter value: max 100 characters for strings
 * - No undefined values
 */
const sanitizeEventParams = (params: Record<string, any>): Record<string, string | number | boolean> => {
  const sanitized: Record<string, string | number | boolean> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    // Skip undefined or null values - Firebase doesn't accept them
    if (value === undefined || value === null) {
      return;
    }
    
    // Sanitize key - max 40 chars, only alphanumeric and underscores
    let sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 40);
    
    // Handle different value types
    if (typeof value === 'string') {
      // Truncate strings to 100 characters (Firebase limit)
      sanitized[sanitizedKey] = value.substring(0, 100);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else {
      // Convert other types to string
      sanitized[sanitizedKey] = String(value).substring(0, 100);
    }
  });
  
  return sanitized;
};

/**
 * Validate Firebase event name
 * Returns true if valid, false if invalid
 */
const validateEventName = (eventName: string): boolean => {
  // Must be 1-40 characters
  if (eventName.length === 0 || eventName.length > 40) {
    console.warn(`[MangaAnalytics] ⚠️ Event name length invalid: ${eventName.length} chars`);
    return false;
  }
  
  // Must only contain lowercase letters, numbers, and underscores
  if (!/^[a-z][a-z0-9_]*$/.test(eventName)) {
    console.warn(`[MangaAnalytics] ⚠️ Event name contains invalid characters: ${eventName}`);
    return false;
  }
  
  // Cannot start with reserved prefixes
  const reservedPrefixes = ['firebase_', 'google_', 'ga_'];
  for (const prefix of reservedPrefixes) {
    if (eventName.startsWith(prefix)) {
      console.warn(`[MangaAnalytics] ⚠️ Event name uses reserved prefix: ${prefix}`);
      return false;
    }
  }
  
  return true;
};

/**
 * Log event to Firebase with full validation
 */
const logToFirebase = async (
  eventName: string,
  params: Record<string, any>
): Promise<void> => {
  // Validate event name
  if (!validateEventName(eventName)) {
    console.error(`[MangaAnalytics] ❌ Skipping invalid event: ${eventName}`);
    return;
  }
  
  // Sanitize parameters
  const sanitizedParams = sanitizeEventParams(params);
  
  if (DEBUG_ANALYTICS) {
    console.log(`📊 [Firebase Event] ${eventName}`, sanitizedParams);
  }
  
  try {
    await firebaseService.logEvent(eventName, sanitizedParams);
    if (DEBUG_ANALYTICS) {
      console.log(`✅ [Firebase] Event logged successfully: ${eventName}`);
    }
  } catch (error) {
    console.error(`❌ [Firebase] Failed to log event ${eventName}:`, error);
  }
};

/**
 * Sanitize a manga name for use in Firebase Analytics event names.
 * Firebase event names must be:
 * - Alphanumeric characters and underscores only
 * - Maximum 40 characters
 * - Cannot start with a number
 * 
 * @param mangaName - The manga title to sanitize
 * @param maxLength - Maximum length for the sanitized name (default: 25 to leave room for prefix/suffix)
 * @returns The sanitized manga name suitable for event names
 * 
 * @example
 * sanitizeMangaName("One Piece") // "one_piece"
 * sanitizeMangaName("Attack on Titan!") // "attack_on_titan"
 * sanitizeMangaName("My Hero Academia: Season 3") // "my_hero_academia_season_3"
 * sanitizeMangaName("123 Manga") // "manga_123" (numbers moved to end if at start)
 */
export const sanitizeMangaName = (mangaName: string, maxLength: number = 25): string => {
  if (!mangaName) return 'unknown';

  // Convert to lowercase
  let sanitized = mangaName.toLowerCase();

  // Replace spaces and common separators with underscores
  sanitized = sanitized.replace(/[\s\-:.,'!?&@#$%^*()+=[\]{}|\\/<>]+/g, '_');

  // Remove any remaining non-alphanumeric characters (except underscores)
  sanitized = sanitized.replace(/[^a-z0-9_]/g, '');

  // Replace multiple consecutive underscores with a single one
  sanitized = sanitized.replace(/_+/g, '_');

  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');

  // If starts with a number, prefix with 'manga_'
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `manga_${sanitized}`;
  }

  // Truncate to maxLength
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    // Remove trailing underscore if truncation created one
    sanitized = sanitized.replace(/_+$/g, '');
  }

  return sanitized || 'unknown';
};

/**
 * Build a manga-based event name
 * Format: {manga_name}_{action} or {action}_{manga_name}
 * 
 * @param action - The action/event type (e.g., 'pressed', 'saved', 'shared')
 * @param mangaName - The manga title
 * @param prefix - If true, manga name comes first. If false, action comes first.
 * @returns Firebase-compatible event name
 * 
 * @example
 * buildMangaEventName('pressed', 'One Piece') // "one_piece_pressed"
 * buildMangaEventName('opened', 'Attack on Titan', false) // "opened_attack_on_titan"
 */
export const buildMangaEventName = (
  action: string,
  mangaName: string,
  prefix: boolean = true
): string => {
  const sanitizedManga = sanitizeMangaName(mangaName);
  const sanitizedAction = action.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  const eventName = prefix 
    ? `${sanitizedManga}_${sanitizedAction}`
    : `${sanitizedAction}_${sanitizedManga}`;
  
  // Ensure total length doesn't exceed 40 characters
  return eventName.substring(0, 40);
};

/**
 * Build an episode-based event name
 * Format: ep{number}_{manga_name}_{action}
 * 
 * @param episodeNumber - The episode number
 * @param mangaName - The manga title
 * @param action - The action/event type (e.g., 'opened', 'completed', 'downloaded')
 * @returns Firebase-compatible event name
 * 
 * @example
 * buildEpisodeEventName(2, 'One Piece', 'opened') // "ep2_one_piece_opened"
 * buildEpisodeEventName(15, 'Attack on Titan', 'completed') // "ep15_attack_on_titan_completed"
 */
export const buildEpisodeEventName = (
  episodeNumber: number,
  mangaName: string,
  action: string
): string => {
  const sanitizedManga = sanitizeMangaName(mangaName, 20); // Shorter to leave room for episode prefix
  const sanitizedAction = action.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  const eventName = `ep${episodeNumber}_${sanitizedManga}_${sanitizedAction}`;
  
  // Ensure total length doesn't exceed 40 characters
  return eventName.substring(0, 40);
};

// ==================
// MANGA EVENT TYPES
// ==================

export interface MangaEventParams {
  manga_id?: string;
  manga_title?: string;
  rating?: number;
  category?: string;
  screen?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface EpisodeEventParams extends MangaEventParams {
  episode_id?: string;
  episode_number?: number;
  episode_title?: string;
  season_number?: number;
}

// ==================
// LOGGING FUNCTIONS
// ==================

/**
 * Log a manga pressed/selected event
 * Creates event: {manga_name}_pressed
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaPressed = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('pressed', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  // Log manga name-based event
  await logToFirebase(eventName, eventParams);
  
  // Also log generic event for aggregation
  await logToFirebase('manga_pressed', eventParams);
};

/**
 * Log manga viewed/opened event
 * Creates event: {manga_name}_viewed
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaViewed = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('viewed', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_viewed', eventParams);
};

/**
 * Log manga saved/bookmarked event
 * Creates event: {manga_name}_saved
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaSaved = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('saved', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_saved', eventParams);
};

/**
 * Log manga unsaved/unbookmarked event
 * Creates event: {manga_name}_unsaved
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaUnsaved = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('unsaved', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_unsaved', eventParams);
};

/**
 * Log manga shared event
 * Creates event: {manga_name}_shared
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaShared = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('shared', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_shared', eventParams);
};

/**
 * Log manga reading started event
 * Creates event: {manga_name}_reading_started
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeNumber - The episode number being read
 * @param params - Additional event parameters
 */
export const logMangaReadingStarted = async (
  mangaName: string,
  mangaId: string | number,
  episodeNumber: number,
  params?: EpisodeEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('reading_started', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_number: episodeNumber,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_reading_started', eventParams);
};

// ==================
// EPISODE EVENTS
// ==================

/**
 * Log episode opened/selected event
 * Creates event: ep{number}_{manga_name}_opened
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeNumber - The episode number
 * @param episodeId - The episode ID
 * @param params - Additional event parameters
 */
export const logEpisodeOpened = async (
  mangaName: string,
  mangaId: string | number,
  episodeNumber: number,
  episodeId: string | number,
  params?: EpisodeEventParams
): Promise<void> => {
  const eventName = buildEpisodeEventName(episodeNumber, mangaName, 'opened');
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_id: String(episodeId),
    episode_number: episodeNumber,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('episode_opened', eventParams);
};

/**
 * Log episode downloaded event
 * Creates event: ep{number}_{manga_name}_downloaded
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeNumber - The episode number
 * @param episodeId - The episode ID
 * @param params - Additional event parameters
 */
export const logEpisodeDownloaded = async (
  mangaName: string,
  mangaId: string | number,
  episodeNumber: number,
  episodeId: string | number,
  params?: EpisodeEventParams
): Promise<void> => {
  const eventName = buildEpisodeEventName(episodeNumber, mangaName, 'downloaded');
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_id: String(episodeId),
    episode_number: episodeNumber,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('episode_downloaded', eventParams);
};

/**
 * Log episode completed event
 * Creates event: ep{number}_{manga_name}_completed
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeNumber - The episode number
 * @param episodeId - The episode ID
 * @param params - Additional event parameters
 */
export const logEpisodeCompleted = async (
  mangaName: string,
  mangaId: string | number,
  episodeNumber: number,
  episodeId: string | number,
  params?: EpisodeEventParams
): Promise<void> => {
  const eventName = buildEpisodeEventName(episodeNumber, mangaName, 'completed');
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_id: String(episodeId),
    episode_number: episodeNumber,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('episode_completed', eventParams);
};

/**
 * Log episode reading continued event
 * Creates event: ep{number}_{manga_name}_continued
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeNumber - The episode number
 * @param episodeId - The episode ID
 * @param progress - Reading progress percentage
 * @param params - Additional event parameters
 */
export const logEpisodeContinued = async (
  mangaName: string,
  mangaId: string | number,
  episodeNumber: number,
  episodeId: string | number,
  progress: number,
  params?: EpisodeEventParams
): Promise<void> => {
  const eventName = buildEpisodeEventName(episodeNumber, mangaName, 'continued');
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_id: String(episodeId),
    episode_number: episodeNumber,
    progress_percent: progress,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('episode_continued', eventParams);
};

// ==================
// REVIEW EVENTS
// ==================

/**
 * Log review/comment posted on manga
 * Creates event: {manga_name}_review_posted
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param params - Additional event parameters
 */
export const logMangaReviewPosted = async (
  mangaName: string,
  mangaId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('review_posted', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_review_posted', eventParams);
};

/**
 * Log review/comment liked on manga
 * Creates event: {manga_name}_review_liked
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param reviewId - The review/comment ID
 * @param params - Additional event parameters
 */
export const logMangaReviewLiked = async (
  mangaName: string,
  mangaId: string | number,
  reviewId: string | number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('review_liked', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    review_id: String(reviewId),
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_review_liked', eventParams);
};

// ==================
// DOWNLOAD EVENTS
// ==================

/**
 * Log all episodes downloaded for manga
 * Creates event: {manga_name}_all_downloaded
 * 
 * @param mangaName - The manga title
 * @param mangaId - The manga ID
 * @param episodeCount - Number of episodes downloaded
 * @param params - Additional event parameters
 */
export const logMangaAllDownloaded = async (
  mangaName: string,
  mangaId: string | number,
  episodeCount: number,
  params?: MangaEventParams
): Promise<void> => {
  const eventName = buildMangaEventName('all_downloaded', mangaName);
  
  const eventParams = {
    manga_id: String(mangaId),
    manga_title: mangaName,
    episode_count: episodeCount,
    ...params,
    timestamp: Date.now(),
  };

  await logToFirebase(eventName, eventParams);
  await logToFirebase('manga_all_downloaded', eventParams);
};

// Export all functions
export default {
  sanitizeMangaName,
  buildMangaEventName,
  buildEpisodeEventName,
  logMangaPressed,
  logMangaViewed,
  logMangaSaved,
  logMangaUnsaved,
  logMangaShared,
  logMangaReadingStarted,
  logEpisodeOpened,
  logEpisodeDownloaded,
  logEpisodeCompleted,
  logEpisodeContinued,
  logMangaReviewPosted,
  logMangaReviewLiked,
  logMangaAllDownloaded,
};
